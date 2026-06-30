'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { WishlistItem, Profile } from '@/types';
import { getWishlist, addWishlistItem, fulfillWishlistItem } from '@/features/couple/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Gift, Plus, Star } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'experience' as WishlistItem['category'],
    estimated_cost: '',
    priority: '3',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle().then(({ data }) => {
          if (data) { setProfile(data as Profile); loadWishlist(data.couple_id || ''); }
        });
      }
    });
  }, []);

  const loadWishlist = async (cid: string) => {
    if (!cid) { setLoading(false); return; }
    const result = await getWishlist(cid);
    if (result.success && result.data) setItems(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile?.couple_id) return;
    const result = await addWishlistItem(userId, profile.couple_id, {
      title: form.title,
      description: form.description,
      category: form.category,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
      priority: parseFloat(form.priority),
    });
    if (result.success) {
      setForm({ title: '', description: '', category: 'experience', estimated_cost: '', priority: '3' });
      setOpen(false);
      loadWishlist(profile.couple_id);
    }
  };

  const handleFulfill = async (id: string) => {
    await fulfillWishlistItem(id);
    if (profile?.couple_id) loadWishlist(profile.couple_id);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/couple')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Wishlist</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{items.length} items</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-pink-600 hover:bg-pink-700"><Plus className="mr-1 h-4 w-4" /> Add</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Add to Wishlist</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Cooking Class" required className="h-12 rounded-xl" /></div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Estimated Cost</Label><Input type="number" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} placeholder="$" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Priority (1-5)</Label><Input type="number" min="1" max="5" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-12 rounded-xl" /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." className="h-12 rounded-xl" /></div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-pink-600 font-semibold hover:bg-pink-700">Add Item</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-pink-50 p-2 text-pink-600"><Gift className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{item.title}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: item.priority || 0 }, (_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
                <p className="text-xs text-neutral-500">{item.category}{item.estimated_cost ? ` · $${item.estimated_cost}` : ''}</p>
                {item.description && <p className="mt-1 text-xs text-neutral-400">{item.description}</p>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleFulfill(item.id)} className="rounded-lg text-emerald-600">Done</Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <EmptyState icon={Gift} title="Wishlist is empty" description="Add things you want to do together" />}
      </div>
    </div>
  );
}
