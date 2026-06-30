'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { locationSchema, type LocationInput } from '../schemas/couple.schema';

/**
 * Updates the user's current live location coordinates.
 */
export async function updateLocation(input: LocationInput) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const validated = locationSchema.parse(input);

    const { data, error } = await (supabase.from('locations') as any)
      .insert({
        user_id: user.id,
        latitude: validated.latitude,
        longitude: validated.longitude,
        accuracy: validated.accuracy || null,
      })
      .select()
      .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'Location update failed.' };
  }
}

/**
 * Retrieves the latest recorded location coordinate for the linked partner.
 */
export async function getPartnerLocation() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: null };

    // Get partner ID
    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) {
      return { success: false, message: 'No linked partner.', data: null };
    }

    const { data: couple } = await (supabase.from('couples') as any)
      .select('partner_a, partner_b')
      .eq('id', profile.couple_id)
      .single();

    if (!couple) {
      return { success: false, message: 'Relationship not found.', data: null };
    }

    const partnerId = couple.partner_a === user.id ? couple.partner_b : couple.partner_a;

    // Fetch latest location
    const { data, error } = await (supabase.from('locations') as any)
      .select('*')
      .eq('user_id', partnerId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, message: error.message, data: null };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: null };
  }
}
