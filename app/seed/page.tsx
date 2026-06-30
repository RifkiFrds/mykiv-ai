'use client';

import { useState } from 'react';
import { seedDatabase } from '@/lib/seed';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Database, CheckCircle } from 'lucide-react';

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleSeed = async () => {
    setStatus('loading');
    try {
      await seedDatabase();
      setStatus('done');
    } catch (error) {
      console.error('Seed error:', error);
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <Card className="w-full max-w-sm rounded-3xl border-0 p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
          <Database className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-neutral-900">Seed Database</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Populate the database with dummy data for two couples: Rifki & Mayly, Adrian & Nabila.
        </p>
        {status === 'done' ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Seed completed!</span>
          </div>
        ) : (
          <Button
            onClick={handleSeed}
            disabled={status === 'loading'}
            className="mt-6 h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700"
          >
            {status === 'loading' ? 'Seeding...' : 'Run Seed'}
          </Button>
        )}
      </Card>
    </div>
  );
}
