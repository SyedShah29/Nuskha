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
      case 'high': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      case 'medium': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      default: return 'bg-[#059669]/10 text-[#059669] border-[#059669]/20';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar
        user={user ? { ...user, name: `Dr. ${user.name?.split(' ')[0] || 'Doctor'}` } : null}
        brandName="Nuskha"
        searchPlaceholder="Search patients or complaints..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        profileHref="/doctor/profile"
        extraInfo={doctorProfile?.specialization && <p className="text-xs text-muted-foreground mt-1 font-mono-data font-bold">{doctorProfile.specialization}</p>}
        dashboardHref="/doctor/dashboard"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Welcome, Dr. {user?.name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="text-muted-foreground text-lg mt-3">Review patient reports and provide care</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex p-1.5 bg-[rgba(15,17,23,0.04)] rounded-full border border-border w-full sm:w-auto">
            {[
              { key: 'pending' as const, label: 'Pending', icon: Clock, count: stats.pending },
              { key: 'in-review' as const, label: 'In Review', icon: FileText, count: stats.inReview },
              { key: 'reviewed' as const, label: 'Reviewed', icon: CheckCircle, count: stats.reviewed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-surface text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground border border-transparent'}`}
              >
                <tab.icon className="w-4 h-4 hidden sm:block" />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-lg text-xs font-bold font-mono-data ${activeTab === tab.key ? 'bg-[#059669]/10 text-[#059669]' : 'bg-[rgba(15,17,23,0.06)] text-muted-foreground'}`}>
                  {dataLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : tab.count}
                </span>
              </button>
            ))}
          </div>
          
          <div className="relative z-20">
            <Button variant="outline" className="rounded-full px-5 py-2.5 bg-surface border-border text-foreground hover:bg-[rgba(15,17,23,0.02)]" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-[#059669] rounded-full" />}
            </Button>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-80 card-surface p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-foreground">Filter Reports</h3>
                    <button onClick={() => setFilters({ dateRange: 'all', priority: 'all', department: 'all' })} className="text-sm font-bold text-muted-foreground hover:text-[#059669] transition-colors">Clear All</button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Department</label>
                      <select value={filters.department} onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))} className="w-full px-4 py-2.5 bg-[rgba(15,17,23,0.02)] border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all">
                        {getDepartmentFilterOptions().map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: 'all', label: 'All Time' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }].map((option) => (
                          <button key={option.value} onClick={() => setFilters((prev) => ({ ...prev, dateRange: option.value }))} className={`p-3 rounded-xl text-sm font-bold transition-all border ${filters.dateRange === option.value ? 'bg-[#059669] text-white border-[#059669]' : 'bg-[rgba(15,17,23,0.02)] text-muted-foreground border-border hover:border-foreground/20'}`}>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Priority Level</label>
                      <div className="space-y-2">
                        {[
                          { value: 'all', label: 'All Priorities', color: 'bg-[rgba(15,17,23,0.02)] text-muted-foreground border-border' },
                          { value: 'high', label: 'High Priority', color: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' },
                          { value: 'medium', label: 'Medium Priority', color: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' },
                          { value: 'low', label: 'Low Priority', color: 'bg-[#059669]/10 text-[#059669] border-[#059669]/20' },
                        ].map((option) => (
                          <button key={option.value} onClick={() => setFilters((prev) => ({ ...prev, priority: option.value }))} className={`w-full p-3 rounded-xl text-sm font-bold transition-all border ${filters.priority === option.value ? 'bg-foreground text-background border-foreground shadow-sm' : `${option.color} hover:shadow-sm`}`}>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-5 border-t border-border">
                    <Button onClick={() => setShowFilters(false)} className="flex-1 btn-primary py-2.5">Apply Filters</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#059669]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredReports.map((report) => {
                const deptInfo = getDepartmentById(normalizeDepartmentId(report.department));
                const DeptIcon = deptInfo.icon;

                return (
                  <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card-surface p-6 group hover:shadow-md transition-all border-border hover:border-[rgba(15,17,23,0.12)] relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center group-hover:bg-[#0F1117] group-hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-lg tracking-tight">{report.patientName}</h3>
                            <p className="text-sm text-muted-foreground font-mono-data">{report.age ? `${report.age} years old` : 'Age not specified'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <div className={`px-3 py-1 rounded-md text-xs font-bold font-mono-data uppercase tracking-wider border ${getUrgencyColor(report.urgency)}`}>{getUrgencyLabel(report.urgency)}</div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono-data uppercase bg-[rgba(15,17,23,0.04)] text-foreground border border-border">
                            <DeptIcon className="w-3 h-3" />
                            {deptInfo.name.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[rgba(15,17,23,0.02)] rounded-xl p-4 border border-border mb-5">
                        <p className="text-foreground text-sm leading-relaxed line-clamp-3">{report.complaint}</p>
                      </div>

                      {report.redFlags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {report.redFlags.map((flag, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EF4444]/10 text-[#EF4444] rounded-md text-xs font-bold font-mono-data border border-[#EF4444]/20">
                              <AlertTriangle className="w-3 h-3" /> {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono-data font-bold">
                        <Clock className="w-4 h-4" />
                        {formatDate(report.timestamp)}
                      </div>
                      <Link href={`/doctor/report/${report.id}`}>
                        <button className="btn-ghost text-sm px-4 py-2 hover:bg-[#059669] hover:text-white group/btn">
                          Review Case <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredReports.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="font-bold text-foreground text-xl mb-2 tracking-tight">No clinical reports found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasActiveFilters ? 'No reports match your current telemetry filters. Try adjusting your parameters.' : `No ${activeTab} reports in the queue at the moment.`}
                </p>
                {hasActiveFilters && (
                  <button onClick={() => setFilters({ dateRange: 'all', priority: 'all', department: 'all' })} className="mt-6 btn-ghost">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
