'use server';

import { supabase } from './supabase';
import { CoupleActivity, WishlistItem, Expense } from '@/types';

export async function getActivities(coupleId: string): Promise<CoupleActivity[]> {
  const { data, error } = await supabase.from('couple_activities').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as CoupleActivity[];
}

export async function createActivity(activity: Partial<CoupleActivity>) {
  const { data, error } = await supabase.from('couple_activities').insert(activity).select().maybeSingle();
  if (error) throw error;
  return data as CoupleActivity | null;
}

export async function getWishlist(coupleId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase.from('wishlist_items').select('*').eq('couple_id', coupleId).eq('is_fulfilled', false).order('priority', { ascending: false });
  if (error) throw error;
  return (data || []) as WishlistItem[];
}

export async function createWishlistItem(item: Partial<WishlistItem>) {
  const { data, error } = await supabase.from('wishlist_items').insert(item).select().maybeSingle();
  if (error) throw error;
  return data as WishlistItem | null;
}

export async function fulfillWishlistItem(id: string) {
  const { error } = await supabase.from('wishlist_items').update({ is_fulfilled: true }).eq('id', id);
  if (error) throw error;
}

export async function getExpenses(coupleId: string): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Expense[];
}

export async function createExpense(expense: Partial<Expense>) {
  const { data, error } = await supabase.from('expenses').insert(expense).select().maybeSingle();
  if (error) throw error;
  return data as Expense | null;
}
