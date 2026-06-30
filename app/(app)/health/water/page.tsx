'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { WaterLog } from '@/types';
import { getWater, createWater } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Droplets, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

const PRESETS = [150, 250, 330, 500];

export default function WaterPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [userId, setUserId] = useState('');

  const GOAL = 2500;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadWater(session.user.id); }
    });
  }, []);

  const loadWater = async (uid: string) => {
    const today = new Date().toISOString().split('T')[0];
    const result = await getWater(uid, today);
    if (result.success && result.data) {
      setLogs(result.data);
      setTotal(result.data.reduce((sum, w) => sum + (w.amount_ml || 0), 0));
    }
    setLoading(false);
  };

  const addWater = async (amount: number) => {
    if (!userId) return;
    const result = await createWater(userId, { amount_ml: amount });
    if (result.success) loadWater(userId);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (amount > 0) { await addWater(amount); setCustomAmount(''); setOpen(false); }
  };

  const progress = Math.min((total / GOAL) * 100, 100);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Water Intake</h1>
      </div>
      <Card className="rounded-3xl border-0 bg-gradient-to-b from-sky-400 to-sky-600 p-8 text-white shadow-lg shadow-sky-200">
        <div className="text-center">
          <Droplets className="mx-auto h-10 w-10" />
          <p className="mt-4 text-5xl font-bold">{total}<span className="text-2xl font-medium opacity-80">ml</span></p>
          <p className="mt-2 text-sm opacity-80">of {GOAL}ml daily goal</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Card>
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-700">Quick Add</p>
        <div className="grid grid-cols-4 gap-3">
          {PRESETS.map((amount) => (
            <Button key={amount} variant="outline" onClick={() => addWater(amount)} className="h-16 flex-col rounded-2xl border-neutral-200 hover:border-sky-300 hover:bg-sky-50">
              <Plus className="h-4 w-4 text-sky-500" /><span className="text-xs font-semibold">{amount}ml</span>
            </Button>
          ))}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-12 w-full rounded-xl border-dashed border-neutral-300"><Plus className="mr-2 h-4 w-4" /> Custom Amount</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Custom Amount</SheetTitle></SheetHeader>
          <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4">
            <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Amount in ml" className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4 text-lg" autoFocus />
            <Button type="submit" className="h-12 w-full rounded-xl bg-sky-500 font-semibold hover:bg-sky-600">Add Water</Button>
          </form>
        </SheetContent>
      </Sheet>
      <div>
        <p className="mb-3 text-sm font-medium text-neutral-700">Today</p>
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-50 p-2 text-sky-500"><Droplets className="h-4 w-4" /></div>
                <span className="text-sm font-medium">{log.amount_ml}ml</span>
              </div>
              <span className="text-xs text-neutral-400">{new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {logs.length === 0 && <EmptyState icon={Droplets} title="No water logged today" description="Stay hydrated!" />}
        </div>
      </div>
    </div>
  );
}
