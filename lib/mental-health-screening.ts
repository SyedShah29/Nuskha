/**
 * Mental Health Screening
 * Implements validated PHQ-9 (Depression) and GAD-7 (Anxiety) screening tools
 * Both are in the public domain — free to use clinically
 *
 * PHQ-9: Patient Health Questionnaire-9 (Kroenke & Spitzer, 2002)
 * GAD-7: Generalized Anxiety Disorder 7-item scale (Spitzer et al., 2006)
 */

export type ScreeningType = 'PHQ-9' | 'GAD-7';

export interface ScreeningQuestion {
  id: number;
  english: string;
  urdu: string;
  key: string;
}

export interface ScreeningResult {
  type: ScreeningType;
  score: number;
  maxScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  recommendation: string;
  interpretationNote: string;
}

// ─── PHQ-9 Questions ─────────────────────────────────────────────────────────
// Scoring: 0=Not at all, 1=Several days, 2=More than half, 3=Nearly every day
export const PHQ9_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 1,
    key: 'phq1',
    english: 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?',
    urdu: 'پچھلے 2 ہفتوں میں، آپ کو کتنی بار چیزوں میں دلچسپی یا خوشی کم محسوس ہوئی؟',
  },
  {
    id: 2,
    key: 'phq2',
    english: 'How often have you felt down, depressed, or hopeless?',
    urdu: 'آپ کتنی بار اداس، مایوس، یا ناامید محسوس ہوئے؟',
  },
  {
    id: 3,
    key: 'phq3',
    english: 'How often have you had trouble falling or staying asleep, or sleeping too much?',
    urdu: 'آپ کو کتنی بار سونے میں دشواری ہوئی یا بہت زیادہ نیند آئی؟',
  },
  {
    id: 4,
    key: 'phq4',
    english: 'How often have you felt tired or had little energy?',
    urdu: 'آپ کتنی بار تھکاوٹ محسوس ہوئی یا توانائی کم لگی؟',
  },
  {
    id: 5,
    key: 'phq5',
    english: 'How often have you had poor appetite or overeating?',
    urdu: 'آپ کتنی بار کم بھوک یا بہت زیادہ کھانے کا مسئلہ ہوا؟',
  },
  {
    id: 6,
    key: 'phq6',
    english: 'How often have you felt bad about yourself, or felt like a failure?',
    urdu: 'آپ کتنی بار اپنے آپ کے بارے میں برا محسوس ہوا یا ناکام محسوس ہوئے؟',
  },
  {
    id: 7,
    key: 'phq7',
    english: 'How often have you had trouble concentrating on things?',
    urdu: 'آپ کتنی بار چیزوں پر توجہ مرکوز کرنے میں دشواری ہوئی؟',
  },
  {
    id: 8,
    key: 'phq8',
    english: 'How often have you moved or spoken so slowly that others noticed, or been very fidgety?',
    urdu: 'آپ کتنی بار اتنے سست ہوئے کہ دوسروں نے دیکھا، یا بہت بے چین رہے؟',
  },
  {
    id: 9,
    key: 'phq9',
    english: 'How often have you had thoughts of being better off dead or hurting yourself?',
    urdu: 'آپ کتنی بار ایسے خیالات آئے کہ مرنا بہتر ہے یا خود کو نقصان پہنچانا؟',
  },
];

