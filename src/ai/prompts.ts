import { AIContext } from '@/types';
import { summarizeHealthContext } from './context';

export function buildSystemPrompt(): string {
  return `You are MyKiv, an AI Relationship & Health Companion for couples.

CORE PRINCIPLES:
- You are a companion, not a controller. Give recommendations, never make decisions.
- You never provide medical diagnosis. Always suggest consulting professionals for health concerns.
- You respect privacy. Only reference data the user has permission to share.
- You learn from habits and preferences over time.
- You are supportive, empathetic, and non-judgmental.
- You speak in a warm, conversational tone.

CAPABILITIES:
- Health tracking insights (meal, water, sleep, exercise, mood, medicine)
- Relationship recommendations and couple activity suggestions
- Memory of preferences, habits, and important dates
- Daily/weekly health summaries
- Smart reminders based on patterns

OUTPUT FORMAT:
When giving recommendations, structure your response clearly:
1. Acknowledge the user's context
2. Provide relevant insight based on their data
3. Give 1-3 actionable recommendations
4. End with encouragement

Keep responses concise (2-4 sentences) unless asked for detail.`;
}

export function buildUserContextPrompt(context: AIContext): string {
  const user = context.user;
  const partner = context.partner;

  let prompt = `USER CONTEXT:\n`;
  prompt += `Name: ${user?.full_name || 'User'}\n`;
  if (user?.date_of_birth) {
    const age = Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 3600000));
    prompt += `Age: ${age}\n`;
  }
  if (partner) {
    prompt += `Partner: ${partner.full_name || 'Partner'}\n`;
    prompt += `Relationship: Connected since ${new Date(user?.created_at || '').toLocaleDateString()}\n`;
  }

  prompt += `\nHEALTH CONTEXT (Past 7 Days):\n`;
  prompt += summarizeHealthContext(context.health);

  if (context.couple.activities.length > 0) {
    prompt += `\n\nUPCOMING ACTIVITIES:\n`;
    context.couple.activities.slice(0, 3).forEach(a => {
      prompt += `- ${a.title} (${a.category})\n`;
    });
  }

  if (context.memory.length > 0) {
    prompt += `\n\nKNOWN PREFERENCES:\n`;
    context.memory.slice(0, 5).forEach(m => {
      prompt += `- ${m.title}: ${m.content}\n`;
    });
  }

  return prompt;
}

export function buildChatPrompt(context: AIContext, userMessage: string): string {
  const system = buildSystemPrompt();
  const userCtx = buildUserContextPrompt(context);

  return `${system}\n\n${userCtx}\n\nUSER MESSAGE: ${userMessage}\n\nRespond as MyKiv:`;
}

export function buildReportPrompt(context: AIContext, reportType: 'daily' | 'weekly' | 'monthly'): string {
  const system = buildSystemPrompt();
  const userCtx = buildUserContextPrompt(context);

  return `${system}\n\n${userCtx}\n\nGenerate a ${reportType} health and relationship summary. Include:\n1. Overall wellness score (1-10)\n2. Key highlights from health data\n3. Relationship activity highlights\n4. 3 personalized recommendations\n5. 1 thing to celebrate\n\nFormat as friendly, encouraging summary:`;
}

export function buildRecommendationPrompt(context: AIContext, category?: string): string {
  const system = buildSystemPrompt();
  const userCtx = buildUserContextPrompt(context);
  const cat = category ? ` focusing on ${category}` : '';

  return `${system}\n\n${userCtx}\n\nGenerate 3 personalized recommendations${cat}. Base them on the user's actual data patterns. Be specific and actionable:`;
}
