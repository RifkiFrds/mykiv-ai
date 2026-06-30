'use server';

import { createClient } from '@/shared/lib/supabase/server';

/**
 * Invites or links a partner by email.
 * Creates a couple relationship and updates both users' couple_id.
 */
export async function linkPartner(partnerEmail: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    if (user.email === partnerEmail.trim()) {
      return { success: false, message: 'You cannot link with yourself.' };
    }

    // 1. Get the partner user record
    const { data: partner, error: partnerError } = await (supabase.from('users') as any)
      .select('*')
      .ilike('email', partnerEmail.trim())
      .single();

    if (partnerError || !partner) {
      return {
        success: false,
        message: 'Partner not found. Make sure your partner has signed in to MyKiv AI first.',
      };
    }

    // 2. Verify that neither user is currently linked to a couple
    const { data: currentUserProfile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (currentUserProfile?.couple_id) {
      return { success: false, message: 'You are already linked to a partner.' };
    }

    if (partner.couple_id) {
      return { success: false, message: 'This user is already linked to another partner.' };
    }

    // 3. Create couple row
    const { data: newCouple, error: coupleError } = await (supabase.from('couples') as any)
      .insert({
        partner_a: user.id,
        partner_b: partner.id,
        relationship_status: 'active',
      })
      .select()
      .single();

    if (coupleError || !newCouple) {
      return { success: false, message: coupleError?.message || 'Failed to create relationship.' };
    }

    // 4. Update both users with new couple_id
    const { error: updateUserError } = await (supabase.from('users') as any)
      .update({ couple_id: newCouple.id })
      .eq('id', user.id);

    const { error: updatePartnerError } = await (supabase.from('users') as any)
      .update({ couple_id: newCouple.id })
      .eq('id', partner.id);

    if (updateUserError || updatePartnerError) {
      // Rollback couple row on failure
      await (supabase.from('couples') as any).delete().eq('id', newCouple.id);
      return { success: false, message: 'Failed to update user profiles.' };
    }

    return { success: true, message: 'Linked successfully with your partner!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Unlinks the current couple relationship.
 * Deletes the couple row and resets couple_id for both partners.
 */
export async function unlinkPartner() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) {
      return { success: false, message: 'You are not linked to any partner.' };
    }

    const coupleId = profile.couple_id;

    // Get the couple info to know the partner ID
    const { data: couple } = await (supabase.from('couples') as any)
      .select('*')
      .eq('id', coupleId)
      .single();

    if (!couple) {
      return { success: false, message: 'Relationship record not found.' };
    }

    // Reset couple_id for both users
    await (supabase.from('users') as any)
      .update({ couple_id: null })
      .in('id', [couple.partner_a, couple.partner_b]);

    // Delete couple record
    const { error } = await (supabase.from('couples') as any).delete().eq('id', coupleId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Unlinked relationship successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
