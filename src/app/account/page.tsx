"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { useAuth } from "@/lib/useAuth";
import { usePro } from "@/lib/usePro";
import { usePWAInstall, forceShowPWABanner } from "@/lib/usePWAInstall";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Compass, Anchor, AlertTriangle, RefreshCcw, Save, CheckCircle2, X, LogOut, CreditCard, Bell } from "lucide-react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { isPro, expiresAt, endedPro, loading: proLoading } = usePro();
  const { userName, userGoal, userAnchor, breakupDate, updateProfile, resetAccount } = useUser();
  const { isMobile } = usePWAInstall();
  const { isSupported, permission, subscription, loading: pushLoading, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();

  const [name, setName] = useState(userName || "Friend");
  const [goal, setGoal] = useState(userGoal || "Finding peace and clarity");
  const [anchor, setAnchor] = useState(userAnchor || "");
  const [date, setDate] = useState(breakupDate ? new Date(breakupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (userName) setName(userName);
    if (userGoal) setGoal(userGoal);
    if (userAnchor) setAnchor(userAnchor);
    if (breakupDate) {
      try {
        setDate(new Date(breakupDate).toISOString().split('T')[0]);
      } catch (e) {
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [userName, userGoal, userAnchor, breakupDate]);

  const goals = [
    "Breaking the urge to reach out",
    "Rebuilding my self-esteem",
    "Processing heartbreak & grief",
    "Finding peace and clarity",
  ];

  const handleSave = () => {
    updateProfile(name.trim() || "Friend", goal, anchor.trim() || "I deserve peace.", new Date(date).toISOString());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24 max-w-2xl mx-auto px-4">
      {/* Header */}
      <header className="flex flex-col gap-1 pb-4 border-b-2 border-ink mt-4">
        <h1 className="font-heading text-4xl uppercase tracking-tight font-black text-ink">Account</h1>
        <p className="font-mono text-ink/70 text-xs sm:text-sm uppercase tracking-wider">Your preferences & settings.</p>
      </header>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="font-mono font-bold text-xs tracking-widest text-ink/50 uppercase">Profile Settings</h2>
        
        <div className="bg-white border-2 sm:border-3 border-ink brutalist-shadow-sm p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider block">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 font-medium border-2 border-ink bg-bg focus-visible:ring-0 rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider block">Day Zero</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 font-mono border-2 border-ink bg-bg focus-visible:ring-0 rounded-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider block">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-12 px-4 bg-bg border-2 border-ink font-sans font-medium text-ink focus:outline-none rounded-none"
            >
              {goals.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider block">Your Anchor</label>
            <Textarea
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              className="min-h-[100px] font-medium border-2 border-ink bg-bg p-3 focus-visible:ring-0 rounded-none resize-none"
              placeholder="I deserve peace..."
            />
          </div>

          <Button 
            className={cn(
              "w-full h-12 text-sm uppercase tracking-wider font-bold transition-all border-2 border-ink brutalist-shadow-sm rounded-none",
              isSaved ? "bg-positive text-ink hover:bg-positive" : "bg-ink text-white hover:bg-ink/90"
            )}
            onClick={handleSave}
          >
            {isSaved ? <><CheckCircle2 className="w-4 h-4 mr-2 inline" /> Saved Successfully</> : "Save Profile"}
          </Button>
        </div>
      </section>

      {/* Notifications Section */}
      {isSupported && (
        <section className="space-y-4">
          <h2 className="font-mono font-bold text-xs tracking-widest text-ink/50 uppercase">Push Notifications</h2>
          
          <div className="bg-white border-2 sm:border-3 border-ink brutalist-shadow-sm">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 border-2 border-ink bg-brand flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <p className="font-heading uppercase text-sm sm:text-base font-black text-ink leading-tight">Daily Reminders</p>
                  <p className="font-mono text-[10px] sm:text-xs text-ink/60">Receive check-in nudges</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Test Button */}
                {subscription && (
                  <button
                    onClick={sendTestNotification}
                    className="h-8 px-3 border-2 border-ink bg-white font-mono text-[10px] uppercase font-bold text-ink hover:bg-ink/5 transition-colors"
                  >
                    Test Push
                  </button>
                )}

                {/* Brutalist Toggle */}
                <button
                onClick={async () => {
                   if (subscription) {
                     await unsubscribe();
                   } else {
                     await subscribe();
                   }
                }}
                disabled={pushLoading || permission === 'denied'}
                className={cn(
                  "relative h-8 w-14 border-2 border-ink flex items-center p-1 transition-colors duration-200 cursor-pointer disabled:opacity-50",
                  subscription ? "bg-positive" : "bg-ink/10"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white border-2 border-ink transform transition-transform duration-200",
                    subscription ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
              </div>
            </div>
            
            {permission === 'denied' && (
              <div className="p-3 bg-danger border-t-2 border-ink text-white font-mono text-xs px-4 flex items-center gap-2 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" /> Blocked in browser
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subscription Section */}
      <section className="space-y-4">
        <h2 className="font-mono font-bold text-xs tracking-widest text-ink/50 uppercase">Subscription</h2>
        
        <div className="bg-white border-2 sm:border-3 border-ink brutalist-shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn("w-10 h-10 border-2 border-ink flex items-center justify-center shrink-0", isPro ? "bg-positive text-ink" : "bg-ink/5 text-ink/40")}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading text-sm sm:text-base uppercase font-black tracking-tight">{isPro ? "Pro Active" : "Free Plan"}</p>
              {isPro && daysRemaining !== null && (
                <p className="font-mono text-[10px] sm:text-xs text-ink/60">{daysRemaining} days left</p>
              )}
            </div>
          </div>
          {!isPro && (
            <Button 
              onClick={() => router.push('/pricing')}
              className="h-9 px-4 text-xs font-mono font-bold uppercase border-2 border-ink bg-brand text-ink hover:bg-brand/90 brutalist-shadow-sm rounded-none"
            >
              Upgrade
            </Button>
          )}
        </div>
      </section>

      {/* Danger Zone & Session */}
      <section className="space-y-3 pt-4 border-t-2 border-ink border-dashed">
        <button 
          onClick={handleSignOut}
          className="w-full p-4 border-2 border-ink bg-white text-ink font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-between hover:bg-ink/5 transition-colors brutalist-shadow-sm"
        >
          <span className="flex items-center gap-3"><LogOut className="w-5 h-5" /> Sign Out</span>
        </button>

        <button 
          onClick={handleReset}
          className="w-full p-4 border-2 border-danger bg-danger/5 text-danger font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-between hover:bg-danger/10 transition-colors brutalist-shadow-sm"
        >
          <span className="flex items-center gap-3"><RefreshCcw className="w-5 h-5" /> Reset Data</span>
        </button>
      </section>

      {/* CUSTOM UI ACCOUNT RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-ink brutalist-shadow max-w-sm w-full p-6 sm:p-8 space-y-6 text-ink relative shadow-2xl">
            <div className="flex items-center gap-3 border-b-4 border-ink pb-4 text-danger">
              <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
              <div>
                <span className="font-mono text-[10px] uppercase font-bold bg-danger text-white px-2 py-0.5">Danger Action</span>
                <h3 className="font-heading text-xl uppercase mt-1 leading-none">RESET DATA?</h3>
              </div>
            </div>

            <p className="font-sans text-sm font-medium leading-relaxed">
              This will permanently delete your diary entries, red flags, and streak. You cannot undo this action.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                variant="danger"
                onClick={async () => {
                  setIsResetting(true);
                  await resetAccount();
                }}
                disabled={isResetting}
                className="w-full h-12 font-mono uppercase text-xs font-bold border-2 border-ink rounded-none disabled:opacity-50"
              >
                {isResetting ? "Wiping Data..." : "Delete everything"}
              </Button>
              <Button
                onClick={() => setShowResetModal(false)}
                className="w-full h-12 bg-white text-ink border-2 border-ink font-mono uppercase font-bold text-xs hover:bg-ink/5 rounded-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
