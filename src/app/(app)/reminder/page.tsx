'use client';

import { useState, useEffect, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { BottomSheet } from '@/shared/components/ui/bottom-sheet';
import { Badge } from '@/shared/components/ui/badge';
import {
  createReminder,
  getReminders,
  completeReminder,
  snoozeReminder,
  deleteReminder,
} from '@/features/reminder/actions/reminder';
import type { ReminderRow, ReminderCategory, RepeatType } from '@/shared/types/database';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Bell,
  Check,
} from 'lucide-react';

const CATEGORIES: Record<ReminderCategory, { label: string; color: string; bg: string }> = {
  meal: { label: 'Meal', color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/30' },
  water: { label: 'Water', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/30' },
  medicine: { label: 'Medicine', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30' },
  sleep: { label: 'Sleep', color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/30' },
  exercise: { label: 'Exercise', color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/30' },
  couple_activity: { label: 'Date', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/30' },
  wishlist: { label: 'Wishlist', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  anniversary: { label: 'Anniversary', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  expense: { label: 'Expense', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  custom: { label: 'Custom', color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-800' },
};

export default function ReminderPage() {
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [category, setCategory] = useState<ReminderCategory>('water');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [repeatType, setRepeatType] = useState<RepeatType>('once');
  const [errorMsg, setErrorMsg] = useState('');

  const loadReminders = async () => {
    setLoading(true);
    const res = await getReminders();
    if (res.success && res.data) {
      setReminders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reminderTime) return;
    setErrorMsg('');

    startTransition(async () => {
      const res = await createReminder({
        category,
        title: title.trim(),
        description: description.trim() || null,
        reminderTime: new Date(reminderTime).toISOString(),
        repeatType,
      });

      if (res.success) {
        setTitle('');
        setDescription('');
        setReminderTime('');
        setActiveSheet(false);
        loadReminders();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleComplete = (id: string) => {
    startTransition(async () => {
      const res = await completeReminder(id);
      if (res.success) loadReminders();
    });
  };

  const handleSnooze = (id: string) => {
    startTransition(async () => {
      const res = await snoozeReminder(id, 15); // Snooze for 15 mins
      if (res.success) loadReminders();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    startTransition(async () => {
      const res = await deleteReminder(id);
      if (res.success) loadReminders();
    });
  };

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader
        title="Smart Reminders"
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
        {/* Reminders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Bell size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm">No reminders set. Tap + to add one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => {
                const config = CATEGORIES[rem.category];
                const isCompleted = rem.status === 'completed';

                return (
                  <Card
                    key={rem.id}
                    variant="elevated"
                    padding="sm"
                    className={`flex items-center justify-between transition-opacity ${
                      isCompleted ? 'opacity-55' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Interactive check button */}
                      <button
                        onClick={() => handleComplete(rem.id)}
                        disabled={isCompleted || isPending}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-success-500 border-success-500 text-white'
                            : 'border-neutral-300 hover:border-primary-500'
                        }`}
                      >
                        {isCompleted && <Check size={14} />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {rem.title}
                          </h4>
                          <Badge variant="default" className={config?.bg}>
                            <span className={config?.color}>{config?.label}</span>
                          </Badge>
                        </div>
                        {rem.description && (
                          <p className="text-xs text-muted mt-0.5">{rem.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-muted mt-1">
                          <Clock size={10} />
                          <span>
                            {new Date(rem.reminder_time).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            {new Date(rem.reminder_time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {rem.repeat_type !== 'once' && (
                            <Badge variant="default" className="text-[9px] py-0 px-1.5 uppercase font-bold">
                              {rem.repeat_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSnooze(rem.id)}
                          disabled={isPending}
                          className="h-7 px-2.5 text-xs font-semibold"
                        >
                          Snooze
                        </Button>
                      )}
                      <button
                        onClick={() => handleDelete(rem.id)}
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

      {/* Add Reminder Bottom Sheet */}
      <BottomSheet isOpen={activeSheet} onClose={() => setActiveSheet(false)} title="New Reminder">
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
            >
              {Object.entries(CATEGORIES).map(([cat, config]) => (
                <option key={cat} value={cat}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Title"
            placeholder="e.g. Minum Obat Vitamin C"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Description / Notes"
            placeholder="e.g. Setelah makan siang"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Time"
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground ml-1">Repeat</label>
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as any)}
                className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-danger-500 text-sm ml-1">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button type="submit" size="md" fullWidth isLoading={isPending}>
            Create Reminder
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
