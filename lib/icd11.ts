/**
 * ICD-11 Auto-Coding
 * Uses the FREE WHO ICD-11 API — no key required
 * https://id.who.int/icd/release/11/2024-01/mms/search
 *
 * Assigns standardized ICD-11 codes to diagnoses for hospital EMR compatibility
 */

export interface ICD11Result {
  code: string;
  title: string;
  chapter: string;
  definition?: string;
  isFound: boolean;
}

// In-memory cache to avoid repeated API calls for same diagnoses
const icd11Cache = new Map<string, ICD11Result>();

// Common diagnoses with pre-mapped ICD-11 codes (offline fallback)
const ICD11_OFFLINE_MAP: Record<string, ICD11Result> = {
  'dengue fever': { code: '1D2Z', title: 'Dengue', chapter: 'Chapter 01 - Infectious', isFound: true },
  'dengue': { code: '1D2Z', title: 'Dengue', chapter: 'Chapter 01 - Infectious', isFound: true },
  'typhoid fever': { code: '1A07', title: 'Typhoid fever', chapter: 'Chapter 01 - Infectious', isFound: true },
  'typhoid': { code: '1A07', title: 'Typhoid fever', chapter: 'Chapter 01 - Infectious', isFound: true },
  'malaria': { code: '1F40', title: 'Malaria', chapter: 'Chapter 01 - Infectious', isFound: true },
  'tuberculosis': { code: '1B10', title: 'Pulmonary tuberculosis', chapter: 'Chapter 01 - Infectious', isFound: true },
  'tb': { code: '1B10', title: 'Pulmonary tuberculosis', chapter: 'Chapter 01 - Infectious', isFound: true },
  'covid-19': { code: 'RA01', title: 'COVID-19', chapter: 'Chapter 01 - Infectious', isFound: true },
  'covid': { code: 'RA01', title: 'COVID-19', chapter: 'Chapter 01 - Infectious', isFound: true },
  'influenza': { code: '1E30', title: 'Influenza', chapter: 'Chapter 01 - Infectious', isFound: true },
  'pneumonia': { code: 'CA40', title: 'Pneumonia', chapter: 'Chapter 11 - Respiratory', isFound: true },
  'asthma': { code: 'CA23', title: 'Asthma', chapter: 'Chapter 11 - Respiratory', isFound: true },
  'bronchitis': { code: 'CA21', title: 'Acute bronchitis', chapter: 'Chapter 11 - Respiratory', isFound: true },
  'hypertension': { code: 'BA00', title: 'Essential hypertension', chapter: 'Chapter 11 - Circulatory', isFound: true },
  'heart attack': { code: 'BA41', title: 'Acute myocardial infarction', chapter: 'Chapter 11 - Circulatory', isFound: true },
  'myocardial infarction': { code: 'BA41', title: 'Acute myocardial infarction', chapter: 'Chapter 11 - Circulatory', isFound: true },
  'coronary artery disease': { code: 'BA80', title: 'Coronary artery disease', chapter: 'Chapter 11 - Circulatory', isFound: true },
  'stroke': { code: '8B20', title: 'Ischaemic stroke', chapter: 'Chapter 08 - Nervous System', isFound: true },
  'migraine': { code: '8A80', title: 'Migraine', chapter: 'Chapter 08 - Nervous System', isFound: true },
  'tension headache': { code: '8A80.0', title: 'Tension-type headache', chapter: 'Chapter 08 - Nervous System', isFound: true },
  'type 2 diabetes': { code: '5A11', title: 'Type 2 diabetes mellitus', chapter: 'Chapter 05 - Endocrine', isFound: true },
  'diabetes': { code: '5A11', title: 'Type 2 diabetes mellitus', chapter: 'Chapter 05 - Endocrine', isFound: true },
  'hypothyroidism': { code: '5A00', title: 'Hypothyroidism', chapter: 'Chapter 05 - Endocrine', isFound: true },
  'gerd': { code: 'DA22', title: 'Gastro-oesophageal reflux disease', chapter: 'Chapter 13 - Digestive', isFound: true },
  'peptic ulcer': { code: 'DA60', title: 'Peptic ulcer disease', chapter: 'Chapter 13 - Digestive', isFound: true },
  'gastroenteritis': { code: 'DA91', title: 'Gastroenteritis', chapter: 'Chapter 13 - Digestive', isFound: true },
  'hepatitis b': { code: '1E50', title: 'Hepatitis B', chapter: 'Chapter 01 - Infectious', isFound: true },
  'hepatitis c': { code: '1E51', title: 'Hepatitis C', chapter: 'Chapter 01 - Infectious', isFound: true },
  'urinary tract infection': { code: 'GC08', title: 'Urinary tract infection', chapter: 'Chapter 16 - Genitourinary', isFound: true },
  'uti': { code: 'GC08', title: 'Urinary tract infection', chapter: 'Chapter 16 - Genitourinary', isFound: true },
  'kidney stones': { code: 'GB90', title: 'Calculus of kidney', chapter: 'Chapter 16 - Genitourinary', isFound: true },
  'rheumatoid arthritis': { code: 'FA20', title: 'Rheumatoid arthritis', chapter: 'Chapter 15 - Musculoskeletal', isFound: true },
  'osteoarthritis': { code: 'FA00', title: 'Osteoarthritis', chapter: 'Chapter 15 - Musculoskeletal', isFound: true },
  'eczema': { code: 'EA80', title: 'Atopic dermatitis', chapter: 'Chapter 14 - Skin', isFound: true },
  'psoriasis': { code: 'EA90', title: 'Psoriasis', chapter: 'Chapter 14 - Skin', isFound: true },
  'depression': { code: '6A70', title: 'Single episode depressive disorder', chapter: 'Chapter 06 - Mental Health', isFound: true },
  'anxiety': { code: '6B00', title: 'Generalised anxiety disorder', chapter: 'Chapter 06 - Mental Health', isFound: true },
  'anxiety disorder': { code: '6B00', title: 'Generalised anxiety disorder', chapter: 'Chapter 06 - Mental Health', isFound: true },
  'pcos': { code: '5A80', title: 'Polycystic ovarian syndrome', chapter: 'Chapter 05 - Endocrine', isFound: true },
  'polycystic ovary syndrome': { code: '5A80', title: 'Polycystic ovarian syndrome', chapter: 'Chapter 05 - Endocrine', isFound: true },
  'common cold': { code: 'CA00', title: 'Acute nasopharyngitis', chapter: 'Chapter 11 - Respiratory', isFound: true },
};

