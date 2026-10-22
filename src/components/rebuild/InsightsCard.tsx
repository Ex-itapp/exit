"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lock, Zap } from "lucide-react";
import { getLocalDateString } from "@/lib/useHabits";
import type { Habit, HabitLog } from "@/lib/useHabits";
import { usePro } from "@/lib/usePro";
import { useMoods } from "@/lib/useMoods";
import { cn } from "@/lib/utils";

interface InsightsCardProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function InsightsCard({ habits, logs }: InsightsCardProps) {
  const { isPro } = usePro();
  const { moodLogs } = useMoods();
  const router = useRouter();

  const totalDoneLogs = useMemo(() => logs.filter(l => l.status === 'done').length, [logs]);

  // 1. Mood vs Habits Correlation (Real data only, no fake fallbacks)
  const moodCorrelation = useMemo(() => {
    const moodScoreMap: Record<string, number> = {
      "😭": 1,
      "😔": 2,
      "😐": 3,
      "🙂": 4,
      "🤩": 5,
    };

    const doneDates = new Set(logs.filter(l => l.status === 'done').map(l => l.log_date));
    
    let habitDaysTotal = 0;
    let habitDaysCount = 0;
    let noHabitDaysTotal = 0;
    let noHabitDaysCount = 0;

    moodLogs.forEach((m) => {
      const score = moodScoreMap[m.emoji] || 3;
      const mDate = getLocalDateString(new Date(m.createdAt));
      if (doneDates.has(mDate)) {
        habitDaysTotal += score;
        habitDaysCount++;
      } else {
        noHabitDaysTotal += score;
        noHabitDaysCount++;
      }
    });

    const hasBoth = habitDaysCount > 0 && noHabitDaysCount > 0;

    return {
      hasBoth,
      habitDaysCount,
      noHabitDaysCount,
      avgDone: habitDaysCount > 0 ? Number((habitDaysTotal / habitDaysCount).toFixed(1)) : null,
      avgMissed: noHabitDaysCount > 0 ? Number((noHabitDaysTotal / noHabitDaysCount).toFixed(1)) : null,
    };
  }, [logs, moodLogs]);

