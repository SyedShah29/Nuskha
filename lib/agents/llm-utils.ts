/**
 * LLM Utilities for Multi-Agent System
 * Shared LLM operations using LangChain + DeepSeek
 */

import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel, type BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import { AIMessage, type BaseMessage } from '@langchain/core/messages';
import { type ChatResult } from '@langchain/core/outputs';
import { pipeline } from '@xenova/transformers';

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';

function deepseekAPIKey(): string {
  return process.env.DEEPSEEK_API_KEY || '';
}

interface DeepSeekModelParams extends BaseChatModelParams {
  model: string;
  temperature: number;
}

class DeepSeekChatModel extends BaseChatModel {
  model: string;
  temperature: number;

  constructor(params: DeepSeekModelParams) {
    super(params);
    this.model = params.model;
    this.temperature = params.temperature;
  }

  _llmType(): string {
    return 'deepseek';
  }

  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    const apiKey = deepseekAPIKey();
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');

    const body = JSON.stringify({
      model: this.model,
      messages: messages.map(m => {
        const role = m.getType() === 'human' ? 'user'
          : m.getType() === 'ai' ? 'assistant'
          : (m.getType() as string) === 'system' ? 'system' : 'user';
        return { role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) };
      }),
      temperature: this.temperature,
      max_tokens: 2048,
    });

    const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DeepSeek API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return {
      generations: [{ message: new AIMessage(content), text: content }],
      llmOutput: data.usage ? { tokenUsage: data.usage } : undefined,
    };
  }
}

const deepseekFast = new DeepSeekChatModel({
  model: 'deepseek-chat',
  temperature: 0.2,
});

const deepseekLLM = new DeepSeekChatModel({
  model: 'deepseek-chat',
  temperature: 0.3,
});

const deepseekCreative = new DeepSeekChatModel({
  model: 'deepseek-chat',
  temperature: 0.5,
});

// Singleton for embedding pipeline
let embeddingPipeline: any = null;

/**
 * Generate embedding using local Xenova model (384-dim)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!embeddingPipeline) {
      console.log('📥 Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
      embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    }
    const output = await embeddingPipeline(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(output.data) as number[];
  } catch (e) {
    console.error('Embedding generation failed:', e);
    return new Array(384).fill(0);
  }
}

/**
 * Translate text to English (for processing) - Uses fast 8b model
 */
export async function translateToEnglish(text: string): Promise<string> {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Translate to English. Medical context. Be concise.
"sr/sir"="Head", "pait"="Stomach", "dil"="Heart", "drd"="pain", "bukhar"="fever"
Return ONLY the translation.`,
    ],
    ['human', '{text}'],
  ]);

  try {
    const chain = prompt.pipe(deepseekFast).pipe(new StringOutputParser());
    const result = await chain.invoke({ text });
    console.log(
      `🌐 Translated: "${text.slice(0, 50)}..." → "${result.slice(0, 50)}..."`
    );
    return result.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

/**
 * Identify potential diseases from symptoms using RAG context and LLM
 */
export async function identifyDiseases(
  symptoms: string[],
  ragContext?: string
): Promise<{ name: string; probability: number }[]> {
  if (symptoms.length === 0) return [];

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a medical diagnostic AI. Analyze symptoms and identify potential diseases.
Return a JSON array of diseases with probability scores.
Format: [{{"name": "Disease Name", "probability": 70}}]
Probability should be 0-100 based on symptom match.
Only return diseases that have medical basis for the symptoms.
Return ONLY valid JSON, no explanation.`,
    ],
    [
      'human',
      `Symptoms: {symptoms}
${ragContext ? `Medical Knowledge Context:\n${ragContext.slice(0, 2000)}` : ''}

Identify 3-7 potential diseases/conditions with probability scores.`,
    ],
  ]);

  let attempt = 0;
  while (attempt < 3) {
    try {
      const chain = prompt.pipe(deepseekLLM).pipe(new StringOutputParser());
      const result = await chain.invoke({ symptoms: symptoms.join(', ') });
      console.log(`📤 [identifyDiseases] Raw output (first 200 chars):`, result.slice(0, 200));

      let cleaned = result.trim();
      const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch) cleaned = fenceMatch[1].trim();

      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      console.warn('⚠️ identifyDiseases: no JSON array in output');
      break;
    } catch (error: any) {
      console.error(`Disease identification failed (attempt ${attempt + 1}):`, error.message || error);
      if (attempt >= 2) break;
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return [];
}

