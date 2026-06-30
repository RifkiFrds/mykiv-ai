'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { reminderSchema, type ReminderInput } from '../schemas/reminder.schema';

/**
 * Creates a new reminder.
 */
export async function createReminder(input: ReminderInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const validated = reminderSchema.parse(input);

    const { data, error } = await (supabase.from('reminders') as any)
      .insert({
        user_id: user.id,
        category: validated.category,
        title: validated.title,
        description: validated.description || null,
        reminder_time: validated.reminderTime,
        repeat_type: validated.repeatType,
        status: 'active',
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

/**
 * Retrieves all active reminders for the current user.
 */
export async function getReminders() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .is('deleted_at', null)
      .order('reminder_time', { ascending: true });

    if (error) return { success: false, message: error.message, data: [] };

    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: [] };
  }
}

/**
 * Completes a reminder and logs the completion state.
 */
export async function completeReminder(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // Update status to completed
    const { error: reminderError } = await (supabase.from('reminders') as any)
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (reminderError) return { success: false, message: reminderError.message };

    // Log completion
    await (supabase.from('reminder_logs') as any).insert({
      reminder_id: id,
      completed: true,
      sent_at: new Date().toISOString(),
      opened_at: new Date().toISOString(),
    });

    revalidatePath('/');
    return { success: true, message: 'Reminder completed successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Snoozes a reminder by pushing its time forward by a specified duration (minutes).
 */
export async function snoozeReminder(id: string, minutes = 15) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    const { error } = await (supabase.from('reminders') as any)
      .update({
        reminder_time: snoozeTime,
        status: 'snoozed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: `Reminder snoozed for ${minutes} minutes.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Soft deletes an existing reminder.
 */
export async function deleteReminder(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('reminders') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Reminder deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
