"use client";

import { useState, useEffect, useCallback } from "react";

import { supabase } from "./supabase";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    const isApple =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari =
      /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsIOS(isApple);
    setIsIOSSafari(isApple && isSafari);
    setIsMobile(mobile);

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    if (isStandalone) return;

    // Listen for the browser's install prompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Trigger automatically on mount if on mobile and hasn't seen it
    const checkAndShow = async () => {
      if (!mobile || isStandalone) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const hasSeen = session?.user?.user_metadata?.has_seen_pwa_prompt === true;
      
      if (!hasSeen) {
        setTimeout(() => setShowBanner(true), 1200);
      }
    };
    
    checkAndShow();

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
    // Record that they saw and interacted with it
    supabase.auth.updateUser({ data: { has_seen_pwa_prompt: true } });
    return outcome === "accepted";
  }, [deferredPrompt]);

  const dismissBanner = useCallback(async () => {
    setShowBanner(false);
    await supabase.auth.updateUser({ data: { has_seen_pwa_prompt: true } });
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isIOSSafari,
    isMobile,
    showBanner,
    setShowBanner,
    promptInstall,
    dismissBanner,
  };
}

/** Call this from any page after a user completes an action */
export function triggerPWAActivity() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pwa-activity"));
  }
}
