'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { MoodLog } from '@/types';
import { getMood, createMood } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Smile, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';
import { MOOD_LABELS } from '@/shared/constants';

export default function MoodPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadMood(session.user.id); }
    });
  }, []);

  const loadMood = async (uid: string) => {
    const result = await getMood(uid);
    if (result.success && result.data) setLogs(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await createMood(userId, {
      mood_score: selectedScore,
      mood_label: MOOD_LABELS[selectedScore],
      notes: notes || null,
    });
    if (result.success) {
      setSelectedScore(5);
      setNotes('');
      setOpen(false);
      loadMood(userId);
    }
  };

  const getMoodColor = (score: number | null) => {
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
        <h1 className="text-xl font-bold text-neutral-900">Mood Tracker</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{logs.length} entries</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700"><Plus className="mr-1 h-4 w-4" /> Log Mood</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>How are you feeling?</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="flex items-center justify-between gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                  <button key={score} type="button" onClick={() => setSelectedScore(score)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      selectedScore === score ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}>{score}</button>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-amber-600">{MOOD_LABELS[selectedScore]}</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What's on your mind?" className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-4" />
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-amber-600 font-semibold hover:bg-amber-700">Save Mood</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${getMoodColor(log.mood_score)}`}><Smile className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getMoodColor(log.mood_score)}`}>{log.mood_score}/10</span>
                </div>
                {log.mood_label && <p className="mt-1 text-sm text-neutral-500">{log.mood_label}</p>}
                {log.notes && <p className="mt-1 text-xs text-neutral-400">{log.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && <EmptyState icon={Smile} title="No mood entries yet" description="Track how you feel" />}
      </div>
    </div>
  );
}
