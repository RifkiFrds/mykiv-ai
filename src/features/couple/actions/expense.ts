'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { expenseSchema, type ExpenseInput } from '../schemas/couple.schema';

export async function createExpense(input: ExpenseInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) {
      return { success: false, message: 'You must link with a partner first.' };
    }

    const validated = expenseSchema.parse(input);

    const { data, error } = await (supabase.from('expenses') as any)
      .insert({
        couple_id: profile.couple_id,
        user_id: user.id,
        category: validated.category,
        amount: validated.amount,
        description: validated.description,
        expense_date: validated.expenseDate,
      })
      .select()
      .single();

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

export async function getExpenses() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) return { success: true, data: [] };

    const { data, error } = await (supabase.from('expenses') as any)
      .select('*')
      .eq('couple_id', profile.couple_id)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: [] };
  }
}

export async function deleteExpense(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('expenses') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Expense log deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
