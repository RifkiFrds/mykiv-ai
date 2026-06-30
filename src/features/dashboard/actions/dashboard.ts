'use server';

import { createClient } from '@/shared/lib/supabase/server';
import type { DashboardData } from '@/shared/types/api';

/**
 * Fetches all necessary dashboard aggregates and feeds for the logged-in user.
 */
export async function getDashboardData(): Promise<{ success: boolean; data: DashboardData | null; message?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, data: null, message: 'Unauthorized' };
    }

    // 1. Get user profile
    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    let partnerId: string | null = null;
    let coupleId: string | null = profile?.couple_id || null;

    if (coupleId) {
      // Get partner info
      const { data: couple } = await (supabase.from('couples') as any)
        .select('partner_a, partner_b')
        .eq('id', coupleId)
        .single();

      if (couple) {
        partnerId = couple.partner_a === user.id ? couple.partner_b : couple.partner_a;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartStr = todayStart.toISOString();

    // 2. Fetch today's logs for user
    const { data: userLogs } = await (supabase.from('health_logs') as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('datetime', todayStartStr)
      .is('deleted_at', null);

    // 3. Fetch today's logs for partner if linked
    let partnerLogs: any[] = [];
    if (partnerId) {
      const { data: pLogs } = await (supabase.from('health_logs') as any)
        .select('*')
        .eq('user_id', partnerId)
        .gte('datetime', todayStartStr)
        .is('deleted_at', null);
      partnerLogs = pLogs || [];
    }

    // 4. Compute User stats
    const uStats = { meals: 0, water: 0, sleepHours: 0, exercise: 0, mood: null as string | null, medicines: 0 };
    (userLogs || []).forEach((log: any) => {
      if (log.type === 'meal') uStats.meals++;
      else if (log.type === 'water') uStats.water += (log.value as any).amountMl || 0;
      else if (log.type === 'sleep') {
        const diff = Math.abs(new Date((log.value as any).wakeTime).getTime() - new Date((log.value as any).sleepTime).getTime()) / 36e5;
        uStats.sleepHours += diff;
      } else if (log.type === 'exercise') uStats.exercise += (log.value as any).durationMinutes || 0;
      else if (log.type === 'mood') uStats.mood = (log.value as any).moodValue || null;
      else if (log.type === 'medicine') uStats.medicines++;
    });

    // 5. Compute Partner stats
    const pStats = { meals: 0, water: 0, sleepHours: 0, mood: null as string | null };
    partnerLogs.forEach((log: any) => {
      if (log.type === 'meal') pStats.meals++;
      else if (log.type === 'water') pStats.water += (log.value as any).amountMl || 0;
      else if (log.type === 'sleep') {
        const diff = Math.abs(new Date((log.value as any).wakeTime).getTime() - new Date((log.value as any).sleepTime).getTime()) / 36e5;
        pStats.sleepHours += diff;
      } else if (log.type === 'mood') pStats.mood = (log.value as any).moodValue || null;
    });

    // 6. Fetch upcoming reminders
    const { data: reminders } = await (supabase.from('reminders') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('reminder_time', new Date().toISOString())
      .order('reminder_time', { ascending: true })
      .limit(3);

    // 7. Get AI recommendation placeholder (Wired in Phase 5)
    // Query last generated report if any
    const { data: latestReport } = await (supabase.from('ai_reports') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 8. Fetch recent activity (union-like feed)
    const recentActivity: any[] = [];
    
    // Last 3 health logs
    (userLogs || []).slice(0, 3).forEach((log: any) => {
      recentActivity.push({
        id: log.id,
        type: `health_${log.type}`,
        title: `Logged ${log.type}`,
        timestamp: log.datetime,
      });
    });

    // Sort activity by time desc
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 9. Health & Relationship Scores
    const healthScore = Math.min(
      100,
      Math.round(
        ((uStats.water > 0 ? 30 : 0) +
          (uStats.meals >= 3 ? 30 : uStats.meals * 10) +
          (uStats.sleepHours >= 7 ? 40 : (uStats.sleepHours / 7) * 40))
      )
    );

    const relationshipScore = partnerId ? 85 : 0; // Default connected score

    return {
      success: true,
      data: {
        todaySummary: uStats,
        partnerSummary: pStats,
        aiRecommendation: latestReport ? JSON.parse(latestReport.summary) : null,
        upcomingReminders: (reminders || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          reminderTime: r.reminder_time,
        })),
        healthScore,
        relationshipScore,
        recentActivity,
      },
    };
  } catch (err: any) {
    return { success: false, data: null, message: err.message || 'An unexpected error occurred.' };
  }
}
