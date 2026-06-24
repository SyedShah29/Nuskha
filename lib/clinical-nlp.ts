/**
 * ClinicalBERT Symptom Extraction
 * Uses @xenova/transformers for local (in-node) zero-shot classification
 * This is fast, free, and doesn't require an external API key.
 * 
 * We use a lightweight zero-shot model to determine if specific medical 
 * concepts are present in the text.
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers to not use local models and only use HF Hub
env.allowLocalModels = false;

// We use a singleton pattern for the pipeline to avoid loading the model multiple times
class NLPService {
  private static instance: any = null;
  private static isInitializing = false;

  public static async getInstance(): Promise<any> {
    if (this.instance) return this.instance;
    if (this.isInitializing) {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.getInstance();
    }

    this.isInitializing = true;
    try {
      // Use a fast, lightweight zero-shot classification model
      this.instance = await pipeline(
        'zero-shot-classification',
        'Xenova/mobilebert-uncased-mnli'
      );
      console.log('✅ Local NLP Model initialized');
    } catch (error) {
      console.error('❌ Failed to initialize local NLP model:', error);
    }
    this.isInitializing = false;
    return this.instance;
  }
}

// Key symptom categories for classification
const SYMPTOM_CATEGORIES = [
  'pain', 'fever', 'nausea', 'breathing difficulty', 
  'bleeding', 'weakness', 'swelling', 'rash', 
  'dizziness', 'cough'
];

export interface SymptomExtractionResult {
  symptoms: string[];
  confidenceMap: Record<string, number>;
}

/**
 * Extract structured symptoms from raw patient text using local zero-shot classification
 */
export async function extractSymptomsWithNLP(
  text: string
): Promise<SymptomExtractionResult> {
  if (!text || text.trim().length === 0) {
    return { symptoms: [], confidenceMap: {} };
  }

  try {
    const classifier = await NLPService.getInstance();
    if (!classifier) {
      throw new Error('Classifier not available');
    }

    // Run classification
    // For zero-shot, we ask: "Does this text describe [category]?"
    const result = await classifier(text, SYMPTOM_CATEGORIES, {
      multi_label: true,
    });

    const extractedSymptoms: string[] = [];
    const confidenceMap: Record<string, number> = {};

    // Filter by threshold (e.g., > 0.6)
    const THRESHOLD = 0.6;
    for (let i = 0; i < result.labels.length; i++) {
      const label = result.labels[i];
      const score = result.scores[i];

      if (score > THRESHOLD) {
        extractedSymptoms.push(label);
        confidenceMap[label] = score;
      }
    }

    return {
      symptoms: extractedSymptoms,
      confidenceMap,
    };
  } catch (error) {
    console.error('NLP symptom extraction error:', error);
    // Fallback: empty result
    return { symptoms: [], confidenceMap: {} };
  }
}
