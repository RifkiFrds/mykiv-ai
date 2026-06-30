'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { ROUTES } from '@/shared/constants/routes';
import { headers } from 'next/headers';

/**
 * Initiates login/signup via Magic Link.
 * Sends a passwordless login link to the user's email.
 */
export async function loginWithMagicLink(email: string) {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || '';
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}${ROUTES.AUTH_CALLBACK}`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Magic link has been sent to your email.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Initiates Google OAuth login.
 * Returns the OAuth URL to redirect the client to.
 */
export async function loginWithGoogle() {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin') || '';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}${ROUTES.AUTH_CALLBACK}`,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, url: data.url };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Signs out the current user session.
 */
export async function signOutUser() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Signed out successfully.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
