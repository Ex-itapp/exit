"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/lib/useUser";
import { Anchor, Shield, Sparkles, Heart, Compass, X, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AnchorModalProps {
  onClose: () => void;
}

export function AnchorModal({ onClose }: AnchorModalProps) {
  const navigate = useRouter();
  const { userName, userGoal, userAnchor, streakDays } = useUser();

  const getGoalIcon = () => {
    switch (userGoal) {
      case "Breaking the urge to reach out": return <Shield className="w-6 h-6 text-brand" />;
      case "Rebuilding my self-esteem": return <Sparkles className="w-6 h-6 text-brand" />;
      case "Processing heartbreak & grief": return <Heart className="w-6 h-6 text-brand" />;
      default: return <Compass className="w-6 h-6 text-brand" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-bg border-[6px] border-ink brutalist-shadow max-w-lg w-full p-6 md:p-8 relative animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border-2 border-ink bg-white hover:bg-black/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ink text-brand border-2 border-ink brutalist-shadow-sm">
            <Anchor className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase font-bold tracking-widest bg-white px-2 py-0.5 border border-ink">
              Emergency Grounding Tool
            </span>
            <h2 className="text-3xl font-heading uppercase tracking-tight leading-none mt-1">
              Your Personal Anchor
            </h2>
          </div>
        </div>

        {/* The Anchor Quote Box */}
        <div className="bg-brand/20 border-4 border-ink p-6 relative">
          <div className="absolute -top-3 left-4 bg-ink text-bg px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
            Why You Started
          </div>
          <p className="font-heading text-xl md:text-2xl text-ink leading-relaxed italic pt-2">
            "{userAnchor || 'I deserve someone who chooses me without hesitation every single day.'}"
          </p>
          <div className="mt-4 text-right font-mono text-xs font-bold uppercase opacity-70">
            — Written by {userName}, Day 1
          </div>
        </div>

        {/* Goal & Affirmation Box */}
        <div className="bg-white border-4 border-ink p-4 flex items-center gap-4">
          <div className="p-3 bg-ink text-bg border-2 border-ink shrink-0">
            {getGoalIcon()}
          </div>
          <div>
            <div className="font-mono text-xs uppercase opacity-60 font-bold">Current Healing Focus</div>
            <div className="font-heading text-lg uppercase">{userGoal}</div>
          </div>
        </div>

        {/* Affirmation Text */}
        <p className="font-sans text-sm md:text-base text-ink/80 leading-relaxed text-center font-medium">
          Take a deep breath. You have protected your peace for <strong>{streakDays} days</strong>. The urge to break no contact is temporary, but the dignity you build today lasts a lifetime.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1 h-14 text-base bg-white hover:bg-white/90"
            onClick={() => {
              onClose();
              navigate.push("/therapist");
            }}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Talk to AI Therapist
          </Button>
          <Button
            className="flex-1 h-14 text-base bg-positive hover:bg-positive/90 text-ink"
            onClick={onClose}
          >
            I Feel Grounded Again
          </Button>
        </div>

      </div>
    </div>
  );
}