/**
 * Robustly extract JSON from LLM output that may contain markdown fences or surrounding text.
 */
function tryParseFlatKV(raw: string): Record<string, any> | null {
  const lines = raw.split(/\r?\n/);
  const result: Record<string, any> = {};
  let currentKey = '';
  let currentValue = '';

  for (const line of lines) {
    // Match "Key: value" (case-insensitive key)
    const kvMatch = line.match(/^(\w[\w\s]*?):\s*(.*)/);
    if (kvMatch) {
      // Save previous key-value pair if any
      if (currentKey) {
        result[currentKey.toLowerCase().replace(/\s+/g, '')] = currentValue.trim();
      }
      currentKey = kvMatch[1];
      currentValue = kvMatch[2];
    } else if (currentKey) {
      // Continuation of a previous value (e.g. IdentifiedSymptoms spanning multiple lines)
      currentValue += ' ' + line.trim();
    }
  }
  // Save the last pair
  if (currentKey) {
    result[currentKey.toLowerCase().replace(/\s+/g, '')] = currentValue.trim();
  }

  // Validate we have at least the content field
  if (!result.content) return null;

  // Coerce typed fields
  const out: Record<string, any> = { content: result.content };
  if (result.urdu) out.urdu = result.urdu;
  if (result.severity) out.severity = result.severity;
  if (result.confidencelevel) {
    const pct = parseInt(result.confidencelevel, 10);
    out.confidenceLevel = isNaN(pct) ? result.confidencelevel : pct;
  }
  if (result.identifiedsymptoms) {
    out.identifiedSymptoms = result.identifiedsymptoms
      .split(/,\s*/)
      .filter((s: string) => s.trim().length > 0);
  }
  if (result.isconfident !== undefined) {
    out.isConfident = result.isconfident === 'true' || result.isconfident === 'True';
  }
  if (result.followupneeded !== undefined) {
    out.followUpNeeded = result.followupneeded === 'true' || result.followupneeded === 'True';
  }
  if (result.diagnosissummary) out.diagnosisSummary = result.diagnosissummary;

  return out;
}

function tryExtractJSON(raw: string): Record<string, any> | null {
  let cleaned = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Find the outermost JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('No JSON braces found in output — falling back to key:value parser');
    return tryParseFlatKV(cleaned);
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e: any) {
    // Try fixing unescaped newlines inside string values (common with raw LLM output)
    try {
      const fixed = jsonMatch[0].replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
      return JSON.parse(fixed);
    } catch {
      console.warn('JSON parse failed after both attempts:', e.message);
      return null;
    }
  }
}

/**
 * Generate clinical response during interview
 */
