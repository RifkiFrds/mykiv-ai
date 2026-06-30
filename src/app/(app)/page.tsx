'use client';

import { useEffect, useState, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { Card } from '@/shared/components/ui/card';
import { Avatar } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuth } from '@/shared/providers/auth-provider';
import { createClient } from '@/shared/lib/supabase/client';
import { getDashboardData } from '@/features/dashboard/actions/dashboard';
import type { DashboardData } from '@/shared/types/api';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import {
  Heart,
  Droplets,
  Moon,
  Dumbbell,
  Smile,
  Pill,
  Sparkles,
  ChevronRight,
  Plus,
  Activity,
  Calendar,
} from 'lucide-react';

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  stress: '🤯',
  sick: '🤒',
  tired: '🥱',
};

export default function DashboardPage() {
  const { profile, partner, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  const loadDashboard = async () => {
    const res = await getDashboardData();
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;

    loadDashboard();

    // Setup Supabase Realtime channel to listen to logs updates
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'health_logs' },
        () => {
          startTransition(() => {
            loadDashboard();
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <SafeArea withTabBar className="px-5 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="120px" height="24px" />
          <Skeleton variant="circular" width="40px" height="40px" />
        </div>
        <Skeleton variant="rectangular" height="120px" />
        <Skeleton variant="text" width="100px" height="18px" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height="100px" />
          ))}
        </div>
      </SafeArea>
    );
  }

  const userName = profile?.full_name || 'You';
  const partnerName = partner?.full_name || 'Partner';
  const greeting = getGreeting();

  const today = data?.todaySummary;
  const pToday = data?.partnerSummary;

  const HEALTH_WIDGETS = [
    { icon: Droplets, label: 'Water', value: today?.water ? `${today.water} ml` : '0 ml', target: '2000 ml', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/30', href: ROUTES.WATER },
    { icon: Moon, label: 'Sleep', value: today?.sleepHours ? `${today.sleepHours.toFixed(1)} h` : '0 h', target: '8 h', color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/30', href: ROUTES.SLEEP },
    { icon: Heart, label: 'Meals', value: today?.meals ? `${today.meals} logs` : '0 logs', target: '3 logs', color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/30', href: ROUTES.MEAL },
    { icon: Dumbbell, label: 'Exercise', value: today?.exercise ? `${today.exercise} min` : '0 min', target: '30 min', color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/30', href: ROUTES.EXERCISE },
    { icon: Smile, label: 'Mood', value: today?.mood ? MOOD_EMOJIS[today.mood] || today.mood : 'Not set', target: '', color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/30', href: ROUTES.MOOD },
    { icon: Pill, label: 'Medicine', value: today?.medicines ? `${today.medicines} logs` : '0 logs', target: '', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30', href: ROUTES.MEDICINE },
  ] as const;

  return (
    <SafeArea withTabBar className="px-5 pt-6 pb-6 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-xs text-muted font-medium">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">
            {userName} 💛
          </h1>
        </div>
        <div className="flex -space-x-2">
          <Avatar name={userName} src={profile?.avatar} size="md" />
          {partner && <Avatar name={partnerName} src={partner.avatar} size="md" />}
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <Card variant="glass" padding="md" className="relative overflow-hidden border-primary-100 dark:border-primary-900/20">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-primary-400/10 to-accent-400/10 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-xl)] bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-glow-primary)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">AI Brain Suggestion</h3>
              <Badge variant="primary">Active</Badge>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {data?.aiRecommendation?.summary ||
                "Welcome to MyKiv AI! Log water, sleep, and meal habits to enable personal relationship and health predictions."}
            </p>
          </div>
          <ChevronRight size={18} className="text-muted flex-shrink-0 mt-1" />
        </div>
      </Card>

      {/* Health Overview Metrics Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Today&apos;s Health Log
          </h2>
          <span className="text-xs text-primary-500 font-bold">Score: {data?.healthScore || 0}%</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {HEALTH_WIDGETS.map((widget) => (
            <Link key={widget.label} href={widget.href} className="no-underline">
              <Card
                variant="elevated"
                padding="sm"
                className="flex flex-col items-center text-center h-full cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className={`w-10 h-10 rounded-[var(--radius-xl)] ${widget.bg} flex items-center justify-center mb-2`}>
                  <widget.icon size={20} className={widget.color} />
                </div>
                <p className="text-xs text-muted mb-0.5">{widget.label}</p>
                <p className="text-sm font-bold text-foreground truncate w-full px-1">{widget.value}</p>
                {widget.target && (
                  <p className="text-[9px] text-muted truncate">/ {widget.target}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Partner Status Card */}
      {partner ? (
        <Card variant="elevated" padding="md">
          <div className="flex items-center gap-3">
            <Avatar name={partnerName} src={partner.avatar} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground">{partnerName}</h3>
              <p className="text-sm text-muted mt-0.5">
                {pToday?.mood
                  ? `Feeling ${pToday.mood} ${MOOD_EMOJIS[pToday.mood] || ''}`
                  : 'Has not set mood today'}
                {pToday?.water ? ` • Drank ${pToday.water} ml` : ''}
              </p>
            </div>
            <Badge variant="success">Linked</Badge>
          </div>
        </Card>
      ) : (
        <Link href={ROUTES.PROFILE} className="no-underline">
          <Card variant="glass" padding="md" className="border-dashed flex items-center justify-between border-neutral-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Link with your Partner</p>
                <p className="text-xs text-muted">Unlock relationship coaching &amp; activity timelines</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </Card>
        </Link>
      )}

      {/* Reminders Feed */}
      {data?.upcomingReminders && data.upcomingReminders.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Reminders
          </h2>
          <div className="space-y-2.5">
            {data.upcomingReminders.map((reminder) => (
              <Card key={reminder.id} variant="elevated" padding="sm" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{reminder.title}</p>
                    <p className="text-xs text-muted mt-0.5">Category: {reminder.category}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary-500">
                  {new Date(reminder.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Timeline Feed
          </h2>
          <div className="space-y-2.5">
            {data.recentActivity.map((activity) => (
              <Card key={activity.id} variant="elevated" padding="sm" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </SafeArea>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  if (hour < 21) return 'Good Evening 🌅';
  return 'Good Night 🌙';
}
