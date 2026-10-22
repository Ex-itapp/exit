"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase';
import { usePro } from './usePro';

export type HabitCategory = 'body' | 'mind' | 'social' | 'routine' | 'craft';
export type FrequencyType = 'daily' | 'weekly';
export type HabitStatus = 'active' | 'paused' | 'archived';

export interface Habit {
  id: string;
  user_id?: string;
  name: string;
  category: HabitCategory;
  frequency_type: FrequencyType;
  weekly_target?: number; // 1-7
  reminder_time?: string | null;
  why_note?: string;
  status: HabitStatus;
  sort_order: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id?: string;
  log_date: string; // YYYY-MM-DD (local date)
  status: 'done' | 'skipped';
  note?: string;
  created_at: string;
}

export interface HabitSuggestion {
  name: string;
  category: HabitCategory;
  frequency_type: FrequencyType;
  weekly_target?: number;
  why_note: string;
  phase: 'SURVIVE' | 'STABILISE' | 'REBUILD' | 'GROW';
}

export const CATEGORY_CONFIG: Record<HabitCategory, { label: string; color: string; border: string; bg: string }> = {
  body:    { label: 'BODY',    color: '#059669', border: '#10B981', bg: 'bg-[#A8E6CF]' },
  mind:    { label: 'MIND',    color: '#7C3AED', border: '#8B5CF6', bg: 'bg-[#D8B4F8]' },
  social:  { label: 'SOCIAL',  color: '#D97706', border: '#F59E0B', bg: 'bg-[#FFF3B0]' },
  routine: { label: 'ROUTINE', color: '#4B5563', border: '#6B7280', bg: 'bg-[#B8C0D0]' },
  craft:   { label: 'CRAFT',   color: '#DC2626', border: '#EF4444', bg: 'bg-[#FFD1BA]' },
};

export const PHASE_SUGGESTIONS: HabitSuggestion[] = [
  // 0-7 Days (SURVIVE)
  {
    name: 'Drink 2L water',
    category: 'body',
    frequency_type: 'daily',
    why_note: 'Physical hydration keeps your nervous system stable through the shock.',
    phase: 'SURVIVE'
  },
  {
    name: '10-min outdoor walk',
    category: 'body',
    frequency_type: 'daily',
    why_note: 'Change of environment breaks the rumination spiral.',
    phase: 'SURVIVE'
  },
  {
    name: 'Sleep by 11 PM',
    category: 'routine',
    frequency_type: 'daily',
    why_note: 'Sleep deprivation amplifies emotional pain and triggers late-night relapses.',
    phase: 'SURVIVE'
  },
  {
    name: 'Shower and dress up',
    category: 'routine',
    frequency_type: 'daily',
    why_note: 'Resetting your physical state signals dignity to your brain.',
    phase: 'SURVIVE'
  },

  // 8-30 Days (STABILISE)
  {
    name: '20-min workout',
    category: 'body',
    frequency_type: 'daily',
    why_note: 'Natural dopamine release to replace relationship withdrawal.',
    phase: 'STABILISE'
  },
  {
    name: 'Zero doomscrolling before bed',
    category: 'mind',
    frequency_type: 'daily',
    why_note: 'Protecting your mind from triggers and stalking habits.',
    phase: 'STABILISE'
  },
  {
    name: 'Healthy breakfast',
    category: 'routine',
    frequency_type: 'daily',
    why_note: 'Blood sugar stability prevents anxiety spikes.',
    phase: 'STABILISE'
  },
  {
    name: 'Message a trusted friend',
    category: 'social',
    frequency_type: 'daily',
    why_note: 'Re-anchoring into your support network instead of isolation.',
    phase: 'STABILISE'
  },

  // 31-90 Days (REBUILD)
  {
    name: 'Learn a new skill',
    category: 'mind',
    frequency_type: 'weekly',
    weekly_target: 4,
    why_note: 'Building cognitive bandwidth and intellectual independence.',
    phase: 'REBUILD'
  },
  {
    name: 'Strength training routine',
    category: 'body',
    frequency_type: 'weekly',
    weekly_target: 4,
    why_note: 'Feeling physically strong restores personal sovereignty.',
    phase: 'REBUILD'
  },
  {
    name: 'Try a solo hobby',
    category: 'craft',
    frequency_type: 'weekly',
    weekly_target: 3,
    why_note: 'Enjoying your own company is the antidote to codependency.',
    phase: 'REBUILD'
  },
  {
    name: 'Weekend social plans',
    category: 'social',
    frequency_type: 'weekly',
    weekly_target: 2,
    why_note: 'Filling your calendar with people who choose you.',
    phase: 'REBUILD'
  },

  // 90+ Days (GROW)
  {
    name: 'Reading 20 pages',
    category: 'mind',
    frequency_type: 'daily',
    why_note: 'Expanding perspective and mental depth beyond the past.',
    phase: 'GROW'
  },
  {
    name: 'Creative passion project',
    category: 'craft',
    frequency_type: 'weekly',
    weekly_target: 3,
    why_note: 'Directing emotional energy into something you create.',
    phase: 'GROW'
  },
  {
    name: 'Career sprint block',
    category: 'craft',
    frequency_type: 'daily',
    why_note: 'Reclaiming your ambition and professional trajectory.',
    phase: 'GROW'
  },
  {
    name: 'Travel planning / exploring',
    category: 'social',
    frequency_type: 'weekly',
    weekly_target: 2,
    why_note: 'Creating new memories in places with no ghost of them.',
    phase: 'GROW'
  }
];

