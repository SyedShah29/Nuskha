'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'pending':
    case 'in_review':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'rejected':
      return 'bg-red-100 text-red-700 border border-red-200';
    case 'in_progress':
      return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
};

function StatCard({ label, value, loading, icon: Icon }: { label: string; value: number; loading: boolean; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="stat-card group">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-indigo-500" />
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      ) : (
        <p className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">{value}</p>
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
        isReviewed ? 'bg-white hover:bg-indigo-50/50 cursor-pointer rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5' : 'bg-gray-50 rounded-2xl border border-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isReviewed ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-indigo-400 to-cyan-500'}`}>
          {isReviewed ? <CheckCircle className="w-5 h-5 text-white" /> : <Activity className="w-5 h-5 text-white" />}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{session.chiefComplaint || 'Clinical Interview'}</p>
          <p className="text-sm text-gray-500">{formatDate(session.createdAt)} &bull; {session.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 md:mt-0">
        {!isReviewed && <Lock className="w-4 h-4 text-gray-400" />}
        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getStatusColor(session.status)}`}>
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
    <div className="border border-emerald-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-teal-50 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{prescription.chiefComplaint || 'Clinical Interview'}</p>
            <p className="text-sm text-gray-500">{formatDate(prescription.reviewedAt)} &bull; Dr. {prescription.doctorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFirst && <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20">New</span>}
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
            <div className="p-6 border-t border-emerald-100">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Dr. {prescription.doctorName}</p>
                  <p className="text-sm text-gray-500">{prescription.doctorSpecialization || prescription.department}</p>
                  {prescription.doctorHospital && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {prescription.doctorHospital}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prescription</p>
                <p className="text-gray-700 whitespace-pre-wrap">{prescription.prescription}</p>
              </div>

              {prescription.doctorNotes && (
                <div className="bg-indigo-50 rounded-2xl p-5 mb-4 border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Doctor&apos;s Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{prescription.doctorNotes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
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
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
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
                  <FileText className="w-4 h-4 mr-1" />
                  Export FHIR
                </Button>
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Interview Mode</h2>
          <p className="text-gray-500 text-sm">
            Select how you&apos;d like to communicate with our AI health assistant.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/patient/interview?mode=voice">
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-indigo-500 group">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">
                <Mic className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Voice Interview</h3>
              <p className="text-xs text-gray-500">Speak naturally and let our AI understand your symptoms through conversation.</p>
            </div>
          </Link>

          <Link href="/patient/interview?mode=text">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Text Chat</h3>
              <p className="text-xs text-gray-500">Type your symptoms and receive detailed AI responses in text format.</p>
            </div>
          </Link>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full rounded-xl border-gray-200">
          Cancel
        </Button>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
      <DashboardNavbar
        user={user}
        brandName="Shifa"
        searchPlaceholder="Search sessions..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        profileHref="/patient/profile"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            Hello,{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'Patient'}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Welcome to your health dashboard</p>
        </motion.div>

        <div className="mb-8 flex gap-2 p-1 bg-gray-100 rounded-2xl max-w-sm">
          {[
            { key: 'interview' as const, label: 'Sessions' },
            { key: 'prescriptions' as const, label: 'Prescriptions' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/10'
                  : 'text-gray-500 hover:text-gray-700'
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Begin Consultation</h2>
                    <p className="text-gray-500 mb-8 text-lg leading-relaxed max-w-lg">
                      Consult with our AI health assistant. Describe your condition and receive a guided clinical assessment.
                    </p>
                    <Button
                      onClick={() => setShowInterviewDialog(true)}
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-8 py-4 text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <StatCard label="Sessions" value={stats.totalSessions} loading={dataLoading} icon={Activity} />
                  <StatCard label="Reports Ready" value={stats.reportsReady} loading={dataLoading} icon={CheckCircle} />
                  <StatCard label="Pending Review" value={stats.pendingReview} loading={dataLoading} icon={Clock} />
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5">Recent Sessions</h3>
                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No sessions yet. Start your first health interview!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Doctor Prescriptions &amp; Recommendations
                </h3>

                {dataLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No prescriptions yet. Complete a health interview and wait for doctor review.</p>
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
