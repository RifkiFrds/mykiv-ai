import { createClient } from '@/shared/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/shared/constants/routes';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || ROUTES.DASHBOARD;

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user profile exists in public.users table.
      // If not, insert a default profile record.
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User';
        const avatar = data.user.user_metadata?.avatar_url || null;

        await (supabase.from('users') as any).insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          avatar: avatar,
        });
      }

      const forwardedHost = request.headers.get('x-forwarded-host'); // Original origin before load balancer
      
      // If the redirect target is localhost/local environment, force HTTP protocol
      if (forwardedHost && (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1'))) {
        return NextResponse.redirect(`http://${forwardedHost}${next}`);
      }

      const isLocalRedirect = !forwardedHost;
      if (isLocalRedirect) {
        const localOrigin = origin.replace('https://', 'http://');
        return NextResponse.redirect(`${localOrigin}${next}`);
      } else {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
    }
  }

  // Redirect to login page on auth failure
  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth_failed`);
}
