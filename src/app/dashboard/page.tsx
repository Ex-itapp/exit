"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Zap, MessageSquare, Anchor, Sparkles, ShieldAlert, Check, ArrowRight } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { useFlags } from "@/lib/useFlags";
import { CalendarTile } from "@/components/CalendarTile";
import { RedFlagTile } from "@/components/RedFlagTile";
import { AnchorModal } from "@/components/AnchorModal";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const navigate = useRouter();
  const { userName, userAnchor, hasCompletedOnboarding, isProfileSyncing } = useUser();
  const { loading: authLoading } = useAuth();
  const { checkins, addCheckin } = useCheckins();
  const { addFlag } = useFlags();
  
  // Daily check-in state
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);

  // Quick Inline Red Flag state
  const [quickFlagText, setQuickFlagText] = useState("");
  const [quickFlagCategory, setQuickFlagCategory] = useState("Disrespect");
  const [flagDropped, setFlagDropped] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && !isProfileSyncing && !hasCompletedOnboarding) {
      const isDone = localStorage.getItem('unsent_onboarding_done_clean');
      if (isDone !== 'true') {
        navigate.push('/onboarding');
      }
    }
  }, [authLoading, isProfileSyncing, hasCompletedOnboarding, navigate]);

  // Get today's checkin if it exists
  const todayCheckin = checkins.find(c => {
    return new Date(c.createdAt).toDateString() === new Date().toDateString();
  });

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24 max-w-[1400px] mx-auto w-full px-2 sm:px-4">
      
      {/* Personalized Welcome Header with Dynamic Grounding Reason */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 w-full border-b-4 border-ink pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-brand border border-ink block animate-pulse" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest bg-ink text-bg px-2 py-0.5">
              Sanctuary Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading tracking-tighter uppercase">
            WELCOME BACK, {userName || "TRAVELER"}
          </h1>
        </div>

        {/* Grounding Reason Button that actually shows what the user entered */}
        <Button 
          variant="secondary"
          onClick={() => setShowAnchor(true)}
          className="bg-white hover:bg-ink hover:text-bg text-ink border-3 border-ink brutalist-shadow-sm h-auto py-2.5 px-3 sm:px-4 shrink-0 font-mono font-bold uppercase transition-all flex items-center gap-2.5 w-full sm:w-auto max-w-full sm:max-w-lg"
          title="Click to view full grounding reminder"
        >
          <div className="p-1 bg-brand text-ink border border-ink shrink-0">
            <Anchor className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left overflow-hidden">
            <div className="text-[9px] opacity-60 leading-none">Your Reason For Leaving:</div>
            <div className="truncate text-xs sm:text-sm font-black tracking-tight">
              "{userAnchor || 'I deserve someone who chooses me without hesitation.'}"
            </div>
          </div>
        </Button>
      </div>

      {/* PRODUCTIVE HERO DASHBOARD: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start w-full">
        {/* Left Column: Persistent Recovery Stats (side-by-side on mobile, stacked on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-6 w-full shrink-0">
          <CalendarTile />
          <RedFlagTile />
        </div>

        {/* Right Column: Active Daily Recovery Hub */}
        <div className="flex flex-col gap-6 w-full h-full">
          
          {/* DAILY MISSION & CHECK-IN */}
          <Card className="flex flex-col border-4 border-ink brutalist-shadow bg-white overflow-hidden">
            <CardHeader className="bg-ink text-bg border-b-4 border-ink p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand" />
                  <CardTitle className="text-xl tracking-tight">DAILY MISSION & CHECK-IN</CardTitle>
                </div>
                {todayCheckin || checkinDone ? (
                  <Badge variant="positive" className="border-bg font-mono text-xs">Logged Today</Badge>
                ) : (
                  <Badge variant="accent" className="animate-pulse border-bg font-mono text-xs">Required</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 bg-bg">
              {todayCheckin || checkinDone ? (
                <div className="animate-in fade-in duration-300 space-y-3">
                  <div className="bg-white border-3 border-ink p-5 brutalist-shadow-sm space-y-2">
                    <div className="flex justify-between items-center border-b-2 border-ink/10 pb-2">
                      <span className="font-mono text-[11px] text-brand bg-ink px-2 py-0.5 font-bold uppercase">
                        Today's Reflection Logged
                      </span>
                      <span className="font-mono text-[11px] text-ink/60">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-sans text-base sm:text-lg font-medium text-ink leading-relaxed pt-1">
                      "{todayCheckin?.content || checkinText}"
                    </p>
                  </div>
                  <p className="font-mono text-xs text-ink/70 text-center italic">
                    ✨ Your check-in is recorded in your timeline. Consistency builds recovery.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-ink/90">
                    How is your heart feeling today? What urge or emotion are you navigating right now?
                  </p>
                  <Textarea 
                    placeholder="Drop your thoughts freely... no judgment, just clarity." 
                    className="min-h-[110px] resize-none border-3 border-ink bg-white font-sans text-base p-4"
                    value={checkinText}
                    onChange={(e) => setCheckinText(e.target.value)}
                  />
                  <Button 
                    className="w-full h-12 text-base bg-brand hover:bg-brand/90 text-ink border-3 border-ink brutalist-shadow-sm hover:-translate-y-0.5 transition-all font-bold uppercase" 
                    onClick={handleCheckin} 
                    disabled={!checkinText.trim()}
                  >
                    Log Today's Check-in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* INSTANT INLINE RED FLAG DROPPER */}
          <Card className="border-4 border-ink brutalist-shadow bg-purple/10 overflow-hidden">
            <div className="bg-ink text-bg p-4 flex items-center justify-between border-b-4 border-ink">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-purple animate-bounce" />
                <h3 className="font-heading text-lg tracking-tight uppercase">INSTANT RED FLAG DROP</h3>
              </div>
              <span className="font-mono text-[10px] bg-purple text-ink px-2 py-0.5 font-bold uppercase">
                Zero Friction
              </span>
            </div>

            <div className="p-5 space-y-4 bg-white">
              <p className="font-sans text-xs sm:text-sm text-ink/80">
                Remembered something toxic or feeling a wave of nostalgia? Drop it here to clear your head immediately without leaving your sanctuary.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {["Disrespect", "Manipulation", "Inconsistency", "Boundary Crossing", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setQuickFlagCategory(cat)}
                    className={cn(
                      "px-3 py-1 font-mono text-xs font-bold border-2 border-ink transition-all uppercase",
                      quickFlagCategory === cat 
                        ? "bg-purple text-ink brutalist-shadow-sm -translate-y-0.5" 
                        : "bg-bg text-ink/70 hover:text-ink hover:bg-bg/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Input
                  placeholder="e.g., How they treated me around their friends..."
                  value={quickFlagText}
                  onChange={(e) => setQuickFlagText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleDropQuickFlag();
                    }
                  }}
                  className="h-12 border-3 border-ink font-sans text-sm flex-1 bg-bg px-4"
                />
                <Button
                  onClick={handleDropQuickFlag}
                  disabled={!quickFlagText.trim()}
                  className="h-12 px-6 bg-ink text-bg hover:bg-ink/90 border-3 border-ink font-mono font-bold uppercase shrink-0"
                >
                  Drop Flag 🚩
                </Button>
              </div>

              {flagDropped && (
                <div className="p-3 bg-positive/20 border-2 border-positive text-ink font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-positive shrink-0" />
                  <span>Red flag logged! Clarity counter updated automatically.</span>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* RECOVERY HEALING SANCTUARY (Focused Deep Tools, No Redundant Nav Buttons) */}
      <div className="space-y-6 pt-6 border-t-4 border-ink/20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="font-mono text-xs text-brand bg-ink px-2 py-0.5 font-bold uppercase">
              Your Healing Sanctuary
            </span>
            <h3 className="font-heading tracking-tighter text-2xl sm:text-3xl uppercase mt-1">
              SAFE SPACES FOR YOUR HEART
            </h3>
          </div>
          <p className="font-mono text-xs text-ink/60">
            Step into a private space whenever you need someone to listen, understand, and help you find peace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Sanctuary 1: Talk to Them */}
          <div 
            onClick={() => navigate.push('/closure')}
            className="border-4 border-ink brutalist-shadow bg-white hover:bg-brand/10 transition-all cursor-pointer p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 rounded-full blur-2xl group-hover:bg-brand/40 transition-colors pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-brand border-3 border-ink brutalist-shadow-sm group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-ink" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-ink text-bg px-2.5 py-1">
                  Private & Unsent
                </span>
              </div>

              <div>
                <h4 className="font-heading text-2xl sm:text-3xl tracking-tight uppercase group-hover:text-brand transition-colors">
                  TALK TO THEM
                </h4>
                <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed mt-2">
                  A gentle, confidential space that understands who they were to you. Say the things left unsaid, express your feelings without fear, and find the closure your heart needs—all while protecting your no-contact promise.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-ink/10 flex items-center justify-between font-mono font-bold text-xs uppercase text-ink group-hover:translate-x-1 transition-transform relative z-10">
              <span>Open Your Unsent Conversation</span>
              <ArrowRight className="w-4 h-4 text-brand" />
            </div>
          </div>

          {/* Sanctuary 2: Healing Companion */}
          <div 
            onClick={() => navigate.push('/therapist')}
            className="border-4 border-ink brutalist-shadow bg-white hover:bg-purple/10 transition-all cursor-pointer p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple/20 rounded-full blur-2xl group-hover:bg-purple/40 transition-colors pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple border-3 border-ink brutalist-shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-ink" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-ink text-purple px-2.5 py-1">
                  24/7 Support
                </span>
              </div>

              <div>
                <h4 className="font-heading text-2xl sm:text-3xl tracking-tight uppercase group-hover:text-purple transition-colors">
                  YOUR HEALING COMPANION
                </h4>
                <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed mt-2">
                  A warm, empathetic listener that remembers what you've been through, helps you understand your emotional triggers, and gently guides you through tough moments when the urge to reach out feels overwhelming.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t-2 border-ink/10 flex items-center justify-between font-mono font-bold text-xs uppercase text-ink group-hover:translate-x-1 transition-transform relative z-10">
              <span>Talk With Your Companion</span>
              <ArrowRight className="w-4 h-4 text-purple" />
            </div>
          </div>

        </div>

        <div className="text-center pt-4">
          <p className="font-mono text-[11px] text-ink/60 uppercase tracking-widest">
            📌 Diary, Red Flags, Timeline, Streak, Rewards & Account are accessible anytime via the bottom navigation bar.
          </p>
        </div>
      </div>

      {/* Anchor Modal */}
      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </div>
  );
}
