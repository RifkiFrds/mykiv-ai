'use server';

import { createClient } from '@/shared/lib/supabase/server';

export interface HealthTrendData {
  date: string;
  waterMl: number;
  sleepHours: number;
  exerciseMinutes: number;
}

/**
 * Compiles health history trends for the last 7 days for analytics charting.
 */
export async function getWeeklyTrends() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: logs, error } = await (supabase.from('health_logs') as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('datetime', sevenDaysAgo.toISOString())
      .is('deleted_at', null);

    if (error) return { success: false, data: [] };

    // Group by date
    const daysMap: Record<string, HealthTrendData> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { date: dateStr, waterMl: 0, sleepHours: 0, exerciseMinutes: 0 };
    }

    (logs || []).forEach((log: any) => {
      const key = log.datetime.split('T')[0];
      if (daysMap[key]) {
        if (log.type === 'water') {
          daysMap[key].waterMl += (log.value as any).amountMl || 0;
        } else if (log.type === 'sleep') {
          const diff = Math.abs(new Date((log.value as any).wakeTime).getTime() - new Date((log.value as any).sleepTime).getTime()) / 36e5;
          daysMap[key].sleepHours += diff;
        } else if (log.type === 'exercise') {
          daysMap[key].exerciseMinutes += (log.value as any).durationMinutes || 0;
        }
      }
    });

    const trendArray = Object.entries(daysMap).map(([_, val]) => val).reverse();
    return { success: true, data: trendArray };
  } catch {
    return { success: false, data: [] };
  }
}

/**
 * Retrieves past AI generated reports.
 */
export async function getAiReports() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };

    const { data, error } = await (supabase.from('ai_reports') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false });

    if (error) return { success: false, data: [] };
    
    const parsedData = (data || []).map((r: any) => ({
      id: r.id,
      type: r.type,
      period: r.period,
      generatedAt: r.generated_at,
      report: JSON.parse(r.summary),
    }));

    return { success: true, data: parsedData };
  } catch {
    return { success: false, data: [] };
  }
}