  // 2. Best day of week & Most consistent habit (Real data only)
  const consistencyStats = useMemo(() => {
    const doneLogs = logs.filter(l => l.status === 'done');
    if (doneLogs.length === 0) {
      return {
        bestDay: "—",
        mostConsistent: "—",
        hasData: false
      };
    }

    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    const habitCounts: Record<string, number> = {};

    doneLogs.forEach((l) => {
      const [y, m, d] = l.log_date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      dayCounts[date.getDay()]++;
      habitCounts[l.habit_id] = (habitCounts[l.habit_id] || 0) + 1;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDayIdx = -1;
    let maxDayCount = 0;
    dayCounts.forEach((cnt, idx) => {
      if (cnt > maxDayCount) {
        maxDayCount = cnt;
        bestDayIdx = idx;
      }
    });

    let bestHabitId: string | null = null;
    let maxHabitCount = 0;
    Object.entries(habitCounts).forEach(([hId, cnt]) => {
      if (cnt > maxHabitCount) {
        maxHabitCount = cnt;
        bestHabitId = hId;
      }
    });

    const bestHabit = habits.find(h => h.id === bestHabitId);

    return {
      bestDay: bestDayIdx >= 0 ? `${dayNames[bestDayIdx]} (${maxDayCount})` : "—",
      mostConsistent: bestHabit ? `${bestHabit.name} (${maxHabitCount})` : "—",
      hasData: true
    };
  }, [habits, logs]);

  // 3. 12-Week Heatmap (Real check-ins)
  const heatmapWeeks = useMemo(() => {
    const weeks: { dateStr: string; count: number }[][] = [];
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + (6 - now.getDay()));

    const countMap: Record<string, number> = {};
    logs.filter(l => l.status === 'done').forEach((l) => {
      countMap[l.log_date] = (countMap[l.log_date] || 0) + 1;
    });

    for (let w = 11; w >= 0; w--) {
      const week: { dateStr: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(end);
        checkDate.setDate(end.getDate() - (w * 7 + (6 - d)));
        const dStr = getLocalDateString(checkDate);
        week.push({ dateStr: dStr, count: countMap[dStr] || 0 });
      }
      weeks.push(week);
    }
    return weeks;
  }, [logs]);

  return (
    <div className="bg-white border-2 border-dashed border-ink/40 p-5 space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand fill-brand" />
          <h3 className="font-heading text-lg uppercase tracking-tight text-ink">
            Rebuild Insights
          </h3>
        </div>
        {!isPro && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-ink text-bg px-2 py-0.5 border border-ink">
            PRO
          </span>
        )}
      </div>

      <div className={cn("space-y-5 transition-all", !isPro && "blur-xs select-none pointer-events-none")}>
        {/* Mood vs Habits Correlation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-ink/70">
            <span>Average Mood Comparison</span>
            <span className="text-ink/40">Scale 1–5</span>
          </div>

          {moodCorrelation.hasBoth && moodCorrelation.avgDone !== null && moodCorrelation.avgMissed !== null ? (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-ink w-24 shrink-0">Habits Done</span>
                  <div className="flex-1 bg-ink/5 border border-ink/20 h-5 relative overflow-hidden flex items-center">
                    <div 
                      className="bg-[#3FA9D6] h-full border-r border-ink transition-all"
                      style={{ width: `${(moodCorrelation.avgDone / 5) * 100}%` }}
                    />
                    <span className="font-mono text-[10px] font-bold text-ink ml-2 absolute right-2">
                      {moodCorrelation.avgDone} / 5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-ink/60 w-24 shrink-0">Habits Missed</span>
                  <div className="flex-1 bg-ink/5 border border-ink/20 h-5 relative overflow-hidden flex items-center">
                    <div 
                      className="bg-ink/20 h-full border-r border-ink/40 transition-all"
                      style={{ width: `${(moodCorrelation.avgMissed / 5) * 100}%` }}
                    />
                    <span className="font-mono text-[10px] font-bold text-ink/60 ml-2 absolute right-2">
                      {moodCorrelation.avgMissed} / 5
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-sans text-[11px] text-ink/60">
                {moodCorrelation.avgDone > moodCorrelation.avgMissed
                  ? `Your average mood is ${(moodCorrelation.avgDone - moodCorrelation.avgMissed).toFixed(1)} points higher on days you finish your habits.`
                  : "Tracking emotional stability across days with and without habits."}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-bg border border-ink/15 text-center space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase text-ink/50 block">
                Awaiting Data
              </span>
              <p className="font-sans text-xs text-ink/70 leading-relaxed">
                {moodCorrelation.habitDaysCount === 0 && moodCorrelation.noHabitDaysCount === 0
                  ? "Log your daily habits and mood to calculate real impact."
                  : "Need at least one day with habits completed and one day without to calculate correlation."}
              </p>
            </div>
          )}
        </div>

        {/* Consistency Stats */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-ink/10">
          <div className="bg-bg border border-ink/15 p-2.5">
            <span className="font-mono text-[9px] uppercase font-bold text-ink/50 block">Best Day of Week</span>
            <span className="font-heading text-sm font-bold uppercase text-ink mt-0.5 block truncate">
              {consistencyStats.bestDay}
            </span>
          </div>
          <div className="bg-bg border border-ink/15 p-2.5">
            <span className="font-mono text-[9px] uppercase font-bold text-ink/50 block">Most Consistent</span>
            <span className="font-heading text-sm font-bold uppercase text-ink mt-0.5 block truncate">
              {consistencyStats.mostConsistent}
            </span>
          </div>
        </div>

        {/* 12-Week Heatmap */}
        <div className="space-y-2 pt-1 border-t border-ink/10">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase text-ink/70">
            <span>12-Week Activity Heatmap</span>
            <span className="text-ink/40">{totalDoneLogs} total check-ins</span>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                  const intensity = Math.min(day.count, 4);
                  return (
                    <div
                      key={dIdx}
                      className={cn(
                        "w-2.5 h-2.5 border border-ink/20",
                        intensity === 0 && "bg-ink/5",
                        intensity === 1 && "bg-[#3FA9D6]/40",
                        intensity === 2 && "bg-[#3FA9D6]/70",
                        intensity >= 3 && "bg-[#3FA9D6] border-ink"
                      )}
                      title={`${day.dateStr}: ${day.count} check-ins`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Free Tier Blur Lock Overlay */}
      {!isPro && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
          <div className="w-10 h-10 bg-ink text-bg flex items-center justify-center border-2 border-ink shadow-xs">
            <Lock className="w-5 h-5 text-brand" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading text-lg uppercase tracking-tight text-ink font-bold">
              Unlock Rebuild Insights
            </h4>
            <p className="font-sans text-xs text-ink/70 max-w-xs leading-relaxed">
              Track how completing your habits directly shifts your emotional recovery, identify peak days, and view your 12-week heatmap.
            </p>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-brand border-2 border-ink font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-opacity"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}
