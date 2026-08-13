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
  const { isSupported, permission, subscription, loading: pushLoading, subscribe, sendTestNotification } = usePushNotifications();

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
      {/* Minimal Header */}
      <header className="flex flex-col gap-1 pb-4 border-b border-ink/10 mt-4">
        <h1 className="font-heading text-3xl text-ink">Settings</h1>
        <p className="font-sans text-ink/50 text-sm">Manage your profile, notifications, and subscription.</p>
      </header>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="font-sans font-bold text-xs tracking-wider text-ink/40 uppercase">Profile</h2>
        
        <div className="bg-white rounded-xl border border-ink/10 overflow-hidden divide-y divide-ink/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
            <label className="font-sans text-sm font-medium text-ink w-1/3">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent border-none text-right font-sans text-sm text-ink/80 focus:outline-none focus:ring-0 p-0"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2">
            <label className="font-sans text-sm font-medium text-ink w-1/3">Day Zero</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-transparent border-none text-right font-sans text-sm text-ink/80 focus:outline-none focus:ring-0 p-0"
            />
          </div>

          <div className="flex flex-col p-4 gap-3">
            <label className="font-sans text-sm font-medium text-ink">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-ink/5 border-none rounded-lg p-3 font-sans text-sm text-ink focus:outline-none"
            >
              {goals.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col p-4 gap-3">
            <label className="font-sans text-sm font-medium text-ink">Your Anchor (Why you left)</label>
            <textarea
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              className="w-full bg-ink/5 border-none rounded-lg p-3 font-sans text-sm text-ink focus:outline-none min-h-[80px] resize-none"
              placeholder="I deserve peace..."
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className={cn(
            "w-full py-3.5 rounded-xl font-sans font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2",
            isSaved ? "bg-positive text-ink" : "bg-ink text-white hover:bg-ink/90"
          )}
        >
          {isSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Profile"}
        </button>
      </section>

      {/* Notifications Section */}
      {isSupported && (
        <section className="space-y-4">
          <h2 className="font-sans font-bold text-xs tracking-wider text-ink/40 uppercase">Notifications</h2>
          
          <div className="bg-white rounded-xl border border-ink/10 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-ink">Push Notifications</p>
                  <p className="font-sans text-xs text-ink/50">Daily check-ins & milestones</p>
                </div>
              </div>
              
              {/* Minimal Toggle Switch */}
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
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                  subscription ? "bg-brand" : "bg-ink/20"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    subscription ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            
            {permission === 'denied' && (
              <div className="p-3 bg-danger/10 text-danger text-xs px-4 border-t border-danger/10 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Blocked in browser settings
              </div>
            )}
          </div>
        </section>
      )}

      {/* Subscription Section */}
      <section className="space-y-4">
        <h2 className="font-sans font-bold text-xs tracking-wider text-ink/40 uppercase">Subscription</h2>
        
        <div className="bg-white rounded-xl border border-ink/10 overflow-hidden p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isPro ? "bg-positive/10" : "bg-ink/5")}>
              <CreditCard className={cn("w-4 h-4", isPro ? "text-positive" : "text-ink/40")} />
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-ink">{isPro ? "Pro Plan Active" : "Free Plan"}</p>
              {isPro && daysRemaining !== null && (
                <p className="font-sans text-xs text-ink/50">{daysRemaining} days remaining</p>
              )}
            </div>
          </div>
          {!isPro && (
            <button 
              onClick={() => router.push('/pricing')}
              className="text-xs font-medium text-brand bg-brand/10 px-3 py-1.5 rounded-full hover:bg-brand/20 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-6 border-t border-ink/10">
        <button 
          onClick={handleSignOut}
          className="w-full p-4 rounded-xl border border-ink/10 bg-white text-ink font-sans text-sm font-medium flex items-center justify-between hover:bg-ink/5 transition-colors"
        >
          <span className="flex items-center gap-2"><LogOut className="w-4 h-4 text-ink/50" /> Sign Out</span>
        </button>

        <button 
          onClick={handleReset}
          className="w-full p-4 rounded-xl border border-danger/20 bg-danger/5 text-danger font-sans text-sm font-medium flex items-center justify-between hover:bg-danger/10 transition-colors"
        >
          <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Reset Account Data</span>
        </button>
      </section>

      {/* CUSTOM UI ACCOUNT RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6 text-ink shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            
            <div>
              <h3 className="font-sans font-bold text-lg text-ink">Reset all data?</h3>
              <p className="font-sans text-sm text-ink/60 mt-2">
                This will permanently delete your diary entries, red flags, and streak. You cannot undo this action.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={async () => {
                  setIsResetting(true);
                  await resetAccount();
                }}
                disabled={isResetting}
                className="w-full py-3 rounded-xl bg-danger text-white font-sans text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {isResetting ? "Wiping Data..." : "Delete everything"}
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full py-3 rounded-xl bg-ink/5 text-ink font-sans text-sm font-medium hover:bg-ink/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
