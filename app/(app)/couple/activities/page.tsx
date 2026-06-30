'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { CoupleActivity, Profile } from '@/types';
import { getActivities, createActivity } from '@/features/couple/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Heart, Plus, Calendar } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';
import { ListSkeleton } from '@/shared/components/layout/Skeleton';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<CoupleActivity[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'date' as CoupleActivity['category'],
    activity_date: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle().then(({ data }) => {
          if (data) { setProfile(data as Profile); loadActivities(data.couple_id || ''); }
        });
      }
    });
  }, []);

  const loadActivities = async (cid: string) => {
    if (!cid) { setLoading(false); return; }
    const result = await getActivities(cid);
    if (result.success && result.data) setActivities(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile?.couple_id) return;
    const result = await createActivity(userId, profile.couple_id, {
      title: form.title,
      description: form.description,
      category: form.category,
      activity_date: form.activity_date ? new Date(form.activity_date).toISOString() : null,
    });
    if (result.success) {
      setForm({ title: '', description: '', category: 'date', activity_date: '' });
      setOpen(false);
      loadActivities(profile.couple_id);
    }
  };

  const typeColors: Record<string, string> = {
    date: 'bg-rose-50 text-rose-600', travel: 'bg-sky-50 text-sky-600', fitness: 'bg-orange-50 text-orange-600',
    cooking: 'bg-amber-50 text-amber-600', movie: 'bg-indigo-50 text-indigo-600', other: 'bg-neutral-50 text-neutral-600',
  };

  if (loading) return <div className="mx-auto max-w-md"><ListSkeleton /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/couple')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Activities</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{activities.length} activities</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700"><Plus className="mr-1 h-4 w-4" /> Add</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>New Activity</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Weekend Getaway" required className="h-12 rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="cooking">Cooking</SelectItem>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>When</Label><Input type="datetime-local" value={form.activity_date} onChange={(e) => setForm({ ...form, activity_date: e.target.value })} className="h-12 rounded-xl" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." className="h-12 rounded-xl" /></div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700">Create Activity</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {activities.map((act) => (
          <Card key={act.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${typeColors[act.category]}`}><Heart className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{act.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${typeColors[act.category]}`}>{act.category}</span>
                </div>
                {act.activity_date && <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500"><Calendar className="h-3 w-3" />{new Date(act.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                {act.description && <p className="mt-1 text-xs text-neutral-400">{act.description}</p>}
              </div>
            </div>
          </Card>
        ))}
        {activities.length === 0 && <EmptyState icon={Heart} title="No activities yet" description="Plan something fun together" />}
      </div>
    </div>
  );
}
