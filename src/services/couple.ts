'use server';

import * as coupleRepo from '@/repositories/couple';
import { ActivityInput, WishlistInput, ExpenseInput } from '@/shared/validators/schemas';
import { CoupleActivity, WishlistItem, Expense } from '@/types';

export async function getActivities(coupleId: string): Promise<CoupleActivity[]> {
  return coupleRepo.getActivities(coupleId);
}

export async function createActivity(userId: string, coupleId: string, input: ActivityInput): Promise<CoupleActivity | null> {
  return coupleRepo.createActivity({
    couple_id: coupleId,
    created_by: userId,
    title: input.title,
    description: input.description,
    category: input.category,
    activity_date: input.activity_date,
    status: 'planned',
  });
}

export async function getWishlist(coupleId: string): Promise<WishlistItem[]> {
  return coupleRepo.getWishlist(coupleId);
}

export async function addWishlistItem(userId: string, coupleId: string, input: WishlistInput): Promise<WishlistItem | null> {
  return coupleRepo.createWishlistItem({
    couple_id: coupleId,
    created_by: userId,
    title: input.title,
    description: input.description,
    category: input.category,
    estimated_cost: input.estimated_cost,
    priority: input.priority,
  });
}

export async function completeWishlistItem(id: string) {
  return coupleRepo.fulfillWishlistItem(id);
}

export async function getExpenses(coupleId: string): Promise<Expense[]> {
  return coupleRepo.getExpenses(coupleId);
}

export async function addExpense(userId: string, coupleId: string, input: ExpenseInput): Promise<Expense | null> {
  return coupleRepo.createExpense({
    couple_id: coupleId,
    created_by: userId,
    title: input.title,
    amount: input.amount,
    category: input.category,
    split_type: input.split_type,
    expense_date: input.expense_date || new Date().toISOString().split('T')[0],
    paid_by: userId,
  });
}

export async function getExpenseTotal(coupleId: string): Promise<number> {
  const expenses = await coupleRepo.getExpenses(coupleId);
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
