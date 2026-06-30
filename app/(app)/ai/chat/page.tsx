'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/repositories/supabase';
import { AIConversation } from '@/types';
import { sendMessage, getChatHistory } from '@/features/ai/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { ChatSkeleton } from '@/shared/components/layout/Skeleton';

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<AIConversation[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async (uid: string) => {
    const result = await getChatHistory(uid);
    if (result.success && result.data) {
      setMessages(result.data);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadHistory(session.user.id);
      }
    });
  }, [loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !userId) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Optimistic UI
    const tempMsg: AIConversation = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      prompt: userMessage,
      response: '',
      token_usage: null,
      latency: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const result = await sendMessage({ message: userMessage, userId });

    if (result.success && result.data) {
      setMessages(prev => prev.map(m =>
        m.id === tempMsg.id ? (result.data?.conversation || m) : m
      ));
    } else {
      setMessages(prev => prev.map(m =>
        m.id === tempMsg.id ? { ...m, response: "I'm sorry, I'm having trouble connecting right now. Please try again later." } : m
      ));
    }

    setLoading(false);
  };

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3 border-b border-neutral-100 bg-white/80 p-4 backdrop-blur-lg">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-sm font-bold">MyKiv AI</h1>
        </div>
        <ChatSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-80px)] max-w-md flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-white/80 p-4 backdrop-blur-lg">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900">MyKiv AI</h1>
            <p className="text-xs text-neutral-500">Your health companion</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-200">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">Hello! I'm MyKiv</p>
              <p className="mt-1 max-w-xs text-sm text-neutral-500">I can help you track your health, suggest activities with your partner, and provide insights about your well-being.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['How did I sleep?', 'Suggest a date idea', 'My mood today', 'Health tips'].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="rounded-full bg-white px-4 py-2 text-sm text-teal-600 shadow-sm hover:shadow-md">{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.response ? 'justify-start' : 'justify-end'}`}>
              {msg.response ? (
                <div className="max-w-[80%] rounded-2xl bg-white px-4 py-3 text-neutral-800 shadow-sm">
                  <p className="text-sm leading-relaxed">{msg.response}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ) : (
                <div className="max-w-[80%] rounded-2xl bg-teal-600 px-4 py-3 text-white">
                  <p className="text-sm leading-relaxed">{msg.prompt}</p>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="border-t border-neutral-100 bg-white p-4">
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask MyKiv anything..." className="h-12 flex-1 rounded-xl border-neutral-200 bg-neutral-50" disabled={loading} />
          <Button type="submit" disabled={loading || !input.trim()} className="h-12 w-12 rounded-xl bg-teal-600 p-0 hover:bg-teal-700"><Send className="h-4 w-4" /></Button>
        </div>
      </form>
    </div>
  );
}
