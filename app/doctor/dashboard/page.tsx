'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import {
  getDepartmentFilterOptions,
  getDepartmentById,
  normalizeDepartmentId,
} from '@/lib/constants/departments';

interface Report {
  id: string;
  sessionId: string;
  patientName: string;
  patientId: string;
  age: number | null;
  complaint: string;
  department: string;
  status: string;
  timestamp: string;
  reviewedAt: string | null;
  redFlags: string[];
  urgency: string;
  triageLabel: string;
}

interface DoctorStats {
  pending: number;
  inReview: number;
  reviewed: number;
  total: number;
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'in-review' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<{ department?: string; specialization?: string } | null>(null);

  const [stats, setStats] = useState<DoctorStats>({ pending: 0, inReview: 0, reviewed: 0, total: 0 });
  const [reports, setReports] = useState<{ pending: Report[]; inReview: Report[]; reviewed: Report[] }>({
    pending: [],
    inReview: [],
    reviewed: [],
  });
  const [filters, setFilters] = useState({ dateRange: 'all', priority: 'all', department: 'all' });

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
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const payload = await res.json();
          if (!payload?.isComplete) {
            router.push('/doctor/onboarding');
            return;
          }
          setDoctorProfile(payload.data);
        } else {
          router.push('/doctor/onboarding');
          return;
        }
      } catch {
        router.push('/doctor/onboarding');
        return;
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
        const res = await fetch('/api/doctors/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setReports({ pending: data.reports.pending, inReview: data.reports.inReview, reviewed: data.reports.reviewed });
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

  const getCurrentReports = () => {
    switch (activeTab) {
      case 'pending': return reports.pending;
      case 'in-review': return reports.inReview;
      case 'reviewed': return reports.reviewed;
      default: return [];
    }
  };

  const filteredReports = getCurrentReports().filter((report) => {
    const matchesDepartment = filters.department === 'all' || report.department === filters.department;
    const matchesSearch = report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || report.complaint.toLowerCase().includes(searchQuery.toLowerCase());
    const now = new Date();
    const reportDate = new Date(report.timestamp);
    const matchesDate =
      filters.dateRange === 'all' ||
      (filters.dateRange === 'today' && reportDate.toDateString() === now.toDateString()) ||
      (filters.dateRange === 'week' && now.getTime() - reportDate.getTime() <= 7 * 24 * 60 * 60 * 1000) ||
      (filters.dateRange === 'month' && now.getTime() - reportDate.getTime() <= 30 * 24 * 60 * 60 * 1000);
    const matchesPriority = filters.priority === 'all' || report.urgency === filters.priority;
    return matchesDepartment && matchesSearch && matchesDate && matchesPriority;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Moderate';
      default: return 'Normal';
    }
  };

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const hasActiveFilters = filters.dateRange !== 'all' || filters.priority !== 'all' || filters.department !== 'all';

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
        user={user ? { ...user, name: `Dr. ${user.name?.split(' ')[0] || 'Doctor'}` } : null}
        brandName="Shifa"
        searchPlaceholder="Search patients or complaints..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        profileHref="/doctor/profile"
        extraInfo={doctorProfile?.specialization && <p className="text-xs text-indigo-500 mt-1 font-medium">{doctorProfile.specialization}</p>}
        dashboardHref="/doctor/dashboard"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Dr. {user?.name?.split(' ')[0] || 'Doctor'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Review patient reports and provide care</p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <div className="relative">
            <Button variant="outline" className="rounded-xl px-4 py-2 border-gray-200" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-indigo-500 rounded-full" />}
            </Button>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-800">Filter Reports</h3>
                    <button onClick={() => setFilters({ dateRange: 'all', priority: 'all', department: 'all' })} className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Clear All</button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Department</label>
                      <select value={filters.department} onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                        {getDepartmentFilterOptions().map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: 'all', label: 'All Time' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }].map((option) => (
                          <button key={option.value} onClick={() => setFilters((prev) => ({ ...prev, dateRange: option.value }))} className={`p-3 rounded-xl text-sm font-semibold transition-all ${filters.dateRange === option.value ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Priority Level</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Priorities', color: 'bg-gray-50 text-gray-700' },
                          { value: 'high', label: 'High Priority', color: 'bg-red-50 text-red-700 border border-red-200' },
                          { value: 'medium', label: 'Medium Priority', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
                          { value: 'low', label: 'Low Priority', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
                        ].map((option) => (
                          <button key={option.value} onClick={() => setFilters((prev) => ({ ...prev, priority: option.value }))} className={`w-full p-3 rounded-xl text-sm font-semibold transition-all border ${filters.priority === option.value ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 border-transparent' : `${option.color} border-transparent hover:shadow-sm`}`}>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                    <Button onClick={() => setShowFilters(false)} className="flex-1 text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-xl py-3 font-semibold">Apply Filters</Button>
                    <Button variant="outline" onClick={() => setShowFilters(false)} className="px-6 rounded-xl border-gray-200 hover:bg-gray-50">Cancel</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-6 p-1 bg-gray-100 rounded-2xl max-w-lg">
          <div className="flex">
            {[
              { key: 'pending' as const, label: 'Pending', icon: Clock, count: stats.pending },
              { key: 'in-review' as const, label: 'In Review', icon: FileText, count: stats.inReview },
              { key: 'reviewed' as const, label: 'Reviewed', icon: CheckCircle, count: stats.reviewed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-indigo-600 shadow-md shadow-indigo-500/10' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs font-bold ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                  {dataLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredReports.map((report) => {
                const deptInfo = getDepartmentById(normalizeDepartmentId(report.department));
                const DeptIcon = deptInfo.icon;

                return (
                  <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <User className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{report.patientName}</h3>
                          <p className="text-sm text-gray-500">{report.age ? `${report.age} years old` : 'Age not specified'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <div className={`px-3 py-1 rounded-xl text-xs font-bold ${getUrgencyColor(report.urgency)}`}>{getUrgencyLabel(report.urgency)}</div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                          <DeptIcon className="w-3 h-3" />
                          {deptInfo.name.split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{report.complaint}</p>

                    {report.redFlags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {report.redFlags.map((flag, i) => (
                          <span key={i} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
                            <AlertTriangle className="w-3 h-3" /> {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {formatDate(report.timestamp)}
                      </div>
                      <Link href={`/doctor/report/${report.id}`}>
                        <Button size="sm" className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
                          Review <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">No reports found</h3>
                <p className="text-gray-500">
                  {hasActiveFilters ? 'No reports match your current filters.' : `No ${activeTab} reports at the moment.`}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
