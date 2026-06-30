import { supabase } from '@/repositories/supabase';
import { AIContext, Profile, HealthContext, CoupleContext, AIMemory, AIConversation } from '@/types';

export async function buildContext(userId: string): Promise<AIContext> {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  let partner: Profile | null = null;
  if (profile?.partner_id) {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', profile.partner_id).maybeSingle();
    partner = p as Profile | null;
  }

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: meals },
    { data: water },
    { data: sleep },
    { data: exercise },
    { data: mood },
    { data: medicine },
    { data: activities },
    { data: wishlist },
    { data: expenses },
    { data: memories },
    { data: conversations },
  ] = await Promise.all([
    supabase.from('meal_logs').select('*').eq('user_id', userId).gte('logged_at', weekAgo).order('logged_at', { ascending: false }).limit(21),
    supabase.from('water_logs').select('*').eq('user_id', userId).gte('logged_at', today).order('logged_at', { ascending: false }),
    supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('sleep_date', weekAgo.split('T')[0]).order('sleep_date', { ascending: false }).limit(7),
    supabase.from('exercise_logs').select('*').eq('user_id', userId).gte('logged_at', weekAgo).order('logged_at', { ascending: false }).limit(10),
    supabase.from('mood_logs').select('*').eq('user_id', userId).gte('logged_at', weekAgo).order('logged_at', { ascending: false }).limit(7),
    supabase.from('medicine_logs').select('*').eq('user_id', userId).gte('taken_at', weekAgo).order('taken_at', { ascending: false }).limit(14),
    profile?.couple_id ? supabase.from('couple_activities').select('*').eq('couple_id', profile.couple_id).order('created_at', { ascending: false }).limit(5) : { data: [] },
    profile?.couple_id ? supabase.from('wishlist_items').select('*').eq('couple_id', profile.couple_id).eq('is_fulfilled', false).order('priority', { ascending: false }).limit(5) : { data: [] },
    profile?.couple_id ? supabase.from('expenses').select('*').eq('couple_id', profile.couple_id).gte('expense_date', weekAgo.split('T')[0]).order('created_at', { ascending: false }).limit(10) : { data: [] },
    supabase.from('ai_memory').select('*').eq('is_active', true).or(`couple_id.eq.${profile?.couple_id},user_id.eq.${userId}`).order('importance', { ascending: false }).limit(20),
    supabase.from('ai_conversations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ]);

  const health: HealthContext = {
    meals: (meals || []) as HealthContext['meals'],
    water: (water || []) as HealthContext['water'],
    sleep: (sleep || []) as HealthContext['sleep'],
    exercise: (exercise || []) as HealthContext['exercise'],
    mood: (mood || []) as HealthContext['mood'],
    medicine: (medicine || []) as HealthContext['medicine'],
  };

  const couple: CoupleContext = {
    activities: (activities || []) as CoupleContext['activities'],
    wishlist: (wishlist || []) as CoupleContext['wishlist'],
    expenses: (expenses || []) as CoupleContext['expenses'],
  };

  return {
    user: profile as Profile | null,
    partner,
    health,
    couple,
    memory: (memories || []) as AIMemory[],
    recentConversations: (conversations || []).reverse() as AIConversation[],
  };
}

export function summarizeHealthContext(context: HealthContext): string {
  const mealCount = context.meals.length;
  const waterTotal = context.water.reduce((s, w) => s + (w.amount_ml || 0), 0);
  const avgSleep = context.sleep.length > 0
    ? context.sleep.reduce((s, sl) => s + (sl.duration_minutes || 0), 0) / context.sleep.length / 60
    : 0;
  const avgMood = context.mood.length > 0
    ? context.mood.reduce((s, m) => s + (m.mood_score || 0), 0) / context.mood.length
    : 0;
  const exerciseCount = context.exercise.length;

  return [
    `Meals: ${mealCount} logged in past 7 days`,
    `Water: ${waterTotal}ml today`,
    `Sleep: ${avgSleep.toFixed(1)}h avg`,
    `Mood: ${avgMood.toFixed(1)}/10 avg`,
    `Exercise: ${exerciseCount} sessions`,
  ].join('. ');
}
