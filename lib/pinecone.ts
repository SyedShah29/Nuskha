import { Pinecone } from "@pinecone-database/pinecone";
import { hybridRerank } from "@/lib/bm25";

// Initialize Pinecone client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "fallback_key_for_build",
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "medical-fast-search";

export const getIndex = () => {
    return pinecone.index(INDEX_NAME);
};

export const NAMESPACES = {
    MEDICAL_KNOWLEDGE: "", // Data is in default namespace
    USER_HISTORY: "user-history",
};

/**
 * Hybrid RAG query: Dense (Pinecone) + BM25 keyword re-ranking
 *
 * Pipeline:
 *   1. Dense vector search → topK*3 candidates (cast wide net)
 *   2. BM25 keyword score each candidate
 *   3. Hybrid fusion: 60% dense + 40% BM25
 *   4. Return top-K re-ranked results
 *
 * This fixes the flat 0.25 threshold and handles exact medical terms
 * that dense search alone misses (e.g., "dengue hemorrhagic fever")
 */
export async function queryMedicalKnowledge(
    embedding: number[],
    topK: number = 5,
    queryText?: string
): Promise<{ context: string; sources: string[]; diseases: string[] }> {
    const index = getIndex();

    try {
        // Stage 1: Dense search with wider net (3x topK for re-ranking)
        const results = await index.namespace(NAMESPACES.MEDICAL_KNOWLEDGE).query({
            vector: embedding,
            topK: topK * 3,
            includeMetadata: true,
        });

        const allMatches = results.matches?.filter(match => (match.score || 0) > 0.15) || [];

        if (allMatches.length === 0) {
            return { context: "", sources: [], diseases: [] };
        }

        // Stage 2: Hybrid re-ranking (BM25 + dense fusion) if query text is provided
        let finalMatches = allMatches;

        if (queryText && queryText.trim().length > 0) {
            const candidates = allMatches.map(match => {
                const meta = match.metadata as any;
                const text = [
                    meta?.subject || "",
                    meta?.question || "",
                    meta?.answer || "",
                    meta?.disease || "",
                    meta?.condition || "",
                ].join(" ");

                return {
                    id: match.id,
                    denseScore: match.score || 0,
                    text,
                    metadata: meta,
                };
            });

            const reranked = hybridRerank(queryText, candidates, 0.6);

            // Map re-ranked results back to original matches
            const matchMap = new Map(allMatches.map(m => [m.id, m]));
            finalMatches = reranked
                .slice(0, topK)
                .map(r => matchMap.get(r.id))
                .filter(Boolean) as typeof allMatches;
        } else {
            // Without query text, just use dense results filtered to topK
            finalMatches = allMatches.slice(0, topK);
        }

        // Build context from re-ranked results
        const context = finalMatches
            .map((match) => {
                const meta = match.metadata as any;
                if (!meta) return "";
                return `
Subject: ${meta.subject || "General"}
Question: ${meta.question || "N/A"}
Answer: ${meta.answer || "N/A"}
Explanation: ${meta.explanation || "N/A"}
`;
            })
            .filter(text => text.length > 50)
            .join("\n\n") || "";

        const sources = finalMatches
            .map((match) => match.metadata?.source || match.id)
            .filter(Boolean) as string[];

        const diseases = finalMatches
            .map((match: any) => match.metadata?.disease || match.metadata?.condition || "")
            .filter(Boolean) as string[];

        console.log(`   🔀 Hybrid RAG: ${allMatches.length} dense → ${finalMatches.length} after re-ranking`);

        return { context, sources, diseases: [...new Set(diseases)] };
    } catch (error) {
        console.error("Error querying medical knowledge:", error);
        return { context: "", sources: [], diseases: [] };
    }
}

// Search for specific disease information
export async function searchDiseaseInfo(
    embedding: number[],
    diseaseName: string,
    topK: number = 3
): Promise<{ symptoms: string[]; description: string; severity: string }> {
    const index = getIndex();

    try {
        const results = await index.namespace(NAMESPACES.MEDICAL_KNOWLEDGE).query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });

        let symptoms: string[] = [];
        let description = "";
        let severity = "moderate";

        results.matches?.forEach((match) => {
            const meta = match.metadata as any;

            // Extract symptoms
            if (meta?.symptoms) {
                if (Array.isArray(meta.symptoms)) {
                    symptoms.push(...meta.symptoms);
                } else {
                    symptoms.push(meta.symptoms);
                }
            }

            // Extract description
            if (meta?.description || meta?.text) {
                description += (meta.description || meta.text) + " ";
            }

            // Extract severity if available
            if (meta?.severity) {
                severity = meta.severity;
            }
        });

        return {
            symptoms: [...new Set(symptoms)],
            description: description.trim().slice(0, 500),
            severity,
        };
    } catch (error) {
        console.error("Error searching disease info:", error);
        return { symptoms: [], description: "", severity: "moderate" };
    }
}

// Get differential diagnosis based on symptoms
export async function getDifferentialDiagnosis(
    embedding: number[],
    symptoms: string[],
    topK: number = 10
): Promise<Array<{ disease: string; matchScore: number; matchedSymptoms: string[] }>> {
    const index = getIndex();

    try {
        const results = await index.namespace(NAMESPACES.MEDICAL_KNOWLEDGE).query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });

        const diseaseMap = new Map<string, { score: number; symptoms: string[] }>();

        results.matches?.forEach((match) => {
            const meta = match.metadata as any;
            const disease = meta?.disease || meta?.condition || meta?.title || "";
            const diseaseSymptoms = meta?.symptoms || [];

            if (disease) {
                // Calculate match score based on symptom overlap
                const matchedSymptoms = symptoms.filter(s =>
                    diseaseSymptoms.some((ds: string) =>
                        ds.toLowerCase().includes(s.toLowerCase()) ||
                        s.toLowerCase().includes(ds.toLowerCase())
                    )
                );

                const existing = diseaseMap.get(disease);
                const score = (match.score || 0) + (matchedSymptoms.length * 0.1);

                if (!existing || existing.score < score) {
                    diseaseMap.set(disease, {
                        score,
                        symptoms: matchedSymptoms
                    });
                }
            }
        });

        return Array.from(diseaseMap.entries())
            .map(([disease, data]) => ({
                disease,
                matchScore: data.score,
                matchedSymptoms: data.symptoms,
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

    } catch (error) {
        console.error("Error getting differential diagnosis:", error);
        return [];
    }
}
