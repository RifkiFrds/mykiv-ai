'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { MedicineLog } from '@/types';
import { getMedicine, createMedicine } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Pill, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function MedicinePage() {
  const router = useRouter();
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    medicine_name: '',
    dosage: '',
    status: 'taken' as 'taken' | 'skipped' | 'missed',
    notes: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadMedicine(session.user.id); }
    });
  }, []);

  const loadMedicine = async (uid: string) => {
    const result = await getMedicine(uid);
    if (result.success && result.data) setLogs(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await createMedicine(userId, {
      medicine_name: form.medicine_name,
      dosage: form.dosage || null,
      status: form.status,
      notes: form.notes || null,
    });
    if (result.success) {
      setForm({ medicine_name: '', dosage: '', status: 'taken', notes: '' });
      setOpen(false);
      loadMedicine(userId);
    }
  };

  const statusColors: Record<string, string> = {
    taken: 'bg-emerald-50 text-emerald-600', skipped: 'bg-amber-50 text-amber-600', missed: 'bg-rose-50 text-rose-600',
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Medicine Log</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{logs.length} entries</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-rose-600 hover:bg-rose-700"><Plus className="mr-1 h-4 w-4" /> Log Medicine</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Log Medicine</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Medicine Name</Label><Input value={form.medicine_name} onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} placeholder="e.g., Vitamin D" required className="h-12 rounded-xl" /></div>
              <div className="space-y-2"><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g., 1 tablet, 500mg" className="h-12 rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taken">Taken</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes?" className="h-12 rounded-xl" /></div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-rose-600 font-semibold hover:bg-rose-700">Save Entry</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${statusColors[log.status]}`}><Pill className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{log.medicine_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${statusColors[log.status]}`}>{log.status}</span>
                </div>
                {log.dosage && <p className="mt-1 text-sm text-neutral-500">{log.dosage}</p>}
                <p className="mt-1 text-xs text-neutral-400">{new Date(log.taken_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && <EmptyState icon={Pill} title="No medicine logs yet" description="Track your supplements" />}
      </div>
    </div>
  );
}
