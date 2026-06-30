'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { Expense, Profile } from '@/types';
import { getExpenses, addExpense } from '@/features/couple/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Receipt, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'food' as Expense['category'],
    split_type: 'equal' as Expense['split_type'],
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle().then(({ data }) => {
          if (data) { setProfile(data as Profile); loadExpenses(data.couple_id || ''); }
        });
      }
    });
  }, []);

  const loadExpenses = async (cid: string) => {
    if (!cid) { setLoading(false); return; }
    const result = await getExpenses(cid);
    if (result.success && result.data) {
      setExpenses(result.data);
      setTotal(result.data.reduce((s, e) => s + e.amount, 0));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile?.couple_id) return;
    const result = await addExpense(userId, profile.couple_id, {
      title: form.title,
      amount: parseFloat(form.amount),
      category: form.category,
      split_type: form.split_type,
      expense_date: form.expense_date,
    });
    if (result.success) {
      setForm({ title: '', amount: '', category: 'food', split_type: 'equal', expense_date: new Date().toISOString().split('T')[0] });
      setOpen(false);
      loadExpenses(profile.couple_id);
    }
  };

  const catColors: Record<string, string> = {
    food: 'bg-orange-50 text-orange-600', travel: 'bg-sky-50 text-sky-600', entertainment: 'bg-purple-50 text-purple-600',
    bills: 'bg-rose-50 text-rose-600', shopping: 'bg-pink-50 text-pink-600', health: 'bg-emerald-50 text-emerald-600', other: 'bg-neutral-50 text-neutral-600',
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-teal-500" /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/couple')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Expenses</h1>
      </div>
      <Card className="rounded-2xl border-0 bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-lg shadow-teal-200">
        <p className="text-sm opacity-80">Total Shared Expenses</p>
        <p className="text-3xl font-bold">${total.toFixed(2)}</p>
      </Card>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{expenses.length} expenses</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700"><Plus className="mr-1 h-4 w-4" /> Add</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Add Expense</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Dinner at Italian Place" required className="h-12 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required className="h-12 rounded-xl" /></div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="bills">Bills</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Split</Label>
                  <Select value={form.split_type} onValueChange={(v) => setForm({ ...form, split_type: v as typeof form.split_type })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Equal</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="h-12 rounded-xl" /></div>
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700">Add Expense</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {expenses.map((exp) => (
          <Card key={exp.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${catColors[exp.category]}`}><Receipt className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-neutral-900">{exp.title}</p>
                  <p className="text-xs text-neutral-500">{exp.category} · {new Date(exp.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <p className="font-bold text-neutral-900">${exp.amount}</p>
            </div>
          </Card>
        ))}
        {expenses.length === 0 && <EmptyState icon={Receipt} title="No expenses yet" description="Track your shared spending" />}
      </div>
    </div>
  );
}
