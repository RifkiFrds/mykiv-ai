'use server';

import { supabase } from '@/repositories/supabase';
import { AIMemory } from '@/types';

export async function getRelevantMemories(userId: string, query: string, limit = 10): Promise<AIMemory[]> {
  const { data } = await supabase
    .from('ai_memory')
    .select('*')
    .or(`user_id.eq.${userId},couple_id.in.(select couple_id from profiles where id = ${userId})`)
    .order('importance', { ascending: false })
    .limit(limit);

  if (!data) return [];

  // Simple relevance scoring based on keyword overlap
  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = (data as AIMemory[]).map(memory => {
    const contentWords = `${memory.title} ${memory.content}`.toLowerCase().split(/\s+/);
    const overlap = queryWords.filter(w => contentWords.some(cw => cw.includes(w) || w.includes(cw))).length;
    return { memory, score: overlap * memory.importance };
  });

  return scored.sort((a, b) => b.score - a.score).map(s => s.memory);
}

export async function consolidateMemories(userId: string): Promise<void> {
  const { data: memories } = await supabase
    .from('ai_memory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!memories || memories.length < 10) return;

  // Group by category and keep top 5 per category
  const byCategory = new Map<string, AIMemory[]>();
  (memories as AIMemory[]).forEach(m => {
    const list = byCategory.get(m.category) || [];
    list.push(m);
    byCategory.set(m.category, list);
  });

  for (const [category, items] of byCategory) {
    if (items.length > 5) {
      const toArchive = items.slice(5);
      for (const item of toArchive) {
        await supabase.from('ai_memory').update({ is_active: false }).eq('id', item.id);
      }
    }
  }
}
