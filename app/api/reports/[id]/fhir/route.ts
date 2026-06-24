/**
 * FHIR R4 Export API Route
 * GET /api/reports/[id]/fhir → Returns FHIR R4 Bundle JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { convertSOAPToFHIR } from '@/lib/fhir-exporter';
import type { SOAPReport } from '@/lib/agents/types';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    const { id: reportId } = await context.params;

    const report = await prisma.sOAPReport.findUnique({
      where: { id: reportId },
      include: {
        session: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Reconstruct SOAPReport from database fields
    const soapReport: SOAPReport = {
      subjective: report.subjective as any,
      objective: report.objective as any,
      assessment: report.assessment as any,
      plan: report.plan as any,
      metadata: {
        generatedAt: report.createdAt.toISOString(),
        sessionId: report.sessionId,
        patientId: report.patientId,
        triageLabel: (report as any).triageLabel || 'standard',
        department: report.department || 'General Medicine',
        icd11Code: (report as any).icd11Code,
        icd11Title: (report as any).icd11Title,
      } as any,
    };

    const fhirBundle = convertSOAPToFHIR(
      soapReport,
      report.patientId,
      report.sessionId,
      reportId
    );

    return new NextResponse(JSON.stringify(fhirBundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Content-Disposition': `attachment; filename="fhir-bundle-${reportId}.json"`,
      },
    });
  } catch (error) {
    console.error('FHIR export error:', error);
    return NextResponse.json(
      { error: 'FHIR export failed', details: String(error) },
      { status: 500 }
    );
  }
}