/**
 * Get ICD-11 code for a diagnosis name
 * First checks offline cache, then tries WHO API
 */
export async function getICD11Code(diagnosisName: string): Promise<ICD11Result> {
  const normalizedName = diagnosisName.toLowerCase().trim();

  // 1. Check in-memory cache
  if (icd11Cache.has(normalizedName)) {
    return icd11Cache.get(normalizedName)!;
  }

  // 2. Check offline map (instant, no API)
  const offlineResult = findInOfflineMap(normalizedName);
  if (offlineResult) {
    icd11Cache.set(normalizedName, offlineResult);
    return offlineResult;
  }

  // 3. Try WHO ICD-11 API (free, no key)
  try {
    const encoded = encodeURIComponent(diagnosisName);
    const url = `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encoded}&flatResults=true&includeKeywordResult=false&useFlexisearch=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'API-Version': 'v2', 'Accept-Language': 'en' },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const firstResult = data.destinationEntities?.[0];

      if (firstResult) {
        const result: ICD11Result = {
          code: firstResult.theCode || 'XX',
          title: firstResult.title || diagnosisName,
          chapter: firstResult.chapter || 'Unknown',
          definition: firstResult.definition,
          isFound: true,
        };
        icd11Cache.set(normalizedName, result);
        return result;
      }
    }
  } catch {
    // WHO API unavailable — fall through to generic code
  }

  // 4. Fallback — unknown code
  const fallback: ICD11Result = {
    code: 'ZZ99',
    title: diagnosisName,
    chapter: 'Unknown',
    isFound: false,
  };
  icd11Cache.set(normalizedName, fallback);
  return fallback;
}

/**
 * Check offline map with fuzzy matching
 */
function findInOfflineMap(name: string): ICD11Result | null {
  // Exact match
  if (ICD11_OFFLINE_MAP[name]) return ICD11_OFFLINE_MAP[name];

  // Partial match (diagnosis contains a known key)
  for (const [key, result] of Object.entries(ICD11_OFFLINE_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return result;
    }
  }

  return null;
}

/**
 * Format ICD-11 code for display in reports
 */
export function formatICD11ForReport(result: ICD11Result): string {
  if (!result.isFound || result.code === 'ZZ99') {
    return `${result.title} (ICD-11: Pending coding)`;
  }
  return `${result.title} (ICD-11: ${result.code})`;
}
