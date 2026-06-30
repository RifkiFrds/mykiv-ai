'use server';

import { supabase } from './supabase';
import { AIMemory, AIConversation, AIReport } from '@/types';

export async function getAIMemory(coupleId?: string, userId?: string): Promise<AIMemory[]> {
  let query = supabase.from('ai_memory').select('*').eq('is_active', true);
  if (coupleId) query = query.eq('couple_id', coupleId);
  else if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query.order('importance', { ascending: false }).limit(50);
  if (error) throw error;
  return (data || []) as AIMemory[];
}

export async function createAIMemory(memory: Omit<AIMemory, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('ai_memory').insert(memory).select().maybeSingle();
  if (error) throw error;
  return data as AIMemory | null;
}

export async function getConversations(userId: string, limit = 50): Promise<AIConversation[]> {
  const { data, error } = await supabase.from('ai_conversations').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(limit);
  if (error) throw error;
  return (data || []) as AIConversation[];
}

export async function createConversation(conv: Omit<AIConversation, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('ai_conversations').insert(conv).select().maybeSingle();
  if (error) throw error;
  return data as AIConversation | null;
}

export async function getReports(userId: string): Promise<AIReport[]> {
  const { data, error } = await supabase.from('ai_reports').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(20);
  if (error) throw error;
  return (data || []) as AIReport[];
}

export async function createReport(report: Omit<AIReport, 'id' | 'generated_at'>) {
  const { data, error } = await supabase.from('ai_reports').insert(report).select().maybeSingle();
  if (error) throw error;
  return data as AIReport | null;
}
