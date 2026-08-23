"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, CalendarClock, Store, Lock, Activity, Link2, Brain, MessageCircle } from "lucide-react";
import { useSparks } from "@/lib/useSparks";
import { cn } from "@/lib/utils";

export default function PlayHub() {
  const { balance, isLoading } = useSparks();

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8">
      
      {/* Sparks Balance Card */}
      <div className="border-2 border-ink bg-accent text-bg p-6 flex items-center justify-between shadow-[4px_4px_0px_0px] shadow-ink/20">
        <div>
          <h2 className="font-heading text-xl uppercase tracking-wider">Your Sparks</h2>
          <p className="font-voice text-sm italic opacity-80 mt-1">Earn sparks by building healthy habits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          <span className="font-mono text-4xl font-bold">{isLoading ? "..." : balance}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h3 className="font-heading text-lg uppercase tracking-wider text-ink">Daily Rituals</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/play/then-vs-now" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <CalendarClock className="w-8 h-8 text-brand mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">Then vs. Now</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Guess the mood of a past diary entry. Fast, daily reflection.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn 10
              </div>
            </div>
          </Link>
          
          <Link href="/play/detective" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <Link2 className="w-8 h-8 text-brand mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">Pattern Detective</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Connect the dots on your logged red flags.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn up to 50
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h3 className="font-heading text-lg uppercase tracking-wider text-ink">Insight Puzzles</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/play/word-cloud" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <Brain className="w-8 h-8 text-blue mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">Word Cloud</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Wordle-style daily puzzle built from your diary vocab.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn 10-15
              </div>
            </div>
          </Link>

          <Link href="/play/bingo" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <MessageCircle className="w-8 h-8 text-brand mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">Excuse Bingo</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Test your pattern recognition on their voice profile.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn 10
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2">
          <h3 className="font-heading text-lg uppercase tracking-wider text-ink">Harm Reduction</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/play/vault" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <Lock className="w-8 h-8 text-brand mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">The Vault</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Write a message to your future self. Healing takes time.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn 15
              </div>
            </div>
          </Link>

          <Link href="/play/interceptor" className="block group">
            <div className="h-full border-2 border-ink bg-bg p-5 hover:bg-ink/5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all duration-200">
              <Activity className="w-8 h-8 text-red-500 mb-4" />
              <h4 className="font-heading text-base uppercase text-ink">Urge Interceptor</h4>
              <p className="font-sans text-xs text-ink/70 mt-2">Feeling the urge to break no-contact? Come here first.</p>
              <div className="mt-4 flex items-center gap-1 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Earn 20
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <Link href="/play/store" className="block group">
          <div className="w-full border-2 border-ink bg-blue text-white p-4 flex items-center justify-between hover:bg-blue/90 hover:shadow-[4px_4px_0px_0px] hover:shadow-ink/20 transition-all">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6" />
              <span className="font-heading text-sm uppercase tracking-wider">Sparks Store</span>
            </div>
            <span className="font-mono text-xs font-bold uppercase underline underline-offset-4">Spend Sparks →</span>
          </div>
        </Link>
      </div>

    </div>
  );
}
