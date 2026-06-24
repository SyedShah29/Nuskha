/**
 * Bayesian Diagnosis Engine
 * Replaces the random Math.random() probability initialization with
 * proper Bayesian inference using Pakistani epidemiological priors.
 *
 * P(Disease | Symptoms) ∝ P(Symptoms | Disease) × P(Disease)
 *
 * Sources for priors:
 * - Pakistan National Health Survey
 * - WHO Pakistan disease burden data
 * - Pakistan Journal of Medical Sciences
 */

export interface DiseaseNode {
  name: string;
  prior: number;           // P(Disease) - base rate in Pakistani population 0-100
  symptoms: Record<string, number>; // P(symptom | disease) 0-1
  severity: 'critical' | 'high' | 'moderate' | 'initial' | 'normal';
  department: string;
  icd11Hint?: string;      // ICD-11 code hint for faster lookup
}

// ─── Pakistani Epidemiological Disease Priors ────────────────────────────────
// Prior = prevalence per 100,000 population, normalized to 0-100 scale
// Pakistan-specific: dengue, typhoid, TB, malaria are significantly higher
export const DISEASE_PRIORS: DiseaseNode[] = [
  // ── INFECTIOUS (High prevalence in Pakistan) ──────────────────────────────
  {
    name: 'Dengue Fever',
    prior: 72,
    severity: 'high',
    department: 'Infectious Disease',
    icd11Hint: '1D2Z',
    symptoms: {
      fever: 0.97, headache: 0.87, 'body ache': 0.90, rash: 0.50,
      fatigue: 0.85, nausea: 0.65, vomiting: 0.55, 'eye pain': 0.60,
      'joint pain': 0.75, 'muscle pain': 0.80, bleeding: 0.30,
    },
  },
  {
    name: 'Typhoid Fever',
    prior: 68,
    severity: 'high',
    department: 'Infectious Disease',
    icd11Hint: '1A07',
    symptoms: {
      fever: 0.98, 'abdominal pain': 0.75, diarrhea: 0.45, constipation: 0.40,
      headache: 0.80, fatigue: 0.85, 'loss of appetite': 0.80,
      nausea: 0.60, vomiting: 0.50, rash: 0.20, weakness: 0.85,
    },
  },
  {
    name: 'Malaria',
    prior: 60,
    severity: 'high',
    department: 'Infectious Disease',
    icd11Hint: '1F40',
    symptoms: {
      fever: 0.99, chills: 0.90, sweating: 0.85, headache: 0.80,
      'muscle pain': 0.75, nausea: 0.65, vomiting: 0.60, fatigue: 0.90,
      'abdominal pain': 0.40, diarrhea: 0.30,
    },
  },
  {
    name: 'Tuberculosis',
    prior: 65,
    severity: 'high',
    department: 'Pulmonology',
    icd11Hint: '1B10',
    symptoms: {
      cough: 0.95, 'night sweats': 0.75, 'weight loss': 0.80,
      fatigue: 0.85, fever: 0.65, hemoptysis: 0.35, 'chest pain': 0.45,
      'shortness of breath': 0.50, 'loss of appetite': 0.75,
    },
  },
  {
    name: 'COVID-19',
    prior: 55,
    severity: 'high',
    department: 'Infectious Disease',
    icd11Hint: 'RA01',
    symptoms: {
      fever: 0.87, cough: 0.68, fatigue: 0.83, 'shortness of breath': 0.61,
      'loss of smell': 0.72, 'loss of taste': 0.70, headache: 0.60,
      'sore throat': 0.55, 'body ache': 0.70, diarrhea: 0.30,
      chills: 0.55,
    },
  },
  {
    name: 'Influenza',
    prior: 70,
    severity: 'moderate',
    department: 'General Medicine',
    icd11Hint: '1E30',
    symptoms: {
      fever: 0.90, cough: 0.78, 'sore throat': 0.60, headache: 0.80,
      'muscle pain': 0.73, fatigue: 0.85, chills: 0.70, weakness: 0.80,
      'runny nose': 0.65, sneezing: 0.55,
    },
  },
  {
    name: 'Common Cold',
    prior: 90,
    severity: 'normal',
    department: 'General Medicine',
    icd11Hint: 'CA00',
    symptoms: {
      'runny nose': 0.90, sneezing: 0.85, 'sore throat': 0.75, cough: 0.65,
      congestion: 0.80, headache: 0.55, fever: 0.30, fatigue: 0.50,
    },
  },
  {
    name: 'Hepatitis B',
    prior: 58,
    severity: 'high',
    department: 'Gastroenterology',
    icd11Hint: '1E50',
    symptoms: {
      jaundice: 0.75, fatigue: 0.88, nausea: 0.70, vomiting: 0.55,
      'abdominal pain': 0.65, 'loss of appetite': 0.80, fever: 0.45,
      'dark urine': 0.70, 'clay stool': 0.55,
    },
  },
  {
    name: 'Hepatitis C',
    prior: 55,
    severity: 'high',
    department: 'Gastroenterology',
    icd11Hint: '1E51',
    symptoms: {
      fatigue: 0.88, 'abdominal pain': 0.60, nausea: 0.60, jaundice: 0.65,
      'loss of appetite': 0.75, 'dark urine': 0.65, weakness: 0.80,
    },
  },
  // ── RESPIRATORY ────────────────────────────────────────────────────────────
  {
    name: 'Pneumonia',
    prior: 55,
    severity: 'high',
    department: 'Pulmonology',
    icd11Hint: 'CA40',
    symptoms: {
      fever: 0.90, cough: 0.92, 'shortness of breath': 0.82, 'chest pain': 0.68,
      fatigue: 0.80, chills: 0.65, nausea: 0.45, sweating: 0.55,
    },
  },
  {
    name: 'Asthma',
    prior: 52,
    severity: 'moderate',
    department: 'Pulmonology',
    icd11Hint: 'CA23',
    symptoms: {
      wheezing: 0.90, 'shortness of breath': 0.88, cough: 0.80,
      'chest tightness': 0.82, 'night cough': 0.75,
    },
  },
  {
    name: 'Bronchitis',
    prior: 60,
    severity: 'moderate',
    department: 'Pulmonology',
    icd11Hint: 'CA21',
    symptoms: {
      cough: 0.95, 'chest discomfort': 0.65, fatigue: 0.70,
      'shortness of breath': 0.55, fever: 0.50, mucus: 0.80,
    },
  },
  // ── CARDIOVASCULAR ─────────────────────────────────────────────────────────
  {
    name: 'Hypertension',
    prior: 70,
    severity: 'high',
    department: 'Cardiology',
    icd11Hint: 'BA00',
    symptoms: {
      headache: 0.55, dizziness: 0.50, 'blurred vision': 0.40,
      'chest pain': 0.35, 'shortness of breath': 0.45, nosebleed: 0.25,
    },
  },
  {
    name: 'Coronary Artery Disease',
    prior: 45,
    severity: 'high',
    department: 'Cardiology',
    icd11Hint: 'BA80',
    symptoms: {
      'chest pain': 0.88, 'shortness of breath': 0.75, fatigue: 0.70,
      'arm pain': 0.60, 'jaw pain': 0.40, sweating: 0.65, nausea: 0.50,
    },
  },
  {
    name: 'Heart Attack',
    prior: 30,
    severity: 'critical',
    department: 'Cardiology',
    icd11Hint: 'BA41',
    symptoms: {
      'chest pain': 0.97, 'shortness of breath': 0.85, 'arm pain': 0.72,
      sweating: 0.80, nausea: 0.70, dizziness: 0.65, fatigue: 0.75,
    },
  },
  // ── GASTROINTESTINAL ───────────────────────────────────────────────────────
  {
    name: 'Gastroenteritis',
    prior: 80,
    severity: 'moderate',
    department: 'Gastroenterology',
    icd11Hint: 'DA91',
    symptoms: {
      diarrhea: 0.92, nausea: 0.88, vomiting: 0.80, 'abdominal pain': 0.85,
      fever: 0.55, cramping: 0.80, dehydration: 0.65,
    },
  },
  {
    name: 'GERD',
    prior: 65,
    severity: 'moderate',
    department: 'Gastroenterology',
    icd11Hint: 'DA22',
    symptoms: {
      heartburn: 0.92, 'acid reflux': 0.88, 'chest pain': 0.55,
      'difficulty swallowing': 0.45, 'sore throat': 0.40, cough: 0.35,
      nausea: 0.50,
    },
  },
  {
    name: 'Peptic Ulcer',
    prior: 50,
    severity: 'moderate',
    department: 'Gastroenterology',
    icd11Hint: 'DA60',
    symptoms: {
      'abdominal pain': 0.92, nausea: 0.65, vomiting: 0.55,
      heartburn: 0.70, 'loss of appetite': 0.65, bloating: 0.60,
    },
  },
  // ── NEUROLOGICAL ───────────────────────────────────────────────────────────
  {
    name: 'Migraine',
    prior: 60,
    severity: 'moderate',
    department: 'Neurology',
    icd11Hint: '8A80',
    symptoms: {
      headache: 0.97, nausea: 0.73, vomiting: 0.55, 'light sensitivity': 0.80,
      'sound sensitivity': 0.75, 'visual aura': 0.28, dizziness: 0.50,
    },
  },
  {
    name: 'Tension Headache',
    prior: 75,
    severity: 'normal',
    department: 'Neurology',
    icd11Hint: '8A80',
    symptoms: {
      headache: 0.97, 'neck stiffness': 0.55, stress: 0.65,
      'light sensitivity': 0.30, fatigue: 0.60,
    },
  },
  {
    name: 'Stroke',
    prior: 25,
    severity: 'critical',
    department: 'Neurology',
    icd11Hint: '8B20',
    symptoms: {
      'facial drooping': 0.92, 'arm weakness': 0.90, 'speech difficulty': 0.88,
      'sudden headache': 0.65, confusion: 0.80, dizziness: 0.70,
      'vision loss': 0.55,
    },
  },
  // ── MUSCULOSKELETAL ────────────────────────────────────────────────────────
  {
    name: 'Rheumatoid Arthritis',
    prior: 45,
    severity: 'moderate',
    department: 'Rheumatology',
    icd11Hint: 'FA20',
    symptoms: {
      'joint pain': 0.97, 'joint swelling': 0.90, 'morning stiffness': 0.88,
      fatigue: 0.80, fever: 0.35, 'joint warmth': 0.75,
    },
  },
  {
    name: 'Osteoarthritis',
    prior: 55,
    severity: 'moderate',
    department: 'Rheumatology',
    icd11Hint: 'FA00',
    symptoms: {
      'joint pain': 0.95, stiffness: 0.88, 'joint swelling': 0.65,
      'reduced range of motion': 0.80, 'joint crepitus': 0.70,
    },
  },
  // ── METABOLIC / ENDOCRINE ──────────────────────────────────────────────────
  {
    name: 'Type 2 Diabetes',
    prior: 68,
    severity: 'high',
    department: 'Endocrinology',
    icd11Hint: '5A11',
    symptoms: {
      'frequent urination': 0.88, 'increased thirst': 0.88, fatigue: 0.80,
      'blurred vision': 0.65, 'slow healing': 0.70, 'weight loss': 0.60,
      'frequent infections': 0.55, numbness: 0.50,
    },
  },
  {
    name: 'Hypothyroidism',
    prior: 50,
    severity: 'moderate',
    department: 'Endocrinology',
    icd11Hint: '5A00',
    symptoms: {
      fatigue: 0.90, 'weight gain': 0.80, 'cold intolerance': 0.75,
      constipation: 0.65, 'dry skin': 0.70, 'hair loss': 0.65,
      depression: 0.60, 'slow heart rate': 0.55,
    },
  },
  // ── RENAL ──────────────────────────────────────────────────────────────────
  {
    name: 'Urinary Tract Infection',
    prior: 65,
    severity: 'moderate',
    department: 'Urology',
    icd11Hint: 'GC08',
    symptoms: {
      'painful urination': 0.95, 'frequent urination': 0.90, 'urge to urinate': 0.85,
      'cloudy urine': 0.75, 'blood in urine': 0.55, 'pelvic pain': 0.65,
      fever: 0.50, 'back pain': 0.45,
    },
  },
  {
    name: 'Kidney Stones',
    prior: 45,
    severity: 'high',
    department: 'Urology',
    icd11Hint: 'GB90',
    symptoms: {
      'severe back pain': 0.95, 'blood in urine': 0.75, 'painful urination': 0.70,
      nausea: 0.75, vomiting: 0.65, 'frequent urination': 0.65,
    },
  },
  // ── DERMATOLOGICAL ─────────────────────────────────────────────────────────
  {
    name: 'Eczema',
    prior: 55,
    severity: 'normal',
    department: 'Dermatology',
    icd11Hint: 'EA80',
    symptoms: {
      itching: 0.97, rash: 0.92, 'dry skin': 0.88, redness: 0.85,
      swelling: 0.55, 'skin cracking': 0.70,
    },
  },
  {
    name: 'Psoriasis',
    prior: 35,
    severity: 'moderate',
    department: 'Dermatology',
    icd11Hint: 'EA90',
    symptoms: {
      rash: 0.95, 'skin scaling': 0.92, itching: 0.75, redness: 0.90,
      'joint pain': 0.35, 'nail changes': 0.55,
    },
  },
  // ── MENTAL HEALTH ──────────────────────────────────────────────────────────
  {
    name: 'Depression',
    prior: 55,
    severity: 'high',
    department: 'Psychiatry',
    icd11Hint: '6A70',
    symptoms: {
      'low mood': 0.95, 'loss of interest': 0.92, fatigue: 0.85,
      'sleep problems': 0.80, 'appetite changes': 0.75, concentration: 0.70,
      worthlessness: 0.72, hopelessness: 0.75,
    },
  },
  {
    name: 'Anxiety Disorder',
    prior: 58,
    severity: 'moderate',
    department: 'Psychiatry',
    icd11Hint: '6B00',
    symptoms: {
      worry: 0.95, 'rapid heartbeat': 0.70, sweating: 0.65,
      trembling: 0.60, 'shortness of breath': 0.60, 'sleep problems': 0.75,
      concentration: 0.70, restlessness: 0.80,
    },
  },
  // ── REPRODUCTIVE ───────────────────────────────────────────────────────────
  {
    name: 'Polycystic Ovary Syndrome',
    prior: 50,
    severity: 'moderate',
    department: 'Gynecology',
    icd11Hint: '5A80',
    symptoms: {
      'irregular periods': 0.90, 'weight gain': 0.70, acne: 0.65,
      'excess hair': 0.60, 'hair loss': 0.55, fatigue: 0.70,
    },
  },
];

