"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Zap, MessageSquare, Sparkles, ShieldAlert, Send, Award, Flag, Map, Calendar, CheckCircle2 } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { useFlags } from "@/lib/useFlags";
import { useMoods } from "@/lib/useMoods";
import { useRewards } from "@/lib/useRewards";
import { AnchorModal } from "@/components/AnchorModal";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const MOODS = [
  { emoji: "😭", label: "Rough", color: "#00B4D8" },
  { emoji: "😔", label: "Low", color: "#9D4EDD" },
  { emoji: "😐", label: "Okay", color: "#888888" },
  { emoji: "🙂", label: "Good", color: "#FFDF00" },
  { emoji: "🤩", label: "Great", color: "#00E676" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export default function DashboardPage() {
  const navigate = useRouter();
  const { streakDays, hasCompletedOnboarding, isProfileSyncing } = useUser();
  const { loading: authLoading } = useAuth();
  const { checkins, addCheckin } = useCheckins();
  const { flags } = useFlags();
  const { logMood, getMoodForDate } = useMoods();
  const { unlockedCount, totalCount } = useRewards();
  
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);
  const [moodNote, setMoodNote] = useState("");

  const todayDate = new Date();
  const todayMood = getMoodForDate(todayDate);
  const formattedToday = todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

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

  const getMoodColor = (emoji?: string) => {
    const found = MOODS.find(m => m.emoji === emoji);
    return found ? found.color : undefined;
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show"
      className="space-y-3 pb-6 max-w-2xl mx-auto w-full px-4 pt-0"
    >
      {/* Zone B: Hero Module */}
      <motion.div variants={item} className="border-3 border-ink bg-white overflow-hidden brutalist-shadow-sm">
        <div className="px-4 pt-3 font-mono text-[10px] uppercase text-ink/40 tracking-widest">
          Day {streakDays}
        </div>
        <div 
          onClick={() => navigate.push('/roadmap')}
          className="cursor-pointer hover:translate-y-[-2px] transition-transform space-y-3"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-3">
            <h1 className="text-7xl sm:text-8xl font-heading tracking-tighter text-ink leading-none">
              {streakDays}
            </h1>
            <p className="text-lg font-sans font-medium text-ink/70 mt-2">
              days no contact
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 pb-6">
            <div className="flex items-center gap-1.5">
              {last7Days.map((date, i) => {
                const mood = getMoodForDate(date);
                const color = getMoodColor(mood?.emoji);
                return (
                  <div 
                    key={i}
                    className={cn("w-8 h-8 border-2 border-ink", !color && "bg-ink/10")}
                    style={color ? { backgroundColor: color } : undefined}
                    title={date.toDateString()}
                  />
                );
              })}
            </div>
            <span className="font-mono text-[9px] text-ink/40 uppercase tracking-widest">
              Last 7 Days
            </span>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 border-t-2 border-ink">
          <div className="flex items-center justify-center gap-2 border-r-2 border-ink py-2.5">
            <Flag className="w-4 h-4 text-ink/60" />
            <span className="font-mono text-xs text-ink/60">
              {recentFlagCount} flags (30d)
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 py-2.5">
            <Calendar className="w-4 h-4 text-ink/60" />
            <span className="font-mono text-xs text-ink/60">
              {formattedToday}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Zone C: Today's Focus */}
      <motion.div variants={item} className="border-2 border-ink bg-white p-4">
        {todayCheckin || checkinDone ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-positive" />
            <span className="font-mono text-xs text-ink uppercase font-bold">Checked in today</span>
            {todayMood && (
              <span className="ml-auto text-lg">{todayMood.emoji}</span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-sans font-medium text-base text-ink">How are you feeling today?</h2>
            <div className="flex items-center justify-between gap-1.5">
              {MOODS.map(m => {
                const isActive = todayMood?.emoji === m.emoji;
                return (
                  <button
                    key={m.emoji}
                    onClick={() => handleMoodSelect(m.emoji)}
                    className={cn(
                      "flex-1 py-2 sm:py-3 text-center border-2 border-ink transition-all text-xl sm:text-2xl bg-bg hover:-translate-y-1",
                      isActive && "bg-brand brutalist-shadow-sm -translate-y-1"
                    )}
                    title={m.label}
                  >
                    {m.emoji}
                  </button>
                );
              })}
            </div>

            {todayMood && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 overflow-hidden pt-1"
              >
                <Textarea 
                  placeholder="What is weighing on your mind today? Write it out..." 
                  className="min-h-[90px] resize-none border-2 border-ink bg-bg font-sans text-sm p-3 focus-visible:ring-0"
                  value={checkinText}
                  onChange={(e) => setCheckinText(e.target.value)}
                />
                <Button 
                  className="w-full h-11 bg-ink text-white hover:bg-ink/90 font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2" 
                  onClick={handleCheckin} 
                  disabled={!checkinText.trim()}
                >
                  Log Entry <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Zone D: Feature Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Companion */}
        <button
          onClick={() => navigate.push('/therapist')}
          className="col-span-2 bg-purple/10 border-2 border-ink p-4 flex items-start gap-4 hover:-translate-y-1 transition-transform text-left"
        >
          <div className="w-12 h-12 bg-purple text-ink border-2 border-ink flex items-center justify-center shrink-0 brutalist-shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div className="mt-0.5">
            <h3 className="font-heading text-xl uppercase text-ink tracking-tighter">Companion</h3>
            <span className="font-mono text-xs text-ink/60">Your AI friend</span>
          </div>
        </button>

        {/* Ex Simulator */}
        <button
          onClick={() => navigate.push('/closure')}
          className="col-span-1 bg-brand/10 border-2 border-ink p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform text-left"
        >
          <div className="w-10 h-10 bg-brand text-ink border-2 border-ink flex items-center justify-center shrink-0 brutalist-shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg uppercase text-ink tracking-tighter leading-tight">Talk to<br/>Them</h3>
            <span className="font-mono text-xs text-ink/60">Closure sim</span>
          </div>
        </button>

        {/* Roadmap */}
        <button
          onClick={() => navigate.push('/roadmap')}
          className="col-span-1 bg-positive/10 border-2 border-ink p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform text-left"
        >
          <div className="w-10 h-10 bg-positive text-ink border-2 border-ink flex items-center justify-center shrink-0 brutalist-shadow-sm">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg uppercase text-ink tracking-tighter">Roadmap</h3>
            <span className="font-mono text-xs text-ink/60">Day {streakDays}/90</span>
          </div>
        </button>

        {/* Rewards */}
        <button
          onClick={() => navigate.push('/rewards')}
          className="col-span-2 bg-blue/10 border-2 border-ink p-4 flex items-start gap-4 hover:-translate-y-1 transition-transform text-left"
        >
          <div className="w-12 h-12 bg-blue text-white border-2 border-ink flex items-center justify-center shrink-0 brutalist-shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div className="mt-0.5">
            <h3 className="font-heading text-xl uppercase text-ink tracking-tighter">Rewards</h3>
            <span className="font-mono text-xs text-ink/60">{unlockedCount}/{totalCount} unlocked</span>
          </div>
        </button>
      </motion.div>

      {/* Zone E: Teaser Strip */}
      <motion.div variants={item}>
        <button 
          onClick={() => navigate.push('/diary')}
          className="w-full mt-1 flex items-center justify-center gap-2 border-2 border-ink border-dashed p-3 bg-ink/5 hover:bg-ink/10 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-ink" />
          <span className="font-mono text-xs uppercase text-ink font-bold">View your pattern report &rarr;</span>
        </button>
      </motion.div>

      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </motion.div>
  );
}
