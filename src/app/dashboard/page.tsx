"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Zap, MessageSquare, Anchor, Sparkles, ShieldAlert, Send, Flame, Award, Flag } from "lucide-react";
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
    setMoodNote("");
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200 pb-28 max-w-2xl mx-auto w-full px-3 sm:px-4">
      
      {/* ── TOP BAR / USER GREETING ── */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 bg-brand border border-ink block animate-pulse" />
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ink/60">
              Sanctuary • Day {streakDays}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading tracking-tighter uppercase font-black">
            Welcome, {userName || "Traveler"}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAnchor(true)}
            className="bg-white hover:bg-ink hover:text-bg text-ink border-2 sm:border-3 border-ink brutalist-shadow-sm py-1.5 px-3 font-mono font-bold uppercase transition-all flex items-center gap-2"
            title="Your Anchor Reason"
          >
            <Anchor className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold hidden sm:inline truncate max-w-[140px]">
              {userAnchor || 'Why You Left'}
            </span>
          </button>

          <button
            onClick={() => navigate.push('/rewards')}
            className="w-9 h-9 sm:w-10 sm:h-10 border-2 sm:border-3 border-ink brutalist-shadow-sm flex items-center justify-center bg-brand hover:scale-105 transition-transform shrink-0"
            title="Rewards & Badges"
          >
            <Award className="w-4 h-4 text-ink" />
          </button>
        </div>
      </div>

      {/* ── COMPACT RECOVERY SNAPSHOT ── */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Streak */}
        <div 
          onClick={() => navigate.push('/streak')}
          className="bg-brand border-2 sm:border-3 border-ink brutalist-shadow-sm p-3 sm:p-4 flex flex-col justify-between cursor-pointer hover:translate-y-[-2px] transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/70">Streak</span>
            <Flame className="w-4 h-4 text-ink" />
          </div>
          <div className="mt-2">
            <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
              {streakDays}d
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">No Contact</span>
          </div>
        </div>

        {/* Red Flags */}
        <div 
          onClick={() => navigate.push('/flags')}
          className="bg-purple/15 border-2 sm:border-3 border-ink brutalist-shadow-sm p-3 sm:p-4 flex flex-col justify-between cursor-pointer hover:translate-y-[-2px] transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-purple font-bold">Flags</span>
            <ShieldAlert className="w-4 h-4 text-purple" />
          </div>
          <div className="mt-2">
            <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
              {recentFlagCount}
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">Last 30 Days</span>
          </div>
        </div>

        {/* Today's Date / Timeline */}
        <div 
          onClick={() => navigate.push('/timeline')}
          className="bg-white border-2 sm:border-3 border-ink brutalist-shadow-sm p-3 sm:p-4 flex flex-col justify-between cursor-pointer hover:translate-y-[-2px] transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/50">{monthShort}</span>
            <span className="font-mono text-[9px] text-ink/40">📅</span>
          </div>
          <div className="mt-2">
            <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
              {dayNum}
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">View Log</span>
          </div>
        </div>
      </div>

      {/* ── HERO FOCUS CARD: DAILY CHECK-IN ── */}
      <div className="border-3 sm:border-4 border-ink brutalist-shadow bg-white overflow-hidden">
        <div className="bg-ink text-bg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="font-heading text-sm sm:text-base tracking-tight uppercase font-black">Daily Check-In</span>
          </div>
          {todayCheckin || checkinDone ? (
            <Badge variant="positive" className="border-bg font-mono text-[9px] uppercase px-2 py-0.5">✓ Completed</Badge>
          ) : (
            <Badge variant="accent" className="animate-pulse border-bg font-mono text-[9px] uppercase px-2 py-0.5">Required Today</Badge>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-bg space-y-4">
          {/* Mood Selector directly inside Check-In */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/60 block">
              How are you feeling right now?
            </label>
            <div className="flex items-center gap-1.5">
              {MOODS.map(m => {
                const isActive = todayMood?.emoji === m.emoji;
                return (
                  <button
                    key={m.emoji}
                    onClick={() => handleMoodSelect(m.emoji)}
                    className={cn(
                      "flex-1 py-2 sm:py-2.5 text-center border-2 border-ink transition-all text-lg sm:text-2xl bg-white",
                      isActive
                        ? "bg-brand border-ink brutalist-shadow-sm -translate-y-0.5 scale-105"
                        : todayMood
                          ? "opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                          : "hover:bg-brand/20 hover:-translate-y-0.5"
                    )}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkin Content */}
          {todayCheckin || checkinDone ? (
            <div className="p-3.5 bg-white border-2 border-ink space-y-1.5">
              <p className="font-sans text-xs sm:text-sm font-medium text-ink leading-relaxed italic">
                &ldquo;{todayCheckin?.content || checkinText}&rdquo;
              </p>
              <p className="font-mono text-[10px] text-ink/40 uppercase font-bold">✨ Safely stored in recovery history</p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <Textarea 
                placeholder="What is weighing on your mind today? Write it out..." 
                className="min-h-[90px] resize-none border-2 border-ink bg-white font-sans text-xs sm:text-sm p-3 focus-visible:ring-0"
                value={checkinText}
                onChange={(e) => setCheckinText(e.target.value)}
              />
              <Button 
                className="w-full h-11 text-xs sm:text-sm bg-brand hover:bg-brand/90 text-ink border-2 sm:border-3 border-ink brutalist-shadow-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2" 
                onClick={handleCheckin} 
                disabled={!checkinText.trim()}
              >
                Log Today's Entry <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── CORE HEALING TOOLS GRID ── */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 block px-1">
          Quick Healing Tools
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate.push('/flags/new')}
            className="bg-white hover:bg-accent/10 border-2 sm:border-3 border-ink brutalist-shadow-sm p-3.5 text-left transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-accent text-white border-2 border-ink flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Flag className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading text-xs uppercase font-black block group-hover:text-accent transition-colors truncate">
                Log Red Flag 🚩
              </span>
              <span className="font-mono text-[9px] text-ink/50 block truncate">Log toxic incident</span>
            </div>
          </button>

          <button
            onClick={() => navigate.push('/therapist')}
            className="bg-white hover:bg-purple/10 border-2 sm:border-3 border-ink brutalist-shadow-sm p-3.5 text-left transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-purple text-ink border-2 border-ink flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading text-xs uppercase font-black block group-hover:text-purple transition-colors truncate">
                Healing Companion
              </span>
              <span className="font-mono text-[9px] text-ink/50 block truncate">24/7 AI listener</span>
            </div>
          </button>

          <button
            onClick={() => navigate.push('/closure')}
            className="bg-white hover:bg-brand/10 border-2 sm:border-3 border-ink brutalist-shadow-sm p-3.5 text-left transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-brand text-ink border-2 border-ink flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-heading text-xs uppercase font-black block group-hover:text-ink transition-colors truncate">
                Unsent Letter
              </span>
              <span className="font-mono text-[9px] text-ink/50 block truncate">Say it here, not to them</span>
            </div>
          </button>
        </div>
      </div>

      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </div>
  );
}
