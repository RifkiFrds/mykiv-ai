'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { ExerciseLog } from '@/types';
import { getExercise, createExercise } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Dumbbell, Plus, Flame } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function ExercisePage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    exercise_type: '',
    duration_minutes: '',
    calories_burned: '',
    intensity: 'moderate' as 'low' | 'moderate' | 'high',
    notes: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadExercise(session.user.id); }
    });
  }, []);

  const loadExercise = async (uid: string) => {
    const result = await getExercise(uid);
    if (result.success && result.data) setLogs(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await createExercise(userId, {
      exercise_type: form.exercise_type,
      duration_minutes: form.duration_minutes ? parseFloat(form.duration_minutes) : null,
      calories_burned: form.calories_burned ? parseFloat(form.calories_burned) : null,
      intensity: form.intensity,
      notes: form.notes || null,
    });
    if (result.success) {
      setForm({ exercise_type: '', duration_minutes: '', calories_burned: '', intensity: 'moderate', notes: '' });
      setOpen(false);
      loadExercise(userId);
    }
  };

  const intensityColors: Record<string, string> = {
    low: 'bg-emerald-50 text-emerald-600', moderate: 'bg-amber-50 text-amber-600', high: 'bg-rose-50 text-rose-600',
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Exercise</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{logs.length} workouts</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-orange-600 hover:bg-orange-700"><Plus className="mr-1 h-4 w-4" /> Log Workout</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Log Workout</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Exercise Type</Label><Input value={form.exercise_type} onChange={(e) => setForm({ ...form, exercise_type: e.target.value })} placeholder="e.g., Running, Yoga, Weights" required className="h-12 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} placeholder="30" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Calories Burned</Label><Input type="number" value={form.calories_burned} onChange={(e) => setForm({ ...form, calories_burned: e.target.value })} placeholder="0" className="h-12 rounded-xl" /></div>
              </div>
              <div className="space-y-2">
                <Label>Intensity</Label>
                <Select value={form.intensity} onValueChange={(v) => setForm({ ...form, intensity: v as typeof form.intensity })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How did it feel?" className="h-12 rounded-xl" /></div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-orange-600 font-semibold hover:bg-orange-700">Save Workout</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-orange-50 p-2 text-orange-600"><Dumbbell className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{log.exercise_type}</p>
                  {log.intensity && <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${intensityColors[log.intensity]}`}>{log.intensity}</span>}
                </div>
                <div className="mt-1 flex gap-4 text-sm text-neutral-500">
                  {log.duration_minutes && <span>{log.duration_minutes} min</span>}
                  {log.calories_burned && <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-400" />{log.calories_burned} kcal</span>}
                </div>
                {log.notes && <p className="mt-1 text-xs text-neutral-400">{log.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && <EmptyState icon={Dumbbell} title="No workouts yet" description="Start moving!" />}
      </div>
    </div>
  );
}
