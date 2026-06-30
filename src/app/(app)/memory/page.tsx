'use client';

import { useState, useEffect, useTransition } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { addMemory, getMemories, deleteMemory } from '@/features/ai/actions/ai';
import type { AiMemoryRow, AiMemoryCategory } from '@/shared/types/database';
import { Brain, Plus, Trash2, ArrowLeft, Heart, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';

const CATEGORIES: Array<{ type: AiMemoryCategory; label: string; emoji: string }> = [
  { type: 'favorite_food', label: 'Fav Food', emoji: '🍕' },
  { type: 'favorite_drink', label: 'Fav Drink', emoji: '🍹' },
  { type: 'favorite_place', label: 'Fav Place', emoji: '📍' },
  { type: 'favorite_color', label: 'Fav Color', emoji: '🎨' },
  { type: 'important_date', label: 'Date', emoji: '📅' },
  { type: 'gift', label: 'Gift Ideas', emoji: '🎁' },
  { type: 'habit', label: 'Habit', emoji: '⚡' },
  { type: 'goal', label: 'Goal', emoji: '🎯' },
  { type: 'personality', label: 'Personality', emoji: '🧠' },
  { type: 'preference', label: 'Preference', emoji: '💡' },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<AiMemoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<AiMemoryCategory>('favorite_food');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState({ text: '', error: false });

  const loadMemories = async () => {
    setLoading(false);
    const res = await getMemories();
    if (res.success && res.data) {
      setMemories(res.data);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setMsg({ text: '', error: false });

    startTransition(async () => {
      const res = await addMemory(selectedCategory, title.trim(), content.trim());
      setMsg({ text: res.message, error: !res.success });
      if (res.success) {
        setTitle('');
        setContent('');
        loadMemories();
      }
    });
  };

  const handleDeleteMemory = (id: string) => {
    if (!confirm('Delete this memory?')) return;
    startTransition(async () => {
      const res = await deleteMemory(id);
      if (res.success) {
        loadMemories();
      }
    });
  };

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader
        title="AI Memories"
        leftAction={
          <Link href={ROUTES.AI_CHAT} className="text-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
        }
      />

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6 stagger-children">
        {/* Memory overview info */}
        <Card variant="glass" padding="md" className="flex items-start gap-3 border-dashed border-primary-300">
          <Sparkles className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted leading-relaxed">
            These shared details act as long-term memory context for your AI Companion.
            The AI accesses these notes to customize recommendations and remember important preferences.
          </p>
        </Card>

        {/* Add Memory Form */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} className="text-primary-500" />
            <h3 className="text-base font-bold text-foreground">Save New Memory</h3>
          </div>

          <form onSubmit={handleAddMemory} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground ml-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full h-12 neu-input px-4 text-base text-foreground bg-surface border-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.type} value={cat.type}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Memory Title"
              placeholder="e.g. Mayly's clothing size, Favorite Coffee Shop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Details / Notes"
              placeholder="e.g. Size M, likes Cafe Latte with less sugar"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            {msg.text && (
              <p className={`text-sm ml-1 ${msg.error ? 'text-danger-500' : 'text-success-500'}`}>
                {msg.text}
              </p>
            )}

            <Button type="submit" size="md" fullWidth isLoading={isPending}>
              Save Memory Context
            </Button>
          </form>
        </Card>

        {/* Memories list */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Active Context Memory
          </h2>

          {loading ? (
            <Card variant="elevated" className="h-16 animate-pulse-soft" />
          ) : memories.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <BookOpen size={32} className="mx-auto opacity-30 mb-2" />
              <p className="text-sm">No memories recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memories.map((mem) => {
                const config = CATEGORIES.find((c) => c.type === mem.category);
                return (
                  <Card key={mem.id} variant="elevated" padding="md" className="relative group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config?.emoji}</span>
                          <h4 className="text-sm font-bold text-foreground">{mem.title}</h4>
                        </div>
                        <p className="text-sm text-muted leading-relaxed pl-7">{mem.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        disabled={isPending}
                        className="text-muted hover:text-danger-500 p-1 cursor-pointer absolute top-3 right-3 opacity-60 hover:opacity-100 transition-opacity"
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
    </div>
  );
}
