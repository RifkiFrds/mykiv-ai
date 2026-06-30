'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  mealSchema,
  waterSchema,
  sleepSchema,
  exerciseSchema,
  moodSchema,
  medicineSchema,
} from '../schemas/health.schema';
import type { HealthLogType } from '@/shared/types/database';

/**
 * Creates a health log entry.
 */
export async function createHealthLog(type: HealthLogType, value: any, unit: string | null, datetime: string, note?: string | null) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: 'Unauthorized' };

    // Validate based on log type
    let validatedValue = value;
    if (type === 'meal') validatedValue = mealSchema.parse({ mealType: value.mealType, description: value.description, calories: value.calories, datetime, note });
    else if (type === 'water') validatedValue = waterSchema.parse({ amountMl: value.amountMl, datetime, note });
    else if (type === 'sleep') validatedValue = sleepSchema.parse({ sleepTime: value.sleepTime, wakeTime: value.wakeTime, quality: value.quality, datetime, note });
    else if (type === 'exercise') validatedValue = exerciseSchema.parse({ exerciseType: value.exerciseType, durationMinutes: value.durationMinutes, datetime, note });
    else if (type === 'mood') validatedValue = moodSchema.parse({ moodValue: value.moodValue, datetime, note });
    else if (type === 'medicine') validatedValue = medicineSchema.parse({ name: value.name, dosage: value.dosage, type: value.type, datetime, note });

    const { data, error } = await (supabase.from('health_logs') as any)
      .insert({
        user_id: user.id,
        type,
        value: validatedValue,
        unit,
        datetime,
        note: note || null,
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
 * Retrieves health logs for a specific period for the logged-in user and optionally partner.
 */
export async function getHealthLogs(type?: HealthLogType, includePartner = false) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    let query = supabase
      .from('health_logs')
      .select('*')
      .is('deleted_at', null)
      .order('datetime', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (!includePartner) {
      query = query.eq('user_id', user.id);
    } else {
      // Get partner profile to get couple_id
      const { data: profile } = await (supabase.from('users') as any)
        .select('couple_id')
        .eq('id', user.id)
        .single();

      if (profile?.couple_id) {
        // Load couple to identify both user IDs
        const { data: couple } = await (supabase.from('couples') as any)
          .select('partner_a, partner_b')
          .eq('id', profile.couple_id)
          .single();

        if (couple) {
          query = query.in('user_id', [couple.partner_a, couple.partner_b]);
        }
      } else {
        query = query.eq('user_id', user.id);
      }
    }

    const { data, error } = await query;
    if (error) return { success: false, message: error.message, data: [] };

    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: [] };
  }
}

/**
 * Updates an existing health log.
 */
export async function updateHealthLog(id: string, value: any, datetime: string, note?: string | null) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('health_logs') as any)
      .update({
        value,
        datetime,
        note: note || null,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Log updated successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Soft deletes an existing health log.
 */
export async function deleteHealthLog(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('health_logs') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Log deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
