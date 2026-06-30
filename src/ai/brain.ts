'use server';

import { createAIProvider } from './provider';
import { buildContext } from './context';
import { buildChatPrompt, buildReportPrompt, buildRecommendationPrompt } from './prompts';
import { AIContext, AIResponse, AIConversation } from '@/types';
import * as aiService from '@/services/ai';

const provider = createAIProvider();

export async function processChat(userId: string, message: string): Promise<{ response: string; conversation: AIConversation | null }> {
  const startTime = Date.now();

  const context = await buildContext(userId);
  const prompt = buildChatPrompt(context, message);

  const aiResponse = await provider.generateResponse(prompt, { temperature: 0.7, maxTokens: 2048 });

  const latency = Date.now() - startTime;

  // Estimate token usage (rough approximation)
  const tokenUsage = Math.ceil((prompt.length + aiResponse.length) / 4);

  const conversation = await aiService.saveMessage(userId, message, aiResponse, tokenUsage, latency);

  return { response: aiResponse, conversation };
}

export async function generateReport(userId: string, reportType: 'daily' | 'weekly' | 'monthly'): Promise<string> {
  const context = await buildContext(userId);
  const prompt = buildReportPrompt(context, reportType);

  return provider.generateResponse(prompt, { temperature: 0.5, maxTokens: 4096 });
}

export async function getRecommendations(userId: string, category?: string): Promise<string[]> {
  const context = await buildContext(userId);
  const prompt = buildRecommendationPrompt(context, category);

  const response = await provider.generateResponse(prompt, { temperature: 0.6, maxTokens: 1024 });

  // Parse numbered recommendations
  return response
    .split(/\n/)
    .filter(line => /^\d+[.\)]/.test(line.trim()))
    .map(line => line.replace(/^\d+[.\)]\s*/, '').trim())
    .filter(Boolean);
}

export async function extractMemory(userId: string, message: string, aiResponse: string): Promise<void> {
  // Simple heuristic-based memory extraction
  const combined = `${message} ${aiResponse}`.toLowerCase();

  const memoryPatterns = [
    { pattern: /favorite food.*?(is|:)\s*([\w\s]+)/i, category: 'favorite_food', title: 'Favorite Food' },
    { pattern: /favorite drink.*?(is|:)\s*([\w\s]+)/i, category: 'favorite_drink', title: 'Favorite Drink' },
    { pattern: /favorite place.*?(is|:)\s*([\w\s]+)/i, category: 'favorite_place', title: 'Favorite Place' },
    { pattern: /goal.*?(is|:)\s*([\w\s]+)/i, category: 'goal', title: 'Goal' },
    { pattern: /habit.*?(is|:)\s*([\w\s]+)/i, category: 'habit', title: 'Habit' },
    { pattern: /prefer.*?(to|:)\s*([\w\s]+)/i, category: 'preference', title: 'Preference' },
  ];

  for (const { pattern, category, title } of memoryPatterns) {
    const match = combined.match(pattern);
    if (match && match[2]) {
      const content = match[2].trim().slice(0, 200);
      await aiService.addMemory({
        couple_id: null,
        category,
        title,
        content,
        importance: 0.7,
        source: 'conversation',
      });
    }
  }
}
