'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useMedicalHistory } from '@/hooks/useMedicalHistory';
import { MedicalHistoryOnboarding } from '@/components/voice/MedicalHistoryOnboarding';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MedicalSessionPage() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleConflict, setRoleConflict] = useState(false);
  const router = useRouter();
  const { isComplete, isLoading: medicalHistoryLoading } = useMedicalHistory();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      if (!data?.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        try {
          const roleCheckRes = await fetch('/api/user/role/check');
          if (roleCheckRes.ok) {
            const roleData = await roleCheckRes.json();
            if (roleData.isDoctor) setRoleConflict(true);
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    };
    getSession();
  }, [router]);

  useEffect(() => {
    if (!medicalHistoryLoading && isComplete) router.push('/patient/dashboard');
  }, [medicalHistoryLoading, isComplete, router]);

  const handleOnboardingComplete = () => router.push('/patient/dashboard');

  if (loading || medicalHistoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-border border-t-[#059669] rounded-full animate-spin" />
      </div>
    );
  }

  if (roleConflict) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="card-surface p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#EF4444]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-[#EF4444]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-4">Account Already Registered</h2>
          <p className="text-muted-foreground mb-6">This email is registered as a <strong>doctor</strong> account.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/doctor/dashboard')} className="w-full btn-primary py-6">
              Go to Provider Portal
            </Button>
            <Button onClick={async () => { await authClient.signOut(); router.push('/login'); }} className="w-full btn-ghost">
              Sign Out & Use Different Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user && !isComplete) {
    return (
      <MedicalHistoryOnboarding
        userName={user?.name?.split(' ')[0] || 'Friend'}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-border border-t-[#059669] rounded-full animate-spin" />
    </div>
  );
}
