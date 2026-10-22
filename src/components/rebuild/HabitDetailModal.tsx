"use client";

import { useState, useMemo } from "react";
import { 
  X, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Pause, 
  Play, 
  Archive, 
  Save 
} from "lucide-react";
import { 
  CATEGORY_CONFIG, 
  getLocalDateString 
} from "@/lib/useHabits";
import type { Habit } from "@/lib/useHabits";
import { cn } from "@/lib/utils";

interface HabitDetailModalProps {
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onTogglePause: () => void;
  onArchive: () => void;
  isDoneOnDate: (habitId: string, dateStr: string) => boolean;
  isSkippedOnDate: (habitId: string, dateStr: string) => boolean;
  getNoteOnDate: (habitId: string, dateStr: string) => string | undefined;
  onSaveNote: (habitId: string, dateStr: string, note: string) => void;
  streakStats: {
    currentStreak: number;
    bestStreak: number;
    totalCheckins: number;
  };
}

export function HabitDetailModal({
  habit,
  onClose,
  onEdit,
  onTogglePause,
  onArchive,
  isDoneOnDate,
  isSkippedOnDate,
  getNoteOnDate,
  onSaveNote,
  streakStats
}: HabitDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [editingNote, setEditingNote] = useState<string>("");
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const categoryConf = CATEGORY_CONFIG[habit.category];

  // 30 days grid (from 29 days ago to today)
  const past30Days = useMemo(() => {
    const list: { date: Date; dateStr: string; status: 'done' | 'missed' | 'grace' | 'future' }[] = [];
    const today = new Date();
    const habitCreatedStr = habit.created_at ? getLocalDateString(new Date(habit.created_at)) : '2020-01-01';

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = getLocalDateString(d);

      let status: 'done' | 'missed' | 'grace' | 'future' = 'missed';
      if (dStr < habitCreatedStr) {
        status = 'future'; // before creation
      } else if (isDoneOnDate(habit.id, dStr)) {
        status = 'done';
      } else if (isSkippedOnDate(habit.id, dStr)) {
        status = 'grace';
      } else if (dStr === getLocalDateString()) {
        status = 'missed';
      }

      list.push({ date: d, dateStr: dStr, status });
    }
    return list;
  }, [habit, isDoneOnDate, isSkippedOnDate]);

  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = getNoteOnDate(habit.id, dateStr) || "";
    setEditingNote(existing);
    setShowNoteEditor(true);
  };

  const handleSaveNote = () => {
    onSaveNote(habit.id, selectedDate, editingNote.trim());
    setShowNoteEditor(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-bg border-t-2 sm:border-2 border-ink max-w-lg w-full max-h-[92vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-ink/15 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border border-ink bg-white">
                {categoryConf.label}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink/50">
                {habit.frequency_type === 'weekly' ? `${habit.weekly_target || 3}x Weekly` : 'Daily'}
              </span>
              {habit.status === 'paused' && (
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-ink text-bg px-1.5 py-0.5">
                  PAUSED
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl uppercase tracking-tight text-ink">
              {habit.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border-2 border-ink/20 flex items-center justify-center hover:bg-ink hover:text-bg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border-2 border-ink p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-ink/50 font-mono text-[9px] uppercase font-bold">
              <Flame className="w-3 h-3 text-accent" /> Streak
            </div>
            <div className="font-heading text-2xl tracking-tight text-ink mt-0.5 font-bold">
              {streakStats.currentStreak}
            </div>
            <span className="font-mono text-[8px] text-ink/40 uppercase">
              {habit.frequency_type === 'weekly' ? 'weeks' : 'days'}
            </span>
          </div>

          <div className="bg-white border-2 border-ink p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-ink/50 font-mono text-[9px] uppercase font-bold">
              <Trophy className="w-3 h-3 text-brand" /> Best
            </div>
            <div className="font-heading text-2xl tracking-tight text-ink mt-0.5 font-bold">
              {streakStats.bestStreak}
            </div>
            <span className="font-mono text-[8px] text-ink/40 uppercase">
              record
            </span>
          </div>

          <div className="bg-white border-2 border-ink p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-ink/50 font-mono text-[9px] uppercase font-bold">
              <CheckCircle2 className="w-3 h-3 text-[#3FA9D6]" /> Total
            </div>
            <div className="font-heading text-2xl tracking-tight text-ink mt-0.5 font-bold">
              {streakStats.totalCheckins}
            </div>
            <span className="font-mono text-[8px] text-ink/40 uppercase">
              check-ins
            </span>
          </div>
        </div>

        {/* 30-Day Grid */}
        <div className="bg-white border-2 border-ink p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-ink">
              <Calendar className="w-3.5 h-3.5 text-ink/60" />
              Last 30 Days
            </div>
            <div className="flex items-center gap-3 font-mono text-[9px] text-ink/50">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#3FA9D6] border border-ink inline-block" /> Done
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-ink/40 inline-block bg-white" /> Missed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 border border-ink inline-block bg-[repeating-linear-gradient(45deg,#3FA9D6,#3FA9D6_2px,#fff_2px,#fff_4px)]" /> Grace
              </span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1.5 pt-1">
            {past30Days.map(({ date, dateStr, status }, idx) => {
              const hasNote = Boolean(getNoteOnDate(habit.id, dateStr));
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dateStr)}
                  title={`${dateStr}: ${status}${hasNote ? ' (Note logged)' : ''}`}
                  className={cn(
                    "aspect-square border flex items-center justify-center transition-all relative",
                    status === 'done' && "bg-[#3FA9D6] border-ink text-white",
                    status === 'grace' && "bg-[repeating-linear-gradient(45deg,#3FA9D6,#3FA9D6_2px,#fff_2px,#fff_4px)] border-ink",
                    status === 'missed' && "bg-white border-ink/30 hover:border-ink",
                    status === 'future' && "bg-ink/5 border-transparent opacity-30 pointer-events-none",
                    isSelected && "ring-2 ring-ink ring-offset-1"
                  )}
                >
                  <span className="font-mono text-[9px] font-bold">
                    {date.getDate()}
                  </span>
                  {hasNote && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full border border-ink" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[9px] text-ink/40 pt-1">
            Tap any day to view or record a reflection note.
          </p>
        </div>

        {/* Note Editor */}
        {showNoteEditor && (
          <div className="p-3.5 bg-brand/10 border-2 border-ink space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-ink">
                Note for {selectedDate}
              </span>
              <button
                type="button"
                onClick={() => setShowNoteEditor(false)}
                className="text-ink/50 hover:text-ink text-xs font-mono"
              >
                Close
              </button>
            </div>
            <textarea
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              placeholder="How did this habit feel today? What was easy or tough?"
              rows={2}
              className="w-full bg-white border border-ink p-2.5 font-sans text-xs outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-3 py-1.5 bg-ink text-bg font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Save className="w-3 h-3" /> Save Note
            </button>
          </div>
        )}

        {/* Why this matters card */}
        {habit.why_note && (
          <div className="p-4 bg-white border-2 border-dashed border-ink/30 space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40 block">
              Why this matters to you
            </span>
            <p className="font-sans text-xs text-ink/80 leading-relaxed italic">
              "{habit.why_note}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t-2 border-ink/15 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="h-11 bg-white border-2 border-ink font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black/5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          
          <button
            type="button"
            onClick={onTogglePause}
            className="h-11 bg-white border-2 border-ink font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-black/5 transition-colors"
          >
            {habit.status === 'paused' ? (
              <>
                <Play className="w-3.5 h-3.5 text-positive" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onArchive}
            className="h-11 bg-white border-2 border-danger/60 text-danger font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-danger/10 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
        </div>

      </div>
    </div>
  );
}
