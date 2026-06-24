/**
 * Drug Interaction Checker
 * Uses the FREE OpenFDA API — no API key required
 * https://api.fda.gov/drug/event.json
 *
 * Also checks patient allergies against recommended medications
 */

export interface DrugInteractionResult {
  hasInteractions: boolean;
  hasAllergyConflicts: boolean;
  interactions: DrugInteraction[];
  allergyWarnings: AllergyWarning[];
  summary: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

export interface AllergyWarning {
  drug: string;
  allergen: string;
  warning: string;
}

// Known major drug interactions (supplement OpenFDA with common pairs)
const KNOWN_INTERACTIONS: Array<{
  drugs: [string, string];
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}> = [
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'major',
    description: 'Increased bleeding risk when combined',
  },
  {
    drugs: ['metformin', 'ibuprofen'],
    severity: 'moderate',
    description: 'NSAIDs may reduce metformin effectiveness and increase kidney risk',
  },
  {
    drugs: ['lisinopril', 'potassium'],
    severity: 'moderate',
    description: 'ACE inhibitors with potassium supplements risk hyperkalemia',
  },
  {
    drugs: ['ssri', 'tramadol'],
    severity: 'major',
    description: 'Risk of serotonin syndrome',
  },
  {
    drugs: ['ciprofloxacin', 'antacid'],
    severity: 'moderate',
    description: 'Antacids reduce ciprofloxacin absorption significantly',
  },
  {
    drugs: ['methotrexate', 'ibuprofen'],
    severity: 'major',
    description: 'NSAIDs increase methotrexate toxicity risk',
  },
  {
    drugs: ['amoxicillin', 'warfarin'],
    severity: 'moderate',
    description: 'Antibiotics may potentiate anticoagulant effect',
  },
  {
    drugs: ['digoxin', 'amiodarone'],
    severity: 'major',
    description: 'Amiodarone significantly increases digoxin levels',
  },
];

// Common allergy cross-reactions
const ALLERGY_CROSS_REACTIONS: Record<string, string[]> = {
  penicillin: ['amoxicillin', 'ampicillin', 'piperacillin', 'nafcillin', 'oxacillin'],
  sulfa: ['sulfamethoxazole', 'sulfadiazine', 'sulfasalazine', 'trimethoprim-sulfamethoxazole'],
  nsaid: ['ibuprofen', 'naproxen', 'diclofenac', 'aspirin', 'indomethacin', 'celecoxib'],
  aspirin: ['ibuprofen', 'naproxen', 'diclofenac'],
  cephalosporin: ['cefazolin', 'cephalexin', 'ceftriaxone', 'cefdinir'],
  quinolone: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
  latex: ['banana', 'avocado', 'kiwi'], // For completeness
};

/**
 * Check drug-drug interactions using OpenFDA + known interaction database
 */
export async function checkDrugInteractions(
  recommendedDrugs: string[],
  currentMedications: string[]
): Promise<DrugInteraction[]> {
  const interactions: DrugInteraction[] = [];
  const allDrugs = [...recommendedDrugs, ...currentMedications];

  if (allDrugs.length < 2) return interactions;

  // 1. Check known interaction table first (fast, no API call)
  for (const pair of KNOWN_INTERACTIONS) {
    const [drug1, drug2] = pair.drugs;
    const hasFirst = allDrugs.some(d => d.toLowerCase().includes(drug1));
    const hasSecond = allDrugs.some(d => d.toLowerCase().includes(drug2));

    if (hasFirst && hasSecond) {
      const actualDrug1 = allDrugs.find(d => d.toLowerCase().includes(drug1)) || drug1;
      const actualDrug2 = allDrugs.find(d => d.toLowerCase().includes(drug2)) || drug2;

      interactions.push({
        drug1: actualDrug1,
        drug2: actualDrug2,
        severity: pair.severity,
        description: pair.description,
      });
    }
  }

  // 2. Try OpenFDA API for recommended drugs (no key required)
  for (const drug of recommendedDrugs.slice(0, 3)) { // Limit to 3 to avoid rate limiting
    try {
      const encodedDrug = encodeURIComponent(drug.toLowerCase());
      const url = `https://api.fda.gov/drug/label.json?search=drug_interactions:${encodedDrug}&limit=1`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const label = data.results?.[0];
        if (label?.drug_interactions) {
          // Check if any current medication appears in the drug interactions section
          const interactionText = label.drug_interactions.join(' ').toLowerCase();
          for (const currentMed of currentMedications) {
            if (interactionText.includes(currentMed.toLowerCase())) {
              // Avoid duplicates
              const alreadyFound = interactions.some(
                i => i.drug1.toLowerCase() === drug.toLowerCase() &&
                     i.drug2.toLowerCase() === currentMed.toLowerCase()
              );
              if (!alreadyFound) {
                interactions.push({
                  drug1: drug,
                  drug2: currentMed,
                  severity: 'moderate',
                  description: `FDA drug interaction data suggests caution when combining ${drug} with ${currentMed}. Review with prescribing physician.`,
                });
              }
            }
          }
        }
      }
    } catch {
      // Silently continue — OpenFDA is optional, known interactions table is the fallback
    }
  }

  return interactions;
}

