import { getHealthLogs } from '@/features/health/actions/health';
import { createClient } from '@/shared/lib/supabase/server';
import { APP_CONFIG } from '@/shared/constants/config';
import type { AiOutput } from '@/shared/types/api';

/**
 * Polls the Replicate prediction status until completion.
 */
async function pollPrediction(getUrl: string, apiToken: string): Promise<any> {
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(getUrl, {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to poll prediction: ${res.statusText}`);
    }

    const prediction = await res.json();
    if (prediction.status === 'succeeded') {
      return prediction;
    }
    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Prediction ended with status: ${prediction.status}`);
    }

    // Wait 1 second before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Prediction timed out.');
}

/**
 * Calls Gemini 2.5 Flash model on Replicate.
 */
export async function callGemini(prompt: string, systemPrompt?: string): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN environment variable is not defined.');
  }

  // Combine system prompt and prompt if model does not separate them
  const fullPrompt = systemPrompt ? `System: ${systemPrompt}\n\nUser: ${prompt}` : prompt;

  const res = await fetch('https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        prompt: fullPrompt,
        temperature: APP_CONFIG.ai.temperature,
      },
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Replicate API initiation failed: ${res.statusText}`);
  }

  const prediction = await res.json();
  const getUrl = prediction.urls.get;

  const finishedPrediction = await pollPrediction(getUrl, apiToken);
  const output = finishedPrediction.output;

  if (Array.isArray(output)) {
    return output.join('');
  }
  if (typeof output === 'string') {
    return output;
  }
  return JSON.stringify(output);
}

/**
 * Builds user context by compiling today's health logs, couple memories, and reminders.
 */
export async function buildUserContext(userId: string): Promise<string> {
  const supabase = await createClient();

  // 1. Get profiles
  const { data: profile } = await (supabase.from('users') as any)
    .select('*')
    .eq('id', userId)
    .single();

  let partnerProfile: any = null;
  let memories: any[] = [];
  
  if (profile?.couple_id) {
    const { data: couple } = await (supabase.from('couples') as any)
      .select('*')
      .eq('id', profile.couple_id)
      .single();

    if (couple) {
      const partnerId = couple.partner_a === userId ? couple.partner_b : couple.partner_a;
      const { data: pProfile } = await (supabase.from('users') as any)
        .select('*')
        .eq('id', partnerId)
        .single();
      partnerProfile = pProfile;
    }

    // Get couple memories
    const { data: mems } = await (supabase.from('ai_memory') as any)
      .select('*')
      .eq('couple_id', profile.couple_id);
    memories = mems || [];
  }

  // 2. Load today's health logs
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: healthLogs } = await (supabase.from('health_logs') as any)
    .select('*')
    .eq('user_id', userId)
    .gte('datetime', todayStart.toISOString())
    .is('deleted_at', null);

  const formattedLogs = (healthLogs || []).map((log: any) => {
    return `- Type: ${log.type}, Value: ${JSON.stringify(log.value)}, Time: ${new Date(log.datetime).toLocaleTimeString()}`;
  }).join('\n');

  const formattedMemories = memories.map((m) => {
    return `- ${m.category}: ${m.title} - ${m.content}`;
  }).join('\n');

  return `
User Profile:
- Name: ${profile?.full_name || 'User'}
- Gender: ${profile?.gender || 'Not specified'}
- Birthdate: ${profile?.birth_date || 'Not specified'}
- Timezone: ${profile?.timezone || 'Asia/Jakarta'}

Partner Profile:
${partnerProfile ? `- Name: ${partnerProfile.full_name}\n- Gender: ${partnerProfile.gender || 'Not specified'}` : '- No partner linked'}

Long Term Memories:
${formattedMemories || '- No memories saved yet'}

Today's Health Tracker Logs:
${formattedLogs || '- No health entries logged today yet'}
  `.trim();
}

/**
 * Validates and formats the raw AI Brain output into the strictly typed JSON response.
 */
export function parseAiOutput(rawText: string): AiOutput {
  try {
    // Find JSON block in text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        recommendation: Array.isArray(parsed.recommendation) ? parsed.recommendation : [],
        prediction: Array.isArray(parsed.prediction) ? parsed.prediction : [],
        warning: Array.isArray(parsed.warning) ? parsed.warning : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
        reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [],
      };
    }
  } catch {
    // Fallback parser
  }

  // Generic fallback if JSON parsing fails completely
  return {
    summary: rawText,
    recommendation: ['Stay hydrated', 'Keep tracking routines'],
    prediction: ['General steady status'],
    warning: [],
    confidence: 0.7,
    reasoning: ['Based on generic context matching'],
  };
}
