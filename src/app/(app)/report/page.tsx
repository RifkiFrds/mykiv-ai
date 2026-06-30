'use client';

import { useState, useEffect } from 'react';
import { SafeArea } from '@/shared/components/layout/safe-area';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { getWeeklyTrends, getAiReports, type HealthTrendData } from '@/features/analytics/actions/analytics';
import { BarChart3, Heart, Sparkles, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function ReportPage() {
  const [activeMetric, setActiveMetric] = useState<'water' | 'sleep' | 'exercise'>('water');
  const [trends, setTrends] = useState<HealthTrendData[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const resTrends = await getWeeklyTrends();
      const resReports = await getAiReports();
      if (resTrends.success) setTrends(resTrends.data);
      if (resReports.success) setReports(resReports.data);
      setLoading(false);
    };
    loadData();
  }, []);

  const maxVal = trends.reduce((max, day) => {
    if (activeMetric === 'water') return Math.max(max, day.waterMl);
    if (activeMetric === 'sleep') return Math.max(max, day.sleepHours);
    return Math.max(max, day.exerciseMinutes);
  }, 10) || 10;

  return (
    <div className="flex-1 bg-surface min-h-dvh flex flex-col">
      <PageHeader title="Weekly Insights" />

      <SafeArea withTabBar className="px-5 pt-4 pb-10 space-y-6 stagger-children">
        {/* Metric Segment Selection */}
        <div className="flex gap-2 justify-center">
          {(['water', 'sleep', 'exercise'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-4 h-9 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeMetric === m
                  ? 'bg-primary-500 border-primary-500 text-white shadow-md'
                  : 'bg-surface-elevated text-muted border-border hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Custom Neomorphic Chart Card */}
        <Card variant="elevated" padding="lg" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp size={16} className="text-primary-500" />
              Weekly {activeMetric.toUpperCase()} Trends
            </h3>
            <Badge variant="primary">Last 7 Days</Badge>
          </div>

          {loading ? (
            <div className="h-44 flex items-center justify-center text-muted text-sm">
              Analyzing trends...
            </div>
          ) : trends.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-muted text-sm">
              Log habits to populate weekly graphs.
            </div>
          ) : (
            /* Custom HTML vertical bar charts */
            <div className="h-44 flex items-end justify-between px-2 pt-6">
              {trends.map((day) => {
                const val =
                  activeMetric === 'water'
                    ? day.waterMl
                    : activeMetric === 'sleep'
                    ? day.sleepHours
                    : day.exerciseMinutes;
                const pct = Math.max(5, (val / maxVal) * 100);

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="relative w-6 flex-1 flex flex-col justify-end">
                      {/* Tooltip */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {val.toFixed(0)}
                        {activeMetric === 'water' ? 'ml' : activeMetric === 'sleep' ? 'h' : 'm'}
                      </span>
                      {/* Bar fill */}
                      <div
                        className="w-full rounded-t-full bg-gradient-to-t from-primary-400 to-primary-500 shadow-[var(--shadow-glow-primary)] transition-all duration-500 ease-out"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-muted">{day.date}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Insight Reports Archives */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            AI Brain Coaching Reports
          </h2>

          {loading ? (
            <Card variant="elevated" className="h-16 animate-pulse-soft" />
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Sparkles size={28} className="mx-auto opacity-30 mb-1.5" />
              <p className="text-xs">No analytics summaries compiled yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id} variant="elevated" padding="md" className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-accent-500 animate-pulse-soft" />
                      <h4 className="text-sm font-bold text-foreground">
                        {r.type.toUpperCase()} COACHING REPORT
                      </h4>
                    </div>
                    <span className="text-[10px] text-muted font-medium">
                      {new Date(r.generatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                    {r.report.summary}
                  </p>

                  {r.report.recommendation && r.report.recommendation.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1">
                        Advice &amp; Actions
                      </span>
                      <ul className="text-xs text-muted list-disc list-inside space-y-0.5">
                        {r.report.recommendation.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </SafeArea>
    </div>
  );
}