// ─── GAD-7 Questions ─────────────────────────────────────────────────────────
export const GAD7_QUESTIONS: ScreeningQuestion[] = [
  {
    id: 1,
    key: 'gad1',
    english: 'Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?',
    urdu: 'پچھلے 2 ہفتوں میں، آپ کتنی بار گھبراہٹ، بے چینی، یا پریشانی محسوس ہوئی؟',
  },
  {
    id: 2,
    key: 'gad2',
    english: 'How often have you not been able to stop or control worrying?',
    urdu: 'آپ کتنی بار فکروں کو روکنے یا کنٹرول کرنے میں ناکام رہے؟',
  },
  {
    id: 3,
    key: 'gad3',
    english: 'How often have you been worrying too much about different things?',
    urdu: 'آپ کتنی بار مختلف چیزوں کے بارے میں بہت زیادہ فکرمند رہے؟',
  },
  {
    id: 4,
    key: 'gad4',
    english: 'How often have you had trouble relaxing?',
    urdu: 'آپ کتنی بار آرام کرنے میں دشواری ہوئی؟',
  },
  {
    id: 5,
    key: 'gad5',
    english: 'How often have you been so restless that it\'s hard to sit still?',
    urdu: 'آپ کتنی بار اتنے بے چین رہے کہ بیٹھنا مشکل ہو گیا؟',
  },
  {
    id: 6,
    key: 'gad6',
    english: 'How often have you become easily annoyed or irritable?',
    urdu: 'آپ کتنی بار آسانی سے چڑچڑے یا غصہ ہوئے؟',
  },
  {
    id: 7,
    key: 'gad7',
    english: 'How often have you felt afraid as if something awful might happen?',
    urdu: 'آپ کتنی بار ڈر محسوس ہوا کہ کچھ برا ہونے والا ہے؟',
  },
];

// Standard answer options (same for both scales)
export const SCREENING_ANSWER_OPTIONS = [
  { value: 0, english: 'Not at all', urdu: 'بالکل نہیں' },
  { value: 1, english: 'Several days', urdu: 'کچھ دنوں میں' },
  { value: 2, english: 'More than half the days', urdu: 'آدھے سے زیادہ دن' },
  { value: 3, english: 'Nearly every day', urdu: 'تقریباً ہر روز' },
];

// ─── Mental Health Indicator Detection ───────────────────────────────────────

const DEPRESSION_KEYWORDS = [
  // English
  'sad', 'depressed', 'hopeless', 'worthless', 'empty', 'crying', 'no motivation',
  'loss of interest', 'can\'t enjoy', 'feel nothing', 'want to die', 'no reason to live',
  'self harm', 'suicide', 'kill myself', 'sleep too much', 'not eating', 'stopped caring',
  // Urdu / Roman Urdu
  'udas', 'اداس', 'mayoos', 'مایوس', 'rone', 'rona', 'khushi nahi', 'dil nahi lagta',
  'zindagi se thak', 'marna chahta', 'دل نہیں لگتا', 'زندگی سے تھک',
];

const ANXIETY_KEYWORDS = [
  // English
  'anxious', 'worried', 'panic', 'nervous', 'fear', 'scared', 'restless', 'overthinking',
  'heart racing', 'can\'t breathe properly', 'sweating with worry', 'can\'t stop thinking',
  'constant worry', 'chest tight with anxiety', 'trembling', 'shaking',
  // Urdu / Roman Urdu
  'ghabrahat', 'گھبراہٹ', 'fikar', 'فکر', 'dar', 'ڈر', 'bechain', 'بے چین',
  'pareshan', 'پریشان', 'khauf', 'خوف', 'sochna band nahi', 'دل تیز چلتا',
];

/**
 * Detect if mental health screening should be triggered
 */
export function detectMentalHealthIndicators(
  symptoms: string[],
  conversationText: string
): { needsPHQ9: boolean; needsGAD7: boolean; confidence: number } {
  const allText = [...symptoms, conversationText].join(' ').toLowerCase();

  const depressionMatches = DEPRESSION_KEYWORDS.filter(kw =>
    allText.includes(kw.toLowerCase())
  ).length;

  const anxietyMatches = ANXIETY_KEYWORDS.filter(kw =>
    allText.includes(kw.toLowerCase())
  ).length;

  return {
    needsPHQ9: depressionMatches >= 2,
    needsGAD7: anxietyMatches >= 2,
    confidence: Math.min((depressionMatches + anxietyMatches) * 20, 90),
  };
}

// ─── Scoring Functions ────────────────────────────────────────────────────────

/**
 * Score PHQ-9 answers
 */
