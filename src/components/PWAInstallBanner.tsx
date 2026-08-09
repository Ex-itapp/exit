"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { usePWAInstall } from "@/lib/usePWAInstall";

export function PWAInstallBanner() {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isIOSSafari,
    showBanner,
    promptInstall,
    dismissBanner,
  } = usePWAInstall();

  const [step, setStep] = useState<"prompt" | "ios-guide">("prompt");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showBanner && !isInstalled) {
      // Slight delay for smooth entry
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
    }
  }, [showBanner, isInstalled]);

  // Don't render if: already installed, or banner not triggered
  // On non-iOS: only show if browser supports install prompt
  // On iOS Safari: always show instructions (no beforeinstallprompt on iOS)
  if (isInstalled) return null;
  if (!showBanner) return null;
  if (!isIOS && !isInstallable) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setStep("ios-guide");
      return;
    }
    const accepted = await promptInstall();
    if (accepted) {
      setIsVisible(false);
      setTimeout(() => dismissBanner(true), 400);
    }
  };

  const handleDismiss = (permanent = false) => {
    setIsVisible(false);
    setTimeout(() => dismissBanner(permanent), 350);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[90] bg-ink/20 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? "auto" : "none" }}
        onClick={() => handleDismiss(false)}
      />

      {/* Banner sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install EX-it. app"
        className="fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-350 ease-out"
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(110%)",
          willChange: "transform",
        }}
      >
        {/* Decorative top bar */}
        <div className="mx-4 h-1 bg-brand border-x-2 border-t-2 border-ink" />

        <div className="bg-bg border-t-4 border-x-4 border-b-0 border-ink mx-0 px-5 pt-5 pb-8 shadow-[0_-8px_0_rgba(0,0,0,0.15)]">
          {step === "prompt" ? (
            <PromptStep
              isIOS={isIOS}
              isIOSSafari={isIOSSafari}
              onInstall={handleInstall}
              onDismiss={handleDismiss}
            />
          ) : (
            <IOSGuideStep onDone={() => handleDismiss(true)} />
          )}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   Step 1: Initial prompt (both Android & iOS)
────────────────────────────────────────────── */
function PromptStep({
  isIOS,
  isIOSSafari,
  onInstall,
  onDismiss,
}: {
  isIOS: boolean;
  isIOSSafari: boolean;
  onInstall: () => void;
  onDismiss: (permanent?: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* App icon mini */}
          <div className="w-12 h-12 bg-ink border-2 border-ink brutalist-shadow-sm flex items-center justify-center shrink-0">
            <div className="w-5 h-5 bg-brand border border-bg transform -rotate-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
              {isIOS ? "📱 Available on iPhone" : "✨ Install for free"}
            </p>
            <h2 className="font-heading text-xl uppercase font-black leading-tight">
              EX-it.<span className="text-brand">.</span> as an App
            </h2>
          </div>
        </div>
        <button
          onClick={() => onDismiss(false)}
          className="w-8 h-8 border-2 border-ink flex items-center justify-center hover:bg-ink hover:text-bg transition-colors shrink-0 mt-0.5"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="font-mono text-xs text-ink/70 leading-relaxed">
        {isIOS
          ? "Add EX-it. to your Home Screen — it works like a native app. No App Store needed. Quick access whenever you need to heal. 💙"
          : "Install EX-it. on your device for instant access, offline journaling, and a full-screen experience. No App Store needed."}
      </p>

      {/* iOS not-Safari warning */}
      {isIOS && !isIOSSafari && (
        <div className="bg-brand/20 border-2 border-ink p-3">
          <p className="font-mono text-[11px] font-bold text-ink">
            ⚠️ Open this page in{" "}
            <span className="underline">Safari</span> to install — Chrome on
            iPhone doesn't support Home Screen install.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onInstall}
          disabled={isIOS && !isIOSSafari}
          className="flex-1 flex items-center justify-center gap-2 bg-ink text-bg px-4 py-3 border-2 border-ink brutalist-shadow-sm font-mono text-xs font-bold uppercase tracking-widest hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isIOS ? (
            <>
              <Share className="w-4 h-4" />
              Show Me How
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Install App
            </>
          )}
        </button>
        <button
          onClick={() => onDismiss(true)}
          className="px-4 py-3 border-2 border-ink font-mono text-xs font-bold uppercase tracking-widest hover:bg-ink/5 transition-colors"
          aria-label="Not now"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Step 2: iOS step-by-step visual guide
────────────────────────────────────────────── */
function IOSGuideStep({ onDone }: { onDone: () => void }) {
  const steps = [
    {
      icon: <ShareIcon />,
      label: "Tap the Share button",
      hint: "The box-with-arrow icon at the bottom of Safari",
    },
    {
      icon: <PlusBoxIcon />,
      label: 'Scroll & tap "Add to Home Screen"',
      hint: 'Scroll down in the share sheet to find this option',
    },
    {
      icon: <CheckmarkIcon />,
      label: 'Tap "Add" in the top right',
      hint: "EX-it. will appear on your Home Screen instantly",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-brand border border-ink transform -rotate-6 shrink-0" />
        <h2 className="font-heading text-lg uppercase font-black">
          Add to Home Screen
        </h2>
      </div>

      <p className="font-mono text-[11px] text-ink/60 uppercase tracking-wide">
        Follow these 3 steps in Safari:
      </p>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-white border-2 border-ink p-3 brutalist-shadow-sm"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Step number */}
            <div className="w-8 h-8 bg-ink text-bg font-heading text-sm font-black flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            {/* Icon */}
            <div className="w-10 h-10 bg-brand/20 border-2 border-ink flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[12px] font-bold text-ink leading-snug">
                {s.label}
              </p>
              <p className="font-mono text-[10px] text-ink/50 mt-0.5 leading-snug">
                {s.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar visual hint */}
      <div className="bg-ink/5 border-2 border-ink/20 p-3 flex items-center gap-3">
        <div className="text-2xl">📱</div>
        <p className="font-mono text-[10px] text-ink/60 leading-relaxed">
          Make sure you're using{" "}
          <span className="font-bold text-ink">Safari</span> — not Chrome or
          Firefox. The Share button is at the{" "}
          <span className="font-bold text-ink">bottom center</span> of your
          screen.
        </p>
      </div>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 bg-brand text-ink px-4 py-3 border-2 border-ink brutalist-shadow-sm font-mono text-xs font-bold uppercase tracking-widest hover:bg-brand/90 transition-colors"
      >
        Got it!
      </button>
    </div>
  );
}

/* ── Inline SVG icons for iOS steps ── */
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function PlusBoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
