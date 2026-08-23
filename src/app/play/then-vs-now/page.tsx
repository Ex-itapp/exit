"use client";

import React, { useState, useEffect } from "react";
import { useDiary, DiaryEntry } from "@/lib/useDiary";
import { useSparks } from "@/lib/useSparks";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// A fallback list of moods in case the user hasn't logged many different ones
const FALLBACK_MOODS = ["Happy", "Sad", "Anxious", "Angry", "Nostalgic", "Relieved", "Numb", "Hopeful"];

export default function ThenVsNow() {
  const { allEntries } = useDiary();
  const { earnSparks } = useSparks();
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctMood, setCorrectMood] = useState<string>("");
  
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [earned, setEarned] = useState(false);

  useEffect(() => {
    // 1. Filter to entries that have at least one mood
    const entriesWithMoods = allEntries.filter(e => e.moods && e.moods.length > 0);
    
    if (entriesWithMoods.length > 0) {
      // Pick a random entry
      const randomEntry = entriesWithMoods[Math.floor(Math.random() * entriesWithMoods.length)];
      setEntry(randomEntry);
      
      // The target mood to guess
      const target = randomEntry.moods[0];
      setCorrectMood(target);
      
      // Generate 3 wrong options
      // First, get all unique moods the user has ever logged
      const allUserMoods = Array.from(new Set(entriesWithMoods.flatMap(e => e.moods)));
      const availableWrong = [...allUserMoods, ...FALLBACK_MOODS].filter(m => m !== target);
      
      const shuffledWrong = availableWrong.sort(() => 0.5 - Math.random());
      const selectedWrong = shuffledWrong.slice(0, 3);
      
      // Combine and shuffle
      const finalOptions = [target, ...selectedWrong].sort(() => 0.5 - Math.random());
      setOptions(finalOptions);
    }
  }, [allEntries]);

  const handleGuess = async (mood: string) => {
    if (hasGuessed) return;
    
    setSelectedMood(mood);
    setHasGuessed(true);
    
    if (mood === correctMood) {
      const success = await earnSparks('then_vs_now', 10);
      if (success) {
        setEarned(true);
      }
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Earlier today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  if (!entry && allEntries.length > 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="font-voice text-ink/60 italic">You don't have any diary entries with moods logged yet.</p>
        <Link href="/diary" className="mt-4 border-2 border-ink px-4 py-2 font-mono text-xs uppercase hover:bg-ink/5">
          Go log an entry
        </Link>
      </div>
    );
  }

  if (!entry) return null; // loading

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl uppercase tracking-wider text-ink">Then vs. Now</h2>
        <p className="font-sans text-sm text-ink/60">Read your past entry. How were you feeling when you wrote this?</p>
      </div>

      <div className="border-2 border-ink bg-bg p-6 sm:p-8 shadow-[4px_4px_0px_0px] shadow-ink/20 relative">
        <div className="absolute top-0 right-0 bg-ink text-bg font-mono text-[10px] font-bold uppercase px-3 py-1">
          {timeAgo(entry.createdAt)}
        </div>
        
        <p className="font-voice text-lg leading-relaxed text-ink mt-4">
          "{entry.content}"
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((mood) => {
          const isSelected = selectedMood === mood;
          const isCorrect = mood === correctMood;
          
          let stateClasses = "bg-bg hover:bg-ink/5";
          
          if (hasGuessed) {
            if (isCorrect) {
              stateClasses = "bg-green-500/20 border-green-600 text-green-900 dark:text-green-400";
            } else if (isSelected && !isCorrect) {
              stateClasses = "bg-red-500/20 border-red-600 text-red-900 dark:text-red-400";
            } else {
              stateClasses = "opacity-50";
            }
          }

          return (
            <button
              key={mood}
              onClick={() => handleGuess(mood)}
              disabled={hasGuessed}
              className={cn(
                "border-2 border-ink p-4 flex items-center justify-between font-heading text-lg transition-all",
                stateClasses
              )}
            >
              {mood}
              {hasGuessed && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {hasGuessed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
            </button>
          );
        })}
      </div>

      {hasGuessed && (
        <div className="flex flex-col items-center justify-center p-6 bg-ink/5 border-2 border-ink space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {selectedMood === correctMood ? (
            <>
              <h3 className="font-heading text-xl uppercase text-accent">Nailed it.</h3>
              <p className="font-sans text-sm text-center text-ink/70">
                You correctly identified your past emotional state. Recognizing your own patterns is the core of healing.
              </p>
              {earned && (
                <div className="flex items-center gap-2 bg-accent text-bg px-4 py-2 font-mono text-sm font-bold uppercase shadow-[2px_2px_0px_0px] shadow-ink/20">
                  <Sparkles className="w-4 h-4" />
                  +10 Sparks Earned
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="font-heading text-xl uppercase text-ink">Not quite.</h3>
              <p className="font-sans text-sm text-center text-ink/70">
                You actually tagged this entry as <strong>{correctMood}</strong>. It's wild how our memory of a feeling changes over time, isn't it?
              </p>
            </>
          )}
          
          <Link 
            href="/play"
            className="mt-4 border-2 border-ink bg-bg px-6 py-3 font-mono text-xs font-bold uppercase hover:bg-ink/5 transition-colors"
          >
            Back to Hub
          </Link>
        </div>
      )}
    </div>
  );
}
