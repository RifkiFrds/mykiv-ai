'use server';

import { z } from 'zod';
import { aiChatSchema } from '@/shared/validators/schemas';
import { processChat, generateReport, getRecommendations, extractMemory } from '@/ai/brain';
import * as aiService from '@/services/ai';

export async function sendMessage(input: unknown) {
  const parsed = aiChatSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const { message, userId } = parsed.data;
    const { response, conversation } = await processChat(userId, message);
    await extractMemory(userId, message, response);
    return { success: true as const, message: 'Message sent', data: { response, conversation } };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getChatHistory(userId: string) {
  try {
    const history = await aiService.getChatHistory(userId);
    return { success: true as const, message: 'History loaded', data: history };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function generateAiReport(userId: string, reportType: 'daily' | 'weekly' | 'monthly') {
  try {
    const report = await generateReport(userId, reportType);
    return { success: true as const, message: 'Report generated', data: report };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getAiRecommendations(userId: string, category?: string) {
  try {
    const recommendations = await getRecommendations(userId, category);
    return { success: true as const, message: 'Recommendations loaded', data: recommendations };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}
