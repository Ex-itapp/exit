"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Zap, MessageSquare, Anchor, Sparkles, ShieldAlert, Check, Send, Flame, Award, Flag } from "lucide-react";
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
  const { flags } = useFlags();
  const { logMood, getMoodForDate } = useMoods();
  
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);
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



  const handleMoodSelect = (emoji: string) => {
    logMood(emoji, moodNote);
    setMoodJustLogged(true);
    setMoodNote("");
    setTimeout(() => setMoodJustLogged(false), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200 pb-28 max-w-3xl mx-auto w-full px-3 sm:px-4">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-3 pt-1 w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-brand border border-ink block" />
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-ink text-bg px-2 py-0.5">
              Sanctuary Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading tracking-tighter uppercase font-black">
            {userName || "TRAVELER"}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAnchor(true)}
            className="bg-white hover:bg-ink hover:text-bg text-ink border-3 border-ink brutalist-shadow-sm py-1.5 px-2.5 font-mono font-bold uppercase transition-all flex items-center gap-2 max-w-[200px] sm:max-w-[260px]"
            title="Your Anchor Reason"
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
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-3 border-ink brutalist-shadow-sm flex items-center justify-center bg-brand hover:bg-brand/80 transition-all group shrink-0"
            title="Achievements & Rewards"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-ink group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="grid grid-cols-4 gap-0 border-3 sm:border-4 border-ink brutalist-shadow bg-white overflow-hidden">
        {/* Streak */}
        <div 
          onClick={() => navigate.push('/streak')}
          className="bg-brand p-2.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-brand/80 transition-colors border-r-3 border-ink"
        >
          <Flame className="w-4 h-4 text-ink mb-0.5" />
          <span className="font-heading text-xl sm:text-3xl tracking-tighter leading-none text-ink">
            {streakDays}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/70">
            Streak
          </span>
        </div>

        {/* Today */}
        <div 
          onClick={() => navigate.push('/timeline')}
          className="bg-white p-2.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-bg transition-colors border-r-3 border-ink"
        >
          <span className="font-mono text-[8px] sm:text-[9px] font-bold uppercase text-ink/50">{monthShort}</span>
          <span className="font-heading text-xl sm:text-3xl tracking-tighter leading-none text-ink">
            {dayNum}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/70">
            Timeline
          </span>
        </div>

        {/* Flags */}
        <div 
          onClick={() => navigate.push('/flags')}
          className="bg-purple/15 p-2.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple/25 transition-colors border-r-3 border-ink"
        >
          <ShieldAlert className="w-4 h-4 text-purple mb-0.5" />
          <span className="font-heading text-xl sm:text-3xl tracking-tighter leading-none text-ink">
            {recentFlagCount}
          </span>
          <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/70">
            Flags
          </span>
        </div>

        {/* Mood */}
        <div 
          onClick={() => navigate.push('/diary')}
          className="bg-white p-2.5 sm:p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-bg transition-colors"
        >
          {todayMood ? (
            <>
              <span className="text-lg sm:text-2xl leading-none">{todayMood.emoji}</span>
              <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/70">
                {MOODS.find(m => m.emoji === todayMood.emoji)?.label || "Mood"}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg sm:text-2xl opacity-30">☁️</span>
              <span className="font-mono text-[8px] sm:text-[10px] font-bold uppercase mt-1 text-ink/40">
                No Mood
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── MOOD LOG ── */}
      <div className="border-3 sm:border-4 border-ink bg-white brutalist-shadow overflow-hidden">
        <div className="flex items-center gap-2 p-2 sm:p-3">
          <span className="font-mono text-[10px] font-bold uppercase text-ink/40 shrink-0 px-1 hidden sm:block">Vibe Check:</span>
          <div className="flex items-center gap-1.5 flex-1">
            {MOODS.map(m => {
              const isActive = todayMood?.emoji === m.emoji;
              return (
                <button
                  key={m.emoji}
                  onClick={() => handleMoodSelect(m.emoji)}
                  className={cn(
                    "flex-1 py-1.5 text-center border-2 border-ink transition-all text-base sm:text-xl",
                    isActive
                      ? "bg-brand shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] -translate-y-0.5 scale-105"
                      : todayMood
                        ? "bg-bg/40 opacity-30 grayscale hover:opacity-70 hover:grayscale-0"
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
            placeholder="Add a quick note about how you feel..."
            value={moodNote}
            onChange={e => setMoodNote(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && moodNote.trim() && todayMood) {
                handleMoodSelect(todayMood.emoji);
              }
            }}
            className="flex-1 bg-transparent font-sans text-xs focus:outline-none placeholder:text-ink/30 text-ink"
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

      {/* ── DAILY CHECK-IN ── */}
      <div className="border-3 sm:border-4 border-ink brutalist-shadow bg-white overflow-hidden flex flex-col">
        <div className="bg-ink text-bg px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="font-heading text-sm sm:text-base tracking-tight uppercase font-black">Daily Check-in</span>
          </div>
          {todayCheckin || checkinDone ? (
            <Badge variant="positive" className="border-bg font-mono text-[9px]">Logged</Badge>
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
              <p className="font-mono text-[10px] text-ink/50 italic">✨ Saved in your recovery timeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea 
                placeholder="How is your heart today? Write what you need to let out..." 
                className="min-h-[85px] resize-none border-2 sm:border-3 border-ink bg-white font-sans text-xs sm:text-sm p-3"
                value={checkinText}
                onChange={(e) => setCheckinText(e.target.value)}
              />
              <Button 
                className="w-full h-10 text-xs sm:text-sm bg-brand hover:bg-brand/90 text-ink border-2 sm:border-3 border-ink brutalist-shadow-sm font-mono font-bold uppercase tracking-wider" 
                onClick={handleCheckin} 
                disabled={!checkinText.trim()}
              >
                Log Today's Check-in
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          onClick={() => navigate.push('/flags/new')}
          className="border-3 border-ink brutalist-shadow-sm bg-white hover:bg-accent/15 p-2.5 sm:p-3.5 text-left transition-all flex items-center gap-2.5 group"
        >
          <div className="p-1.5 sm:p-2 bg-accent text-white border-2 border-ink shrink-0 group-hover:scale-105 transition-transform">
            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-heading text-[11px] sm:text-xs uppercase font-black block group-hover:text-accent transition-colors truncate">
              Log Flag 🚩
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/50 block truncate">Drop incident</span>
          </div>
        </button>

        <button
          onClick={() => navigate.push('/therapist')}
          className="border-3 border-ink brutalist-shadow-sm bg-white hover:bg-purple/15 p-2.5 sm:p-3.5 text-left transition-all flex items-center gap-2.5 group"
        >
          <div className="p-1.5 sm:p-2 bg-purple border-2 border-ink shrink-0 group-hover:scale-105 transition-transform">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ink" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-heading text-[11px] sm:text-xs uppercase font-black block group-hover:text-purple transition-colors truncate">
              Healing AI
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/50 block truncate">24/7 Companion</span>
          </div>
        </button>

        <button
          onClick={() => navigate.push('/closure')}
          className="border-3 border-ink brutalist-shadow-sm bg-white hover:bg-brand/15 p-2.5 sm:p-3.5 text-left transition-all flex items-center gap-2.5 group"
        >
          <div className="p-1.5 sm:p-2 bg-brand border-2 border-ink shrink-0 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ink" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-heading text-[11px] sm:text-xs uppercase font-black block group-hover:text-ink transition-colors truncate">
              Closure
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/50 block truncate">Unsent Words</span>
          </div>
        </button>
      </div>

      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </div>
  );
}
