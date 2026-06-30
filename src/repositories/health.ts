'use server';

import { supabase } from './supabase';
import { MealLog, WaterLog, SleepLog, ExerciseLog, MoodLog, MedicineLog } from '@/types';

export async function getMealLogs(userId: string, limit = 50): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as MealLog[];
}

export async function createMealLog(userId: string, log: Partial<MealLog>) {
  const { data, error } = await supabase.from('meal_logs').insert({ ...log, user_id: userId }).select().maybeSingle();
  if (error) throw error;
  return data as MealLog | null;
}

export async function getWaterLogs(userId: string, from?: string, limit = 50): Promise<WaterLog[]> {
  let query = supabase.from('water_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false });
  if (from) query = query.gte('logged_at', from);
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return (data || []) as WaterLog[];
}

export async function createWaterLog(userId: string, amount_ml: number) {
  const { data, error } = await supabase.from('water_logs').insert({ user_id: userId, amount_ml }).select().maybeSingle();
  if (error) throw error;
  return data as WaterLog | null;
}

export async function getSleepLogs(userId: string, limit = 30): Promise<SleepLog[]> {
  const { data, error } = await supabase.from('sleep_logs').select('*').eq('user_id', userId).order('sleep_date', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as SleepLog[];
}

export async function createSleepLog(userId: string, log: Partial<SleepLog>) {
  const { data, error } = await supabase.from('sleep_logs').insert({ ...log, user_id: userId }).select().maybeSingle();
  if (error) throw error;
  return data as SleepLog | null;
}

export async function getExerciseLogs(userId: string, limit = 30): Promise<ExerciseLog[]> {
  const { data, error } = await supabase.from('exercise_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as ExerciseLog[];
}

export async function createExerciseLog(userId: string, log: Partial<ExerciseLog>) {
  const { data, error } = await supabase.from('exercise_logs').insert({ ...log, user_id: userId }).select().maybeSingle();
  if (error) throw error;
  return data as ExerciseLog | null;
}

export async function getMoodLogs(userId: string, limit = 30): Promise<MoodLog[]> {
  const { data, error } = await supabase.from('mood_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as MoodLog[];
}

export async function createMoodLog(userId: string, log: Partial<MoodLog>) {
  const { data, error } = await supabase.from('mood_logs').insert({ ...log, user_id: userId }).select().maybeSingle();
  if (error) throw error;
  return data as MoodLog | null;
}

export async function getMedicineLogs(userId: string, limit = 30): Promise<MedicineLog[]> {
  const { data, error } = await supabase.from('medicine_logs').select('*').eq('user_id', userId).order('taken_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as MedicineLog[];
}

export async function createMedicineLog(userId: string, log: Partial<MedicineLog>) {
  const { data, error } = await supabase.from('medicine_logs').insert({ ...log, user_id: userId }).select().maybeSingle();
  if (error) throw error;
  return data as MedicineLog | null;
}
