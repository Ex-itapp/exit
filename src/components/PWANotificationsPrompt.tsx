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
    // Only show if PWA is installed, push is supported, permission hasn't been asked, and user is logged in
    const checkAndShow = async () => {
      if (!isInstalled || !isSupported || permission !== "default" || dismissed) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Show it after a small delay so it doesn't interrupt immediate dashboard load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    };
    
    checkAndShow();
  }, [isInstalled, isSupported, permission, dismissed]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[24px] p-6 space-y-6 relative shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <button
          onClick={() => {
            setShowPrompt(false);
            setDismissed(true);
          }}
          className="absolute top-4 right-4 p-2 bg-ink/5 rounded-full hover:bg-ink/10 transition-colors"
        >
          <X className="w-5 h-5 text-ink/60" />
        </button>

        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Bell className="w-8 h-8 text-brand" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl text-ink uppercase tracking-tight">Enable Notifications</h2>
          <p className="font-sans text-sm text-ink/70 leading-relaxed px-2">
            Never miss a check-in. Get a gentle nudge each day to log your streak and keep your healing on track.
          </p>
        </div>

        <div className="bg-positive/10 rounded-xl p-3 flex items-start gap-3 border border-positive/20">
          <ShieldCheck className="w-5 h-5 text-positive shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-ink/70">
            We only send 1-2 notifications per day. No spam, ever.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-ink text-white font-sans font-medium text-base hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Enabling..." : "Turn on Notifications"}
          </button>
          <button
            onClick={() => {
              setShowPrompt(false);
              setDismissed(true);
            }}
            className="w-full py-3 rounded-xl bg-transparent text-ink/50 font-sans font-medium text-sm hover:text-ink transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
