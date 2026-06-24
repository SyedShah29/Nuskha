'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  Camera,
  Save,
  ChevronLeft,
  Loader2,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getDepartmentOptions } from '@/lib/constants/departments';

export default function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const userData = data.user as unknown as Record<string, string>;
      setFormData({
        fullName: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        specialization: userData.specialization || '',
        qualification: userData.qualification || '',
        experience: userData.experience || '',
        licenseNumber: userData.licenseNumber || '',
        hospital: userData.hospital || '',
        department: userData.department || '',
        bio: userData.bio || '',
      });
      setProfileImage(userData.profileImage || '');

      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const payload = await res.json();
          if (payload?.data) {
            const d = payload.data;
            setFormData(prev => ({
              ...prev,
              fullName: d.full_name || prev.fullName,
              email: d.email || prev.email,
              phone: d.phone || prev.phone,
              address: d.address || prev.address,
              dateOfBirth: d.date_of_birth || prev.dateOfBirth,
              specialization: d.specialization || prev.specialization,
              qualification: d.qualification || prev.qualification,
              experience: d.experience ? String(d.experience) : prev.experience,
              licenseNumber: d.license_number || prev.licenseNumber,
              hospital: d.hospital || prev.hospital,
              department: d.department || prev.department,
              bio: d.bio || prev.bio,
            }));
            setProfileImage(d.profile_image || profileImage);
          }
        }
      } catch {
        // ignore
      }

      setLoading(false);
    };
    getSessionAndProfile();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setProfileImage(ev.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
          licenseNumber: formData.licenseNumber,
          hospital: formData.hospital,
          department: formData.department,
          bio: formData.bio,
          profileImage,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/doctor/dashboard">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Image src="/logo/shifa-logo.svg" alt="Shifa" width={24} height={24} className="brightness-0 invert" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">Doctor Profile</h1>
                <p className="text-xs text-gray-500">Manage your profile</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center sticky top-24">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {profileImage ? (
                    <Image src={profileImage} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-indigo-400" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-110">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Dr. {formData.fullName || 'Doctor'}</h2>
              <p className="text-indigo-600 font-semibold mb-1">{formData.specialization || 'Medical Professional'}</p>
              <p className="text-gray-500 text-sm mb-4">{formData.hospital || 'Healthcare Provider'}</p>
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Experience</p>
                <p className="text-lg font-bold text-indigo-600">{formData.experience || '0'} Years</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Profile Information
                </h3>
                <p className="text-gray-500 text-sm mt-1">Update your personal and professional details</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-500" /> Personal Details
                    </h4>
                    {[
                      { name: 'fullName', label: 'Full Name', icon: User, locked: true },
                      { name: 'email', label: 'Email Address', icon: Mail, locked: true, type: 'email' },
                      { name: 'phone', label: 'Phone Number', icon: Phone, required: true },
                      { name: 'dateOfBirth', label: 'Date of Birth', icon: Calendar, type: 'date', required: true },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          {field.label}
                          {field.locked && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> Locked</span>}
                          {field.required && !field.locked && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={field.type || 'text'}
                            name={field.name}
                            value={(formData as Record<string, string>)[field.name] || ''}
                            onChange={handleInputChange}
                            readOnly={field.locked}
                            disabled={field.locked}
                            className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl text-sm transition-all ${
                              field.locked ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-gray-50 focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-cyan-500" /> Professional Details
                    </h4>
                    {[
                      { name: 'specialization', label: 'Specialization', type: 'select', required: true },
                      { name: 'qualification', label: 'Qualification', placeholder: 'e.g., MBBS, MD, FCPS', required: true },
                      { name: 'experience', label: 'Years of Experience', type: 'number', required: true },
                      { name: 'licenseNumber', label: 'Medical License Number', required: true },
                      { name: 'hospital', label: 'Hospital/Clinic', required: true },
                      { name: 'department', label: 'Department', type: 'select', required: true },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select name={field.name} value={(formData as Record<string, string>)[field.name] || ''} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white">
                            <option value="">Select {field.label}</option>
                            {getDepartmentOptions().map(dept => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                          </select>
                        ) : (
                          <input type={field.type || 'text'} name={field.name} value={(formData as Record<string, string>)[field.name] || ''} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white" placeholder={field.placeholder} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" /> Professional Bio
                  </h4>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50 focus:bg-white resize-none" placeholder="Write a brief professional bio..." />
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {saveSuccess && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Changes saved!</span>
                      </motion.div>
                    )}
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all font-semibold">
                    {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
