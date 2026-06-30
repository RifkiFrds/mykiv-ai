'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { Profile } from '@/types';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { DashboardSkeleton } from '@/shared/components/layout/Skeleton';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (data) setProfile(data as Profile);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-neutral-50">
        <DashboardSkeleton />
      </div>
    );
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-50 pb-20">
      {children}
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
