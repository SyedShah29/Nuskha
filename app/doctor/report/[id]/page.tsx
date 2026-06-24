'use client';

import { useEffect, useState, use, useRef } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Download,
  MessageSquare,
  Send,
  Pill,
  Printer,
  Loader2,
  Star,
  RefreshCw,
  Building,
  Share2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface ReportData {
  id: string;
  sessionId: string;
  patientId: string;
  patientName: string;
  patientInfo: {
    age?: number;
    gender?: string;
    bloodGroup?: string;
  } | null;
  medicalHistory: {
    chronicConditions?: string[];
    currentMedications?: string[];
    allergies?: string[];
  } | null;
  subjective: {
    chiefComplaint: string;
    symptoms: string[];
    patientHistory: string;
    patientNarrative: string;
  };
  objective: {
    reportedSymptoms: string[];
    severity: string;
    confidenceLevel: number;
  };
  assessment: {
    primaryDiagnosis: string;
    differentialDiagnosis: string[];
    severity: string;
    confidence: number;
    aiAnalysis: string;
    redFlags: string[];
  };
  plan: {
    recommendations: string[];
    testsNeeded: string[];
    specialistReferral?: string;
    followUpNeeded: boolean;
    urgency: string;
  };
  department: string;
  priority: string;
  reviewStatus: string;
  createdAt: string;
  sessionDate: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function DoctorReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [includeDoctorDetails, setIncludeDoctorDetails] = useState(false);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getSession();
  }, [router]);

  // Fetch report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
      }
    };

    if (user) {
      fetchReport();
    }
  }, [id, user]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleRatingClick = (star: number) => {
    setRating(star);
  };

  const handleRegenerate = async () => {
    if (!notes.trim()) {
      alert('Please provide feedback notes for regeneration');
      return;
    }
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/reports/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: notes,
          starRating: rating || 2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setReport(prev =>
            prev
              ? {
                  ...prev,
                  subjective: data.report.subjective,
                  objective: data.report.objective,
                  assessment: data.report.assessment,
                  plan: data.report.plan,
                }
              : null
          );
        }
        setNotes('');
        setRating(0);
      }
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnBase64: false }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SOAP_Report_${id.slice(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/reports/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: chatInput,
          chatHistory: chatMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!decision || !rating) return;

    setIsSubmitting(true);
    try {
      // If prescription is provided and approved, generate prescription PDF
      if (decision === 'accept' && prescription.trim()) {
        await fetch(`/api/reports/${id}/prescription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescription,
            includeDoctorDetails,
            returnBase64: true,
          }),
        });
      }

      // Submit the review
      const res = await fetch(`/api/reports/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: decision === 'accept' ? 'approve' : 'reject',
          feedback: notes,
          starRating: rating,
          rejectionReason: decision === 'reject' ? notes : undefined,
          prescription: decision === 'accept' ? prescription : undefined,
          doctorNotes: notes,
        }),
      });

      if (res.ok) {
        router.push('/doctor/dashboard');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      emergency: { bg: 'bg-[#EF4444]/10 border-[#EF4444]/20', text: 'text-[#EF4444]' },
      urgent: {
        bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20',
        text: 'text-[#F59E0B]',
      },
      high: { bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20', text: 'text-[#F59E0B]' },
      standard: { bg: 'bg-[rgba(15,17,23,0.04)] border-border', text: 'text-foreground' },
      normal: { bg: 'bg-[#059669]/10 border-[#059669]/20', text: 'text-[#059669]' },
      routine: { bg: 'bg-[#059669]/10 border-[#059669]/20', text: 'text-[#059669]' },
    };
    const { bg, text } = config[urgency?.toLowerCase()] || config.standard;
    return { bg, text };
  };

  if (loading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
      </div>
    );
  }

  const urgencyStyle = getUrgencyBadge(report.priority);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/doctor/dashboard">
              <button className="p-2 rounded-xl hover:bg-[rgba(15,17,23,0.04)] transition-colors">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <Image
                src="/logo/nuskha-emerald.svg"
                alt="Nuskha"
                width={32}
                height={32}
                className="rounded-xl"
              />
              <div>
                <h1 className="font-bold text-foreground">
                  SOAP Report Review
                </h1>
                <p className="font-mono-data text-xs text-muted-foreground">
                  ID: {id.slice(0, 12)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl bg-surface border-border hover:bg-[rgba(15,17,23,0.02)]"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              )}
              <span className="font-bold">Download PDF</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl bg-surface border-border hover:bg-[rgba(15,17,23,0.02)] hidden sm:flex"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-bold">Print</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SOAP Report */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[rgba(15,17,23,0.04)] border border-border rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">
                      {report.patientName}
                    </h2>
                    <p className="text-muted-foreground font-mono-data text-sm mt-1">
                      {report.patientInfo?.age
                        ? `${report.patientInfo.age} years old`
                        : 'Age not specified'}
                      {report.patientInfo?.gender
                        ? ` • ${report.patientInfo.gender}`
                        : ''}
                      {report.patientInfo?.bloodGroup
                        ? ` • ${report.patientInfo.bloodGroup}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start sm:items-end">
                  <div
                    className={`px-3 py-1 rounded-md border text-xs font-bold font-mono-data uppercase tracking-wider flex items-center gap-1.5 ${urgencyStyle.bg} ${urgencyStyle.text}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{report.priority}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(15,17,23,0.04)] rounded-md border border-border">
                    <Building className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-bold font-mono-data uppercase tracking-wider text-foreground">
                      {report.department || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono-data font-bold text-muted-foreground pt-4 border-t border-border mt-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {new Date(report.sessionDate).toLocaleString()}
                </span>
                <span>•</span>
                <span>
                  Confidence:{' '}
                  {report.assessment?.confidence ||
                    report.objective?.confidenceLevel}
                  %
                </span>
              </div>
            </motion.div>

            {/* Subjective */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">S</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Subjective</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Chief Complaint</p>
                  <p className="text-foreground leading-relaxed">
                    {report.subjective?.chiefComplaint || 'Not specified'}
                  </p>
                </div>
                {report.subjective?.patientNarrative && (
                  <div>
                    <p className="eyebrow mb-2">Patient Narrative</p>
                    <div className="bg-[rgba(15,17,23,0.02)] rounded-xl p-4 border border-border">
                      <p className="text-foreground leading-relaxed italic">
                        "{report.subjective.patientNarrative}"
                      </p>
                    </div>
                  </div>
                )}
                {report.subjective?.symptoms?.length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Reported Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {report.subjective.symptoms.map((symptom, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-surface border border-border text-foreground rounded-md text-sm font-bold"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {report.medicalHistory && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border">
                    {report.medicalHistory.chronicConditions &&
                      report.medicalHistory.chronicConditions.length > 0 && (
                        <div>
                          <p className="eyebrow mb-2">Chronic Conditions</p>
                          <p className="text-foreground text-sm leading-relaxed">
                            {report.medicalHistory.chronicConditions.join(', ')}
                          </p>
                        </div>
                      )}
                    {report.medicalHistory.currentMedications &&
                      report.medicalHistory.currentMedications.length > 0 && (
                        <div>
                          <p className="eyebrow mb-2">Current Medications</p>
                          <p className="text-foreground text-sm leading-relaxed">
                            {report.medicalHistory.currentMedications.join(', ')}
                          </p>
                        </div>
                      )}
                    {report.medicalHistory.allergies &&
                      report.medicalHistory.allergies.length > 0 && (
                        <div>
                          <p className="eyebrow mb-2 text-[#EF4444]">Allergies</p>
                          <p className="text-[#EF4444] font-bold text-sm">
                            {report.medicalHistory.allergies.join(', ')}
                          </p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Objective */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">O</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Objective</h3>
              </div>
              <div className="space-y-6">
                <div className="bg-[#F59E0B]/10 rounded-xl p-4 border border-[#F59E0B]/20">
                  <p className="text-sm font-bold text-[#F59E0B] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Vital signs not collected during virtual consultation. Patient should have vitals measured during in-person visit.
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[rgba(15,17,23,0.02)] border border-border rounded-xl p-5 text-center">
                    <p className="eyebrow mb-2">Severity</p>
                    <p className="font-bold text-foreground text-lg capitalize tracking-tight">
                      {report.objective?.severity || 'Moderate'}
                    </p>
                  </div>
                  <div className="bg-[rgba(15,17,23,0.02)] border border-border rounded-xl p-5 text-center">
                    <p className="eyebrow mb-2">Confidence</p>
                    <p className="font-bold text-foreground text-lg tracking-tight font-mono-data">
                      {report.objective?.confidenceLevel || 0}%
                    </p>
                  </div>
                  <div className="bg-[rgba(15,17,23,0.02)] border border-border rounded-xl p-5 text-center">
                    <p className="eyebrow mb-2">Symptoms</p>
                    <p className="font-bold text-foreground text-lg tracking-tight font-mono-data">
                      {report.objective?.reportedSymptoms?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">A</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Assessment</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Primary Diagnosis</p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">
                    {report.assessment?.primaryDiagnosis || 'Under evaluation'}
                  </p>
                </div>
                {report.assessment?.differentialDiagnosis &&
                  report.assessment.differentialDiagnosis.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Differential Diagnoses</p>
                      <div className="flex flex-wrap gap-2">
                        {report.assessment.differentialDiagnosis.map((dx, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface border border-border rounded-md text-foreground text-sm font-bold"
                          >
                            {dx}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {report.assessment?.aiAnalysis && (
                  <div>
                    <p className="eyebrow mb-2">Clinical Reasoning</p>
                    <p className="text-foreground leading-relaxed text-sm">
                      {report.assessment.aiAnalysis}
                    </p>
                  </div>
                )}
                {report.assessment?.redFlags &&
                  report.assessment.redFlags.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="eyebrow mb-3 text-[#EF4444]">Red Flags Identified</p>
                      <div className="flex flex-wrap gap-2">
                        {report.assessment.redFlags.map((flag, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#EF4444]/10 text-[#EF4444] rounded-md text-xs font-bold font-mono-data border border-[#EF4444]/20"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>

            {/* Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#059669]/10 border border-[#059669]/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-[#059669]">P</span>
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">
                  Plan (AI Recommended)
                </h3>
              </div>
              <div className="space-y-6">
                {report.plan?.recommendations &&
                  report.plan.recommendations.length > 0 && (
                    <ul className="space-y-3">
                      {report.plan.recommendations.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 p-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl"
                        >
                          <span className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold font-mono-data flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-foreground leading-relaxed text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                {report.plan?.testsNeeded &&
                  report.plan.testsNeeded.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Recommended Tests</p>
                      <div className="flex flex-wrap gap-2">
                        {report.plan.testsNeeded.map((test, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface border border-border rounded-md text-foreground text-sm font-bold"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {report.plan?.specialistReferral && (
                  <div className="flex items-center gap-3 p-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl mt-6">
                    <Building className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-bold text-sm">
                      Specialist Referral Required: <span className="text-[#059669]">{report.plan.specialistReferral}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-surface p-6 sticky top-24"
            >
              <h3 className="text-lg font-bold text-foreground mb-5 tracking-tight">
                Review Decision
              </h3>

              {/* Accept/Reject Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setDecision('accept')}
                  className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                    decision === 'accept'
                      ? 'border-[#059669] bg-[#059669]/5 shadow-sm'
                      : 'border-border bg-surface hover:border-[#059669]/50'
                  }`}
                >
                  <CheckCircle
                    className={`w-8 h-8 ${
                      decision === 'accept' ? 'text-[#059669]' : 'text-muted-foreground'
                    }`}
                  />
                  <p
                    className={`font-bold tracking-tight ${
                      decision === 'accept' ? 'text-[#059669]' : 'text-foreground'
                    }`}
                  >
                    Accept
                  </p>
                </button>
                <button
                  onClick={() => setDecision('reject')}
                  className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                    decision === 'reject'
                      ? 'border-[#EF4444] bg-[#EF4444]/5 shadow-sm'
                      : 'border-border bg-surface hover:border-[#EF4444]/50'
                  }`}
                >
                  <XCircle
                    className={`w-8 h-8 ${
                      decision === 'reject' ? 'text-[#EF4444]' : 'text-muted-foreground'
                    }`}
                  />
                  <p
                    className={`font-bold tracking-tight ${
                      decision === 'reject' ? 'text-[#EF4444]' : 'text-foreground'
                    }`}
                  >
                    Reject
                  </p>
                </button>
              </div>

              {/* Rating System */}
              <div className="mb-8 p-5 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl">
                <h4 className="eyebrow mb-4 text-center">Rate AI Accuracy</h4>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'fill-[#059669] text-[#059669]'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-xs font-bold font-mono-data text-muted-foreground uppercase tracking-wider mt-2">
                    {rating}/5 stars
                  </p>
                )}

                {/* Regenerate Button - Show if rating < 3 */}
                {rating > 0 && rating < 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-5 border-t border-border"
                  >
                    <Button
                      onClick={handleRegenerate}
                      disabled={isRegenerating || !notes.trim()}
                      className="w-full bg-foreground text-background hover:bg-[#0F1117]/90 rounded-xl py-6 font-bold"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Report
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                      Add feedback notes below to guide the AI before regenerating.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-8">
                <label className="block eyebrow mb-3">
                  Doctor's Notes / Feedback
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add your notes, corrections, or feedback for AI improvement..."
                  className="w-full h-32 p-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm leading-relaxed text-foreground transition-all"
                />
              </div>

              {/* Prescription Button */}
              <button
                onClick={() => setShowPrescription(!showPrescription)}
                className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl mb-4 hover:bg-[rgba(15,17,23,0.02)] transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(15,17,23,0.04)] flex items-center justify-center group-hover:bg-[#059669]/10 transition-colors">
                    <Pill className="w-4 h-4 text-foreground group-hover:text-[#059669] transition-colors" />
                  </div>
                  <span className="font-bold text-foreground">
                    Write Prescription
                  </span>
                </span>
                <span className="text-muted-foreground font-mono-data text-lg">
                  {showPrescription ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {showPrescription && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-8 overflow-hidden"
                  >
                    <textarea
                      value={prescription}
                      onChange={e => setPrescription(e.target.value)}
                      placeholder="Enter prescription details...&#10;e.g., Panadol 500mg - 1 tablet 3 times daily after meals for 5 days"
                      className="w-full h-40 p-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm leading-relaxed text-foreground transition-all mb-4"
                    />
                    <label className="flex items-start gap-3 p-4 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl cursor-pointer hover:bg-[rgba(15,17,23,0.04)] transition-colors">
                      <input
                        type="checkbox"
                        checked={includeDoctorDetails}
                        onChange={e =>
                          setIncludeDoctorDetails(e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 rounded border-border text-[#059669] focus:ring-[#059669] bg-surface"
                      />
                      <div>
                        <span className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                          Include my details in prescription
                        </span>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          Your name, specialization, license, and contact info will be visible to the patient.
                        </p>
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat with AI */}
              <button
                onClick={() => setShowChat(true)}
                className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl mb-8 hover:bg-[rgba(15,17,23,0.02)] transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(15,17,23,0.04)] flex items-center justify-center group-hover:bg-[#059669]/10 transition-colors">
                    <MessageSquare className="w-4 h-4 text-foreground group-hover:text-[#059669] transition-colors" />
                  </div>
                  <span className="font-bold text-foreground">
                    Query Report AI
                  </span>
                </span>
                <span className="eyebrow text-[10px]">Chat</span>
              </button>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitReview}
                disabled={!decision || !rating || isSubmitting}
                className="w-full py-6 btn-primary rounded-xl disabled:opacity-50 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-current" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Final Review
                  </>
                )}
              </Button>
              {!rating && decision && (
                <p className="text-xs text-[#EF4444] font-bold text-center mt-3">
                  * Please rate the report accuracy before submitting
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowChat(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="card-surface p-0 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#059669]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    Report Assistant
                  </h3>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-[rgba(15,17,23,0.04)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-background p-6 min-h-[350px] max-h-[450px] overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-5">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-foreground mb-2">Query the AI</p>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about reasoning, guidelines, or diagnostics.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 ${
                            msg.role === 'user'
                              ? 'bg-[#059669] text-white rounded-tr-sm'
                              : 'bg-surface border border-border text-foreground rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-surface border border-border rounded-2xl rounded-tl-sm p-4">
                          <Loader2 className="w-5 h-5 animate-spin text-[#059669]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-surface">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type your clinical query..."
                    className="flex-1 px-4 py-3 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-sm"
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={handleSendChat}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="rounded-xl btn-primary px-5"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