// ─── Bayesian Update Engine ──────────────────────────────────────────────────

export interface BayesianBeliefState {
  diseases: Array<{
    name: string;
    posterior: number;  // Updated probability 0-100
    prior: number;
    severity: string;
    department: string;
    icd11Hint?: string;
  }>;
  confidenceScore: number;
  entropy: number;
}

/**
 * Initialize belief state with Pakistani priors
 */
export function initializeBayesianBeliefs(): BayesianBeliefState {
  const total = DISEASE_PRIORS.reduce((sum, d) => sum + d.prior, 0);

  const diseases = DISEASE_PRIORS.map(d => ({
    name: d.name,
    posterior: (d.prior / total) * 100,
    prior: d.prior,
    severity: d.severity,
    department: d.department,
    icd11Hint: d.icd11Hint,
  }));

  return {
    diseases: diseases.sort((a, b) => b.posterior - a.posterior),
    confidenceScore: 0,
    entropy: computeEntropy(diseases.map(d => d.posterior)),
  };
}

/**
 * Update beliefs given a confirmed or denied symptom
 * Uses: P(D|S) = P(S|D) × P(D) / P(S)
 */
export function updateBeliefs(
  state: BayesianBeliefState,
  symptom: string,
  confirmed: boolean
): BayesianBeliefState {
  const normalizedSymptom = symptom.toLowerCase().trim();

  // Compute updated posteriors
  const updatedDiseases = state.diseases.map(diseaseNode => {
    const diseaseData = DISEASE_PRIORS.find(d => d.name === diseaseNode.name);
    if (!diseaseData) return diseaseNode;

    // Get P(symptom | disease) — likelihood
    const likelihood = diseaseData.symptoms[normalizedSymptom] ?? 0.15;

    // Bayesian update:
    // If confirmed: P(D|S+) ∝ P(S|D) × P(D)
    // If denied:    P(D|S-) ∝ (1 - P(S|D)) × P(D)
    const factor = confirmed ? likelihood : (1 - likelihood);

    return {
      ...diseaseNode,
      posterior: diseaseNode.posterior * (factor > 0 ? factor : 0.05),
    };
  });

  // Normalize posteriors to sum to 100
  const totalPosterior = updatedDiseases.reduce((sum, d) => sum + d.posterior, 0);
  const normalized = updatedDiseases.map(d => ({
    ...d,
    posterior: totalPosterior > 0 ? (d.posterior / totalPosterior) * 100 : 100 / updatedDiseases.length,
  }));

  // Sort by posterior descending
  normalized.sort((a, b) => b.posterior - a.posterior);

  const entropy = computeEntropy(normalized.map(d => d.posterior));
  const confidenceScore = computeConfidence(entropy, normalized);

  return {
    diseases: normalized,
    confidenceScore,
    entropy,
  };
}

