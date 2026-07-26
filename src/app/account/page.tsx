"use client";

import { useState, useEffect } from "react";
import { useUser, type AppMode } from "@/lib/useUser";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Shield, Compass, Anchor, AlertTriangle, RefreshCcw, Save, CheckCircle2, Lock, LogOut, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const { userName, userGoal, userAnchor, breakupDate, appMode, updateProfile, setAppMode, resetAccount } = useUser();
  const { user, signInAnonymously, signInWithEmail, signOut } = useAuth();

  const [name, setName] = useState(userName || "Friend");
  const [goal, setGoal] = useState(userGoal || "Finding peace and clarity");
  const [anchor, setAnchor] = useState(userAnchor || "");
  const [date, setDate] = useState(breakupDate ? new Date(breakupDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isSaved, setIsSaved] = useState(false);

  // Auth form
  const [email, setEmail] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

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
    if (confirm("Are you sure you want to reset all your account data and restart onboarding? This cannot be undone.")) {
      resetAccount();
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) return;
    setIsAuthLoading(true);
    const { error } = await signInWithEmail(email.trim());
    setIsAuthLoading(false);
    if (error) {
      setAuthMsg("Error: " + error.message);
    } else {
      setAuthMsg("✨ Magic login link sent to your email!");
    }
  };

  const handleGuestLogin = async () => {
    setIsAuthLoading(true);
    const { error } = await signInAnonymously();
    setIsAuthLoading(false);
    if (error) {
      setAuthMsg("Error: " + error.message);
    } else {
      setAuthMsg("✨ Logged in as Guest!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase">ACCOUNT HUB</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">YOUR HEALING PREFERENCES, CLOUD SYNC & SANCTUARY SETTINGS.</p>
        </div>
        <div className="flex items-center gap-2 bg-ink text-bg px-4 py-2 border-2 border-ink">
          <User className="w-5 h-5 text-brand" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest">{userName}</span>
        </div>
      </header>

      {/* Supabase Cloud Authentication Section */}
      <Card className="border-[4px] border-ink bg-purple/10">
        <CardHeader className="border-b-[4px] border-ink bg-purple text-ink p-4">
          <CardTitle className="text-xl flex items-center gap-2 uppercase">
            <Cloud className="w-5 h-5" />
            Supabase Cloud Sync & Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border-3 border-ink">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-positive" />
                  <span className="font-heading text-lg uppercase">Synced to Cloud Database</span>
                </div>
                <p className="font-mono text-xs text-ink/70">
                  User ID: <code className="bg-bg px-1.5 py-0.5 border border-ink/30 font-bold">{user.id.substring(0, 18)}...</code>
                </p>
                <p className="font-mono text-[11px] text-ink/60">
                  Your Person Engine profiles, memories, diary entries, and red flags are continuously encrypted and backed up to Supabase.
                </p>
              </div>

              <Button
                variant="secondary"
                className="h-11 px-5 border-2 border-ink bg-white hover:bg-danger/10 text-danger text-xs font-mono font-bold uppercase shrink-0"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4 bg-white p-5 border-3 border-ink">
              <div className="space-y-1">
                <h4 className="font-heading text-lg uppercase flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple" /> Connect Your Account
                </h4>
                <p className="font-sans text-sm text-ink/80">
                  By default, your healing data lives in local browser storage. Log in with your email (magic link) or as a guest to sync across mobile and desktop devices.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Input
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-ink font-mono text-sm max-w-sm"
                />
                <Button
                  className="h-12 px-6 bg-ink text-bg font-bold uppercase text-xs shrink-0"
                  onClick={handleLogin}
                  disabled={isAuthLoading || !email.trim()}
                >
                  {isAuthLoading ? "Sending..." : "Send Magic Link"}
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 px-5 text-xs uppercase shrink-0"
                  onClick={handleGuestLogin}
                  disabled={isAuthLoading}
                >
                  Guest Sync
                </Button>
              </div>

              {authMsg && (
                <p className="font-mono text-xs text-ink font-bold pt-1">{authMsg}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Mode Switching */}
      <Card className="border-[4px] border-ink">
        <CardHeader className="bg-ink text-bg p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand" />
            HEALING MODE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="font-sans text-sm md:text-base text-ink/80">
            You can switch between healing modes at any time depending on what you need most.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => setAppMode("no_contact")}
              className={cn(
                "p-4 border-4 border-ink cursor-pointer transition-all flex flex-col justify-between",
                appMode === "no_contact" ? "bg-brand text-ink brutalist-shadow-sm" : "bg-bg text-ink/70 hover:bg-white"
              )}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-heading text-xl uppercase">No Contact Mode</span>
                  {appMode === "no_contact" && <CheckCircle2 className="w-5 h-5 text-ink" />}
                </div>
                <p className="font-mono text-xs opacity-80 leading-relaxed">
                  Strict streak counter, red flag logging, and accountability for detachment.
                </p>
              </div>
            </div>

            <div
              onClick={() => setAppMode("evaluating")}
              className={cn(
                "p-4 border-4 border-ink cursor-pointer transition-all flex flex-col justify-between",
                appMode === "evaluating" ? "bg-brand text-ink brutalist-shadow-sm" : "bg-bg text-ink/70 hover:bg-white"
              )}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-heading text-xl uppercase">Clarity Mode</span>
                  {appMode === "evaluating" && <CheckCircle2 className="w-5 h-5 text-ink" />}
                </div>
                <p className="font-mono text-xs opacity-80 leading-relaxed">
                  Gentle journaling and pattern reflection without streak timers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Preferences */}
      <Card className="border-[4px] border-ink">
        <CardHeader className="border-b-[4px] border-ink bg-bg p-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Compass className="w-5 h-5" />
            PERSONAL DETAILS & ANCHOR
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
              <Anchor className="w-4 h-4 text-brand" /> Your Personal Anchor ("My Why")
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
            Reset Sanctuary & Restart Onboarding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
