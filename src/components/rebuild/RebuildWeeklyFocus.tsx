"use client";

import { useState, useEffect } from "react";
import { Compass, X } from "lucide-react";
import type { Habit, HabitCategory } from "@/lib/useHabits";

interface RebuildWeeklyFocusProps {
  activeHabits: Habit[];
}

const CATEGORY_PROMPTS: Record<HabitCategory, string> = {
  routine: "This week: protect your sleep routine. Your nervous system is recalibrating.",
  body: "This week: move your body before you check your phone. Clear physical energy early.",
  mind: "This week: practice cognitive grounding. When your thoughts loop, step outside.",
  social: "This week: lean into community. Don't carry heartbreak in total isolation.",
  craft: "This week: build something with your hands. Reclaim your focus and agency.",
};

const DEFAULT_PROMPT = "This week: choose one small win each morning. Consistency is quiet victory.";

export function RebuildWeeklyFocus({ activeHabits }: RebuildWeeklyFocusProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive current week key for dismissal caching (e.g. 2026-W43)
  const currentWeekKey = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
  })();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissedWeek = localStorage.getItem("rebuild_focus_dismissed_week");
    if (dismissedWeek === currentWeekKey) {
      setIsDismissed(true);
    }
  }, [currentWeekKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("rebuild_focus_dismissed_week", currentWeekKey);
    }
  };

  if (isDismissed) return null;

  // Pick prompt based on category least represented or first category
  const categoriesPresent = new Set(activeHabits.map(h => h.category));
  const missingCategories = (['routine', 'body', 'mind', 'social', 'craft'] as HabitCategory[]).filter(
    c => !categoriesPresent.has(c)
  );

  const focusCategory = missingCategories[0] || activeHabits[0]?.category;
  const promptText = focusCategory ? CATEGORY_PROMPTS[focusCategory] : DEFAULT_PROMPT;

  return (
    <div className="bg-brand/10 border-2 border-dashed border-ink/40 p-4 relative flex items-start gap-3">
      <div className="p-2 bg-brand border border-ink text-ink shrink-0 mt-0.5">
        <Compass className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-0.5 pr-6">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 block">
          THIS WEEK&apos;S FOCUS
        </span>
        <p className="font-sans text-xs font-medium text-ink leading-relaxed">
          {promptText}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-ink/40 hover:text-ink p-1 transition-colors"
        title="Dismiss for this week"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