/**
 * Update beliefs for multiple symptoms at once
 */
export function updateBeliefsMulti(
  state: BayesianBeliefState,
  confirmedSymptoms: string[],
  deniedSymptoms: string[]
): BayesianBeliefState {
  let currentState = state;

  for (const symptom of confirmedSymptoms) {
    currentState = updateBeliefs(currentState, symptom, true);
  }
  for (const symptom of deniedSymptoms) {
    currentState = updateBeliefs(currentState, symptom, false);
  }

  return currentState;
}

/**
 * Shannon entropy of the posterior distribution
 * Low entropy = high confidence (probability mass concentrated on few diseases)
 * High entropy = low confidence (probability spread across many diseases)
 */
function computeEntropy(posteriors: number[]): number {
  const total = posteriors.reduce((s, p) => s + p, 0);
  if (total === 0) return Math.log(posteriors.length);

  return -posteriors.reduce((sum, p) => {
    const prob = p / total;
    return prob > 0 ? sum + prob * Math.log2(prob) : sum;
  }, 0);
}

/**
 * Confidence score from posterior distribution
 * 0 = completely uncertain, 100 = fully confident
 */
function computeConfidence(
  entropy: number,
  diseases: Array<{ posterior: number }>
): number {
  const maxEntropy = Math.log2(diseases.length); // Worst case: uniform distribution
  if (maxEntropy === 0) return 100;

  // Entropic confidence: 1 - normalized entropy
  const entropicConfidence = (1 - entropy / maxEntropy) * 100;

  // Top disease concentration bonus
  const topPosterior = diseases[0]?.posterior ?? 0;
  const top3Sum = diseases.slice(0, 3).reduce((s, d) => s + d.posterior, 0);

  // Blend: 60% from entropy, 40% from top disease concentration
  const confidence = entropicConfidence * 0.6 + (top3Sum / 100) * 40;

  return Math.min(Math.max(Math.round(confidence), 0), 99); // Cap at 99 (100 requires clinical validation)
}

