/**
 * FHIR R4 Exporter
 * Converts Nuskha SOAP reports to HL7 FHIR R4 format
 * FHIR is the global hospital EMR interoperability standard
 *
 * Free standard — no license, no key required
 * Uses fhir.js concepts without the full package dependency
 */

import type { SOAPReport } from '@/lib/agents/types';

export interface FHIRBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document';
  timestamp: string;
  entry: FHIRBundleEntry[];
  meta: {
    profile: string[];
    lastUpdated: string;
  };
}

export interface FHIRBundleEntry {
  fullUrl: string;
  resource: any;
}

/**
 * Convert a SOAP report to a FHIR R4 Bundle
 * Creates: Patient, Encounter, Composition, Condition, Observation resources
 */
export function convertSOAPToFHIR(
  soapReport: SOAPReport,
  patientId: string,
  sessionId: string,
  reportId: string
): FHIRBundle {
  const now = new Date().toISOString();
  const baseUrl = `urn:uuid:${reportId}`;

  // ── Patient Resource ──────────────────────────────────────────────────────
  const patientResource = {
    resourceType: 'Patient',
    id: `patient-${patientId}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      {
        system: 'https://nuskha.app/patients',
        value: patientId,
      },
    ],
    active: true,
    gender: (soapReport.subjective as any)?.gender || 'unknown',
    birthDate: (soapReport.subjective as any)?.dob || undefined,
  };

  // ── Encounter Resource ────────────────────────────────────────────────────
  const encounterResource = {
    resourceType: 'Encounter',
    id: `encounter-${sessionId}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
    },
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'VR',
      display: 'virtual',
    },
    type: [
      {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '390906007',
            display: 'AI-assisted clinical interview',
          },
        ],
      },
    ],
    subject: {
      reference: `Patient/patient-${patientId}`,
    },
    period: {
      start: (soapReport.metadata as any)?.generatedAt || now,
      end: now,
    },
    serviceType: {
      text: (soapReport.metadata as any)?.department || 'General Medicine',
    },
    priority: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
          code: mapTriageToFHIRPriority(soapReport.metadata?.triageLabel as string),
        },
      ],
    },
  };

  // ── Condition Resource (Primary Diagnosis) ────────────────────────────────
  const conditionResource = {
    resourceType: 'Condition',
    id: `condition-${reportId}`,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Condition'],
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'provisional', // AI diagnosis is provisional until confirmed by physician
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'encounter-diagnosis',
            display: 'Encounter Diagnosis',
          },
        ],
      },
    ],
    code: {
      coding: buildICD11Coding(soapReport),
      text: soapReport.assessment?.primaryDiagnosis || 'Under evaluation',
    },
    subject: {
      reference: `Patient/patient-${patientId}`,
    },
    encounter: {
      reference: `Encounter/encounter-${sessionId}`,
    },
    onsetDateTime: (soapReport.metadata as any)?.generatedAt || now,
    note: soapReport.assessment?.aiAnalysis
      ? [{ text: soapReport.assessment.aiAnalysis }]
      : undefined,
  };

  // ── Observations (Identified Symptoms) ───────────────────────────────────
  const observationResources = (soapReport.subjective?.symptoms || [])
    .slice(0, 10)
    .map((symptom: string, idx: number) => ({
      resourceType: 'Observation',
      id: `obs-${reportId}-${idx}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'exam',
            },
          ],
        },
      ],
      code: {
        text: symptom,
      },
      subject: {
        reference: `Patient/patient-${patientId}`,
      },
      encounter: {
        reference: `Encounter/encounter-${sessionId}`,
      },
      effectiveDateTime: now,
      valueString: symptom,
    }));

  // ── DocumentReference (SOAP notes as text) ───────────────────────────────
  const soapText = buildSOAPNarrativeText(soapReport);
  const documentResource = {
    resourceType: 'DocumentReference',
    id: `doc-${reportId}`,
    status: 'current',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '34133-9',
          display: 'Summarization of episode note',
        },
      ],
    },
    subject: {
      reference: `Patient/patient-${patientId}`,
    },
    date: now,
    author: [
      {
        display: 'Nuskha AI — v2.0 (Provisional — requires physician review)',
      },
    ],
    description: `SOAP Report — ${soapReport.assessment?.primaryDiagnosis || 'Clinical Assessment'}`,
    content: [
      {
        attachment: {
          contentType: 'text/plain',
          data: Buffer.from(soapText).toString('base64'),
          title: 'SOAP Clinical Report',
          creation: now,
        },
      },
    ],
    context: {
      encounter: [{ reference: `Encounter/encounter-${sessionId}` }],
      period: {
        start: (soapReport.metadata as any)?.generatedAt || now,
        end: now,
      },
    },
  };

  // ── Assemble FHIR Bundle ──────────────────────────────────────────────────
  const bundle: FHIRBundle = {
    resourceType: 'Bundle',
    id: `bundle-${reportId}`,
    type: 'document',
    timestamp: now,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      lastUpdated: now,
    },
    entry: [
      { fullUrl: `Patient/patient-${patientId}`, resource: patientResource },
      { fullUrl: `Encounter/encounter-${sessionId}`, resource: encounterResource },
      { fullUrl: `Condition/condition-${reportId}`, resource: conditionResource },
      ...observationResources.map((obs: any, idx: number) => ({
        fullUrl: `Observation/obs-${reportId}-${idx}`,
        resource: obs,
      })),
      { fullUrl: `DocumentReference/doc-${reportId}`, resource: documentResource },
    ],
  };

  return bundle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildICD11Coding(soapReport: SOAPReport): any[] {
  const icd11Code = (soapReport.metadata as any)?.icd11Code;
  const icd11Title = (soapReport.metadata as any)?.icd11Title;

  const codings: any[] = [];

  if (icd11Code && icd11Code !== 'ZZ99') {
    codings.push({
      system: 'http://id.who.int/icd/release/11/2024-01/mms',
      code: icd11Code,
      display: icd11Title || soapReport.assessment?.primaryDiagnosis,
    });
  }

  // Always include SNOMED placeholder
  codings.push({
    system: 'http://snomed.info/sct',
    display: soapReport.assessment?.primaryDiagnosis || 'Clinical finding',
  });

  return codings;
}

function mapTriageToFHIRPriority(triageLabel: string): string {
  const map: Record<string, string> = {
    emergency: 'EM',
    urgent: 'UR',
    standard: 'R',
    routine: 'EL',
  };
  return map[triageLabel] || 'R';
}

function buildSOAPNarrativeText(soapReport: SOAPReport): string {
  const s = soapReport.subjective;
  const o = soapReport.objective;
  const a = soapReport.assessment;
  const p = soapReport.plan;

  return [
    '=== NUSKHA SOAP REPORT ===',
    `Generated: ${(soapReport.metadata as any)?.generatedAt || new Date().toISOString()}`,
    `ICD-11: ${(soapReport.metadata as any)?.icd11Code || 'Pending'} — ${(soapReport.metadata as any)?.icd11Title || ''}`,
    '',
    'SUBJECTIVE:',
    `Chief Complaint: ${s?.chiefComplaint || 'N/A'}`,
    `Symptoms: ${(s?.symptoms || []).join(', ')}`,
    `History: ${s?.patientHistory || 'N/A'}`,
    '',
    'OBJECTIVE:',
    `Severity: ${o?.severity || 'N/A'}`,
    `AI Confidence: ${o?.confidenceLevel || 'N/A'}%`,
    `Reported Symptoms: ${(o?.reportedSymptoms || []).join(', ')}`,
    '',
    'ASSESSMENT:',
    `Primary Diagnosis: ${a?.primaryDiagnosis || 'N/A'}`,
    `Differential: ${(a?.differentialDiagnosis || []).join(', ')}`,
    `Severity: ${a?.severity || 'N/A'}`,
    `AI Analysis: ${a?.aiAnalysis || 'N/A'}`,
    `Red Flags: ${(a?.redFlags || []).join('; ') || 'None'}`,
    `Drug Interaction Warnings: ${(p as any)?.drugInteractionWarnings || 'None detected'}`,
    '',
    'PLAN:',
    `Recommendations: ${(p?.recommendations || []).join('; ')}`,
    `Tests Needed: ${(p?.testsNeeded || []).join(', ')}`,
    `Specialist Referral: ${p?.specialistReferral || 'None'}`,
    `Urgency: ${p?.urgency || 'standard'}`,
    '',
    'EVIDENCE SOURCES:',
    ...(a?.medicalSources || ['General medical knowledge']),
    '',
    '⚠️ NOTE: This report is generated by AI and requires review by a licensed physician before clinical decisions are made.',
  ].join('\n');
}
