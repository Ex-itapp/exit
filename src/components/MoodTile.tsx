"use client";

import { useState } from "react";
import { useMoods } from "@/lib/useMoods";
import { cn } from "@/lib/utils";

const MOODS = [
  { emoji: "😭", label: "Rough" },
  { emoji: "😔", label: "Low" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "🤩", label: "Great" },
];

export function MoodTile() {
  const { logMood, getMoodForDate } = useMoods();
  
  const todayMood = getMoodForDate(new Date());
  
  const [selectedMood, setSelectedMood] = useState(todayMood?.emoji || "");
  const [note, setNote] = useState(todayMood?.note || "");
  const [editing, setEditing] = useState(false);
  
  const handleLogMood = () => {
    if (!selectedMood) return;
    logMood(selectedMood, note);
    setEditing(false);
  };

  const showForm = !todayMood || editing;

  return (
    <div 
      className="relative w-full aspect-square max-w-[280px] mx-auto group"
    >
      {/* Shadow */}
      <div className="absolute inset-0 bg-ink rounded-xl translate-x-2 translate-y-2 transition-transform" />
      
      <div className="relative w-full h-full bg-blue/20 border-4 border-ink rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-blue py-1.5 sm:py-2 text-center font-heading text-lg sm:text-xl md:text-2xl uppercase tracking-widest border-b-4 border-ink flex items-center justify-center gap-1.5 sm:gap-2">
          {todayMood && !editing ? todayMood.emoji : "☀️"} MOOD
        </div>
        
        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 relative bg-white">
          {showForm ? (
            /* Emoji picker form */
            <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
              <div className="flex gap-2 sm:gap-3">
                {MOODS.map(m => (
                  <button
                    key={m.emoji}
                    onClick={() => setSelectedMood(m.emoji)}
                    className={cn(
                      "text-2xl sm:text-3xl transition-all duration-150",
                      selectedMood === m.emoji 
                        ? "scale-125 drop-shadow-lg" 
                        : "opacity-40 grayscale hover:opacity-70 hover:grayscale-0 hover:scale-110"
                    )}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              
              {selectedMood && (
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase text-ink/50">
                  {MOODS.find(m => m.emoji === selectedMood)?.label}
                </span>
              )}
              
              <input
                placeholder="How are you feeling?"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border-3 border-ink bg-bg font-sans text-xs sm:text-sm focus:outline-none focus:bg-brand/10 transition-colors text-center"
              />
              
              <button
                onClick={handleLogMood}
                disabled={!selectedMood}
                className="px-4 sm:px-6 py-1.5 sm:py-2 border-3 border-ink bg-blue text-ink font-mono text-[10px] sm:text-xs font-bold uppercase disabled:opacity-30 hover:bg-blue/80 transition-colors brutalist-shadow-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Log Mood
              </button>
            </div>
          ) : (
            /* Logged state */
            <div className="flex flex-col items-center justify-center h-full gap-1 sm:gap-2 cursor-pointer" onClick={() => setEditing(true)}>
              <span className="text-5xl sm:text-7xl drop-shadow-md">{todayMood?.emoji}</span>
              <span className="font-mono text-[10px] sm:text-sm font-bold uppercase mt-1 opacity-80 text-center">
                {MOODS.find(m => m.emoji === todayMood?.emoji)?.label || "Logged"}
              </span>
              {todayMood?.note && (
                <span className="font-sans text-[10px] sm:text-xs text-ink/60 italic text-center leading-tight max-w-[90%]">
                  &ldquo;{todayMood.note}&rdquo;
                </span>
              )}
              <div className="mt-1 sm:mt-2 px-2.5 sm:px-4 py-1 sm:py-1.5 border-3 border-ink bg-bg rounded-full flex items-center justify-center -rotate-2 group-hover:scale-110 transition-transform">
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase whitespace-nowrap text-ink">
                  TAP TO UPDATE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
