'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/shared/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 * This client uses the browser's cookies for auth session.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