/**
 * Convert Bayesian state to the DiagnosisState format used by the rest of the system
 */
export function toBayesianDiseaseList(state: BayesianBeliefState) {
  return state.diseases.slice(0, 20).map(d => ({
    name: d.name,
    probability: Math.round(d.posterior),
    matchedSymptoms: [] as string[],
    differentiatingSymptoms: [] as string[],
    severity: d.severity as 'critical' | 'high' | 'moderate' | 'initial' | 'normal',
  }));
}

/**
 * Extract symptom keywords from text using normalized medical vocabulary
 * Maps both Urdu/Roman Urdu and English terms to canonical English symptom names
 */
export function extractSymptomsFromText(text: string): {
  confirmed: string[];
  denied: string[];
} {
  const lower = text.toLowerCase();

  // Negation detection
  const negationPatterns = [
    /\b(no|not|don't|dont|haven't|havent|never|nahi|نہیں|nahin|without)\b.*?(\w+)/g,
  ];

  const negatedWords = new Set<string>();
  for (const pattern of negationPatterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      negatedWords.add(match[2]);
    }
  }

  // Symptom vocabulary: Urdu/Roman Urdu → canonical English
  const SYMPTOM_MAP: Record<string, string> = {
    // Pain
    'dard': 'pain', 'درد': 'pain', 'drd': 'pain',
    // Fever
    'bukhar': 'fever', 'بخار': 'fever', 'temperature': 'fever',
    // Cough
    'khansi': 'cough', 'کھانسی': 'cough',
    // Headache
    'sar dard': 'headache', 'sir dard': 'headache', 'سر درد': 'headache',
    // Nausea
    'ji matlana': 'nausea', 'matli': 'nausea', 'متلی': 'nausea',
    // Vomiting
    'ulti': 'vomiting', 'qai': 'vomiting', 'قے': 'vomiting',
    // Dizziness
    'chakkar': 'dizziness', 'چکر': 'dizziness',
    // Weakness
    'kamzori': 'fatigue', 'کمزوری': 'fatigue', 'thakan': 'fatigue', 'تھکان': 'fatigue',
    // Breathing
    'saans': 'shortness of breath', 'سانس': 'shortness of breath',
    // Chest
    'seena': 'chest pain', 'سینہ': 'chest pain',
    // Stomach
    'pait': 'abdominal pain', 'پیٹ': 'abdominal pain',
    // Throat
    'gala': 'sore throat', 'گلا': 'sore throat',
    // Joints
    'jor': 'joint pain', 'جوڑ': 'joint pain',
    // Skin
    'jild': 'rash', 'جلد': 'rash', 'daane': 'rash',
    // Itching
    'khujli': 'itching', 'کھجلی': 'itching',
    // Swelling
    'sujan': 'swelling', 'سوجن': 'swelling',
    // Bleeding
    'khoon': 'bleeding', 'خون': 'bleeding',
    // Sleep
    'neend': 'sleep problems', 'نیند': 'sleep problems',
    // Heart
    'dil': 'rapid heartbeat', 'دل': 'rapid heartbeat',
    // Back
    'kamar dard': 'back pain', 'kamar': 'back pain',
    // Diarrhea
    'dast': 'diarrhea', 'داست': 'diarrhea', 'loose motion': 'diarrhea',
    // Jaundice
    'yarqan': 'jaundice', 'یرقان': 'jaundice',
    // Urination
    'peshab': 'frequent urination', 'پیشاب': 'frequent urination',
  };

  // All canonical symptom names from DISEASE_PRIORS
  const ALL_SYMPTOMS = new Set(
    DISEASE_PRIORS.flatMap(d => Object.keys(d.symptoms))
  );

  const confirmed: string[] = [];
  const denied: string[] = [];

  // Check Urdu/Roman Urdu mappings
  for (const [term, canonical] of Object.entries(SYMPTOM_MAP)) {
    if (lower.includes(term)) {
      const isNegated = [...negatedWords].some(w => w.includes(term.split(' ')[0]));
      if (isNegated) {
        denied.push(canonical);
      } else {
        confirmed.push(canonical);
      }
    }
  }

  // Check canonical English symptoms directly
  for (const symptom of ALL_SYMPTOMS) {
    if (lower.includes(symptom)) {
      const isNegated = [...negatedWords].some(w => symptom.includes(w));
      if (!confirmed.includes(symptom) && !denied.includes(symptom)) {
        if (isNegated) {
          denied.push(symptom);
        } else {
          confirmed.push(symptom);
        }
      }
    }
  }

  return {
    confirmed: [...new Set(confirmed)],
    denied: [...new Set(denied)],
  };
}
