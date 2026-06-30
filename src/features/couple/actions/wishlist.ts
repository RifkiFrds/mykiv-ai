'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { wishlistSchema, type WishlistInput } from '../schemas/couple.schema';

export async function createWishlist(input: WishlistInput) {
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

    const validated = wishlistSchema.parse(input);

    const { data, error } = await (supabase.from('wishlists') as any)
      .insert({
        couple_id: profile.couple_id,
        title: validated.title,
        category: validated.category,
        progress: validated.progress,
        completed: validated.completed,
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

export async function getWishlists() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized', data: [] };

    const { data: profile } = await (supabase.from('users') as any)
      .select('couple_id')
      .eq('id', user.id)
      .single();

    if (!profile?.couple_id) return { success: true, data: [] };

    const { data, error } = await (supabase.from('wishlists') as any)
      .select('*')
      .eq('couple_id', profile.couple_id)
      .order('created_at', { ascending: false });

    if (error) return { success: false, message: error.message, data: [] };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.', data: [] };
  }
}

export async function updateWishlistProgress(id: string, progress: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const completed = progress >= 100;

    const { error } = await (supabase.from('wishlists') as any)
      .update({
        progress,
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Wishlist progress updated.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteWishlist(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const { error } = await (supabase.from('wishlists') as any).delete().eq('id', id);

    if (error) return { success: false, message: error.message };

    revalidatePath('/');
    return { success: true, message: 'Wishlist item deleted successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
