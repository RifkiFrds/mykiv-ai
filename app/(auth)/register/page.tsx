'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const coupleCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        couple_code: coupleCode,
      });
    }

    router.push('/dashboard');
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Create account</h1>
        <p className="mt-2 text-neutral-500">Start your journey with MyKiv</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            required
            className="h-12 rounded-xl border-neutral-200 bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="h-12 rounded-xl border-neutral-200 bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
            className="h-12 rounded-xl border-neutral-200 bg-white"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-teal-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
