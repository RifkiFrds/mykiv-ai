import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/shared/types/database';

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses Next.js cookies for auth session management.
 *
 * Note: Next.js 16 — cookies() is async and must be awaited.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies can't be set. This can be safely ignored if you have
            // middleware refreshing user sessions.
          }
        },
      },
    },
  );
}
