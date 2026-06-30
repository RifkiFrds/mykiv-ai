'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { SleepLog } from '@/types';
import { getSleep, createSleep } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Moon, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function SleepPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    sleep_date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    quality_score: '',
    bed_time: '',
    wake_time: '',
    notes: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadSleep(session.user.id); }
    });
  }, []);

  const loadSleep = async (uid: string) => {
    const result = await getSleep(uid);
    if (result.success && result.data) setLogs(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await createSleep(userId, {
      sleep_date: form.sleep_date,
      duration_minutes: form.duration_minutes ? parseFloat(form.duration_minutes) : null,
      quality_score: form.quality_score ? parseFloat(form.quality_score) : null,
      bed_time: form.bed_time ? new Date(form.bed_time).toISOString() : null,
      wake_time: form.wake_time ? new Date(form.wake_time).toISOString() : null,
      notes: form.notes || null,
    });
    if (result.success) {
      setForm({ sleep_date: new Date().toISOString().split('T')[0], duration_minutes: '', quality_score: '', bed_time: '', wake_time: '', notes: '' });
      setOpen(false);
      loadSleep(userId);
    }
  };

  const getQualityColor = (score: number | null) => {
    if (!score) return 'bg-neutral-100 text-neutral-500';
    if (score >= 8) return 'bg-emerald-50 text-emerald-600';
    if (score >= 5) return 'bg-amber-50 text-amber-600';
    return 'bg-rose-50 text-rose-600';
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Sleep Logs</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{logs.length} nights tracked</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700"><Plus className="mr-1 h-4 w-4" /> Log Sleep</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Log Sleep</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.sleep_date} onChange={(e) => setForm({ ...form, sleep_date: e.target.value })} required className="h-12 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} placeholder="480" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Quality (1-10)</Label><Input type="number" min="1" max="10" value={form.quality_score} onChange={(e) => setForm({ ...form, quality_score: e.target.value })} placeholder="7" className="h-12 rounded-xl" /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How did you sleep?" className="h-12 rounded-xl" /></div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-indigo-600 font-semibold hover:bg-indigo-700">Save Sleep Log</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><Moon className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{new Date(log.sleep_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  {log.quality_score && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getQualityColor(log.quality_score)}`}>{log.quality_score}/10</span>}
                </div>
                {log.duration_minutes && <p className="mt-1 text-sm text-neutral-500">{Math.floor(log.duration_minutes / 60)}h {log.duration_minutes % 60}m</p>}
                {log.notes && <p className="mt-1 text-xs text-neutral-400">{log.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && <EmptyState icon={Moon} title="No sleep tracked yet" description="Log your first night" />}
      </div>
    </div>
  );
}
