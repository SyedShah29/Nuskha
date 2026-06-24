/**
 * Vision Agent — Gemini 2.0 Flash Multimodal Analysis
 * Analyzes patient-submitted images for clinical assessment
 *
 * Uses @google/generative-ai (already installed in package.json)
 * GEMINI_API_KEY is already in .env.example
 *
 * Supported image types:
 * - Skin rashes, lesions, wounds
 * - Eye conditions (redness, jaundice, swelling)
 * - Throat/oral conditions
 * - Swelling/inflammation
 * - Wound severity
 */

import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export interface VisionAnalysisResult {
  findings: string;
  findingsUrdu: string;
  suggestedSymptoms: string[];
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'normal';
  urgency: 'emergency' | 'urgent' | 'standard' | 'routine';
  bodyArea: string;
  confidence: number;
  redFlags: string[];
  recommendations: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VISION_SYSTEM_PROMPT = `You are a clinical AI assistant analyzing a patient-submitted medical image from Pakistan. 
Your role is to provide preliminary clinical observations ONLY — not a final diagnosis.

CRITICAL RULES:
1. NEVER provide a definitive diagnosis — always say "preliminary observation" or "appears consistent with"
2. Always recommend professional medical consultation
3. Flag any emergency signs immediately
4. Be sensitive and respectful in your language
5. Consider conditions common in Pakistan (dengue, tropical conditions, local diseases)

Analyze the image and return a JSON response with this exact structure:
{
  "findings": "Brief clinical description of what is observed in English (2-3 sentences)",
  "findingsUrdu": "Same findings in Urdu (2-3 sentences)",
  "suggestedSymptoms": ["symptom1", "symptom2"],
  "severity": "critical|high|moderate|low|normal",
  "urgency": "emergency|urgent|standard|routine",
  "bodyArea": "The body part/area visible in the image",
  "confidence": 0-100,
  "redFlags": ["red flag 1 if any"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

SEVERITY GUIDE:
- critical: Severe burns, profuse bleeding, signs of necrosis, anaphylaxis signs
- high: Deep wounds, spreading infection, significant jaundice, severe swelling
- moderate: Skin rashes, moderate swelling, inflammation, possible infection signs
- low: Minor rashes, mild redness, superficial wounds
- normal: No concerning findings visible

Return ONLY valid JSON. No markdown, no explanations outside the JSON.`;

/**
 * Analyze a patient-submitted medical image
 */
export async function analyzePatientImage(
  imageBase64: string,
  mimeType: string,
  additionalContext?: string
): Promise<VisionAnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1, // Low temperature for medical analysis
    },
  });

  const imagePart: Part = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType as any,
    },
  };

  const contextPrompt = additionalContext
    ? `\n\nAdditional patient context: ${additionalContext}`
    : '';

  try {
    const result = await model.generateContent([
      VISION_SYSTEM_PROMPT + contextPrompt,
      imagePart,
    ]);

    const responseText = result.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        findings: parsed.findings || 'Image analysis completed. Please consult a healthcare provider.',
        findingsUrdu: parsed.findingsUrdu || 'تصویر کا تجزیہ مکمل ہوا۔ براہ کرم ڈاکٹر سے مشورہ کریں۔',
        suggestedSymptoms: Array.isArray(parsed.suggestedSymptoms) ? parsed.suggestedSymptoms : [],
        severity: validateSeverity(parsed.severity),
        urgency: validateUrgency(parsed.urgency),
        bodyArea: parsed.bodyArea || 'Unspecified',
        confidence: Math.min(Math.max(parsed.confidence || 50, 0), 100),
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : ['Consult a healthcare provider for proper evaluation'],
      };
    }
  } catch (error) {
    console.error('Vision analysis failed:', error);
  }

  // Fallback response
  return {
    findings: 'Image received but analysis could not be completed. Please describe your symptoms in text.',
    findingsUrdu: 'تصویر موصول ہوئی لیکن تجزیہ مکمل نہیں ہو سکا۔ براہ کرم اپنی علامات متن میں بیان کریں۔',
    suggestedSymptoms: [],
    severity: 'moderate',
    urgency: 'standard',
    bodyArea: 'Unknown',
    confidence: 0,
    redFlags: [],
    recommendations: ['Please describe your symptoms verbally for a more accurate assessment'],
  };
}

function validateSeverity(value: string): VisionAnalysisResult['severity'] {
  const valid = ['critical', 'high', 'moderate', 'low', 'normal'];
  return valid.includes(value) ? (value as VisionAnalysisResult['severity']) : 'moderate';
}

function validateUrgency(value: string): VisionAnalysisResult['urgency'] {
  const valid = ['emergency', 'urgent', 'standard', 'routine'];
  return valid.includes(value) ? (value as VisionAnalysisResult['urgency']) : 'standard';
}

/**
 * Generate a follow-up interview message based on vision findings
 */
export function generateVisionFollowUpMessage(result: VisionAnalysisResult): {
  english: string;
  urdu: string;
} {
  const urgencyPrefix =
    result.urgency === 'emergency'
      ? '🚨 URGENT: '
      : result.urgency === 'urgent'
        ? '⚠️ '
        : '';

  const english = `${urgencyPrefix}Thank you for sharing the image. Based on what I can observe: ${result.findings} I've noted the following possible symptoms: ${result.suggestedSymptoms.join(', ')}. Can you tell me more about when this started and if you have any other symptoms?`;

  const urdu = `${urgencyPrefix}تصویر شیئر کرنے کا شکریہ۔ مشاہدے کی بنیاد پر: ${result.findingsUrdu} کیا آپ بتا سکتے ہیں کہ یہ کب شروع ہوا اور کوئی اور علامات ہیں؟`;

  return { english, urdu };
}
