"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Plus, 
  Flame, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  ArrowLeft 
} from "lucide-react";
import { motion } from "motion/react";
import { 
  useHabits, 
  CATEGORY_CONFIG, 
  getLocalDateString 
} from "@/lib/useHabits";
import type { Habit, HabitCategory } from "@/lib/useHabits";
import { HabitModal } from "@/components/rebuild/HabitModal";
import { HabitDetailModal } from "@/components/rebuild/HabitDetailModal";
import { InsightsCard } from "@/components/rebuild/InsightsCard";
import { RebuildWeeklyFocus } from "@/components/rebuild/RebuildWeeklyFocus";
import { cn } from "@/lib/utils";

export default function RebuildPage() {
  const router = useRouter();
  const {
    habits,
    logs,
    activeHabits,
    pausedHabits,
    activeHabitsLimit,
    doneTodayCount,
    todayStr,
    isHabitDoneOnDate,
    isHabitSkippedOnDate,
    getHabitNoteOnDate,
    getHabitStreakStats,
    getDayStripStatus,
    toggleHabit,
    addHabit,
    updateHabit,
    togglePauseHabit,
    archiveHabit
  } = useHabits();

  // Modals state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [showPaused, setShowPaused] = useState(false);

  // Today formatted header string (e.g. "THU, OCT 22")
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  }, []);

  // Last 7 days dates list (6 days ago -> today)
  const last7Days = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      list.push(getLocalDateString(d));
    }
    return list;
  }, []);

  // Handle Checkbox Toggle with haptic and debounce
  const handleToggle = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(10); } catch {}
    }
    toggleHabit(habitId, todayStr);
  };

  // Starter habits for empty state
  const starterHabits = [
    { name: "Drink 2L water", category: "body" as HabitCategory },
    { name: "10-min outdoor walk", category: "body" as HabitCategory },
    { name: "No doomscrolling before bed", category: "mind" as HabitCategory },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-2 pb-24 space-y-5">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-2.5 h-8 sm:h-9 bg-white border-2 border-ink shadow-xs hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase shrink-0 cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="font-heading text-2xl sm:text-4xl uppercase tracking-tighter text-ink leading-none">
              REBUILD
            </h1>
            <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-ink/50 mt-1 block">
              {todayFormatted} · DAILY ANCHORS
            </span>
          </div>
        </div>
      </div>

      {/* 2. Today Progress Card */}
      <div className="bg-white border-2 border-ink p-5 space-y-3 shadow-xs">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 block">
              HABITS DONE TODAY
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading text-5xl tracking-tight font-black text-ink">
                {doneTodayCount}
              </span>
              <span className="font-heading text-2xl tracking-tight text-ink/40 font-bold">
                / {activeHabits.length}
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold uppercase text-ink/60 bg-bg px-2.5 py-1 border border-ink/15">
            {activeHabits.length === 0 
              ? "0 Active" 
              : doneTodayCount === activeHabits.length 
              ? "All Clear ✦" 
              : `${activeHabits.length - doneTodayCount} remaining`}
          </span>
        </div>

        {/* Segmented Progress Bar */}
        {activeHabits.length > 0 && (
          <div className="grid gap-1.5 pt-1" style={{ gridTemplateColumns: `repeat(${activeHabits.length}, minmax(0, 1fr))` }}>
            {activeHabits.map((h) => {
              const isDone = isHabitDoneOnDate(h.id, todayStr);
              return (
                <div 
                  key={h.id}
                  className={cn(
                    "h-2.5 border border-ink transition-all duration-200",
                    isDone ? "bg-[#3FA9D6]" : "bg-ink/5"
                  )}
                  title={`${h.name}: ${isDone ? 'Completed' : 'Pending'}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Habit List or Empty State */}
      {activeHabits.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-2 border-ink p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-positive/30 border-2 border-ink mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-ink" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-heading text-xl uppercase tracking-tight text-ink font-bold">
              Your ex took up space in your day.
            </h3>
            <p className="font-sans text-xs text-ink/70 leading-relaxed">
              What goes there now? Start small. 2 to 3 calm habits rebuild your nervous system faster than overhauling your life overnight.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            {starterHabits.map((starter) => (
              <button
                key={starter.name}
                onClick={() => addHabit(starter)}
                className="px-3 py-2 bg-bg hover:bg-brand/20 border-2 border-ink font-mono text-xs font-bold uppercase text-left sm:text-center transition-colors flex items-center justify-between sm:justify-center gap-2"
              >
                <span>+ {starter.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Active Habit Rows */
        <div className="space-y-2.5">
          {activeHabits.map((habit) => {
            const isDone = isHabitDoneOnDate(habit.id, todayStr);
            const stats = getHabitStreakStats(habit);

            return (
              <div
                key={habit.id}
                onClick={() => setDetailHabit(habit)}
                className="bg-white border-2 border-ink p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-ink/80 transition-all cursor-pointer group shadow-xs"
              >
                {/* Big Square Checkbox (44px touch target) */}
                <button
                  type="button"
                  onClick={(e) => handleToggle(e, habit.id)}
                  aria-label={`Mark ${habit.name} as ${isDone ? 'not done' : 'done'}`}
                  className="w-11 h-11 shrink-0 flex items-center justify-center focus:outline-none"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    animate={{ scale: isDone ? [1.15, 1.0] : 1.0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 border-2 border-ink flex items-center justify-center transition-all",
                      isDone 
                        ? "bg-[#3FA9D6] text-white shadow-xs" 
                        : "bg-white hover:bg-bg"
                    )}
                  >
                    {isDone && <Check className="w-5 h-5 stroke-[3]" />}
                  </motion.div>
                </button>

                {/* Middle: Habit Name + Streak */}
                <div className="flex-1 min-w-0 pr-1">
                  <h4 className={cn(
                    "font-sans text-sm sm:text-base font-bold text-ink truncate leading-tight group-hover:text-brand-dark transition-colors",
                    isDone && "text-ink/80"
                  )}>
                    {habit.name}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-ink/60 mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-ink">
                      <Flame className="w-3 h-3 text-accent fill-accent shrink-0" />
                      {stats.currentStreak} {habit.frequency_type === 'weekly' ? 'wk' : 'd'} streak
                    </span>
                    <span className="text-ink/30">·</span>
                    <span>best {stats.bestStreak}</span>
                  </div>
                </div>

                {/* Right: 7-Square Strip (last 7 days) */}
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  {last7Days.map((dateStr, idx) => {
                    const status = getDayStripStatus(habit.id, dateStr);
                    const isTodaySquare = idx === 6;

                    return (
                      <div
                        key={dateStr}
                        className={cn(
                          "w-3.5 h-3.5 sm:w-4 sm:h-4 border transition-colors",
                          status === 'done' && "bg-[#3FA9D6] border-ink",
                          status === 'grace' && "bg-[repeating-linear-gradient(45deg,#3FA9D6,#3FA9D6_1.5px,#fff_1.5px,#fff_3px)] border-ink",
                          status === 'missed' && "bg-white border-ink/30",
                          status === 'none' && "bg-bg border-ink/20",
                          isTodaySquare && "ring-1 ring-ink/30"
                        )}
                        title={`${dateStr}: ${status}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Dashed Card: + ADD HABIT */}
      <div>
        {activeHabits.length >= 5 ? (
          <div className="p-4 bg-white/40 border-2 border-dashed border-ink/20 text-center font-mono text-xs font-bold uppercase tracking-wider text-ink/40 select-none">
            5/5 ACTIVE (MAX LIMIT REACHED)
          </div>
        ) : (
          <button
            onClick={() => {
              setSelectedHabit(null);
              setModalMode('create');
            }}
            className="w-full p-4 bg-white hover:bg-brand/10 border-2 border-dashed border-ink/40 text-ink font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors group"
          >
            <Plus className="w-4 h-4 text-ink group-hover:rotate-90 transition-transform" />
            + Add Habit ({activeHabits.length}/{activeHabitsLimit})
          </button>
        )}
      </div>

      {/* 5. Dashed Card: THIS WEEK'S FOCUS (dismissible) */}
      <RebuildWeeklyFocus activeHabits={activeHabits} />

      {/* 6. Insights Card (Pro / Blurred preview) */}
      <InsightsCard habits={habits} logs={logs} />

      {/* 7. Collapsible: Paused Habits */}
      {pausedHabits.length > 0 && (
        <div className="pt-2 border-t-2 border-ink/10 space-y-2">
          <button
            onClick={() => setShowPaused(!showPaused)}
            className="flex items-center justify-between w-full font-mono text-xs font-bold uppercase tracking-wider text-ink/60 hover:text-ink transition-colors py-1"
          >
            <span>PAUSED HABITS ({pausedHabits.length})</span>
            {showPaused ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPaused && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              {pausedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white/60 border-2 border-ink/20 p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] font-bold uppercase text-ink/40">
                      {CATEGORY_CONFIG[habit.category].label} · PAUSED
                    </span>
                    <h5 className="font-sans text-sm font-bold text-ink/70 truncate">
                      {habit.name}
                    </h5>
                  </div>
                  <button
                    onClick={() => togglePauseHabit(habit.id)}
                    className="px-3 py-1.5 bg-white border border-ink font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-positive hover:border-ink transition-colors"
                  >
                    <Play className="w-3 h-3" /> Resume
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add / Edit Habit Modal */}
      {modalMode && (
        <HabitModal
          habit={selectedHabit}
          onClose={() => {
            setModalMode(null);
            setSelectedHabit(null);
          }}
          onSave={async (data) => {
            if (modalMode === 'edit' && selectedHabit) {
              await updateHabit(selectedHabit.id, data);
              return { success: true };
            } else {
              return await addHabit(data);
            }
          }}
        />
      )}

      {/* 2. Habit Detail Sheet Modal */}
      {detailHabit && (
        <HabitDetailModal
          habit={detailHabit}
          onClose={() => setDetailHabit(null)}
          onEdit={() => {
            const h = detailHabit;
            setDetailHabit(null);
            setSelectedHabit(h);
            setModalMode('edit');
          }}
          onTogglePause={async () => {
            await togglePauseHabit(detailHabit.id);
            setDetailHabit(null);
          }}
          onArchive={async () => {
            await archiveHabit(detailHabit.id);
            setDetailHabit(null);
          }}
          isDoneOnDate={isHabitDoneOnDate}
          isSkippedOnDate={isHabitSkippedOnDate}
          getNoteOnDate={getHabitNoteOnDate}
          onSaveNote={(habitId, dateStr, note) => {
            toggleHabit(habitId, dateStr, note);
          }}
          streakStats={getHabitStreakStats(detailHabit)}
        />
      )}

    </div>
  );
}
