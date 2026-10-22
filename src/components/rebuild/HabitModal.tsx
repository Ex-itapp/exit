"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  Check 
} from "lucide-react";
import { 
  CATEGORY_CONFIG, 
  PHASE_SUGGESTIONS, 
  getNoContactPhase,
} from "@/lib/useHabits";
import type { 
  Habit, 
  HabitCategory, 
  FrequencyType, 
  HabitSuggestion 
} from "@/lib/useHabits";
import { useUser } from "@/lib/useUser";
import { cn } from "@/lib/utils";

interface HabitModalProps {
  habit?: Habit | null; // null for new habit, existing for edit
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: HabitCategory;
    frequency_type: FrequencyType;
    weekly_target?: number;
    reminder_time?: string | null;
    why_note?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES: HabitCategory[] = ['body', 'mind', 'social', 'routine', 'craft'];

export function HabitModal({ habit, onClose, onSave }: HabitModalProps) {
  const { streakDays } = useUser();
  const currentPhase = getNoContactPhase(streakDays);

  const [name, setName] = useState(habit?.name || "");
  const [category, setCategory] = useState<HabitCategory>(habit?.category || "body");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(habit?.frequency_type || "daily");
  const [weeklyTarget, setWeeklyTarget] = useState<number>(habit?.weekly_target || 3);
  const [reminderTime, setReminderTime] = useState(habit?.reminder_time || "");
  const [whyNote, setWhyNote] = useState(habit?.why_note || "");
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | 'SURVIVE' | 'STABILISE' | 'REBUILD' | 'GROW'>(currentPhase);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered suggestions
  const filteredSuggestions = PHASE_SUGGESTIONS.filter(
    s => selectedPhase === 'ALL' || s.phase === selectedPhase
  );

  const handleApplySuggestion = (s: HabitSuggestion) => {
    setName(s.name);
    setCategory(s.category);
    setFrequencyType(s.frequency_type);
    if (s.weekly_target) setWeeklyTarget(s.weekly_target);
    if (s.why_note) setWhyNote(s.why_note);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a habit name.");
      return;
    }
    setErrorMsg(null);
    setIsSaving(true);

    const res = await onSave({
      name: name.trim().slice(0, 40),
      category,
      frequency_type: frequencyType,
      weekly_target: frequencyType === 'weekly' ? weeklyTarget : undefined,
      reminder_time: reminderTime || null,
      why_note: whyNote.trim() || undefined,
    });

    setIsSaving(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || "Failed to save habit.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-bg border-t-2 sm:border-2 border-ink max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-ink/15 pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-ink/50 block">
              {habit ? "Edit Habit" : "New Rebuild Habit"}
            </span>
            <h2 className="font-heading text-2xl uppercase tracking-tight text-ink mt-0.5">
              {habit ? "Update Habit" : "Add to Your Day"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border-2 border-ink/20 flex items-center justify-center hover:bg-ink hover:text-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-danger/10 border-2 border-danger text-danger font-mono text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Suggestion Chips (only on creation) */}
        {!habit && (
          <div className="space-y-2.5 bg-white border-2 border-dashed border-ink/20 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand fill-brand" />
                Suggestions For Your Phase ({currentPhase})
              </span>
              <div className="flex gap-1 text-[9px] font-mono">
                {(['SURVIVE', 'STABILISE', 'REBUILD', 'GROW'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPhase(p)}
                    className={cn(
                      "px-1.5 py-0.5 border border-ink/20 font-bold",
                      selectedPhase === p ? "bg-ink text-bg" : "bg-bg text-ink/60 hover:text-ink"
                    )}
                  >
                    {p[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.slice(0, 4).map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleApplySuggestion(s)}
                  className="px-2.5 py-1 text-xs font-sans font-medium bg-bg hover:bg-brand/20 border border-ink/20 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>{s.name}</span>
                  <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Habit Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                Habit Name
              </label>
              <span className={cn("font-mono text-[10px]", name.length > 35 ? "text-danger" : "text-ink/40")}>
                {name.length}/40
              </span>
            </div>
            <input
              type="text"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 20-min morning walk"
              className="w-full bg-white border-2 border-ink p-3 font-sans text-sm font-bold text-ink outline-none placeholder:text-ink/30 focus:border-brand"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink block">
              Category
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map((cat) => {
                const conf = CATEGORY_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "py-2 px-1 text-center border-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all",
                      isSelected
                        ? "border-ink bg-ink text-bg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "border-ink/20 bg-white text-ink/70 hover:border-ink"
                    )}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency Type */}
          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink block">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFrequencyType("daily")}
                className={cn(
                  "py-2.5 px-3 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all text-center",
                  frequencyType === "daily"
                    ? "border-ink bg-ink text-bg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "border-ink/20 bg-white text-ink/70 hover:border-ink"
                )}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType("weekly")}
                className={cn(
                  "py-2.5 px-3 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all text-center",
                  frequencyType === "weekly"
                    ? "border-ink bg-ink text-bg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "border-ink/20 bg-white text-ink/70 hover:border-ink"
                )}
              >
                Weekly Target
              </button>
            </div>

            {frequencyType === "weekly" && (
              <div className="pt-2 flex items-center gap-2">
                <span className="font-mono text-xs text-ink/70">Days per week:</span>
                <div className="flex gap-1.5">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWeeklyTarget(num)}
                      className={cn(
                        "w-8 h-8 border-2 font-mono text-xs font-bold flex items-center justify-center transition-all",
                        weeklyTarget === num
                          ? "border-ink bg-brand text-ink shadow-xs"
                          : "border-ink/20 bg-white text-ink/60 hover:border-ink"
                      )}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Reminder Time */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-ink/60" />
              Daily Reminder (Optional)
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-white border-2 border-ink p-2.5 font-mono text-sm text-ink outline-none"
            />
          </div>

          {/* Why This Matters */}
          <div className="space-y-1.5">
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-ink/60" />
              Why this matters (Optional)
            </label>
            <textarea
              value={whyNote}
              onChange={(e) => setWhyNote(e.target.value)}
              placeholder="e.g. Clears my head instead of checking their socials."
              rows={2}
              className="w-full bg-white border-2 border-ink p-3 font-sans text-xs text-ink outline-none resize-none placeholder:text-ink/30"
            />
            <span className="font-mono text-[9px] text-ink/40 block">
              Shown during urge interventions when you feel tempted to text your ex.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-white border-2 border-ink font-mono text-xs font-bold uppercase tracking-wider hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 bg-ink text-bg border-2 border-ink font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSaving ? "Saving..." : habit ? "Save Changes" : "Create Habit"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
