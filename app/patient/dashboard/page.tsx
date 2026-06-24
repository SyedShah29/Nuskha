'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from '@phosphor-icons/react';
import {
  Mic,
  MessageSquare,
  FileText,
  Activity,
  Clock,
  Stethoscope,
  User,
  ChevronDown,
  Download,
  Building2,
  Loader2,
  Lock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import { downloadFile } from '@/lib/downloadFile';

interface DashboardStats {
  totalSessions: number;
  reportsReady: number;
  pendingReview: number;
}

interface Session {
  id: string;
  chiefComplaint: string;
  department: string;
  status: string;
  createdAt: string;
  reportId: string | null;
  hasPrescription: boolean;
}

interface Prescription {
  id: string;
  reportId: string;
  chiefComplaint: string;
  department: string;
  prescription: string;
  doctorNotes: string | null;
  doctorName: string;
  doctorSpecialization: string | null;
  doctorHospital: string | null;
  reviewedAt: string;
  createdAt: string;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
    case 'reviewed':
      return 'bg-[#059669]/10 text-[#059669] border border-[#059669]/20';
    case 'pending':
    case 'in_review':
      return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
    case 'rejected':
      return 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20';
    case 'in_progress':
      return 'bg-[rgba(15,17,23,0.06)] text-foreground border border-border';
    default:
      return 'bg-[rgba(15,17,23,0.04)] text-muted-foreground border border-border';
  }
};

function StatCard({ label, value, loading, icon: Icon }: { label: string; value: number; loading: boolean; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="card-surface p-6 flex flex-col justify-between h-full group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(15,17,23,0.04)] border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        <p className="eyebrow">{label}</p>
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      ) : (
        <p className="text-4xl font-mono-data font-bold text-foreground">{value}</p>
      )}
    </div>
  );
}

