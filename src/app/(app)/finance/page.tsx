'use client';

import { useState, useEffect, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { BottomSheet } from '@/shared/components/ui/bottom-sheet';
import { Badge } from '@/shared/components/ui/badge';
import { createExpense, getExpenses, deleteExpense } from '@/features/couple/actions/expense';
import type { ExpenseRow, ExpenseCategory } from '@/shared/types/database';
import { Wallet, Plus, Trash2, ArrowLeft, BarChart3, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

const CATEGORIES: Record<ExpenseCategory, { label: string; emoji: string; color: string; bg: string }> = {
  food: { label: 'Food & Dining', emoji: '🍕', color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/30' },
  transportation: { label: 'Transport', emoji: '🚗', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/30' },
  shopping: { label: 'Shopping', emoji: '🛍️', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  gift: { label: 'Gifts', emoji: '🎁', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/30' },
  vacation: { label: 'Vacation', emoji: '✈️', color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/30' },
  bills: { label: 'Bills', emoji: '📄', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  other: { label: 'Other', emoji: '✨', color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-800' },
};

export default function FinancePage() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [expenseDate, setExpenseDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadExpenses = async () => {
    setLoading(true);
    const res = await getExpenses();
    if (res.success && res.data) {
      setExpenses(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim() || !expenseDate) return;
    setErrorMsg('');

    startTransition(async () => {
      const res = await createExpense({
        amount: parsedAmount,
        description: description.trim(),
        category,
        expenseDate,
      });

      if (res.success) {
        setAmount('');
        setDescription('');
        setExpenseDate('');
        setActiveSheet(false);
        loadExpenses();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (!confirm('Delete this expense entry?')) return;
    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res.success) loadExpenses();
    });
  };

  // Compute total monthly shared expense
  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader
        title="Shared Expenses"
        leftAction={
          <Link href={ROUTES.DASHBOARD} className="text-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
        }
        rightAction={
          <Button
            size="sm"
            variant="primary"
            className="rounded-full h-8 w-8 p-0"
            onClick={() => setActiveSheet(true)}
          >
            <Plus size={18} />
          </Button>
        }
      />

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6 stagger-children">
        {/* Monthly total display */}
        <Card variant="glass" padding="lg" className="flex items-center justify-between border-emerald-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Total Shared Budget
            </span>
            <span className="text-3xl font-bold text-foreground block mt-1">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
            <BarChart3 size={24} />
          </div>
        </Card>

        {/* Expenses List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Logs History
          </h2>

          {loading ? (
            <div className="space-y-3">
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Wallet size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm">No expenses logged yet. Tap + to add one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((item) => {
                const config = CATEGORIES[item.category];

                return (
                  <Card key={item.id} variant="elevated" padding="sm" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[var(--radius-xl)] ${config?.bg} flex items-center justify-center`}>
                        <span className="text-xl">{config?.emoji}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{item.description}</h4>
                        <p className="text-xs text-muted mt-0.5">
                          Category: {config?.label} •{' '}
                          {new Date(item.expense_date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        Rp {Number(item.amount).toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        disabled={isPending}
                        className="text-muted hover:text-danger-500 p-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SafeArea>

      {/* Add Expense Bottom Sheet */}
      <BottomSheet isOpen={activeSheet} onClose={() => setActiveSheet(false)} title="Add Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
            >
              {Object.entries(CATEGORIES).map(([cat, config]) => (
                <option key={cat} value={cat}>
                  {config.emoji} {config.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Amount (IDR)"
            type="number"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Description"
            placeholder="e.g. Beli tiket nonton"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Input
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-danger-500 text-sm ml-1">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button type="submit" size="md" fullWidth isLoading={isPending}>
            Save Shared Expense
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
