"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDiary } from './useDiary';
import { useFlags } from './useFlags';
import { useCheckins } from './useCheckins';
import { useUser } from './useUser';
import { useHabits } from './useHabits';
import { supabase } from './supabase';

export interface RealityCheckData {
  id: string;
  generatedAt: string;
  weekNumber: number;
  dateRange: string;
  page1_overview: {
    headline: string;
    stat_highlight: string;
    subtext: string;
  };
  page2_diary: {
    headline: string;
    coping_comparison: string;
    mood_breakdown: Array<{ mood: string; count: number }>;
    standout_line: string;
  };
  page3_redflags: {
    headline: string;
    top_pattern: string;
    pattern_counts: Array<{ category: string; count: number }>;
    insight_line: string;
  };
  page4_rebuild?: {
    headline: string;
    completion_comparison: string;
    strongest_habit: string;
    weakest_habit: string;
    next_week_suggestion: string;
  };
}

const STORAGE_KEY = 'unsent_reality_check_cache';
const HISTORY_KEY = 'unsent_reality_check_history';
const MIN_REQUIRED_LOGS = 3;
const COOLDOWN_DAYS = 7;

export function useRealityCheck() {
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();
  const { streakDays } = useUser();
  const { activeHabits, logs, getHabitStreakStats } = useHabits();

  const [currentReport, setCurrentReport] = useState<RealityCheckData | null>(null);
  const [history, setHistory] = useState<RealityCheckData[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cached reports from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setCurrentReport(JSON.parse(cached));
      }

      const hist = localStorage.getItem(HISTORY_KEY);
      if (hist) {
        setHistory(JSON.parse(hist));
      }
    } catch (e) {
      console.error('Failed to load cached Reality Check:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Filter logs for the current 7-day period vs previous 7-day period
  const now = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), [now]);
  const fourteenDaysAgo = useMemo(() => new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), [now]);

  const recentDiary = useMemo(() => {
    return entries.filter(e => new Date(e.createdAt) >= sevenDaysAgo);
  }, [entries, sevenDaysAgo]);

  const previousDiary = useMemo(() => {
    return entries.filter(e => {
      const d = new Date(e.createdAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });
  }, [entries, fourteenDaysAgo, sevenDaysAgo]);

  const recentFlags = useMemo(() => {
    return flags.filter(f => new Date(f.createdAt) >= sevenDaysAgo);
  }, [flags, sevenDaysAgo]);

  const recentCheckins = useMemo(() => {
    return checkins.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
  }, [checkins, sevenDaysAgo]);

  // Total logs available in the recent period
  const totalRecentLogs = recentDiary.length + recentFlags.length + recentCheckins.length;
  // If overall user activity has >= 3 logs total, allow generation if recent is slightly low
  const totalAllTimeLogs = entries.length + flags.length + checkins.length;
  const eligibleLogCount = Math.max(totalRecentLogs, totalAllTimeLogs);

  const hasEnoughData = eligibleLogCount >= MIN_REQUIRED_LOGS;

  // Calculate cooldown
  const lastGeneratedDate = currentReport ? new Date(currentReport.generatedAt) : null;
  const daysSinceLast = lastGeneratedDate 
    ? (now.getTime() - lastGeneratedDate.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;

  const isCooldownActive = daysSinceLast < COOLDOWN_DAYS;
  const daysUntilNext = isCooldownActive ? Math.ceil(COOLDOWN_DAYS - daysSinceLast) : 0;

  const canGenerate = hasEnoughData && !isCooldownActive;

  // Week number calculation
  const calculatedWeek = useMemo(() => {
    if (history.length > 0) return history.length + (canGenerate ? 1 : 0);
    return Math.max(1, Math.ceil((streakDays || 1) / 7));
  }, [history.length, canGenerate, streakDays]);

  const generateReport = useCallback(async () => {
    if (!hasEnoughData) {
      setError(`You need at least ${MIN_REQUIRED_LOGS} logs to generate an accurate Reality Check.`);
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Scanning unfiltered diary entries...');

    try {
      // Step simulation for brutalist feel
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Analyzing recurring red flags and behavioral patterns...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Removing the rose-tinted glasses...');
      }, 2400);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Prepare payload
      const diaryToAnalyze = recentDiary.length >= 2 ? recentDiary : entries.slice(0, 5);
      const flagsToAnalyze = recentFlags.length >= 1 ? recentFlags : flags.slice(0, 5);

      const res = await fetch('/api/pattern-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          diary_entries_current: diaryToAnalyze.map(e => ({
            content: e.content,
            moods: e.moods,
            createdAt: e.createdAt,
            isUnsent: e.isUnsent
          })),
          diary_entries_comparison: previousDiary.map(e => ({
            content: e.content,
            moods: e.moods
          })),
          red_flags_current: flagsToAnalyze.map(f => ({
            category: f.category,
            content: f.content,
            createdAt: f.createdAt
          })),
          habits_current: activeHabits.map(h => ({
            name: h.name,
            category: h.category,
            frequency: h.frequency_type,
            stats: getHabitStreakStats(h)
          }))
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const reportPayload = await res.json();

      const startDateStr = sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const newReport: RealityCheckData = {
        id: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
        weekNumber: calculatedWeek,
        dateRange: `${startDateStr} – ${endDateStr}`,
        page1_overview: reportPayload.page1_overview || {
          headline: "Clarity over fantasy.",
          stat_highlight: `${streakDays} Days Clear`,
          subtext: "Your entries show a steady shift from obsession to recovery."
        },
        page2_diary: reportPayload.page2_diary || {
          headline: "The emotional ground is shifting.",
          coping_comparison: "Less spiraling, more honest venting.",
          mood_breakdown: [{ mood: "reflective", count: diaryToAnalyze.length }],
          standout_line: "Reclaiming my peace day by day."
        },
        page3_redflags: reportPayload.page3_redflags || {
          headline: "Patterns you stopped excusing.",
          top_pattern: flagsToAnalyze[0]?.category || "Inconsistency",
          pattern_counts: [{ category: flagsToAnalyze[0]?.category || "Inconsistency", count: flagsToAnalyze.length }],
          insight_line: "When someone shows you who they are, believe them the first time."
        }
      };

      // Save to state and localStorage
      setCurrentReport(newReport);
      const updatedHistory = [newReport, ...history.filter(h => h.id !== newReport.id)];
      setHistory(updatedHistory);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReport));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

      return newReport;
    } catch (err: any) {
      console.error('Error generating Reality Check:', err);
      setError(err.message || 'Failed to generate Reality Check. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  }, [hasEnoughData, recentDiary, entries, previousDiary, recentFlags, flags, calculatedWeek, streakDays, sevenDaysAgo, history]);

  return {
    currentReport,
    history,
    isLoaded,
    hasEnoughData,
    eligibleLogCount,
    minRequiredLogs: MIN_REQUIRED_LOGS,
    canGenerate,
    isCooldownActive,
    daysUntilNext,
    calculatedWeek,
    isGenerating,
    generationStep,
    error,
    generateReport
  };
}
