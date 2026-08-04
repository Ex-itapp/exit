"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Zap, MessageSquare, Anchor, Sparkles, ShieldAlert, Check, ArrowRight, Send, Flame, Award } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { useFlags } from "@/lib/useFlags";
import { useMoods } from "@/lib/useMoods";
import { AnchorModal } from "@/components/AnchorModal";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

const MOODS = [
  { emoji: "😭", label: "Rough" },
  { emoji: "😔", label: "Low" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "🤩", label: "Great" },
];

export default function DashboardPage() {
  const navigate = useRouter();
  const { userName, userAnchor, streakDays, hasCompletedOnboarding, isProfileSyncing } = useUser();
  const { loading: authLoading } = useAuth();
  const { checkins, addCheckin } = useCheckins();
  const { flags, addFlag } = useFlags();
  const { logMood, getMoodForDate } = useMoods();
  
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);
  const [quickFlagText, setQuickFlagText] = useState("");
  const [quickFlagCategory, setQuickFlagCategory] = useState("Disrespect");
  const [flagDropped, setFlagDropped] = useState(false);
  const [moodNote, setMoodNote] = useState("");
  const [moodJustLogged, setMoodJustLogged] = useState(false);

  const todayMood = getMoodForDate(new Date());
  const todayDate = new Date();
  const dayNum = todayDate.getDate();
  const monthShort = todayDate.toLocaleString('default', { month: 'short' }).toUpperCase();

  // Flag count last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentFlagCount = flags.filter(f => new Date(f.createdAt) >= thirtyDaysAgo).length;

  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && !isProfileSyncing && !hasCompletedOnboarding) {
      const isDone = localStorage.getItem('unsent_onboarding_done_clean');
      if (isDone !== 'true') {
        navigate.push('/onboarding');
      }
    }
  }, [authLoading, isProfileSyncing, hasCompletedOnboarding, navigate]);

  const todayCheckin = checkins.find(c => new Date(c.createdAt).toDateString() === new Date().toDateString());

  const handleCheckin = () => {
    if (!checkinText.trim()) return;
    addCheckin(checkinText);
    setCheckinText("");
    setCheckinDone(true);
  };

  const handleDropQuickFlag = () => {
    if (!quickFlagText.trim()) return;
    addFlag(quickFlagText, quickFlagCategory);
    setQuickFlagText("");
    setFlagDropped(true);
    setTimeout(() => setFlagDropped(false), 4000);
  };

  const handleMoodSelect = (emoji: string) => {
    logMood(emoji, moodNote);
    setMoodJustLogged(true);
    setMoodNote("");
    setTimeout(() => setMoodJustLogged(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24 max-w-[1200px] mx-auto w-full px-2 sm:px-4">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-3 pt-2 w-full">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 bg-brand border border-ink block animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-ink text-bg px-1.5 py-0.5">
              Sanctuary Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-tighter uppercase">
            {userName || "TRAVELER"}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowAnchor(true)}
            className="bg-white hover:bg-ink hover:text-bg text-ink border-3 border-ink brutalist-shadow-sm py-2 px-3 font-mono font-bold uppercase transition-all flex items-center gap-2 max-w-[200px] sm:max-w-[280px]"
          >
            <div className="p-1 bg-brand text-ink border border-ink shrink-0">
              <Anchor className="w-3.5 h-3.5" />
            </div>
            <div className="text-left overflow-hidden hidden sm:block">
              <div className="text-[8px] opacity-60 leading-none">Why you left:</div>
              <div className="truncate text-[11px] font-black tracking-tight">
                {userAnchor || 'I deserve better.'}
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate.push('/rewards')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-ink brutalist-shadow-sm flex items-center justify-center bg-brand hover:bg-brand/80 transition-all group shrink-0"
            title="Achievements & Rewards"
          >
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-ink group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── STATS STRIP — 4 compact stat blocks in a row ── */}
      <div className="grid grid-cols-4 gap-0 border-4 border-ink brutalist-shadow overflow-hidden">
        {/* Streak */}
        <div 
          onClick={() => navigate.push('/streak')}
          className="bg-brand p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-brand/80 transition-colors border-r-3 border-ink"
        >
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-ink mb-1" />
          <span className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-ink">
            {streakDays}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-0.5 text-ink/70">
            Streak
          </span>
        </div>

        {/* Today */}
        <div 
          onClick={() => navigate.push('/timeline')}
          className="bg-white p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-bg transition-colors border-r-3 border-ink"
        >
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase text-ink/50">{monthShort}</span>
          <span className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-ink">
            {dayNum}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-0.5 text-ink/70">
            Today
          </span>
        </div>

        {/* Flags */}
        <div 
          onClick={() => navigate.push('/flags')}
          className="bg-purple/15 p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple/25 transition-colors border-r-3 border-ink"
        >
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-purple mb-1" />
          <span className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-tighter leading-none text-ink">
            {recentFlagCount}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-0.5 text-ink/70">
            Flags
          </span>
        </div>

        {/* Mood */}
        <div className="bg-white p-3 sm:p-4 flex flex-col items-center justify-center">
          {todayMood ? (
            <>
              <span className="text-xl sm:text-2xl md:text-3xl leading-none">{todayMood.emoji}</span>
              <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/70">
                {MOODS.find(m => m.emoji === todayMood.emoji)?.label || "Mood"}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl sm:text-2xl opacity-30">☁️</span>
              <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/40">
                No Mood
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── MOOD PICKER — slim bar ── */}
      <div className="border-4 border-ink bg-white overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3">
          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/40 shrink-0 hidden sm:block">Vibe:</span>
          <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
            {MOODS.map(m => {
              const isActive = todayMood?.emoji === m.emoji;
              return (
                <button
                  key={m.emoji}
                  onClick={() => handleMoodSelect(m.emoji)}
                  className={cn(
                    "flex-1 py-1.5 sm:py-2 text-center border-2 border-ink transition-all text-base sm:text-lg",
                    isActive
                      ? "bg-brand shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] -translate-y-0.5 scale-105"
                      : todayMood
                        ? "bg-bg/50 opacity-30 grayscale hover:opacity-60 hover:grayscale-0"
                        : "bg-bg hover:bg-brand/20 hover:-translate-y-0.5"
                  )}
                >
                  {m.emoji}
                </button>
              );
            })}
          </div>
          {moodJustLogged && (
            <Check className="w-4 h-4 text-positive shrink-0 animate-in fade-in" />
          )}
        </div>
        <div className="border-t-2 border-ink/10 flex items-center gap-2 px-3 py-1.5 bg-bg/30">
          <input
            placeholder="Add a note..."
            value={moodNote}
            onChange={e => setMoodNote(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && moodNote.trim() && todayMood) {
                handleMoodSelect(todayMood.emoji);
              }
            }}
            className="flex-1 bg-transparent font-sans text-xs focus:outline-none placeholder:text-ink/25 text-ink/70"
          />
          {moodNote.trim() && todayMood && (
            <button
              onClick={() => handleMoodSelect(todayMood.emoji)}
              className="p-1 bg-brand border-2 border-ink hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all"
            >
              <Send className="w-3 h-3 text-ink" />
            </button>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN: CHECK-IN + RED FLAG DROPPER ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Check-in */}
        <div className="border-4 border-ink brutalist-shadow bg-white overflow-hidden flex flex-col">
          <div className="bg-ink text-bg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="font-heading text-sm tracking-tight uppercase">Daily Check-in</span>
            </div>
            {todayCheckin || checkinDone ? (
              <Badge variant="positive" className="border-bg font-mono text-[9px]">Done</Badge>
            ) : (
              <Badge variant="accent" className="animate-pulse border-bg font-mono text-[9px]">Required</Badge>
            )}
          </div>
          <div className="p-4 bg-bg flex-1">
            {todayCheckin || checkinDone ? (
              <div className="space-y-2">
                <p className="font-sans text-sm font-medium text-ink leading-relaxed">
                  &ldquo;{todayCheckin?.content || checkinText}&rdquo;
                </p>
                <p className="font-mono text-[10px] text-ink/50 italic">✨ Recorded in your timeline</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea 
                  placeholder="How is your heart today? What are you feeling?" 
                  className="min-h-[90px] resize-none border-3 border-ink bg-white font-sans text-sm p-3"
                  value={checkinText}
                  onChange={(e) => setCheckinText(e.target.value)}
                />
                <Button 
                  className="w-full h-10 text-sm bg-brand hover:bg-brand/90 text-ink border-3 border-ink brutalist-shadow-sm hover:-translate-y-0.5 transition-all font-bold uppercase" 
                  onClick={handleCheckin} 
                  disabled={!checkinText.trim()}
                >
                  Log Check-in
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Red Flag Dropper */}
        <div className="border-4 border-ink brutalist-shadow bg-white overflow-hidden flex flex-col">
          <div className="bg-ink text-bg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple" />
              <span className="font-heading text-sm tracking-tight uppercase">Quick Flag Drop</span>
            </div>
            <span className="font-mono text-[9px] bg-purple text-ink px-1.5 py-0.5 font-bold uppercase">
              Zero Friction
            </span>
          </div>
          <div className="p-4 bg-bg flex-1 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {["Disrespect", "Manipulation", "Inconsistency", "Boundary Crossing"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQuickFlagCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 font-mono text-[10px] font-bold border-2 border-ink transition-all uppercase",
                    quickFlagCategory === cat 
                      ? "bg-purple text-ink brutalist-shadow-sm -translate-y-0.5" 
                      : "bg-white text-ink/50 hover:text-ink"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="What did they do..."
                value={quickFlagText}
                onChange={(e) => setQuickFlagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleDropQuickFlag();
                  }
                }}
                className="h-10 border-3 border-ink font-sans text-xs flex-1 bg-white px-3"
              />
              <Button
                onClick={handleDropQuickFlag}
                disabled={!quickFlagText.trim()}
                className="h-10 px-4 bg-ink text-bg hover:bg-ink/90 border-3 border-ink font-mono font-bold uppercase shrink-0 text-xs"
              >
                Drop 🚩
              </Button>
            </div>
            {flagDropped && (
              <div className="p-2 bg-positive/20 border-2 border-positive text-ink font-mono text-[10px] font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-3 h-3 text-positive shrink-0" />
                <span>Red flag logged!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SANCTUARY CARDS — compact horizontal ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => navigate.push('/closure')}
          className="border-4 border-ink brutalist-shadow bg-white hover:bg-brand/10 transition-all cursor-pointer p-4 sm:p-5 flex items-center gap-4 group overflow-hidden"
        >
          <div className="p-2.5 bg-brand border-3 border-ink brutalist-shadow-sm group-hover:scale-110 transition-transform shrink-0">
            <MessageSquare className="w-5 h-5 text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading text-lg sm:text-xl tracking-tight uppercase group-hover:text-brand transition-colors">
              Talk to them
            </h4>
            <p className="font-sans text-[11px] sm:text-xs text-ink/60 leading-snug mt-0.5 line-clamp-1">
              Say the things left unsaid. Find closure privately.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-brand shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>

        <div 
          onClick={() => navigate.push('/therapist')}
          className="border-4 border-ink brutalist-shadow bg-white hover:bg-purple/10 transition-all cursor-pointer p-4 sm:p-5 flex items-center gap-4 group overflow-hidden"
        >
          <div className="p-2.5 bg-purple border-3 border-ink brutalist-shadow-sm group-hover:scale-110 transition-transform shrink-0">
            <Zap className="w-5 h-5 text-ink" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading text-lg sm:text-xl tracking-tight uppercase group-hover:text-purple transition-colors">
              Healing Companion
            </h4>
            <p className="font-sans text-[11px] sm:text-xs text-ink/60 leading-snug mt-0.5 line-clamp-1">
              A warm listener, available 24/7 when the urge hits.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-purple shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">
          📌 Diary, Red Flags, Timeline, Streak, Rewards & Account via the bottom nav bar.
        </p>
      </div>

      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </div>
  );
}
