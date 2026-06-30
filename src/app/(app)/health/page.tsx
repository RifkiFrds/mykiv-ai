'use client';

import { useState, useEffect, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { BottomSheet } from '@/shared/components/ui/bottom-sheet';
import { Badge } from '@/shared/components/ui/badge';
import { getHealthLogs, deleteHealthLog } from '@/features/health/actions/health';
import { useOfflineSync } from '@/shared/hooks/use-offline-sync';
import type { HealthLogRow } from '@/shared/types/database';
import {
  Droplets,
  Heart,
  Smile,
  Moon,
  Dumbbell,
  Pill,
  Plus,
  Trash2,
  Calendar,
  CloudLightning,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';

const CATEGORIES = [
  { type: 'water' as const, label: 'Water', icon: Droplets, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/30', unit: 'ml' },
  { type: 'meal' as const, label: 'Meal', icon: Heart, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-900/30', unit: '' },
  { type: 'sleep' as const, label: 'Sleep', icon: Moon, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/30', unit: 'hours' },
  { type: 'exercise' as const, label: 'Exercise', icon: Dumbbell, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-900/30', unit: 'min' },
  { type: 'mood' as const, label: 'Mood', icon: Smile, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-900/30', unit: '' },
  { type: 'medicine' as const, label: 'Medicine', icon: Pill, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30', unit: '' },
];

export default function HealthPage() {
  const [selectedCategory, setSelectedCategory] = useState<'water' | 'meal' | 'sleep' | 'exercise' | 'mood' | 'medicine'>('water');
  const [logs, setLogs] = useState<HealthLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load logs function
  const loadLogs = async () => {
    setLoading(true);
    const res = await getHealthLogs(selectedCategory, true); // Include partner
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  const { isOnline, addLog, queueLength, triggerSync } = useOfflineSync(loadLogs);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Quick-add forms states
  const [waterAmount, setWaterAmount] = useState('250');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealDesc, setMealDesc] = useState('');
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepQuality, setSleepQuality] = useState('4');
  const [exerciseType, setExerciseType] = useState<'walking' | 'running' | 'gym' | 'stretching' | 'cycling'>('walking');
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [moodVal, setMoodVal] = useState<'happy' | 'neutral' | 'sad' | 'stress' | 'sick' | 'tired'>('happy');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medType, setMedType] = useState<'medicine' | 'vitamin' | 'supplement'>('medicine');
  const [note, setNote] = useState('');
  const [logError, setLogError] = useState('');

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogError('');

    let value: any = {};
    let unit: string | null = null;
    const datetime = new Date().toISOString();

    try {
      if (selectedCategory === 'water') {
        const amountMl = Number(waterAmount);
        if (isNaN(amountMl) || amountMl <= 0) throw new Error('Invalid amount');
        value = { amountMl };
        unit = 'ml';
      } else if (selectedCategory === 'meal') {
        if (!mealDesc.trim()) throw new Error('Please enter meal description');
        value = { mealType, description: mealDesc.trim(), calories: null };
      } else if (selectedCategory === 'sleep') {
        if (!sleepStart || !sleepEnd) throw new Error('Please select sleep and wake times');
        value = { sleepTime: new Date(sleepStart).toISOString(), wakeTime: new Date(sleepEnd).toISOString(), quality: Number(sleepQuality) };
        unit = 'hours';
      } else if (selectedCategory === 'exercise') {
        value = { exerciseType, durationMinutes: Number(exerciseDuration) };
        unit = 'minutes';
      } else if (selectedCategory === 'mood') {
        value = { moodValue: moodVal };
      } else if (selectedCategory === 'medicine') {
        if (!medName.trim()) throw new Error('Please enter medicine name');
        value = { name: medName.trim(), dosage: medDosage.trim() || null, type: medType };
      }

      const res = await addLog(selectedCategory, value, unit, datetime, note.trim() || null);
      if (res.success) {
        setActiveSheet(null);
        setNote('');
        setMealDesc('');
        setMedName('');
        setMedDosage('');
        loadLogs();
      } else {
        setLogError(res.message);
      }
    } catch (err: any) {
      setLogError(err.message || 'Validation failed');
    }
  };

  const handleDeleteLog = (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    startTransition(async () => {
      const res = await deleteHealthLog(id);
      if (res.success) {
        loadLogs();
      }
    });
  };

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader
        title="Health Tracker"
        rightAction={
          isOnline ? (
            <Badge variant="success" className="gap-1"><Wifi size={12} />Online</Badge>
          ) : (
            <Badge variant="danger" className="gap-1"><WifiOff size={12} />Offline</Badge>
          )
        }
      />

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6">
        {/* Offline cache notice banner */}
        {queueLength > 0 && (
          <Card variant="glass" padding="sm" className="bg-warning-50 border-warning-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning-800">
              <CloudLightning size={16} />
              <span className="text-sm font-medium">{queueLength} logs waiting to sync</span>
            </div>
            <Button size="sm" variant="secondary" onClick={triggerSync}>Sync Now</Button>
          </Card>
        )}

        {/* Horizontal Category Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.type;

            return (
              <button
                key={cat.type}
                onClick={() => setSelectedCategory(cat.type)}
                className={`
                  flex items-center gap-2 h-10 px-4 rounded-full font-semibold text-sm transition-all flex-shrink-0 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-surface-elevated text-muted shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }
                `}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Log History List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {CATEGORIES.find((c) => c.type === selectedCategory)?.label} History
            </h2>
            <Button size="sm" variant="primary" className="rounded-full h-8 w-8 p-0" onClick={() => setActiveSheet(selectedCategory)}>
              <Plus size={18} />
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
              <Card variant="elevated" className="h-16 animate-pulse-soft" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <Clock size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm">No logs found for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const config = CATEGORIES.find((c) => c.type === log.type)!;
                const Icon = config.icon;

                // Format values based on type
                let displayVal = '';
                let details = '';
                const val = log.value as any;

                if (log.type === 'water') {
                  displayVal = `${val?.amountMl || 0} ml`;
                } else if (log.type === 'meal') {
                  displayVal = (val?.mealType || '').toUpperCase();
                  details = val?.description || '';
                } else if (log.type === 'sleep') {
                  const hrs = val?.wakeTime && val?.sleepTime
                    ? Math.abs(new Date(val.wakeTime).getTime() - new Date(val.sleepTime).getTime()) / 36e5
                    : 0;
                  displayVal = `${hrs.toFixed(1)} hrs`;
                  details = `Quality: ${'⭐'.repeat(val?.quality || 0)}`;
                } else if (log.type === 'exercise') {
                  displayVal = `${val?.durationMinutes || 0} min`;
                  details = val?.exerciseType || '';
                } else if (log.type === 'mood') {
                  displayVal = val?.moodValue || '';
                } else if (log.type === 'medicine') {
                  displayVal = val?.name || '';
                  details = `${val?.dosage || ''} (${val?.type || ''})`;
                }

                return (
                  <Card key={log.id} variant="elevated" padding="sm" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[var(--radius-xl)] ${config.bg} flex items-center justify-center`}>
                        <Icon size={20} className={config.color} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{displayVal}</p>
                        {details && <p className="text-xs text-muted mt-0.5">{details}</p>}
                        {log.note && <p className="text-xs italic text-muted mt-1">&ldquo;{log.note}&rdquo;</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">
                        {new Date(log.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={isPending}
                        className="text-muted hover:text-danger-500 p-1 cursor-pointer"
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

      {/* Quick Add Bottom Sheet for Water */}
      <BottomSheet isOpen={activeSheet === 'water'} onClose={() => setActiveSheet(null)} title="Log Water Intake">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {['150', '250', '500'].map((amt) => (
              <Card
                key={amt}
                variant="elevated"
                padding="sm"
                className={`text-center cursor-pointer font-bold ${waterAmount === amt ? 'bg-primary-500 text-white' : ''}`}
                onClick={() => setWaterAmount(amt)}
              >
                {amt} ml
              </Card>
            ))}
          </div>
          <Input
            label="Custom Amount (ml)"
            type="number"
            value={waterAmount}
            onChange={(e) => setWaterAmount(e.target.value)}
            required
          />
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Water Log</Button>
        </form>
      </BottomSheet>

      {/* Quick Add Bottom Sheet for Meal */}
      <BottomSheet isOpen={activeSheet === 'meal'} onClose={() => setActiveSheet(null)} title="Log Meal">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
              <Card
                key={t}
                variant="elevated"
                padding="sm"
                className={`text-center cursor-pointer text-xs font-bold ${mealType === t ? 'bg-danger-500 text-white' : ''}`}
                onClick={() => setMealType(t)}
              >
                {t.toUpperCase()}
              </Card>
            ))}
          </div>
          <Input
            label="What did you eat?"
            type="text"
            placeholder="e.g. Nasi goreng dengan telur ceplok"
            value={mealDesc}
            onChange={(e) => setMealDesc(e.target.value)}
            required
          />
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Meal Log</Button>
        </form>
      </BottomSheet>

      {/* Quick Add Bottom Sheet for Sleep */}
      <BottomSheet isOpen={activeSheet === 'sleep'} onClose={() => setActiveSheet(null)} title="Log Sleep">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sleep Time"
              type="datetime-local"
              value={sleepStart}
              onChange={(e) => setSleepStart(e.target.value)}
              required
            />
            <Input
              label="Wake Time"
              type="datetime-local"
              value={sleepEnd}
              onChange={(e) => setSleepEnd(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Quality</label>
            <div className="flex gap-2 justify-center">
              {['1', '2', '3', '4', '5'].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSleepQuality(star)}
                  className={`text-2xl cursor-pointer transition-transform active:scale-125 ${Number(sleepQuality) >= Number(star) ? 'opacity-100' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Sleep Log</Button>
        </form>
      </BottomSheet>

      {/* Quick Add Bottom Sheet for Exercise */}
      <BottomSheet isOpen={activeSheet === 'exercise'} onClose={() => setActiveSheet(null)} title="Log Exercise">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground ml-1">Type</label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as any)}
              className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
            >
              {['walking', 'running', 'gym', 'stretching', 'cycling'].map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            value={exerciseDuration}
            onChange={(e) => setExerciseDuration(e.target.value)}
            required
          />
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Exercise Log</Button>
        </form>
      </BottomSheet>

      {/* Quick Add Bottom Sheet for Mood */}
      <BottomSheet isOpen={activeSheet === 'mood'} onClose={() => setActiveSheet(null)} title="Log Mood">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: 'happy' as const, emoji: '😊' },
              { val: 'neutral' as const, emoji: '😐' },
              { val: 'sad' as const, emoji: '😢' },
              { val: 'stress' as const, emoji: '🤯' },
              { val: 'sick' as const, emoji: '🤒' },
              { val: 'tired' as const, emoji: '🥱' },
            ].map((m) => (
              <Card
                key={m.val}
                variant="elevated"
                padding="sm"
                className={`text-center cursor-pointer text-sm font-bold flex flex-col items-center gap-1 ${moodVal === m.val ? 'bg-warning-400 text-white' : ''}`}
                onClick={() => setMoodVal(m.val)}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span>{m.val.toUpperCase()}</span>
              </Card>
            ))}
          </div>
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Mood Log</Button>
        </form>
      </BottomSheet>

      {/* Quick Add Bottom Sheet for Medicine */}
      <BottomSheet isOpen={activeSheet === 'medicine'} onClose={() => setActiveSheet(null)} title="Log Medicine">
        <form onSubmit={handleAddLog} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['medicine', 'vitamin', 'supplement'] as const).map((t) => (
              <Card
                key={t}
                variant="elevated"
                padding="sm"
                className={`text-center cursor-pointer text-xs font-bold ${medType === t ? 'bg-primary-500 text-white' : ''}`}
                onClick={() => setMedType(t)}
              >
                {t.toUpperCase()}
              </Card>
            ))}
          </div>
          <Input
            label="Medicine Name"
            type="text"
            placeholder="e.g. Paracetamol"
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            required
          />
          <Input
            label="Dosage"
            type="text"
            placeholder="e.g. 500mg"
            value={medDosage}
            onChange={(e) => setMedDosage(e.target.value)}
          />
          <Input label="Add Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          {logError && <p className="text-sm text-danger-500">{logError}</p>}
          <Button type="submit" size="md" fullWidth>Save Medicine Log</Button>
        </form>
      </BottomSheet>
    </div>
  );
}
