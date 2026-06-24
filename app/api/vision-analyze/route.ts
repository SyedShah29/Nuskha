/**
 * Vision Analyze API Route
 * Accepts image uploads and runs Gemini Vision analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzePatientImage } from '@/lib/agents/vision-agent';
import { quickEmergencyCheck } from '@/lib/agents/safety-agent';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const context = formData.get('context') as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 10MB allowed.' },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    console.log(`\n📸 [Vision Agent] Analyzing ${imageFile.type} image (${(imageFile.size / 1024).toFixed(1)}KB)...`);

    // Run vision analysis
    const analysisResult = await analyzePatientImage(
      base64,
      imageFile.type,
      context || undefined
    );

    console.log(`   ✅ Vision analysis complete`);
    console.log(`   🏥 Body area: ${analysisResult.bodyArea}`);
    console.log(`   ⚠️ Severity: ${analysisResult.severity}`);
    console.log(`   🚨 Red flags: ${analysisResult.redFlags.length}`);

    // Quick emergency check on findings
    const emergencyCheck = quickEmergencyCheck(analysisResult.redFlags);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      emergencyDetected: emergencyCheck.isEmergency,
      emergencyFlags: emergencyCheck.flags,
    });
  } catch (error) {
    console.error('❌ Vision analysis error:', error);
    return NextResponse.json(
      { error: 'Image analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}
