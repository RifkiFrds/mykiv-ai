'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { profileSchema, type ProfileInput } from '../schemas/profile.schema';
import { APP_CONFIG } from '@/shared/constants/config';

/**
 * Updates the current user's profile info in the public.users table.
 */
export async function updateProfile(input: ProfileInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const validated = profileSchema.parse(input);

    const { error } = await (supabase.from('users') as any)
      .update({
        full_name: validated.fullName,
        birth_date: validated.birthDate,
        gender: validated.gender,
        timezone: validated.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Profile updated successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Uploads an avatar image to Supabase Storage and updates the user record.
 */
export async function uploadAvatar(fileBase64: string, fileType: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    // Decode base64 to binary buffer
    const buffer = Buffer.from(fileBase64.split(',')[1] || fileBase64, 'base64');
    const extension = fileType.split('/')[1] || 'png';
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from(APP_CONFIG.storage.avatars)
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      return { success: false, message: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(APP_CONFIG.storage.avatars)
      .getPublicUrl(filePath);

    // Update user profile record with new avatar URL
    const { error: updateError } = await (supabase.from('users') as any)
      .update({ avatar: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return { success: true, avatarUrl: publicUrl };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