export async function generateClinicalResponse(params: {
  userMessage: string;
  medicalContext: string;
  patientHistory: string;
  patientInfo?: any;
  conversationHistory: Array<{ role: string; content: string }>;
  potentialDiseases: string[];
  confidenceScore: number;
  identifiedSymptoms: string[];
  isReadyForDiagnosis: boolean;
}): Promise<{
  content: string;
  urdu: string;
  severity: string;
  confidenceLevel: number;
  identifiedSymptoms: string[];
  isConfident: boolean;
  diagnosisSummary?: string;
}> {
  const {
    userMessage,
    medicalContext,
    patientHistory,
    patientInfo,
    conversationHistory,
    potentialDiseases,
    confidenceScore,
    identifiedSymptoms,
    isReadyForDiagnosis,
  } = params;

  let instruction = '';
  if (isReadyForDiagnosis) {
    instruction = `DIAGNOSIS: Thank patient. Summarize the most likely condition simply. Mention a SOAP report will be generated for doctor review.
Start with: "Thank you for completing this clinical interview session!"
State the top 1-2 likely conditions clearly. Keep it to 3-4 sentences. Set isConfident:true, confidenceLevel:95.`;
  } else {
    // Build a focused diagnostic strategy based on what diseases remain
    const topDiseases = potentialDiseases.slice(0, 5);
    const confirmedSymptoms = identifiedSymptoms.join(', ') || 'none yet';

    // Symptom probing map — what to ask next based on the disease cluster
    const diseaseClues: Record<string, string[]> = {
      // Respiratory
      'Common Cold': ['runny nose', 'sneezing', 'mild fever', 'nasal congestion'],
      'Bronchitis': ['persistent cough with phlegm', 'chest tightness', 'wheezing', 'low-grade fever for days'],
      'Pneumonia': ['high fever (>38.5°C)', 'shortness of breath', 'chest pain when breathing', 'yellow/green phlegm'],
      'Sinusitis': ['facial pressure/pain', 'nasal congestion', 'postnasal drip', 'loss of smell'],
      'Tonsillitis': ['painful swallowing', 'swollen lymph nodes in neck', 'white patches on throat', 'high fever'],
      'Pharyngitis': ['sore throat', 'pain when swallowing', 'red throat', 'mild fever'],
      'Asthma': ['wheezing', 'shortness of breath', 'triggered by dust/cold air', 'worse at night'],
      'Tuberculosis': ['night sweats', 'unexplained weight loss', 'coughing blood', 'prolonged cough >3 weeks'],
      // GI
      'Gastritis': ['burning stomach pain', 'pain worse on empty stomach', 'nausea after eating', 'bloating'],
      'GERD': ['heartburn after meals', 'acid taste in mouth', 'worse when lying down', 'chest burning'],
      'Appendicitis': ['pain starting near navel moving to lower right', 'fever', 'loss of appetite', 'pain worse with movement'],
      'Peptic Ulcer': ['gnawing stomach pain', 'pain relieved by eating', 'black/tarry stools', 'nausea'],
      // Neurological
      'Migraine': ['one-sided head pain', 'sensitivity to light/sound', 'nausea with headache', 'visual aura'],
      'Tension Headache': ['pressure/band-like pain around head', 'both sides', 'no nausea', 'triggered by stress'],
      'Vertigo': ['room spinning sensation', 'triggered by head movement', 'nausea with dizziness', 'hearing changes'],
      // Cardiac
      'Hypertension': ['usually no symptoms', 'occasional headache', 'blurred vision', 'family history'],
      'Angina': ['chest tightness on exertion', 'relieved by rest', 'left arm/jaw pain', 'shortness of breath'],
      // General
      'Anemia': ['fatigue', 'pale skin', 'shortness of breath on exertion', 'cold hands/feet'],
      'Diabetes Type 2': ['excessive thirst', 'frequent urination', 'blurred vision', 'slow healing wounds'],
      'Thyroid Disorder': ['weight change', 'fatigue', 'hair loss', 'feeling too hot or cold'],
      'Dehydration': ['dark urine', 'dry mouth', 'dizziness when standing', 'decreased urination'],
    };

    // Find which symptoms to probe for the top diseases
    const symptomsToProbe: string[] = [];
    for (const disease of topDiseases) {
      const clues = diseaseClues[disease] || [];
      for (const clue of clues) {
        // Only suggest symptoms not already confirmed
        const alreadyKnown = identifiedSymptoms.some(s =>
          s.toLowerCase().includes(clue.toLowerCase().split(' ')[0])
        );
        if (!alreadyKnown) {
          symptomsToProbe.push(clue);
        }
      }
    }

    // De-duplicate and pick the most relevant probe
    const uniqueProbes = [...new Set(symptomsToProbe)].slice(0, 6);

    instruction = `DIAGNOSTIC INTERVIEW — FOCUSED QUESTIONING:

You are a clinical AI narrowing a differential diagnosis. Current top conditions:
${topDiseases.map((d, i) => `  ${i + 1}. ${d}`).join('\n')}

Symptoms already confirmed from patient: ${confirmedSymptoms}

Key symptoms still needed to differentiate: ${uniqueProbes.length > 0 ? uniqueProbes.join(', ') : 'duration, severity, associated symptoms'}

YOUR TASK: Ask exactly ONE specific, targeted question about ONE of the key symptoms above.
- Be specific: NOT "any other symptoms?" but "do you have a fever?" or "is your cough dry or are you coughing up phlegm?"
- If asking about pain: ask its character (sharp/dull/burning), location, or timing
- If throat: ask about fever, difficulty swallowing, or swollen glands
- Match the patient's language (Urdu/Roman Urdu/English — match what they used)
- Max 2 sentences. Conversational tone. No medical jargon.
- Do NOT repeat a question already in the chat history
- Do NOT ask generic questions`;
  }

  // Pediatric & Geriatric Modes
  if (patientInfo?.age) {
    if (patientInfo.age < 12) {
      instruction += `\n[PEDIATRIC MODE]: Patient is a child (${patientInfo.age} yrs). Address the parent/guardian. Use comforting, reassuring tone. Ask about eating/sleeping changes.`;
    } else if (patientInfo.age > 65) {
      instruction += `\n[GERIATRIC MODE]: Patient is elderly (${patientInfo.age} yrs). Speak clearly and respectfully. Ask about recent falls, mobility issues, or medication side effects.`;
    }
  }

  // Limit conversation history to reduce tokens
  const recentHistory = conversationHistory.slice(-4);
  const limitedMedicalContext = medicalContext.slice(0, 800);

  // Build the JSON format instruction with escaped braces for LangChain templates
  const jsonFormat = isReadyForDiagnosis
    ? '{{"content": string, "urdu": string, "severity": string, "confidenceLevel": number, "identifiedSymptoms": string[], "isConfident": boolean, "followUpNeeded": boolean, "diagnosisSummary": string}}'
    : '{{"content": string, "urdu": string, "severity": string, "confidenceLevel": number, "identifiedSymptoms": string[], "isConfident": boolean, "followUpNeeded": boolean}}';

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `Medical AI interview. Match patient's language (English/Roman Urdu). No medications.
${instruction}
CRITICAL: Return ONLY a valid JSON object with exactly these fields: ${jsonFormat}
Do NOT return plain text. Do NOT wrap in markdown. Output must be parseable JSON.`,
    ],
    [
      'human',
      `Patient: ${patientHistory?.slice(0, 300) || 'N/A'}
Context: ${limitedMedicalContext || 'General'}
Chat: ${recentHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
Message: "${userMessage}"
Diseases: ${potentialDiseases.slice(0, 5).join(', ') || 'Analyzing'}
Confidence: ${confidenceScore}%
Symptoms: ${identifiedSymptoms.slice(0, 10).join(', ') || 'None'}`,
    ],
  ]);

  let attempt = 0;
  while (attempt < 3) {
    try {
      const chain = prompt.pipe(deepseekCreative).pipe(new StringOutputParser());
      const result = await chain.invoke({});
      console.log(`📤 [generateClinicalResponse] Raw LLM output (first 300 chars):`, result.slice(0, 300));

      const parsed = tryExtractJSON(result);
      if (parsed) {
        return {
          content: parsed.content || 'Please describe your symptoms.',
          urdu: parsed.urdu || 'براہ کرم علامات بیان کریں',
          severity: parsed.severity || 'moderate',
          confidenceLevel: parsed.confidenceLevel || confidenceScore,
          identifiedSymptoms: parsed.identifiedSymptoms || identifiedSymptoms,
          isConfident: parsed.isConfident || false,
          diagnosisSummary: parsed.diagnosisSummary,
        };
      }
      console.warn('⚠️ LLM returned no valid JSON even after extraction. Retrying...');
      if (attempt >= 2) break;
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`Clinical response generation failed (attempt ${attempt + 1}):`, error.message || error);
      if (attempt >= 2) break;
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.warn('⚠️ All clinical response attempts failed — returning fallback');
  return {
    content: 'Could you please describe your symptoms in more detail?',
    urdu: 'براہ کرم اپنی علامات کی مزید تفصیل بیان کریں',
    severity: 'moderate',
    confidenceLevel: confidenceScore,
    identifiedSymptoms: identifiedSymptoms,
    isConfident: false,
  };
}

