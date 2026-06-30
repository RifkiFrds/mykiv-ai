'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { MealLog } from '@/types';
import { getMeals, createMeal } from '@/features/health/actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { EmptyState } from '@/shared/components/layout/EmptyState';
import { ListSkeleton } from '@/shared/components/layout/Skeleton';

export default function MealsPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState('');

  const [form, setForm] = useState({
    meal_type: 'breakfast' as const,
    food_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); loadMeals(session.user.id); }
    });
  }, []);

  const loadMeals = async (uid: string) => {
    const result = await getMeals(uid);
    if (result.success && result.data) setMeals(result.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await createMeal(userId, {
      meal_type: form.meal_type,
      food_name: form.food_name,
      calories: form.calories ? parseFloat(form.calories) : null,
      protein_g: form.protein_g ? parseFloat(form.protein_g) : null,
      carbs_g: form.carbs_g ? parseFloat(form.carbs_g) : null,
      fat_g: form.fat_g ? parseFloat(form.fat_g) : null,
    });
    if (result.success) {
      setForm({ meal_type: 'breakfast', food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' });
      setOpen(false);
      loadMeals(userId);
    }
  };

  const mealTypeColors: Record<string, string> = {
    breakfast: 'bg-amber-50 text-amber-600', lunch: 'bg-emerald-50 text-emerald-600',
    dinner: 'bg-indigo-50 text-indigo-600', snack: 'bg-rose-50 text-rose-600',
  };

  if (loading) return <div className="mx-auto max-w-md"><ListSkeleton /></div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold text-neutral-900">Meal Logs</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{meals.length} meals logged</p>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700"><Plus className="mr-1 h-4 w-4" /> Log Meal</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Log a Meal</SheetTitle></SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={form.meal_type} onValueChange={(v) => setForm({ ...form, meal_type: v as typeof form.meal_type })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Food Name</Label>
                <Input value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} placeholder="e.g., Grilled Chicken Salad" required className="h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Calories</Label><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="0" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Protein (g)</Label><Input type="number" value={form.protein_g} onChange={(e) => setForm({ ...form, protein_g: e.target.value })} placeholder="0" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Carbs (g)</Label><Input type="number" value={form.carbs_g} onChange={(e) => setForm({ ...form, carbs_g: e.target.value })} placeholder="0" className="h-12 rounded-xl" /></div>
                <div className="space-y-2"><Label>Fat (g)</Label><Input type="number" value={form.fat_g} onChange={(e) => setForm({ ...form, fat_g: e.target.value })} placeholder="0" className="h-12 rounded-xl" /></div>
              </div>
              <Button type="submit" className="h-12 w-full rounded-xl bg-teal-600 font-semibold hover:bg-teal-700">Save Meal</Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="space-y-3">
        {meals.map((meal) => (
          <Card key={meal.id} className="rounded-2xl border-0 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-2 ${mealTypeColors[meal.meal_type] || 'bg-neutral-50 text-neutral-600'}`}><UtensilsCrossed className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">{meal.food_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${mealTypeColors[meal.meal_type] || ''}`}>{meal.meal_type}</span>
                </div>
                {meal.calories && <p className="mt-1 text-sm text-neutral-500">{meal.calories} kcal</p>}
                {(meal.protein_g || meal.carbs_g || meal.fat_g) && (
                  <div className="mt-2 flex gap-3 text-xs text-neutral-400">
                    {meal.protein_g && <span>P: {meal.protein_g}g</span>}
                    {meal.carbs_g && <span>C: {meal.carbs_g}g</span>}
                    {meal.fat_g && <span>F: {meal.fat_g}g</span>}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {meals.length === 0 && <EmptyState icon={UtensilsCrossed} title="No meals logged yet" description="Tap Log Meal to get started" />}
      </div>
    </div>
  );
}