export function getNoContactPhase(streakDays: number): 'SURVIVE' | 'STABILISE' | 'REBUILD' | 'GROW' {
  if (streakDays <= 7) return 'SURVIVE';
  if (streakDays <= 30) return 'STABILISE';
  if (streakDays <= 90) return 'REBUILD';
  return 'GROW';
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HABITS_STORAGE_KEY = 'unsent_rebuild_habits';
const LOGS_STORAGE_KEY = 'unsent_rebuild_logs';

export function useHabits() {
  const { isPro } = usePro();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeHabitsLimit = isPro ? 5 : 2;

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const savedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
      if (savedHabits) setHabits(JSON.parse(savedHabits));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.warn('Failed to parse local habits', e);
    }
    setIsLoaded(true);

    // 2. Cloud Sync if session available
    async function syncCloud() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: cloudHabits, error: habitErr } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', session.user.id)
          .order('sort_order', { ascending: true });

        if (!habitErr && cloudHabits) {
          setHabits(cloudHabits);
          localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(cloudHabits));
        }

        const { data: cloudLogs, error: logErr } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', session.user.id);

        if (!logErr && cloudLogs) {
          setLogs(cloudLogs);
          localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(cloudLogs));
        }
      } catch (err) {
        // Quietly fallback to local storage
      }
    }

    syncCloud();
  }, []);

  // Save changes locally
  const saveLocalHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    if (typeof window !== 'undefined') {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(newHabits));
    }
  };

  const saveLocalLogs = (newLogs: HabitLog[]) => {
    setLogs(newLogs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(newLogs));
    }
  };

  // Active, Paused, Archived views
  const activeHabits = useMemo(() => habits.filter(h => h.status === 'active'), [habits]);
  const pausedHabits = useMemo(() => habits.filter(h => h.status === 'paused'), [habits]);
  const archivedHabits = useMemo(() => habits.filter(h => h.status === 'archived'), [habits]);

  // Today string
  const todayStr = useMemo(() => getLocalDateString(), []);

  // Check if habit is completed on a date
  const isHabitDoneOnDate = useCallback((habitId: string, dateStr: string): boolean => {
    return logs.some(l => l.habit_id === habitId && l.log_date === dateStr && l.status === 'done');
  }, [logs]);

  // Check if habit is skipped on a date
  const isHabitSkippedOnDate = useCallback((habitId: string, dateStr: string): boolean => {
    return logs.some(l => l.habit_id === habitId && l.log_date === dateStr && l.status === 'skipped');
  }, [logs]);

  // Get note for a habit on a date
  const getHabitNoteOnDate = useCallback((habitId: string, dateStr: string): string | undefined => {
    const found = logs.find(l => l.habit_id === habitId && l.log_date === dateStr);
    return found?.note;
  }, [logs]);

  // Number of active habits done today
  const doneTodayCount = useMemo(() => {
    return activeHabits.filter(h => isHabitDoneOnDate(h.id, todayStr)).length;
  }, [activeHabits, isHabitDoneOnDate, todayStr]);

  // Calculate Streak & Best Streak for a habit with Grace-Day logic
  const getHabitStreakStats = useCallback((habit: Habit) => {
    const habitLogs = logs.filter(l => l.habit_id === habit.id);
    const logDateSet = new Set(habitLogs.filter(l => l.status === 'done').map(l => l.log_date));
    const skipDateSet = new Set(habitLogs.filter(l => l.status === 'skipped').map(l => l.log_date));

    if (habit.frequency_type === 'weekly') {
      // Weekly habit streak logic
      // Target: habit.weekly_target (defaults to 3 if omitted)
      const target = habit.weekly_target || 3;
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      // Check current and past 12 weeks
      const now = new Date();
      // Go week by week back in time
      for (let w = 0; w < 52; w++) {
        let weeklyChecks = 0;
        for (let d = 0; d < 7; d++) {
          const checkDate = new Date();
          checkDate.setDate(now.getDate() - (w * 7 + d));
          const dateStr = getLocalDateString(checkDate);
          if (logDateSet.has(dateStr)) weeklyChecks++;
        }

        if (weeklyChecks >= target) {
          tempStreak++;
          if (w === 0 || currentStreak === w) {
            currentStreak = tempStreak;
          }
          if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
          // If current week is in progress, don't break current streak yet
          if (w === 0) continue;
          tempStreak = 0;
        }
      }

      return {
        currentStreak,
        bestStreak: Math.max(bestStreak, currentStreak),
        totalCheckins: logDateSet.size
      };
    }

    // Daily Habit Streak with Grace Day:
    // Rule: consecutive days backwards from today (or yesterday).
    // In any rolling 7-day window, at most 1 missed/skipped day does not break the streak.
    const today = new Date();
    const todayFormatted = getLocalDateString(today);

    // If today is done, start count from today; if not done yet today, evaluate from yesterday
    let startDate = new Date();
    if (!logDateSet.has(todayFormatted)) {
      startDate.setDate(startDate.getDate() - 1);
    }

    let streak = 0;
    let graceDaysUsedInWindow = 0;
    let dayIndex = 0;

    // Scan backwards up to 365 days
    while (dayIndex < 365) {
      const d = new Date(startDate);
      d.setDate(d.getDate() - dayIndex);
      const dStr = getLocalDateString(d);

      // Check creation date: don't count before habit was created
      const habitCreatedStr = habit.created_at ? getLocalDateString(new Date(habit.created_at)) : '2020-01-01';
      if (dStr < habitCreatedStr) {
        break;
      }

      const isDone = logDateSet.has(dStr);
      const isExplicitSkip = skipDateSet.has(dStr);

      if (isDone) {
        streak++;
      } else if (isExplicitSkip || graceDaysUsedInWindow === 0) {
        // Use grace day
        graceDaysUsedInWindow++;
        streak++; // Grace day preserves streak continuity
      } else {
        // More than 1 missed day in rolling window -> streak breaks
        break;
      }

      // Reset rolling grace window every 7 days
      if (dayIndex % 7 === 6) {
        graceDaysUsedInWindow = 0;
      }

      dayIndex++;
    }

    // Best streak calculation across all time
    const sortedDates = Array.from(logDateSet).sort();
    let best = streak;
    let runningBest = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i > 0) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 2) {
          // Within grace distance
          runningBest++;
        } else {
          runningBest = 1;
        }
      } else {
        runningBest = 1;
      }
      if (runningBest > best) best = runningBest;
    }

    return {
      currentStreak: streak,
      bestStreak: Math.max(best, streak),
      totalCheckins: logDateSet.size
    };
  }, [logs]);

  // Toggle habit check-in for a date
  const toggleHabit = async (habitId: string, dateStr: string = todayStr, note?: string) => {
    const existingIndex = logs.findIndex(l => l.habit_id === habitId && l.log_date === dateStr);
    let updatedLogs: HabitLog[];

    if (existingIndex >= 0) {
      const existing = logs[existingIndex];
      if (existing.status === 'done') {
        // Remove log (untoggle)
        updatedLogs = logs.filter((_, idx) => idx !== existingIndex);
      } else {
        // Switch skipped to done
        updatedLogs = [...logs];
        updatedLogs[existingIndex] = { ...existing, status: 'done', note: note || existing.note };
      }
    } else {
      // Add new done log
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habit_id: habitId,
        log_date: dateStr,
        status: 'done',
        note,
        created_at: new Date().toISOString()
      };
      updatedLogs = [newLog, ...logs];
    }

    saveLocalLogs(updatedLogs);

    // Sync with Supabase asynchronously
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (existingIndex >= 0 && logs[existingIndex].status === 'done') {
        await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habitId)
          .eq('log_date', dateStr)
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('habit_logs')
          .upsert({
            habit_id: habitId,
            user_id: session.user.id,
            log_date: dateStr,
            status: 'done',
            note: note || ''
          }, { onConflict: 'habit_id,log_date' });
      }
    } catch {
      // Offline fallback already preserved in localStorage
    }
  };

  // Add a new habit
  const addHabit = async (params: {
    name: string;
    category: HabitCategory;
    frequency_type?: FrequencyType;
    weekly_target?: number;
    reminder_time?: string | null;
    why_note?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (activeHabits.length >= activeHabitsLimit) {
      return {
        success: false,
        error: isPro 
          ? 'Maximum limit of 5 active habits reached.' 
          : 'Free plan includes up to 2 active habits. Upgrade to Pro for 5 habits.'
      };
    }

    const trimmedName = params.name.trim();
    if (!trimmedName) return { success: false, error: 'Habit name is required.' };
    if (trimmedName.length > 40) return { success: false, error: 'Name must be 40 characters or less.' };

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: trimmedName,
      category: params.category,
      frequency_type: params.frequency_type || 'daily',
      weekly_target: params.weekly_target,
      reminder_time: params.reminder_time,
      why_note: params.why_note?.trim() || '',
      status: 'active',
      sort_order: activeHabits.length,
      created_at: new Date().toISOString()
    };

    const nextHabits = [...habits, newHabit];
    saveLocalHabits(nextHabits);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('habits').insert({
          ...newHabit,
          user_id: session.user.id
        });
      }
    } catch {}

    return { success: true };
  };

  // Update existing habit
  const updateHabit = async (habitId: string, updates: Partial<Omit<Habit, 'id' | 'created_at'>>) => {
    const nextHabits = habits.map(h => h.id === habitId ? { ...h, ...updates } : h);
    saveLocalHabits(nextHabits);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('habits').update(updates).eq('id', habitId).eq('user_id', session.user.id);
      }
    } catch {}
  };

  // Pause / Resume habit
  const togglePauseHabit = async (habitId: string) => {
    const target = habits.find(h => h.id === habitId);
    if (!target) return;

    if (target.status === 'paused') {
      if (activeHabits.length >= activeHabitsLimit) {
        return {
          success: false,
          error: isPro 
            ? 'Maximum limit of 5 active habits reached.' 
            : 'Upgrade to Pro to have up to 5 active habits.'
        };
      }
      await updateHabit(habitId, { status: 'active' });
    } else if (target.status === 'active') {
      await updateHabit(habitId, { status: 'paused' });
    }
    return { success: true };
  };

  // Archive habit (keeps history, hides from main list)
  const archiveHabit = async (habitId: string) => {
    await updateHabit(habitId, { status: 'archived' });
  };

  // Check 7-day strip status: returns 'done' | 'missed' | 'grace' | 'none'
  const getDayStripStatus = useCallback((habitId: string, dateStr: string): 'done' | 'missed' | 'grace' | 'none' => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 'none';

    // If date is before habit creation, return 'none'
    const createdStr = habit.created_at ? getLocalDateString(new Date(habit.created_at)) : '2020-01-01';
    if (dateStr < createdStr) return 'none';

    if (isHabitDoneOnDate(habitId, dateStr)) return 'done';
    if (isHabitSkippedOnDate(habitId, dateStr)) return 'grace';

    // If today and not yet done, show none/empty
    if (dateStr === todayStr) return 'none';

    return 'missed';
  }, [habits, isHabitDoneOnDate, isHabitSkippedOnDate, todayStr]);

  return {
    isLoaded,
    habits,
    logs,
    activeHabits,
    pausedHabits,
    archivedHabits,
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
  };
}
