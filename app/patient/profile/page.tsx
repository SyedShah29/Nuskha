'use client';

import { useEffect, useState, Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  Lock,
  CheckCircle,
  History,
  Pill,
  AlertTriangle,
  Loader2,
  Droplets,
  Scale,
  Ruler,
  Cigarette,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MedicalHistoryData {
  id: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  weight?: number;
  height?: number;
  familyHistory?: Record<string, boolean>;
  chronicConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  pastSurgeries?: string[];
  smokingStatus?: string;
  alcoholConsumption?: string;
  isComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function ProfilePageContent() {
  const [user, setUser] = useState<{ name?: string; email?: string; emailVerified?: boolean; createdAt?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'medical-history'>('profile');
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'medical-history') setActiveTab('medical-history');
  }, [searchParams]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user as unknown as Record<string, string>);
      }
      setLoading(false);
    };
    getSession();
  }, [router]);

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (activeTab !== 'medical-history' || !user) return;
      setHistoryLoading(true);
      try {
        const res = await fetch('/api/medical-history');
        if (res.ok) {
          const result = await res.json();
          setMedicalHistory(result.data);
        }
      } catch {
        // ignore
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchMedicalHistory();
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
              <p className="text-sm text-gray-500">Your account and medical information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 p-1 bg-gray-100 rounded-2xl max-w-md">
          <div className="flex">
            {[
              { key: 'profile' as const, label: 'Account', icon: User },
              { key: 'medical-history' as const, label: 'Medical History', icon: History },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/10' : 'text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.section key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white backdrop-blur-sm">
                    {user?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">{user?.name || 'Patient'}</h2>
                    <p className="text-white/80">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Account Information</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lock className="w-4 h-4" /> Read-only
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { icon: User, label: 'Full Name', value: user?.name || 'Not provided', color: 'from-indigo-100 to-indigo-50', iconColor: 'text-indigo-500' },
                    { icon: Mail, label: 'Email Address', value: user?.email || 'Not provided', color: 'from-cyan-100 to-cyan-50', iconColor: 'text-cyan-500' },
                    { icon: Calendar, label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : 'N/A', color: 'from-purple-100 to-purple-50', iconColor: 'text-purple-500' },
                    { icon: Shield, label: 'Account Type', value: (user?.role || 'Patient').charAt(0).toUpperCase() + (user?.role || 'Patient').slice(1), color: 'from-orange-100 to-orange-50', iconColor: 'text-orange-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section key="medical-history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">Medical History Report</h2>
                      <p className="text-white/80">Your health profile</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                  ) : !medicalHistory?.isComplete ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-bold text-gray-700 mb-2">No Medical History Found</h3>
                      <p className="text-gray-500 mb-6">Complete your medical history to get personalized recommendations.</p>
                      <Link href="/patient/medical_session">
                        <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">Complete Medical History</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Patient Name</p>
                          <p className="font-semibold text-gray-800">{user?.name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl font-semibold">
                          <CheckCircle className="w-4 h-4" /> Complete
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { icon: Calendar, label: 'Age', value: medicalHistory.age ? `${medicalHistory.age} years` : 'N/A', color: 'text-blue-500' },
                          { icon: User, label: 'Gender', value: medicalHistory.gender || 'N/A', color: 'text-purple-500' },
                          { icon: Droplets, label: 'Blood Group', value: medicalHistory.bloodGroup || 'N/A', color: 'text-red-500' },
                          { icon: Scale, label: 'Weight', value: medicalHistory.weight ? `${medicalHistory.weight} kg` : 'N/A', color: 'text-green-500' },
                          { icon: Ruler, label: 'Height', value: medicalHistory.height ? `${medicalHistory.height} cm` : 'N/A', color: 'text-indigo-500' },
                          { icon: Cigarette, label: 'Smoking', value: medicalHistory.smokingStatus || 'N/A', color: 'text-gray-500' },
                        ].map((item) => (
                          <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <item.icon className={`w-4 h-4 ${item.color}`} />
                              <span className="text-xs font-bold text-gray-400 uppercase">{item.label}</span>
                            </div>
                            <p className="font-semibold text-gray-800">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {medicalHistory.chronicConditions && medicalHistory.chronicConditions.length > 0 && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-sm font-bold text-red-600 mb-2">Chronic Conditions</p>
                          <div className="flex flex-wrap gap-2">
                            {medicalHistory.chronicConditions.map((c, i) => (
                              <span key={i} className="px-3 py-1 bg-white text-red-700 rounded-lg text-sm font-medium border border-red-200">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <p className="text-sm font-bold text-orange-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Allergies</p>
                          <div className="flex flex-wrap gap-2">
                            {medicalHistory.allergies.map((a, i) => (
                              <span key={i} className="px-3 py-1 bg-white text-orange-700 rounded-lg text-sm font-medium border border-orange-200">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {medicalHistory.currentMedications && medicalHistory.currentMedications.length > 0 && (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                          <p className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-2"><Pill className="w-4 h-4" /> Current Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {medicalHistory.currentMedications.map((m, i) => (
                              <span key={i} className="px-3 py-1 bg-white text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
