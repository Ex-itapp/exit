"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [showBanner, setShowBanner] = useState(false);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent;
    const isApple =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari =
      /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
    setIsIOS(isApple);
    setIsIOSSafari(isApple && isSafari);

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

    // Listen for custom activity events from any page
    const activityHandler = () => {
      setActivityCount((prev) => {
        const next = prev + 1;
        // Show banner after 1st meaningful activity
        if (next === 1) {
          const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
          const permanentlyDismissed = localStorage.getItem(
            "pwa-banner-dismissed"
          );
          if (!dismissed && !permanentlyDismissed) {
            // Small delay so it doesn't feel abrupt
            setTimeout(() => setShowBanner(true), 1200);
          }
        }
        return next;
      });
    };

    window.addEventListener("pwa-activity", activityHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-activity", activityHandler);
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
    return outcome === "accepted";
  }, [deferredPrompt]);

  const dismissBanner = useCallback((permanent = false) => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    if (permanent) {
      localStorage.setItem("pwa-banner-dismissed", "1");
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isIOSSafari,
    showBanner,
    setShowBanner,
    promptInstall,
    dismissBanner,
    activityCount,
  };
}

/** Call this from any page after a user completes an action */
export function triggerPWAActivity() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pwa-activity"));
  }
}