/**
 * Check if recommended drugs conflict with known patient allergies
 */
export function checkAllergyConflicts(
  recommendedDrugs: string[],
  patientAllergies: string[]
): AllergyWarning[] {
  const warnings: AllergyWarning[] = [];

  for (const drug of recommendedDrugs) {
    const drugLower = drug.toLowerCase();

    for (const allergy of patientAllergies) {
      const allergyLower = allergy.toLowerCase();

      // Direct match
      if (drugLower.includes(allergyLower) || allergyLower.includes(drugLower)) {
        warnings.push({
          drug,
          allergen: allergy,
          warning: `⚠️ ALLERGY ALERT: Patient is allergic to ${allergy}. ${drug} may contain or be related to this allergen.`,
        });
        continue;
      }

      // Cross-reaction check
      const crossReactions = ALLERGY_CROSS_REACTIONS[allergyLower] || [];
      const isCrossReaction = crossReactions.some(cr =>
        drugLower.includes(cr) || cr.includes(drugLower)
      );

      if (isCrossReaction) {
        warnings.push({
          drug,
          allergen: allergy,
          warning: `⚠️ CROSS-REACTION RISK: Patient has ${allergy} allergy. ${drug} may cause cross-reaction. Use with extreme caution.`,
        });
      }
    }
  }

  return warnings;
}

/**
 * Full drug safety check — combines interaction and allergy checking
 */
export async function performFullDrugSafetyCheck(
  recommendedDrugs: string[],
  currentMedications: string[],
  patientAllergies: string[]
): Promise<DrugInteractionResult> {
  if (recommendedDrugs.length === 0) {
    return {
      hasInteractions: false,
      hasAllergyConflicts: false,
      interactions: [],
      allergyWarnings: [],
      summary: 'No medications recommended to check.',
    };
  }

  const [interactions, allergyWarnings] = await Promise.all([
    checkDrugInteractions(recommendedDrugs, currentMedications),
    Promise.resolve(checkAllergyConflicts(recommendedDrugs, patientAllergies)),
  ]);

  const majorInteractions = interactions.filter(i => i.severity === 'major');
  const hasInteractions = interactions.length > 0;
  const hasAllergyConflicts = allergyWarnings.length > 0;

  let summary = '';
  if (majorInteractions.length > 0) {
    summary += `🚨 ${majorInteractions.length} MAJOR drug interaction(s) detected. `;
  }
  if (hasInteractions && majorInteractions.length === 0) {
    summary += `⚠️ ${interactions.length} drug interaction(s) detected. `;
  }
  if (hasAllergyConflicts) {
    summary += `🚫 ${allergyWarnings.length} allergy conflict(s) detected. `;
  }
  if (!hasInteractions && !hasAllergyConflicts) {
    summary = '✅ No drug interactions or allergy conflicts detected.';
  }

  return {
    hasInteractions,
    hasAllergyConflicts,
    interactions,
    allergyWarnings,
    summary,
  };
}

/**
 * Extract drug names from SOAP plan recommendations
 */
export function extractDrugNamesFromPlan(recommendations: string[]): string[] {
  const commonDrugPatterns = [
    // Antibiotics
    'amoxicillin', 'ampicillin', 'ciprofloxacin', 'azithromycin', 'doxycycline',
    'metronidazole', 'ceftriaxone', 'clarithromycin', 'levofloxacin', 'clindamycin',
    'erythromycin', 'tetracycline', 'trimethoprim', 'nitrofurantoin',
    // Pain/Fever
    'ibuprofen', 'paracetamol', 'acetaminophen', 'aspirin', 'diclofenac',
    'naproxen', 'indomethacin', 'celecoxib', 'tramadol', 'morphine',
    // Cardiovascular
    'lisinopril', 'enalapril', 'amlodipine', 'metoprolol', 'atenolol',
    'warfarin', 'aspirin', 'clopidogrel', 'digoxin', 'furosemide',
    'hydrochlorothiazide', 'spironolactone', 'amiodarone',
    // Diabetes
    'metformin', 'insulin', 'glibenclamide', 'glimepiride', 'sitagliptin',
    // GI
    'omeprazole', 'pantoprazole', 'ranitidine', 'domperidone', 'metoclopramide',
    'loperamide', 'ondansetron',
    // Respiratory
    'salbutamol', 'prednisolone', 'budesonide', 'montelukast',
    // Antihistamines
    'cetirizine', 'loratadine', 'chlorphenamine',
    // Antifungals
    'fluconazole', 'clotrimazole', 'ketoconazole',
    // Antiparasitics (common in Pakistan)
    'albendazole', 'mebendazole', 'chloroquine', 'artemether',
  ];

  const foundDrugs: string[] = [];
  const planText = recommendations.join(' ').toLowerCase();

  for (const drug of commonDrugPatterns) {
    if (planText.includes(drug)) {
      foundDrugs.push(drug);
    }
  }

  return [...new Set(foundDrugs)];
}
