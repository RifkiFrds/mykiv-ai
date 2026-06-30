'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { sendChatMessage, generateDailyReport } from '@/features/ai/actions/ai';
import { Sparkles, Send, Bot, User, Brain, AlertCircle } from 'lucide-react';
import { useAuth } from '@/shared/providers/auth-provider';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  'Generate today\'s health report',
  'What is my partner\'s mood today?',
  'Give me sleep advice',
  'Suggest a weekend date idea',
];

export default function AiChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile?.full_name || 'there'}! I am your AI companion. I can help analyze your health logs, remember important dates, and suggest relationship insights. Ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isPending) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    startTransition(async () => {
      // Special routing for shortcut text
      if (text.includes('today\'s health report')) {
        const res = await generateDailyReport();
        if (res.success && res.data) {
          const report = res.data;
          const reportText = `
**Today's Health Summary:**
${report.summary}

**AI Recommendations:**
${report.recommendation.map((r) => `- ${r}`).join('\n')}

**Pattern Predictions:**
${report.prediction.map((p) => `- ${p}`).join('\n')}
          `.trim();

          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-assistant`,
              sender: 'assistant',
              text: reportText,
              timestamp: new Date(),
            },
          ]);
          return;
        }
      }

      // Normal chat message
      const res = await sendChatMessage(text);
      if (res.success && res.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            sender: 'assistant',
            text: res.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            sender: 'assistant',
            text: `Error: ${res.message || 'I had trouble connecting to the AI Brain. Please verify your internet connection and try again.'}`,
            timestamp: new Date(),
          },
        ]);
      }
    });
  };

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader
        title="AI Companion"
        rightAction={<LinkIcon href="/memory" />}
      />

      <SafeArea withTabBar className="flex-1 flex flex-col h-[calc(100dvh-7rem)] overflow-hidden">
        {/* Messages list container */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } animate-slide-up`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser
                      ? 'bg-primary-500 text-white'
                      : 'bg-gradient-to-br from-primary-400 to-accent-500 text-white'
                  }`}
                >
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Speech Bubble */}
                <Card
                  variant={isUser ? 'flat' : 'elevated'}
                  padding="md"
                  className={`
                    rounded-[var(--radius-xl)]
                    ${
                      isUser
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : 'bg-surface-elevated text-foreground rounded-tl-none'
                    }
                  `}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1.5 ${
                      isUser ? 'text-white/60' : 'text-muted'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </Card>
              </div>
            );
          })}
          {isPending && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse-soft">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center">
                <Brain size={14} />
              </div>
              <Card variant="elevated" padding="sm" className="rounded-tl-none bg-surface-elevated">
                <div className="flex gap-1 py-1.5 px-3">
                  <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </Card>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Dynamic suggestion chips */}
        {messages.length === 1 && !isPending && (
          <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 flex-shrink-0">
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSendMessage(sug)}
                className="bg-surface-elevated text-xs font-semibold text-muted border border-border px-3.5 py-2 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex-shrink-0 cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Message Form */}
        <div className="p-4 border-t border-border bg-surface-elevated/70 backdrop-blur-md flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2 items-center"
          >
            <Input
              type="text"
              placeholder="Ask AI Companion..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isPending}
              className="flex-1 rounded-full h-11"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || isPending}
              className="rounded-full h-11 w-11 p-0 flex-shrink-0"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </SafeArea>
    </div>
  );
}

function LinkIcon({ href }: { href: string }) {
  return (
    <Link href={href} className="text-muted hover:text-foreground">
      <Brain size={20} />
    </Link>
  );
}
