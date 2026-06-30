'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { callGemini, buildUserContext, parseAiOutput } from '../services/ai-brain';
import { revalidatePath } from 'next/cache';
import type { AiMemoryCategory, ImportanceLevel } from '@/shared/types/database';

/**
 * Executes a conversation turn with the AI companion.
 */
export async function sendChatMessage(prompt: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // 1. Compile current system user context
    const context = await buildUserContext(user.id);
    const systemPrompt = `
You are the central AI Brain of "MyKiv AI" - an AI Relationship & Health Companion.
Use the following Context to answer user queries. Do not make medical diagnoses or prescribe doses.
Always reply with an iPhone-assistant styled friendly tone, helpful, private, and relationship-supportive.

Context:
${context}
    `.trim();

    // 2. Query model
    const start = Date.now();
    const responseText = await callGemini(prompt, systemPrompt);
    const latency = Date.now() - start;

    // 3. Save conversation logs in database
    await (supabase.from('ai_conversations') as any).insert({
      user_id: user.id,
      prompt,
      response: responseText,
      latency,
    });

    return { success: true, response: responseText };
  } catch (err: any) {
    return { success: false, message: err.message || 'AI chat execution failed.' };
  }
}

/**
 * Generates and updates the daily dashboard AI insights report.
 */
export async function generateDailyReport() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const context = await buildUserContext(user.id);
    const prompt = `
Generate a daily summary report in the required JSON schema format.
Provide a general summary, recommendations, warnings, and confidence scoring.
Do not provide medical diagnosis.

Context:
${context}

Required JSON Output Schema:
{
  "summary": "Today's summary text here",
  "recommendation": ["rec 1", "rec 2"],
  "prediction": ["predict pattern 1"],
  "warning": ["warnings here if health gaps exist"],
  "confidence": 0.9,
  "reasoning": ["reasoning details"]
}
    `.trim();

    const rawOutput = await callGemini(prompt);
    const parsed = parseAiOutput(rawOutput);

    // Save report in table
    const { error } = await (supabase.from('ai_reports') as any).insert({
      user_id: user.id,
      type: 'daily',
      period: new Date().toISOString().split('T')[0],
      summary: JSON.stringify(parsed),
    });

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, data: parsed };
  } catch (err: any) {
    return { success: false, message: err.message || 'Report generation failed.' };
  }
}

// ────────────────────────────────────────────────
// Long-Term Memories CRUD Server Actions
// ────────────────────────────────────────────────

export async function addMemory(category: AiMemoryCategory, title: string, content: string, importance: ImportanceLevel = 'medium') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) {
      return { success: false, message: 'You must link with a partner to save couple memories.' };
    }

    const { error } = await (supabase.from('ai_memory') as any).insert({
      couple_id: profile.couple_id,
      user_id: user.id,
      category,
      title,
      content,
      importance,
      source: 'user',
    });

    if (error) return { success: false, message: error.message };

    revalidatePath('/profile');
    return { success: true, message: 'Memory saved successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to save memory.' };
  }
}

export async function getMemories() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) return { success: true, data: [] };

    const { data, error } = await (supabase.from('ai_memory') as any)
      .select('*')
      .eq('couple_id', profile.couple_id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to load memories.', data: [] };
  }
}

export async function deleteMemory(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await supabase
      .from('ai_memory')
      .delete()
      .eq('id', id);

    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Memory deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to delete memory.' };
  }
}
