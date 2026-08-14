"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUser } from "@/lib/useUser";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { useCheckins } from "@/lib/useCheckins";
import { AlertTriangle, RefreshCcw, Settings2, ShieldAlert, BookOpen, Anchor, CheckCircle2, X, Flag, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CalendarTile } from "@/components/CalendarTile";
import { Badge } from "@/components/ui/Badge";

export default function Streak() {
  const { streakDays, breakupDate, userAnchor, userGoal, appMode, setAppMode } = useUser();

  const getGoalIntervention = () => {
    switch (userGoal) {
      case "Breaking the urge to reach out":
        return {
          header: "YOU'VE BEEN FIGHTING THIS URGE.",
          message: `You chose accountability. You chose to break the cycle. ${streakDays} days of pure willpower — texting them won't give you closure, it'll restart the addiction. You are stronger than a moment of weakness.`,
          color: "bg-accent/20",
          cta: "Stay Accountable"
        };
      case "Rebuilding my self-esteem":
        return {
          header: "YOU'RE WORTH MORE THAN THIS.",
          message: `You chose to rebuild yourself. Every one of these ${streakDays} days, you proved that you don't need their validation to feel whole. Going back now means letting them define your worth again. You define it.`,
          color: "bg-purple/20",
          cta: "I Know My Worth"
        };
      case "Processing heartbreak & grief":
        return {
          header: "THE GRIEF IS REAL. BUT SO IS YOUR HEALING.",
          message: `You gave yourself permission to feel everything — and you've survived ${streakDays} days of it. The pain doesn't disappear by going back. It just resets the clock on your healing. Let yourself grieve forward, not backward.`,
          color: "bg-blue/20",
          cta: "Keep Healing"
        };
      default: // Finding peace and clarity
        return {
          header: "YOU WERE SEARCHING FOR CLARITY.",
          message: `You chose to understand what happened — and ${streakDays} days later, you have more clarity than the day you started. Reaching out now muddies everything you've learned. The answers are inside you, not in their replies.`,
          color: "bg-brand/20",
          cta: "Stay Clear"
        };
    }
  };

  const goalIntervention = getGoalIntervention();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const { checkins } = useCheckins();

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [newBreakupDate, setNewBreakupDate] = useState(
    breakupDate ? new Date(breakupDate).toISOString().split('T')[0] : ""
  );

  // Intervention Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [streakProtectedToast, setStreakProtectedToast] = useState(false);

  const handleUpdateBreakupDate = () => {
    if (newBreakupDate) {
      localStorage.setItem('unsent_breakup_date', new Date(newBreakupDate).toISOString());
      window.location.reload();
    }
  };

  const handleConfirmReset = () => {
    localStorage.setItem('unsent_breakup_date', new Date().toISOString());
    localStorage.setItem('unsent_punched_dates', JSON.stringify([]));
    window.location.reload();
  };

  const handleStayedStrong = () => {
    setShowResetModal(false);
    setStreakProtectedToast(true);
    setTimeout(() => setStreakProtectedToast(false), 5000);
  };

  if (appMode === 'evaluating') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 relative h-full flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
        <ShieldAlert className="w-24 h-24 text-ink opacity-20 mb-4" />
        <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase">Streaks are Locked</h1>
        <p className="text-lg opacity-80 mt-4 font-medium max-w-md">
          Streaks become available once you initiate No Contact. Take your time to gather clarity. When you're ready to leave, switch modes.
        </p>
        <Button 
          className="mt-8 h-14 px-8 text-lg brutalist-shadow-sm"
          onClick={() => setAppMode('no_contact')}
        >
          I'M READY FOR NO CONTACT
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 relative pb-20 max-w-[1200px] mx-auto w-full px-2 sm:px-4">

      {/* Toast Notice when streak is preserved */}
      {streakProtectedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-positive text-ink border-4 border-ink brutalist-shadow px-6 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-[90%]">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div className="font-mono text-xs sm:text-sm font-bold uppercase">
            ✨ Your streak is protected! Proud of you for honoring your peace and choosing yourself today.
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest bg-ink text-bg px-2.5 py-1">
            Active Protection Mode
          </span>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase mt-2">STREAK & CLARITY</h1>
          <p className="font-mono text-ink/70 mt-1 text-sm md:text-base uppercase">Every day is an act of self-respect.</p>
        </div>
        <div className="text-left sm:text-right bg-white border-3 border-ink px-6 py-3 brutalist-shadow-sm">
          <div className="text-4xl sm:text-5xl font-heading tracking-tighter leading-none text-ink">{streakDays}</div>
          <p className="font-mono text-xs font-bold tracking-widest uppercase text-brand bg-ink px-2 py-0.5 mt-1 inline-block">DAYS NO CONTACT</p>
        </div>
      </header>

      {/* Hero Calendar Tile */}
      <div className="flex justify-center py-4">
        <CalendarTile />
      </div>

      {/* Streak Settings & Adjustments */}
      <Card className="border-4 border-ink brutalist-shadow bg-white">
        <CardHeader className="border-b-4 border-ink bg-bg p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsEditingSettings(!isEditingSettings)}>
          <CardTitle className="flex items-center gap-2 text-lg uppercase font-heading">
            <Settings2 className="w-5 h-5" />
            STREAK SETTINGS
          </CardTitle>
          <Button variant="ghost" className="h-8 px-3 text-xs font-mono font-bold uppercase border-2 border-ink">
            {isEditingSettings ? "Done" : "Edit Date"}
          </Button>
        </CardHeader>
        {isEditingSettings && (
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2 pt-4">
              <label className="text-xs sm:text-sm font-bold font-mono uppercase">Change Day Zero Date (Breakup / Start Date)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="date" 
                  value={newBreakupDate}
                  onChange={(e) => setNewBreakupDate(e.target.value)}
                  className="flex-1 h-12 border-3 border-ink font-mono"
                />
                <Button onClick={handleUpdateBreakupDate} className="h-12 px-6 font-mono font-bold uppercase bg-brand text-ink border-3 border-ink">Update Date</Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-4 border-danger brutalist-shadow bg-white">
        <CardHeader className="bg-danger/10 border-b-4 border-danger p-4">
          <CardTitle className="flex items-center gap-2 text-danger font-heading text-xl uppercase">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            DANGER ZONE & URGE INTERVENTION
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <p className="font-sans text-sm md:text-base font-medium text-ink/90 leading-relaxed">
            Feeling a sudden wave of nostalgia, an urge to text them, or tempted to reset your streak? Before you wipe your progress, let us remind you of the journey you've survived so far.
          </p>
          <Button 
            variant="danger" 
            className="w-full h-14 text-base font-mono font-bold uppercase border-3 border-ink brutalist-shadow-sm hover:-translate-y-0.5 transition-all" 
            onClick={() => setShowResetModal(true)}
          >
            <RefreshCcw className="w-5 h-5 mr-2 animate-spin" style={{ animationDuration: '4s' }} />
            I Want to Reset My Streak...
          </Button>
        </CardContent>
      </Card>

      {/* CUSTOM UI INTERVENTION MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg border-4 border-ink brutalist-shadow max-w-md w-full flex flex-col relative my-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute -top-3 -right-3 z-10 p-1.5 bg-bg text-ink border-2 border-ink hover:bg-ink hover:text-white transition-colors brutalist-shadow-sm rounded-none"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Goal Intervention */}
              <div className={`${goalIntervention.color} border-3 border-ink p-4 text-ink space-y-2`}>
                <div className="font-heading text-lg sm:text-xl uppercase tracking-tight leading-none">
                  {goalIntervention.header}
                </div>
                <p className="font-sans text-sm sm:text-base font-medium leading-relaxed">
                  {goalIntervention.message}
                </p>
              </div>

              {/* Anchor Quote */}
              <div className="text-center px-2">
                <p className="font-heading text-xl sm:text-2xl text-ink uppercase tracking-tight">
                  "{userAnchor || 'I deserve someone who chooses me without hesitation and treats me with absolute respect.'}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex flex-col gap-4">
              <Button
                onClick={handleStayedStrong}
                className="w-full h-14 bg-positive hover:bg-positive/90 text-ink border-4 border-ink brutalist-shadow-sm hover:brutalist-shadow text-sm sm:text-base font-heading font-black uppercase tracking-tight flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{goalIntervention.cta} (Keep My {streakDays}-Day Streak) 🛡️</span>
              </Button>

              <button
                onClick={handleConfirmReset}
                className="w-full py-3 text-center font-mono text-xs sm:text-sm font-bold uppercase text-danger hover:bg-danger/10 transition-colors border-2 border-danger/30 hover:border-danger border-dashed bg-bg"
              >
                I broke no-contact — reset to Day 0
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