/**
 * Generate SOAP Report from clinical session
 */
export async function generateSOAPReport(params: {
  conversationHistory: Array<{ role: string; content: string }>;
  patientInfo: any;
  diagnosisState: {
    potentialDiseases: Array<{ name: string; probability: number }>;
    identifiedSymptoms: string[];
    confidenceScore: number;
  };
  ragSources: string[];
}): Promise<{
  subjective: any;
  objective: any;
  assessment: any;
  plan: any;
}> {
  const { conversationHistory, patientInfo, diagnosisState, ragSources } =
    params;

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a medical documentation AI. Generate a structured SOAP report.
Return valid JSON with this exact structure:
{{
    "subjective": {{
        "chiefComplaint": "Main symptom",
        "symptoms": ["symptom1", "symptom2"],
        "patientHistory": "Relevant history",
        "patientNarrative": "Patient's own words"
    }},
    "objective": {{
        "reportedSymptoms": ["symptom1"],
        "severity": "moderate",
        "confidenceLevel": 75
    }},
    "assessment": {{
        "primaryDiagnosis": "Most likely condition",
        "differentialDiagnosis": ["other possibilities"],
        "severity": "moderate",
        "confidence": 75,
        "aiAnalysis": "Reasoning for diagnosis",
        "redFlags": []
    }},
    "plan": {{
        "recommendations": ["recommendation1"],
        "testsNeeded": ["test1"],
        "specialistReferral": "Cardiology",
        "followUpNeeded": true,
        "urgency": "standard"
    }}
}}`,
    ],
    [
      'human',
      `Generate SOAP report from this clinical session:

Patient Info:
- Age: ${patientInfo?.age || 'Unknown'}
- Gender: ${patientInfo?.gender || 'Unknown'}
- Chronic conditions: ${patientInfo?.chronicConditions?.join(', ') || 'None'}
- Medications: ${patientInfo?.currentMedications?.join(', ') || 'None'}

Conversation Summary:
${conversationHistory
        .slice(-10)
        .map(m => `${m.role}: ${m.content.slice(0, 200)}`)
        .join('\n')}

Diagnosis Analysis:
- Potential diseases: ${diagnosisState.potentialDiseases.map(d => `${d.name} (${d.probability}%)`).join(', ')}
- Identified symptoms: ${diagnosisState.identifiedSymptoms.join(', ')}
- Confidence: ${diagnosisState.confidenceScore}%

Medical sources used: ${ragSources.slice(0, 5).join(', ') || 'General knowledge'}`,
    ],
  ]);

  try {
    const chain = prompt.pipe(deepseekCreative).pipe(new StringOutputParser());
    const result = await chain.invoke({});
    console.log(`📤 [generateSOAPReport] Raw output (first 200 chars):`, result.slice(0, 200));
    const parsed = tryExtractJSON(result);
    if (parsed) return parsed as { subjective: any; objective: any; assessment: any; plan: any };
  } catch (error) {
    console.error('SOAP generation failed:', error);
  }

  // Fallback SOAP structure
  return {
    subjective: {
      chiefComplaint: 'Clinical interview conducted',
      symptoms: diagnosisState.identifiedSymptoms,
      patientHistory: '',
      patientNarrative: '',
    },
    objective: {
      reportedSymptoms: diagnosisState.identifiedSymptoms,
      severity: 'moderate',
      confidenceLevel: diagnosisState.confidenceScore,
    },
    assessment: {
      primaryDiagnosis:
        diagnosisState.potentialDiseases[0]?.name || 'Under evaluation',
      differentialDiagnosis: diagnosisState.potentialDiseases
        .slice(1)
        .map(d => d.name),
      severity: 'moderate',
      confidence: diagnosisState.confidenceScore,
      aiAnalysis: 'AI analysis pending',
      redFlags: [],
    },
    plan: {
      recommendations: ['Consult with physician'],
      testsNeeded: [],
      followUpNeeded: true,
      urgency: 'standard',
    },
  };
}

/**
 * Check for emergency red flags in symptoms/diagnosis
 */
export async function checkEmergencyFlags(params: {
  symptoms: string[];
  diagnosis: string;
  patientAge?: number;
}): Promise<{
  isEmergency: boolean;
  redFlags: string[];
  triageLabel: 'emergency' | 'urgent' | 'standard' | 'routine';
  urgencyScore: number;
}> {
  const { symptoms, diagnosis, patientAge } = params;

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a medical triage AI. Analyze for emergency indicators.
CRITICAL RED FLAGS that require immediate attention:
- Chest pain with shortness of breath
- Sudden severe headache
- Signs of stroke (facial drooping, arm weakness, speech difficulty)
- Severe allergic reaction
- Difficulty breathing
- Heavy bleeding
- Loss of consciousness
- Severe abdominal pain

Return JSON:
{{
    "isEmergency": boolean,
    "redFlags": ["flag1", "flag2"],
    "triageLabel": "emergency|urgent|standard|routine",
    "urgencyScore": 0-100
}}`,
    ],
    [
      'human',
      `Analyze for emergency:
Symptoms: ${symptoms.join(', ')}
Diagnosis: ${diagnosis}
Patient age: ${patientAge || 'Unknown'}`,
    ],
  ]);

  try {
    const chain = prompt.pipe(deepseekLLM).pipe(new StringOutputParser());
    const result = await chain.invoke({});
    const parsed = tryExtractJSON(result);
    if (parsed) return parsed;
  } catch (error) {
    console.error('Emergency check failed:', error);
  }

  return {
    isEmergency: false,
    redFlags: [],
    triageLabel: 'standard',
    urgencyScore: 30,
  };
}