export function scorePHQ9(answers: number[]): ScreeningResult {
  const score = answers.reduce((sum, a) => sum + (a || 0), 0);

  let severity: ScreeningResult['severity'];
  let recommendation: string;
  let interpretationNote: string;

  if (score <= 4) {
    severity = 'minimal';
    recommendation = 'Monitor symptoms. No immediate action required.';
    interpretationNote = 'Minimal depression symptoms detected.';
  } else if (score <= 9) {
    severity = 'mild';
    recommendation = 'Watchful waiting. Consider lifestyle interventions and supportive counseling.';
    interpretationNote = 'Mild depression symptoms. Follow-up in 4 weeks recommended.';
  } else if (score <= 14) {
    severity = 'moderate';
    recommendation = 'Referral to mental health professional. Consider counseling or therapy.';
    interpretationNote = 'Moderate depression. Treatment plan with mental health support recommended.';
  } else if (score <= 19) {
    severity = 'moderately-severe';
    recommendation = 'Active treatment with antidepressants and/or psychotherapy required.';
    interpretationNote = 'Moderately severe depression. Immediate mental health referral advised.';
  } else {
    severity = 'severe';
    recommendation = 'Immediate psychiatric evaluation required. Consider inpatient care if patient at risk.';
    interpretationNote = 'Severe depression. Urgent psychiatric intervention needed.';
  }

  // Special flag for question 9 (suicidal ideation)
  if (answers[8] && answers[8] >= 1) {
    recommendation = '⚠️ URGENT: Suicidal ideation indicated. Immediate psychiatric evaluation required. ' + recommendation;
  }

  return {
    type: 'PHQ-9',
    score,
    maxScore: 27,
    severity,
    recommendation,
    interpretationNote,
  };
}

/**
 * Score GAD-7 answers
 */
export function scoreGAD7(answers: number[]): ScreeningResult {
  const score = answers.reduce((sum, a) => sum + (a || 0), 0);

  let severity: ScreeningResult['severity'];
  let recommendation: string;
  let interpretationNote: string;

  if (score <= 4) {
    severity = 'minimal';
    recommendation = 'Monitor symptoms. No immediate action required.';
    interpretationNote = 'Minimal anxiety symptoms detected.';
  } else if (score <= 9) {
    severity = 'mild';
    recommendation = 'Consider watchful waiting, stress management techniques, and lifestyle changes.';
    interpretationNote = 'Mild anxiety. Reassessment in 2-4 weeks recommended.';
  } else if (score <= 14) {
    severity = 'moderate';
    recommendation = 'Likely warrants treatment. Consider therapy (CBT) and/or pharmacotherapy.';
    interpretationNote = 'Moderate anxiety disorder. Mental health referral recommended.';
  } else {
    severity = 'severe';
    recommendation = 'Active treatment required. Combination of medication and psychotherapy indicated.';
    interpretationNote = 'Severe anxiety disorder. Immediate psychiatric referral needed.';
  }

  return {
    type: 'GAD-7',
    score,
    maxScore: 21,
    severity,
    recommendation,
    interpretationNote,
  };
}

/**
 * Format screening result for SOAP objective section
 */
export function formatScreeningForSOAP(result: ScreeningResult): string {
  return `${result.type}: ${result.score}/${result.maxScore} — ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} ${result.type === 'PHQ-9' ? 'Depression' : 'Anxiety'}. ${result.interpretationNote}`;
}

/**
 * Generate bilingual screening prompt message for AI to ask patient
 */
export function generateScreeningPrompt(type: ScreeningType): {
  english: string;
  urdu: string;
} {
  if (type === 'PHQ-9') {
    return {
      english: 'I\'d like to ask you a few quick questions about your mood over the past 2 weeks to better understand your mental wellbeing. This is a standard medical screening called PHQ-9.',
      urdu: 'میں آپ کے موڈ اور ذہنی صحت کے بارے میں چند سوالات پوچھنا چاہتا ہوں۔ یہ PHQ-9 نامی ایک معیاری طبی جانچ ہے۔',
    };
  }
  return {
    english: 'I\'d like to assess your anxiety levels using the standard GAD-7 screening tool. I\'ll ask you 7 brief questions about the past 2 weeks.',
    urdu: 'میں GAD-7 اسکریننگ ٹول کے ذریعے آپ کی بے چینی کی سطح جاننا چاہتا ہوں۔ پچھلے 2 ہفتوں کے بارے میں 7 مختصر سوالات پوچھوں گا۔',
  };
}
