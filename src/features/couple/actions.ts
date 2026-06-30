'use server';

import { activitySchema, wishlistSchema, expenseSchema } from '@/shared/validators/schemas';
import * as coupleService from '@/services/couple';

export async function getActivities(coupleId: string) {
  try {
    const data = await coupleService.getActivities(coupleId);
    return { success: true as const, message: 'Activities loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function createActivity(userId: string, coupleId: string, input: unknown) {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await coupleService.createActivity(userId, coupleId, parsed.data);
    return { success: true as const, message: 'Activity created', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getWishlist(coupleId: string) {
  try {
    const data = await coupleService.getWishlist(coupleId);
    return { success: true as const, message: 'Wishlist loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function addWishlistItem(userId: string, coupleId: string, input: unknown) {
  const parsed = wishlistSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await coupleService.addWishlistItem(userId, coupleId, parsed.data);
    return { success: true as const, message: 'Item added', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function fulfillWishlistItem(id: string) {
  try {
    await coupleService.completeWishlistItem(id);
    return { success: true as const, message: 'Item fulfilled', data: null };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function getExpenses(coupleId: string) {
  try {
    const data = await coupleService.getExpenses(coupleId);
    return { success: true as const, message: 'Expenses loaded', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}

export async function addExpense(userId: string, coupleId: string, input: unknown) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: 'Invalid input', errors: parsed.error.flatten().fieldErrors };
  try {
    const data = await coupleService.addExpense(userId, coupleId, parsed.data);
    return { success: true as const, message: 'Expense added', data };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Unknown error', errors: [] };
  }
}
