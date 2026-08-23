"use client";

import React, { useState, useEffect } from "react";
import { useClosure } from "@/lib/useClosure";
import { useSparks } from "@/lib/useSparks";
import { Sparkles, MessageCircle, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FAKE_QUOTES = [
  "I'm just too busy with work right now.",
  "You're making a big deal out of nothing.",
  "I don't know what you want me to say.",
  "I never said that, you're remembering it wrong.",
  "Can we talk about this later?",
  "I'm sorry you feel that way.",
  "I'm just tired, okay?",
  "Why do you always have to start a fight?"
];

export default function ExcuseBingo() {
  const { profile } = useClosure();
  const { earnSparks } = useSparks();
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState("");
  
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [earned, setEarned] = useState(false);

  useEffect(() => {
    if (profile && profile.voice_profile && profile.voice_profile.top_verbatim_example_lines) {
      const lines = profile.voice_profile.top_verbatim_example_lines;
      
      if (lines.length > 0) {
        // Pick one real quote
        const realQuote = lines[Math.floor(Math.random() * lines.length)];
        
        // Pick 3 fake quotes
        const availableFakes = FAKE_QUOTES.filter(q => q !== realQuote);
        const shuffledFakes = availableFakes.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const finalOptions = [realQuote, ...shuffledFakes].sort(() => 0.5 - Math.random());
        
        setQuestion("Which of these is a verbatim phrase they actually used?");
        setCorrectOption(realQuote);
        setOptions(finalOptions);
      }
    }
  }, [profile]);

  const handleGuess = async (opt: string) => {
    if (hasGuessed) return;
    
    setSelectedOption(opt);
    setHasGuessed(true);
    
    if (opt === correctOption) {
      const success = await earnSparks('then_vs_now', 10); // Using a generic tag for now, or word_cloud etc
      if (success) {
        setEarned(true);
      }
    }
  };

  if (!profile || !profile.voice_profile || !profile.voice_profile.top_verbatim_example_lines || profile.voice_profile.top_verbatim_example_lines.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-12 h-12 text-ink/40 mb-4" />
        <h2 className="font-heading text-xl uppercase text-ink">No Voice Profile</h2>
        <p className="font-voice text-ink/60 italic max-w-md mx-auto mt-2">
          Excuse Bingo requires an active Ex Simulator voice profile. The AI needs to learn their patterns first.
        </p>
        <Link href="/talk" className="mt-6 border-2 border-ink px-6 py-2 font-mono text-xs uppercase hover:bg-ink/5">
          Train Simulator
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <MessageCircle className="w-10 h-10 text-brand mx-auto mb-2" />
        <h2 className="font-heading text-2xl uppercase tracking-wider text-ink">Excuse Bingo</h2>
        <p className="font-sans text-sm text-ink/70">Test your pattern recognition.</p>
      </div>

      <div className="border-2 border-ink bg-bg p-6 sm:p-8 shadow-[4px_4px_0px_0px] shadow-ink/20">
        <h3 className="font-heading text-xl uppercase text-center">{question}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === correctOption;
          
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
              key={i}
              onClick={() => handleGuess(opt)}
              disabled={hasGuessed}
              className={cn(
                "border-2 border-ink p-4 flex items-center justify-between font-voice italic text-lg transition-all text-left",
                stateClasses
              )}
            >
              "{opt}"
              {hasGuessed && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 ml-4" />}
              {hasGuessed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-4" />}
            </button>
          );
        })}
      </div>

      {hasGuessed && (
        <div className="flex flex-col items-center justify-center p-6 bg-ink/5 border-2 border-ink space-y-4 animate-in fade-in slide-in-from-bottom-4">
          {selectedOption === correctOption ? (
            <>
              <h3 className="font-heading text-xl uppercase text-accent">Spot On.</h3>
              <p className="font-sans text-sm text-center text-ink/70">
                You know their patterns perfectly. Recognizing the script takes its power away.
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
              <h3 className="font-heading text-xl uppercase text-ink">Nope.</h3>
              <p className="font-sans text-sm text-center text-ink/70">
                The actual quote was: <strong>"{correctOption}"</strong>.
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
