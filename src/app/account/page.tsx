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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <h1 className="font-heading text-4xl uppercase tracking-tight font-black">Account</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">YOUR HEALING PREFERENCES, CLOUD SYNC & PERSONAL SETTINGS.</p>
        </div>
        <div className="flex items-center gap-2 bg-ink text-bg px-4 py-2 border-2 border-ink">
          <User className="w-5 h-5 text-brand" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest">{userName}</span>
        </div>
      </header>

      {/* Profile Preferences */}
      <Card className="border-[4px] border-ink">
        <CardHeader className="border-b-[4px] border-ink bg-bg p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Compass className="w-5 h-5" />
            PERSONAL DETAILS & REASON
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider block">
                Your Name / Nickname
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 font-medium border-2 border-ink"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider block">
                Breakup / Day Zero Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 font-mono border-2 border-ink"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider block">
              Primary Healing Focus
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-12 px-4 bg-white border-2 border-ink font-sans font-medium text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              {goals.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Anchor className="w-4 h-4 text-brand" /> Your Reason for Leaving
            </label>
            <Textarea
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              className="min-h-[100px] font-medium border-2 border-ink p-3"
            />
          </div>

          <Button 
            className={cn(
              "w-full h-14 text-base transition-colors",
              isSaved ? "bg-positive text-ink hover:bg-positive" : "bg-ink text-bg hover:bg-ink/90"
            )} 
            onClick={handleSave}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2 inline" /> Preferences Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2 inline" /> Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      {isSupported && (
        <Card className="border-[4px] border-ink bg-white">
          <CardHeader className="border-b-4 border-ink bg-purple/10 p-4">
            <CardTitle className="text-xl flex items-center gap-2 text-purple">
              <Bell className="w-5 h-5" />
              NOTIFICATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="font-sans text-sm md:text-base text-ink/80">
              Get notified when it's time for your daily check-in, or when you reach a new healing milestone.
            </p>
            {permission === 'granted' && subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-positive">
                  <CheckCircle2 className="w-5 h-5" /> Notifications Enabled
                </div>
                <Button 
                  onClick={sendTestNotification} 
                  className="w-full h-12 text-sm bg-purple hover:bg-purple/90 text-white"
                >
                  Send Test Notification
                </Button>
              </div>
            ) : permission === 'denied' ? (
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-danger">
                <AlertTriangle className="w-5 h-5" /> Notifications Blocked in Browser Settings
              </div>
            ) : (
              <Button 
                onClick={subscribe} 
                disabled={pushLoading}
                className="w-full h-14 text-base bg-purple hover:bg-purple/90 text-white"
              >
                {pushLoading ? "Enabling..." : "Enable Push Notifications"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-[4px] border-danger bg-white">
        <CardHeader className="border-b-4 border-danger bg-danger/10 p-4">
          <CardTitle className="text-xl text-danger flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            DANGER ZONE & RESET
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="font-sans text-sm md:text-base text-ink/80">
            Need a fresh start? This will clear all your saved diary entries, red flags, check-ins, and rewards, and take you back to step 1 of onboarding.
          </p>
          <Button variant="danger" className="w-full h-14 text-base" onClick={handleReset}>
            <RefreshCcw className="w-5 h-5 mr-2" />
            Reset Account & Restart Setup
          </Button>
        </CardContent>
      </Card>

      {/* App Install */}
      {isMobile && (
        <Card className="border-[4px] border-ink bg-white">
          <CardHeader className="border-b-4 border-ink bg-brand/10 p-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Compass className="w-5 h-5" />
              APP INSTALL
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="font-sans text-sm md:text-base text-ink/80">
              Install EX-it. directly to your device's home screen for instant access and a full-screen app experience. No App Store required.
            </p>
            <Button className="w-full h-14 text-base bg-brand hover:bg-brand/90 text-ink" onClick={forceShowPWABanner}>
              Show Install Guide
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plan / Subscription */}
      <Card className="border-[4px] border-ink bg-white">
        <CardHeader className="border-b-4 border-ink bg-bg p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            PLAN
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {proLoading ? (
            <div className="flex items-center gap-4 p-4 border-2 border-ink/20 animate-pulse">
              <div className="w-8 h-8 bg-ink/10 border-2 border-ink/20 rounded-none" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-ink/10 w-40 border-2 border-ink/20" />
                <div className="h-3 bg-ink/10 w-60 border-2 border-ink/20" />
              </div>
            </div>
          ) : isPro ? (
            <div className="flex items-center gap-4 p-4 bg-positive/10 border-2 border-positive">
              <CheckCircle2 className="w-8 h-8 text-positive shrink-0" />
              <div>
                <span className="font-heading text-lg uppercase tracking-tight">Pro Plan Active</span>
                {daysRemaining !== null && (
                  <p className="font-mono text-sm text-ink/70 mt-1">
                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in billing period
                  </p>
                )}
                <p className="font-mono text-[10px] text-ink/50 mt-0.5">
                  No refunds on current billing period. To cancel, contact your bank.
                </p>
              </div>
            </div>
          ) : endedPro ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-accent/10 border-2 border-accent">
                <AlertTriangle className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <span className="font-heading text-lg uppercase tracking-tight">Pro Plan Ended</span>
                  <p className="font-mono text-sm text-ink/70 mt-1">
                    Your subscription was cancelled. Resubscribe to get Pro access again.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full h-14 text-base bg-brand border-3 border-ink brutalist-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Resubscribe to Pro →
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 border-2 border-ink/30">
              <span className="font-heading text-lg uppercase tracking-tight">Free Plan</span>
              <span className="ml-auto font-mono text-xs text-ink/50">upgrade anytime</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-[4px] border-ink bg-white">
        <CardHeader className="border-b-4 border-ink bg-bg p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            SESSION
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="font-sans text-sm md:text-base text-ink/80">
            Sign out of your account and return to the landing page.
          </p>
          <Button
            onClick={handleSignOut}
            className="w-full h-14 text-base border-3 border-ink bg-ink text-bg hover:bg-ink/90"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* CUSTOM UI ACCOUNT RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-ink brutalist-shadow max-w-lg w-full p-6 sm:p-8 space-y-6 text-ink relative shadow-2xl">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-ink hover:bg-ink hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b-4 border-ink pb-4 text-danger">
              <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
              <div>
                <span className="font-mono text-[10px] uppercase font-bold bg-danger text-white px-2 py-0.5">Danger Action</span>
                <h3 className="font-heading text-2xl uppercase mt-1">RESET ALL ACCOUNT DATA?</h3>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-base font-medium leading-relaxed">
              Are you sure you want to wipe all your data? This will permanently delete your diary entries, red flags, timeline records, and streak, and restart onboarding from scratch.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => setShowResetModal(false)}
                className="w-full h-12 bg-positive hover:bg-positive/90 text-ink border-3 border-ink font-heading uppercase tracking-tight text-base"
              >
                Nevermind, Keep My Data 🛡️
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  setIsResetting(true);
                  await resetAccount();
                }}
                disabled={isResetting}
                className="w-full h-12 font-mono uppercase text-xs disabled:opacity-50"
              >
                {isResetting ? "Wiping Data..." : "Yes, Wipe Everything & Restart Setup"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
