'use client';

import { useState } from 'react';
import { Heart, Sparkles, Mail, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { loginWithMagicLink, loginWithGoogle } from '@/features/auth/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMsg('');

    const res = await loginWithMagicLink(email.trim());
    if (res.success) {
      setIsSent(true);
    } else {
      setErrorMsg(res.message);
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const res = await loginWithGoogle();
    if (res.success && res.url) {
      window.location.href = res.url;
    } else {
      setErrorMsg(res.message || 'OAuth initiation failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-fade-in">
      {/* Logo & Branding */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-[var(--radius-3xl)] bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-[var(--shadow-glow-primary)] animate-float">
            <Heart className="w-9 h-9 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success-400 flex items-center justify-center ring-3 ring-surface shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          MyKiv AI
        </h1>
        <p className="text-muted text-center mt-2 text-sm leading-relaxed max-w-[260px]">
          Your AI Relationship &amp; Health Companion
        </p>
      </div>

      {/* Login Form */}
      {!isSent ? (
        <div className="w-full space-y-4">
          {/* Google Login */}
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              autoComplete="email"
              required
            />
            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!email.trim()}
            >
              Send Magic Link
              <ArrowRight size={18} />
            </Button>
          </form>
          {errorMsg && (
            <p className="text-sm text-danger-500 text-center animate-fade-in">{errorMsg}</p>
          )}
        </div>
      ) : (
        /* Email Sent Confirmation */
        <div className="w-full neu-card p-6 text-center animate-scale-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-900/30 flex items-center justify-center">
            <Mail className="w-7 h-7 text-success-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Check your email
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            We sent a magic link to{' '}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Click the link to sign in.
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setIsSent(false)}
          >
            Use a different email
          </Button>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-8 flex items-center gap-2 text-xs text-muted">
        <Shield size={14} />
        <span>Your data is encrypted and private</span>
      </div>
    </div>
  );
}
