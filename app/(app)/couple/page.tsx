'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/repositories/supabase';
import { Profile, CoupleActivity, WishlistItem, Expense } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Calendar, Gift, Receipt, Users } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';
import { ListSkeleton } from '@/shared/components/layout/Skeleton';

export default function CouplePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<CoupleActivity[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (profileData) {
      setProfile(profileData as Profile);
      if (profileData.partner_id) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', profileData.partner_id).maybeSingle();
        if (p) setPartner(p as Profile);
      }
      if (profileData.couple_id) {
        const [{ data: act }, { data: wish }, { data: exp }] = await Promise.all([
          supabase.from('couple_activities').select('*').eq('couple_id', profileData.couple_id).order('created_at', { ascending: false }).limit(5),
          supabase.from('wishlist_items').select('*').eq('couple_id', profileData.couple_id).eq('is_fulfilled', false).order('priority', { ascending: false }).limit(5),
          supabase.from('expenses').select('*').eq('couple_id', profileData.couple_id).order('created_at', { ascending: false }).limit(5),
        ]);
        if (act) setActivities(act as CoupleActivity[]);
        if (wish) setWishlist(wish as WishlistItem[]);
        if (exp) setExpenses(exp as Expense[]);
      }
    }
    setLoading(false);
  };

  if (loading) return <div className="mx-auto max-w-md"><ListSkeleton count={3} /></div>;

  if (!profile?.partner_id) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-neutral-900">Couple Space</h1>
        <Card className="rounded-2xl border-0 p-8 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-neutral-300" />
          <p className="mt-4 text-lg font-semibold text-neutral-900">Connect with your partner</p>
          <p className="mt-2 text-sm text-neutral-500">Share your couple code to connect</p>
          <div className="mt-6">
            <p className="text-3xl font-bold tracking-widest text-teal-600">{profile?.couple_code}</p>
            <p className="mt-2 text-xs text-neutral-400">Your couple code</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-neutral-200">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">{profile?.full_name?.charAt(0) || 'U'}</div>}
          </div>
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white bg-neutral-200">
            {partner?.avatar_url ? <img src={partner.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">{partner?.full_name?.charAt(0) || 'P'}</div>}
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{profile?.full_name} & {partner?.full_name}</h1>
          <p className="text-sm text-neutral-500">Together since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-neutral-100 p-1">
          <TabsTrigger value="activities" className="rounded-lg text-xs"><Calendar className="mr-1 h-3 w-3" /> Activities</TabsTrigger>
          <TabsTrigger value="wishlist" className="rounded-lg text-xs"><Gift className="mr-1 h-3 w-3" /> Wishlist</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs"><Receipt className="mr-1 h-3 w-3" /> Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Activities</h2>
            <Button asChild size="sm" variant="ghost" className="rounded-lg text-teal-600"><Link href="/couple/activities">View All</Link></Button>
          </div>
          {activities.map((act) => (
            <Card key={act.id} className="rounded-2xl border-0 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 p-2 text-teal-600"><Heart className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{act.title}</p>
                  <p className="text-xs text-neutral-500">{act.category} · {act.status}</p>
                </div>
              </div>
            </Card>
          ))}
          {activities.length === 0 && <EmptyState icon={Calendar} title="No activities yet" description="Plan something fun together" />}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Wishlist</h2>
            <Button asChild size="sm" variant="ghost" className="rounded-lg text-teal-600"><Link href="/couple/wishlist">View All</Link></Button>
          </div>
          {wishlist.map((item) => (
            <Card key={item.id} className="rounded-2xl border-0 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-pink-50 p-2 text-pink-600"><Gift className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{item.title}</p>
                  {item.estimated_cost && <p className="text-xs text-neutral-500">${item.estimated_cost}</p>}
                </div>
              </div>
            </Card>
          ))}
          {wishlist.length === 0 && <EmptyState icon={Gift} title="Wishlist is empty" description="Add things you want to do together" />}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">Recent Expenses</h2>
            <Button asChild size="sm" variant="ghost" className="rounded-lg text-teal-600"><Link href="/couple/expenses">View All</Link></Button>
          </div>
          {expenses.map((exp) => (
            <Card key={exp.id} className="rounded-2xl border-0 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-neutral-50 p-2 text-neutral-600"><Receipt className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-neutral-900">{exp.title}</p>
                    <p className="text-xs text-neutral-500">{exp.category}</p>
                  </div>
                </div>
                <p className="font-semibold text-neutral-900">${exp.amount}</p>
              </div>
            </Card>
          ))}
          {expenses.length === 0 && <EmptyState icon={Receipt} title="No expenses yet" description="Track your shared spending" />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
