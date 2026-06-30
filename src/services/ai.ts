'use server';

import * as aiRepo from '@/repositories/ai';
import { AIChatInput } from '@/shared/validators/schemas';
import { AIConversation, AIResponse, AIMemory } from '@/types';

export async function getChatHistory(userId: string): Promise<AIConversation[]> {
  return aiRepo.getConversations(userId);
}

export async function saveMessage(userId: string, prompt: string, response: string, tokenUsage?: number, latency?: number): Promise<AIConversation | null> {
  return aiRepo.createConversation({ user_id: userId, prompt, response, token_usage: tokenUsage || null, latency: latency || null });
}

export async function getMemories(coupleId?: string, userId?: string): Promise<AIMemory[]> {
  return aiRepo.getAIMemory(coupleId, userId);
}

export async function addMemory(memory: Omit<AIMemory, 'id' | 'created_at'>): Promise<AIMemory | null> {
  return aiRepo.createAIMemory(memory);
}

export async function getUserReports(userId: string) {
  return aiRepo.getReports(userId);
}
