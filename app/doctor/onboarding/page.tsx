'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  GraduationCap,
  Building,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getDepartmentOptions } from '@/lib/constants/departments';

interface FormErrors {
  [key: string]: string;
}

export default function DoctorOnboarding() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [roleConflict, setRoleConflict] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    specialization: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    hospital: '',
    department: '',
    bio: '',
  });
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
      setFormData(prev => ({ ...prev, fullName: data.user.name || '' }));

      try {
        const roleCheckRes = await fetch('/api/user/role/check');
        if (roleCheckRes.ok) {
          const roleData = await roleCheckRes.json();
          if (roleData.isPatient) {
            setRoleConflict(true);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const payload = await res.json();
          if (payload?.isComplete) {
            router.push('/doctor/dashboard');
            return;
          }
          if (payload?.data) {
            const d = payload.data;
            setFormData(prev => ({
              ...prev,
              fullName: d.fullName || prev.fullName,
              phone: d.phone || prev.phone,
              address: d.address || prev.address,
              dateOfBirth: d.dateOfBirth || prev.dateOfBirth,
              specialization: d.specialization || prev.specialization,
              qualification: d.qualification || prev.qualification,
              experience: d.experience ? String(d.experience) : prev.experience,
              licenseNumber: d.licenseNumber || prev.licenseNumber,
              hospital: d.hospital || prev.hospital,
              department: d.department || prev.department,
              bio: d.bio || prev.bio,
            }));
          }
        }
      } catch {
        // ignore
      }

      setLoading(false);
    };
    getSession();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.hospital.trim()) newErrors.hospital = 'Hospital/Clinic is required';
    if (!formData.department) newErrors.department = 'Department is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isComplete: true }),
      });
      if (res.ok) {
        router.push('/doctor/dashboard');
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.code === 'ROLE_CONFLICT') {
          setRoleConflict(true);
        } else {
          setErrors({ submit: err.error || 'Failed to save profile.' });
        }
      }
    } catch {
      setErrors({ submit: 'Failed to save profile.' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (roleConflict) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Already Registered</h2>
          <p className="text-gray-600 mb-6">This email is already registered as a <strong>patient</strong> account.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/patient/dashboard')} className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl">
              Go to Patient Dashboard
            </Button>
            <Button onClick={async () => { await authClient.signOut(); router.push('/login'); }} variant="outline" className="w-full rounded-xl">
              Sign Out & Use Different Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500">
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl p-2 backdrop-blur-sm flex items-center justify-center">
              <Image src="/logo/shifa-logo.svg" alt="Shifa" width={32} height={32} className="brightness-0 invert" />
            </div>
            <div>
              <h1 className="font-semibold text-white">Doctor Registration</h1>
              <p className="text-xs text-white/60">Complete your profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <span className="text-white text-sm font-medium">{user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, Dr. {user?.name?.split(' ')[0]}!</h2>
          <p className="text-white/70">Please complete your profile to start reviewing patient cases.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'Dr. Ahmed Khan', required: true },
                { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+92 300 1234567', required: true },
                { name: 'dateOfBirth', label: 'Date of Birth', icon: Calendar, type: 'date', required: false },
                { name: 'address', label: 'Address', icon: MapPin, type: 'text', placeholder: 'City, Country', required: false },
                { name: 'qualification', label: 'Qualification', icon: GraduationCap, type: 'text', placeholder: 'MBBS, FCPS, etc.', required: true },
                { name: 'experience', label: 'Years of Experience', icon: Calendar, type: 'number', placeholder: 'e.g., 10', required: true },
                { name: 'licenseNumber', label: 'PMC License Number', icon: FileText, type: 'text', placeholder: 'PMC-XXXXX', required: true },
                { name: 'hospital', label: 'Hospital/Clinic', icon: Building, type: 'text', placeholder: 'Hospital Name', required: true },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <field.icon className="w-4 h-4 inline mr-2" />
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as Record<string, string>)[field.name] || ''}
                    onChange={handleInputChange}
                    className={inputClass(field.name)}
                    placeholder={field.placeholder}
                    min={field.type === 'number' ? '0' : undefined}
                  />
                  {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Stethoscope className="w-4 h-4 inline mr-2" />
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select name="specialization" value={formData.specialization} onChange={handleInputChange} className={inputClass('specialization')}>
                  <option value="">Select Specialization</option>
                  {getDepartmentOptions().map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Department <span className="text-red-500">*</span>
                </label>
                <select name="department" value={formData.department} onChange={handleInputChange} className={inputClass('department')}>
                  <option value="">Select Department</option>
                  {getDepartmentOptions().map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / About</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Brief description about yourself..." />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSubmit} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all font-semibold">
                {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Complete Registration</>}
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-white/50 text-xs mt-6">All fields marked with <span className="text-red-400">*</span> are required</p>
      </main>
    </div>
  );
}