function SessionItem({
  session,
  isReviewed,
  onClick,
}: {
  session: Session;
  isReviewed: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between p-5 transition-all group ${
        isReviewed ? 'bg-surface hover:bg-[rgba(15,17,23,0.02)] cursor-pointer rounded-2xl border border-border hover:border-[rgba(15,17,23,0.12)] hover:shadow-sm' : 'bg-[rgba(15,17,23,0.02)] rounded-2xl border border-border'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isReviewed ? 'bg-[#059669]' : 'bg-surface border border-border'}`}>
          {isReviewed ? <CheckCircle className="w-5 h-5 text-white" /> : <Activity className="w-5 h-5 text-foreground" />}
        </div>
        <div>
          <p className="font-bold text-foreground">{session.chiefComplaint || 'Clinical Interview'}</p>
          <p className="text-sm text-muted-foreground font-mono-data mt-1">{formatDate(session.createdAt)} &bull; {session.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 md:mt-0">
        {!isReviewed && <Lock className="w-4 h-4 text-muted-foreground" />}
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-data tracking-wide uppercase ${getStatusColor(session.status)}`}>
          {session.status === 'approved' ? 'Reviewed' : session.status === 'pending' ? 'Awaiting Review' : session.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

function PrescriptionCard({
  prescription,
  isFirst,
  isExpanded,
  onToggle,
}: {
  prescription: Prescription;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden transition-all bg-surface hover:shadow-sm">
      <div className="flex items-center justify-between p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-[#059669] rounded-xl flex items-center justify-center shadow-sm">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground">{prescription.chiefComplaint || 'Clinical Interview'}</p>
            <p className="text-sm text-muted-foreground font-mono-data mt-1">{formatDate(prescription.reviewedAt)} &bull; Dr. {prescription.doctorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFirst && <span className="px-3 py-1 bg-[#059669] text-white text-xs font-bold rounded-lg shadow-sm">New</span>}
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-border">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
                <div className="w-14 h-14 bg-surface border border-border rounded-2xl flex items-center justify-center text-foreground shadow-sm">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Dr. {prescription.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{prescription.doctorSpecialization || prescription.department}</p>
                  {prescription.doctorHospital && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {prescription.doctorHospital}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[rgba(15,17,23,0.02)] rounded-2xl p-5 mb-4 border border-border">
                <p className="eyebrow mb-3">Prescription</p>
                <p className="text-foreground whitespace-pre-wrap">{prescription.prescription}</p>
              </div>

              {prescription.doctorNotes && (
                <div className="bg-[#059669]/5 rounded-2xl p-5 mb-4 border border-[#059669]/20">
                  <p className="eyebrow text-[#059669] mb-3">Doctor&apos;s Notes</p>
                  <p className="text-foreground whitespace-pre-wrap">{prescription.doctorNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button
                  className="btn-ghost text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await downloadFile(
                        `/api/reports/${prescription.reportId}/prescription`,
                        `Prescription_${prescription.reportId.slice(0, 8)}.pdf`
                      );
                    } catch {
                      alert('Failed to download prescription');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>

                <button
                  className="btn-ghost text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await fetch(`/api/reports/${prescription.reportId}/fhir`);
                      if (res.ok) {
                        const fhirData = await res.json();
                        const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `FHIR_Report_${prescription.reportId.slice(0, 8)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }
                    } catch {
                      alert('Failed to download FHIR bundle');
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export FHIR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InterviewModeDialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="card-surface p-8 max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(5,150,105,0.2)]">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Choose Interface Mode</h2>
          <p className="text-muted-foreground">
            Select how you&apos;d like to communicate with our clinical AI.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/patient/interview?mode=voice">
            <div className="bento-emerald h-full p-6 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <Mic className="w-7 h-7 text-[#059669]" />
              </div>
              <h3 className="font-bold text-[#059669] mb-2">Voice Interview</h3>
              <p className="text-xs text-[#059669]/70 leading-relaxed">Speak naturally. Our AI handles the medical translation.</p>
            </div>
          </Link>

          <Link href="/patient/interview?mode=text">
            <div className="card-surface h-full p-6 hover:shadow-md transition-all cursor-pointer border-border hover:border-foreground/20 group flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-[rgba(15,17,23,0.04)] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform border border-border">
                <MessageSquare className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Text Chat</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Type your symptoms and receive text-based guidance.</p>
            </div>
          </Link>
        </div>

        <button onClick={onClose} className="btn-ghost w-full justify-center">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PatientDashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'interview' | 'prescriptions'>('interview');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({ totalSessions: 0, reportsReady: 0, pendingReview: 0 });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
        setLoading(false);
        return;
      }
      setUser(data.user);

      try {
        const res = await fetch('/api/medical-history');
        if (res.ok) {
          const payload = await res.json();
          if (!payload?.isComplete) {
            router.push('/patient/medical_session');
            return;
          }
        } else {
          router.push('/patient/medical_session');
          return;
        }
      } catch (e) {
        console.error('Failed to load medical history', e);
      }
      setLoading(false);
    };
    getSession();
  }, [router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const res = await fetch('/api/patient/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setSessions(data.sessions);
          setPrescriptions(data.prescriptions);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const filteredSessions = sessions.filter(
    (s) =>
      s.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 border-4 text-[#059669] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar
        user={user}
        brandName="Nuskha"
        searchPlaceholder="Search sessions..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        profileHref="/patient/profile"
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Patient'}.
          </h1>
          <p className="text-muted-foreground text-lg mt-3">Here is the status of your clinical reports.</p>
        </motion.div>

        <div className="mb-10 flex gap-2 p-1.5 bg-[rgba(15,17,23,0.04)] rounded-full max-w-sm border border-border">
          {[
            { key: 'interview' as const, label: 'Sessions' },
            { key: 'prescriptions' as const, label: 'Prescriptions' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-surface text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'interview' ? (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Primary CTA Bento */}
                <div className="md:col-span-8 bento-dark p-10 relative overflow-hidden group flex flex-col justify-center">
                  {/* Abstract background element */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#059669]/20 rounded-full blur-3xl group-hover:bg-[#059669]/30 transition-colors duration-700" />
                  
                  <div className="relative z-10">
                    <span className="eyebrow bg-white/10 text-white border-white/20 mb-6">New Consultation</span>
                    <h2 className="text-3xl font-bold text-white mb-4">Start Clinical Interview</h2>
                    <p className="text-white/70 mb-8 text-lg max-w-md leading-relaxed">
                      Consult with our AI health assistant in Urdu or English. Receive a guided assessment.
                    </p>
                    <button
                      onClick={() => setShowInterviewDialog(true)}
                      className="btn-primary"
                    >
                      Initialize Session
                      <span className="btn-icon-nest"><ArrowUpRight size={14} weight="bold" /></span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-1 gap-6">
                  <StatCard label="Pending Review" value={stats.pendingReview} loading={dataLoading} icon={Clock} />
                  <div className="grid grid-cols-2 gap-6">
                    <StatCard label="Ready" value={stats.reportsReady} loading={dataLoading} icon={CheckCircle} />
                    <StatCard label="Total" value={stats.totalSessions} loading={dataLoading} icon={Activity} />
                  </div>
                </div>
              </div>

              <div className="card-surface p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Clinical History</h3>
                {dataLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    <Activity className="w-8 h-8 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No sessions found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isReviewed={session.status === 'approved'}
                        onClick={() => session.status === 'approved' && setActiveTab('prescriptions')}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prescriptions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="card-surface p-8">
                <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <span className="eyebrow">Medical Records</span>
                  Reviewed Prescriptions
                </h3>

                {dataLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    <FileText className="w-8 h-8 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No prescriptions available yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((prescription, i) => (
                      <PrescriptionCard
                        key={prescription.id}
                        prescription={prescription}
                        isFirst={i === 0}
                        isExpanded={expandedPrescription === prescription.id}
                        onToggle={() => setExpandedPrescription(expandedPrescription === prescription.id ? null : prescription.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showInterviewDialog && <InterviewModeDialog onClose={() => setShowInterviewDialog(false)} />}
      </AnimatePresence>
    </div>
  );
}
