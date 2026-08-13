"use client";

import { useEffect, useState } from "react";
import { usePWAInstall } from "@/lib/usePWAInstall";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { Bell, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function PWANotificationsPrompt() {
  const { isInstalled } = usePWAInstall();
  const { isSupported, permission, subscribe, loading } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAndShow = async () => {
      if (!isInstalled || !isSupported || dismissed) return;
      
      const isToggledOff = localStorage.getItem('push_toggled_off') === 'true';
      const hasBeenReprompted = localStorage.getItem('has_been_reprompted_for_push') === 'true';

      const isFreshInstall = permission === "default";
      const needsReprompt = permission === "granted" && isToggledOff && !hasBeenReprompted;

      if (!isFreshInstall && !needsReprompt) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 800);
      return () => clearTimeout(timer);
    };
    
    checkAndShow();
  }, [isInstalled, isSupported, permission, dismissed]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      localStorage.setItem('has_been_reprompted_for_push', 'true');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('has_been_reprompted_for_push', 'true');
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm border-4 border-ink p-6 sm:p-8 space-y-6 relative brutalist-shadow animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 bg-transparent hover:bg-ink/5 transition-colors"
        >
          <X className="w-6 h-6 text-ink" />
        </button>

        <div className="w-16 h-16 border-4 border-ink bg-brand flex items-center justify-center mx-auto mb-2 transform -rotate-3 brutalist-shadow-sm">
          <Bell className="w-8 h-8 text-ink" />
        </div>

        <div className="text-center space-y-3">
          <h2 className="font-heading text-2xl sm:text-3xl text-ink uppercase tracking-tight font-black leading-none">Enable Push</h2>
          <p className="font-sans font-medium text-sm text-ink/80 leading-relaxed px-2">
            Never miss a check-in. Get a gentle nudge each day to log your streak and keep your healing on track.
          </p>
        </div>

        <div className="bg-positive border-2 border-ink p-3 flex items-start gap-3 brutalist-shadow-sm">
          <ShieldCheck className="w-5 h-5 text-ink shrink-0 mt-0.5" />
          <p className="font-mono font-bold text-[10px] sm:text-xs text-ink uppercase tracking-wider">
            1-2 notifications daily.<br/>No spam, ever.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full h-14 border-4 border-ink bg-ink text-white font-mono font-bold uppercase tracking-widest text-sm hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Enabling..." : "Turn On"}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full h-14 border-4 border-ink bg-white text-ink font-mono font-bold uppercase tracking-widest text-sm hover:bg-ink/5 transition-colors brutalist-shadow-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
