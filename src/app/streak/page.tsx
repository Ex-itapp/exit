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

      {/* CUSTOM UI INTERVENTION & EVIDENCE VAULT MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-bg border-4 border-ink brutalist-shadow max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-danger text-white p-4 sm:p-6 border-b-4 border-ink flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-white shrink-0 animate-bounce" />
                <div>
                  <span className="font-mono text-[10px] sm:text-xs font-bold uppercase bg-ink text-white px-2 py-0.5 tracking-widest">
                    Urge Intercept Active
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl md:text-3xl uppercase tracking-tighter mt-1">
                    WAIT! BEFORE YOU RESET YOUR STREAK... 🛑
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="p-1.5 bg-ink text-white hover:bg-white hover:text-ink border-2 border-white transition-colors shrink-0"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body: The Evidence Vault */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white custom-scrollbar">
              
              <div className={`${goalIntervention.color} border-3 border-ink p-5 text-ink space-y-2`}>
                <div className="font-heading text-lg sm:text-xl uppercase tracking-tight leading-none">
                  {goalIntervention.header}
                </div>
                <p className="font-sans text-sm sm:text-base font-medium leading-relaxed">
                  {goalIntervention.message}
                </p>
              </div>

              {/* 1. Grounding Anchor */}
              <div className="border-4 border-ink bg-bg p-5 brutalist-shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-brand bg-ink px-3 py-1 w-fit font-mono text-xs font-bold uppercase">
                  <Anchor className="w-4 h-4" />
                  <span>Your Exact Reason For Leaving</span>
                </div>
                <p className="font-heading text-lg sm:text-xl md:text-2xl text-ink uppercase tracking-tight pt-2">
                  "{userAnchor || 'I deserve someone who chooses me without hesitation and treats me with absolute respect.'}"
                </p>
              </div>

              {/* 2. Logged Red Flags Archive */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-3 border-ink pb-2">
                  <div className="flex items-center gap-2 font-heading text-lg sm:text-xl uppercase">
                    <ShieldAlert className="w-5 h-5 text-purple" />
                    <span>Your Red Flags Archive</span>
                  </div>
                  <Badge variant="accent" className="font-mono text-xs border-2 border-ink">
                    {flags.length} Logged
                  </Badge>
                </div>

                {flags.length === 0 ? (
                  <p className="font-mono text-xs text-ink/60 italic p-4 border-2 border-dashed border-ink/40 bg-bg text-center">
                    No red flags logged yet — remember that peace and consistency are worth protecting above all.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {flags.map((flag) => (
                      <div key={flag.id} className="bg-purple/10 border-3 border-ink p-3.5 space-y-1.5 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[10px] font-bold uppercase bg-purple text-ink px-2 py-0.5 border border-ink">
                            {flag.category}
                          </span>
                          <span className="font-mono text-[9px] text-ink/50">
                            {new Date(flag.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-sans text-xs sm:text-sm font-medium text-ink pt-1 leading-normal">
                          "{flag.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Past Diary & Check-ins */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-3 border-ink pb-2">
                  <div className="flex items-center gap-2 font-heading text-lg sm:text-xl uppercase">
                    <BookOpen className="w-5 h-5 text-blue" />
                    <span>Your Past Diary & Check-in Logs</span>
                  </div>
                  <span className="font-mono text-xs text-ink/70">
                    Showing recent entries
                  </span>
                </div>

                {entries.length === 0 && checkins.length === 0 ? (
                  <p className="font-mono text-xs text-ink/60 italic p-4 border-2 border-dashed border-ink/40 bg-bg text-center">
                    No diary entries yet — stay grounded in your current strength.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {entries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="bg-bg border-2 border-ink p-3 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] bg-ink text-bg px-2 py-0.5 font-bold uppercase">
                            Diary Log
                          </span>
                          {entry.moods.map((m) => (
                            <span key={m} className="font-mono text-[10px] bg-white text-ink border border-ink px-1.5 py-0.5">
                              {m}
                            </span>
                          ))}
                          <span className="font-mono text-[9px] text-ink/50 ml-auto">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-ink/90 italic pt-1">
                          "{entry.content}"
                        </p>
                      </div>
                    ))}

                    {checkins.slice(0, 3).map((chk) => (
                      <div key={chk.id} className="bg-blue/10 border-2 border-ink p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] bg-blue text-ink font-bold uppercase px-2 py-0.5 border border-ink">
                            Daily Check-in
                          </span>
                          <span className="font-mono text-[9px] text-ink/50">
                            {new Date(chk.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-sans text-xs sm:text-sm text-ink font-medium pt-1">
                          "{chk.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions (Custom UI Buttons, Zero Browser Dialogs!) */}
            <div className="bg-bg p-4 sm:p-6 border-t-4 border-ink flex flex-col gap-3 shrink-0">
              <Button
                onClick={handleStayedStrong}
                className="w-full h-14 bg-positive hover:bg-positive/90 text-ink border-4 border-ink brutalist-shadow text-sm sm:text-base font-heading font-black uppercase tracking-tight flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{goalIntervention.cta} (Keep My {streakDays}-Day Streak) 🛡️</span>
              </Button>

              <button
                onClick={handleConfirmReset}
                className="w-full py-2.5 text-center font-mono text-xs font-bold uppercase text-danger hover:bg-danger/10 transition-colors border-2 border-transparent hover:border-danger/30 rounded"
              >
                I actually broke no-contact — confirm reset to Day 0
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
