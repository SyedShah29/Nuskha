/**
 * BM25 Implementation for Hybrid RAG
 * Lightweight BM25 (Best Match 25) keyword search algorithm
 * Used as Stage 1 of the hybrid retrieval pipeline before dense vector search
 *
 * BM25 parameters: k1=1.5, b=0.75 (standard values)
 */

export interface BM25Document {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface BM25Result {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

const K1 = 1.5; // Term frequency saturation parameter
const B = 0.75;  // Length normalization parameter

/**
 * Tokenize text for BM25 (simple but effective for medical text)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2); // Filter very short tokens
}

/**
 * Build IDF (Inverse Document Frequency) index
 */
function buildIDF(documents: BM25Document[]): Map<string, number> {
  const docCount = documents.length;
  const termDocCount = new Map<string, number>();

  for (const doc of documents) {
    const uniqueTerms = new Set(tokenize(doc.text));
    for (const term of uniqueTerms) {
      termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, count] of termDocCount) {
    // BM25 IDF formula
    idf.set(term, Math.log((docCount - count + 0.5) / (count + 0.5) + 1));
  }

  return idf;
}

/**
 * BM25 scorer class
 */
export class BM25 {
  private documents: BM25Document[];
  private idf: Map<string, number>;
  private avgDocLength: number;
  private tokenizedDocs: string[][];

  constructor(documents: BM25Document[]) {
    this.documents = documents;
    this.tokenizedDocs = documents.map(d => tokenize(d.text));
    this.avgDocLength =
      this.tokenizedDocs.reduce((sum, tokens) => sum + tokens.length, 0) /
      Math.max(documents.length, 1);
    this.idf = buildIDF(documents);
  }

  /**
   * Score a single document against a query
   */
  private scoreDocument(queryTerms: string[], docIndex: number): number {
    const docTokens = this.tokenizedDocs[docIndex];
    const docLength = docTokens.length;

    // Build term frequency map for this document
    const tf = new Map<string, number>();
    for (const token of docTokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    let score = 0;
    for (const term of queryTerms) {
      const termTF = tf.get(term) || 0;
      const termIDF = this.idf.get(term) || 0;

      if (termTF === 0) continue;

      // BM25 scoring formula
      const numerator = termIDF * termTF * (K1 + 1);
      const denominator = termTF + K1 * (1 - B + B * (docLength / this.avgDocLength));
      score += numerator / denominator;
    }

    return score;
  }

  /**
   * Search and return top-k results sorted by BM25 score
   */
  search(query: string, topK: number = 10): BM25Result[] {
    const queryTerms = tokenize(query);

    if (queryTerms.length === 0) return [];

    const scores: BM25Result[] = this.documents.map((doc, idx) => ({
      id: doc.id,
      score: this.scoreDocument(queryTerms, idx),
      metadata: doc.metadata,
    }));

    return scores
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/**
 * Medical-specific stopwords (terms that appear in almost all medical docs)
 */
const MEDICAL_STOPWORDS = new Set([
  'patient', 'patients', 'disease', 'treatment', 'clinical', 'medical',
  'health', 'symptom', 'symptoms', 'condition', 'study', 'studies',
  'risk', 'factors', 'associated', 'including', 'following', 'used',
  'may', 'can', 'also', 'known', 'often', 'common', 'general',
]);

/**
 * Medical-aware tokenizer (handles medical terminology better)
 */
export function medicalTokenize(text: string): string[] {
  const tokens = tokenize(text);
  return tokens.filter(t => !MEDICAL_STOPWORDS.has(t) && t.length > 2);
}

/**
 * Re-rank a list of documents using BM25 scores
 * Combined score = alpha * dense_score + (1-alpha) * bm25_score
 */
export function hybridRerank(
  query: string,
  candidates: Array<{ id: string; denseScore: number; text: string; metadata?: any }>,
  alpha: number = 0.6 // Weight for dense score (0.6 dense + 0.4 BM25)
): Array<{ id: string; hybridScore: number; metadata?: any }> {
  if (candidates.length === 0) return [];

  // Build BM25 on candidates
  const docs: BM25Document[] = candidates.map(c => ({
    id: c.id,
    text: c.text,
    metadata: c.metadata,
  }));

  const bm25 = new BM25(docs);
  const bm25Results = bm25.search(query, candidates.length);

  // Normalize BM25 scores to 0-1
  const maxBM25 = Math.max(...bm25Results.map(r => r.score), 1);
  const bm25Map = new Map(bm25Results.map(r => [r.id, r.score / maxBM25]));

  // Combine scores
  return candidates
    .map(c => ({
      id: c.id,
      hybridScore:
        alpha * c.denseScore + (1 - alpha) * (bm25Map.get(c.id) || 0),
      metadata: c.metadata,
    }))
    .sort((a, b) => b.hybridScore - a.hybridScore);
}
