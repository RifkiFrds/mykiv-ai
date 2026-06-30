'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { activitySchema, type ActivityInput } from '../schemas/couple.schema';

export async function createActivity(input: ActivityInput) {
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

    const validated = activitySchema.parse(input);

    const { data, error } = await (supabase.from('couple_activities') as any)
      .insert({
        couple_id: profile.couple_id,
        category: validated.category,
        title: validated.title,
        description: validated.description || null,
        activity_date: validated.activityDate,
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

export async function getActivities() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) return { success: true, data: [] };

    const { data, error } = await (supabase.from('couple_activities') as any)
      .select('*')
      .eq('couple_id', profile.couple_id)
      .is('deleted_at', null)
      .order('activity_date', { ascending: false });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: [] };
  }
}

export async function deleteActivity(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('couple_activities') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Activity deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