/**
 * Regenerate SOAP report based on doctor feedback
 */
export async function regenerateSOAPWithFeedback(params: {
  originalReport: any;
  doctorFeedback: string;
  rejectionReason: string;
}): Promise<any> {
  const { originalReport, doctorFeedback, rejectionReason } = params;

  // Escape the report JSON for template safety
  const reportJson = JSON.stringify(originalReport, null, 2)
    .replace(/\{/g, '{{')
    .replace(/\}/g, '}}');

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a Senior Medical Consultant AI assisting a doctor.
Your task is to REGENERATE and REFINE a SOAP report based on the doctor's specific feedback.

CRITICAL INSTRUCTIONS:
1.  **Strictly Adhere** to the Doctor's Feedback: If they say "change diagnosis to X", DO IT. If they say "add test Y", ADD IT.
2.  **Professional Medical Tone:** Use high-quality, clinical language suitable for a medical record. Avoid vague terms.
3.  **Refine the Content:** Don't just append the feedback; rewrite the relevant sections to flow naturally.
4.  **JSON Structure:** You MUST return the exact same valid JSON structure. Do not break the schema.

Return ONLY valid JSON. No markdown, no explanations.`,
    ],
    [
      'human',
      `ORIGINAL REPORT:
${reportJson}

DOCTOR'S FEEDBACK: "${doctorFeedback}"
REJECTION REASON (if any): "${rejectionReason}"

TASK:
- Update the report to address the feedback.
- Ensure 'Assessment' and 'Plan' reflect any new clinical insights.
- If the feedback contradicts the original AI analysis, trust the doctor's feedback as authoritative.`,
    ],
  ]);

  try {
    const chain = prompt.pipe(deepseekCreative).pipe(new StringOutputParser());
    const result = await chain.invoke({});
    const parsed = tryExtractJSON(result);
    if (parsed) return parsed;
  } catch (error) {
    console.error('SOAP regeneration failed:', error);
  }

  return originalReport;
}

export { deepseekLLM, deepseekCreative };
