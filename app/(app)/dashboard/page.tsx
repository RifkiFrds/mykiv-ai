'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/repositories/supabase';
import { Profile } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/shared/components/layout/Skeleton';
import { Droplets, Moon, Dumbbell, Smile, UtensilsCrossed, Pill, Heart } from 'lucide-react';

interface DashboardStats {
  waterToday: number;
  sleepLastNight: number | null;
  exerciseThisWeek: number;
  moodToday: number | null;
  mealsToday: number;
  medicinePending: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    waterToday: 0, sleepLastNight: null, exerciseThisWeek: 0,
    moodToday: null, mealsToday: 0, medicinePending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (profileData) setProfile(profileData as Profile);

    const [
      { data: waterData }, { data: sleepData }, { data: exerciseData },
      { data: moodData }, { data: mealData },
    ] = await Promise.all([
      supabase.from('water_logs').select('amount_ml').eq('user_id', session.user.id).gte('logged_at', today),
      supabase.from('sleep_logs').select('duration_minutes').eq('user_id', session.user.id).order('sleep_date', { ascending: false }).limit(1),
      supabase.from('exercise_logs').select('id').eq('user_id', session.user.id).gte('logged_at', weekAgo),
      supabase.from('mood_logs').select('mood_score').eq('user_id', session.user.id).gte('logged_at', today).limit(1),
      supabase.from('meal_logs').select('id').eq('user_id', session.user.id).gte('logged_at', today),
    ]);

    setStats({
      waterToday: waterData?.reduce((s, w) => s + (w.amount_ml || 0), 0) || 0,
      sleepLastNight: sleepData?.[0]?.duration_minutes || null,
      exerciseThisWeek: exerciseData?.length || 0,
      moodToday: moodData?.[0]?.mood_score || null,
      mealsToday: mealData?.length || 0,
      medicinePending: 0,
    });
    setLoading(false);
  };

  if (loading) return <div className="mx-auto max-w-md"><DashboardSkeleton /></div>;

  const healthCards = [
    { label: 'Water', value: `${stats.waterToday}ml`, icon: Droplets, color: 'bg-sky-50 text-sky-600', href: '/health/water' },
    { label: 'Sleep', value: stats.sleepLastNight ? `${Math.round(stats.sleepLastNight / 60)}h` : 'No data', icon: Moon, color: 'bg-indigo-50 text-indigo-600', href: '/health/sleep' },
    { label: 'Exercise', value: `${stats.exerciseThisWeek} this week`, icon: Dumbbell, color: 'bg-orange-50 text-orange-600', href: '/health/exercise' },
    { label: 'Mood', value: stats.moodToday ? `${stats.moodToday}/10` : 'No data', icon: Smile, color: 'bg-amber-50 text-amber-600', href: '/health/mood' },
    { label: 'Meals', value: `${stats.mealsToday} today`, icon: UtensilsCrossed, color: 'bg-emerald-50 text-emerald-600', href: '/health/meals' },
    { label: 'Medicine', value: `${stats.medicinePending} pending`, icon: Pill, color: 'bg-rose-50 text-rose-600', href: '/health/medicine' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Hi, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
          <p className="text-sm text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">{profile?.full_name?.charAt(0) || 'U'}</div>
          )}
        </div>
      </div>

      {profile?.partner_id ? (
        <Card className="rounded-2xl border-0 bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-lg shadow-teal-200">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" />
            <p className="text-sm font-medium opacity-90">Connected with your partner</p>
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border-0 bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-lg shadow-teal-200">
          <p className="text-sm font-medium opacity-90">Connect with your partner</p>
          <p className="mt-1 text-xs opacity-80">Your couple code: {profile?.couple_code}</p>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Health Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {healthCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <Card className="rounded-2xl border-0 p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl p-2 ${card.color}`}><Icon className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-neutral-900">{card.value}</p>
                  <p className="text-xs text-neutral-500">{card.label}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Button asChild className="h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700">
        <Link href="/ai/chat">Talk to MyKiv AI</Link>
      </Button>
    </div>
  );
}
