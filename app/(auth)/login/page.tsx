'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/repositories/supabase';
import { loginSchema } from '@/shared/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Invalid input');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Welcome back</h1>
        <p className="mt-2 text-neutral-500">Sign in to continue with MyKiv</p>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 rounded-xl border-neutral-200 bg-white" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="h-12 rounded-xl border-neutral-200 bg-white" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="h-12 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account? <Link href="/register" className="font-semibold text-teal-600">Sign up</Link>
      </p>
    </div>
  );
}
