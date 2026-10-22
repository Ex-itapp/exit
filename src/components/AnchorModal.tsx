"use client";

import { Button } from "@/components/ui/Button";
import { useUser } from "@/lib/useUser";
import { useHabits } from "@/lib/useHabits";
import { Anchor, Shield, Sparkles, Heart, Compass, X, MessageSquare, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnchorModalProps {
  onClose: () => void;
}

export function AnchorModal({ onClose }: AnchorModalProps) {
  const navigate = useRouter();
  const { userName, userGoal, userAnchor, streakDays } = useUser();
  const { activeHabits, isHabitDoneOnDate, todayStr } = useHabits();

  const incompleteHabits = activeHabits.filter(h => !isHabitDoneOnDate(h.id, todayStr));

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
      <div className="bg-bg border-2 border-ink/20 shadow-lg max-w-lg w-full p-6 md:p-8 relative animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border-2 border-ink/15 bg-white hover:bg-black/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ink text-brand border-2 border-ink/15 shadow-sm">
            <Anchor className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="font-mono text-xs uppercase font-bold tracking-widest bg-white px-2 py-0.5 border-2 border-ink/15">
              Daily Grounding Reminder
            </span>
            <h2 className="text-3xl font-heading uppercase tracking-tight leading-none mt-1">
              Your Reason for Leaving
            </h2>
          </div>
        </div>

        {/* The Anchor Quote Box */}
        <div className="bg-brand/20 border-2 border-ink/20 p-6 relative">
          <div className="absolute -top-3 left-4 bg-ink text-bg px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest">
            The Reason
          </div>
          <p className="font-heading text-xl md:text-2xl text-ink leading-relaxed italic pt-2">
            "{userAnchor || 'I deserve someone who chooses me without hesitation every single day.'}"
          </p>
          <div className="mt-4 text-right font-mono text-xs font-bold uppercase opacity-70">
            — Written by {userName}, Day 1
          </div>
        </div>

        {/* Goal & Affirmation Box */}
        <div className="bg-white border-2 border-ink/20 p-4 flex items-center gap-4">
          <div className="p-3 bg-ink text-bg border-2 border-ink/15 shrink-0">
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

        {/* Urge-Swap Card: Do one of your habits instead */}
        {incompleteHabits.length > 0 && (
          <div className="bg-white border-2 border-ink p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#3FA9D6]" />
                Do one of your habits instead
              </span>
              <span className="font-mono text-[10px] text-ink/40">
                {incompleteHabits.length} open today
              </span>
            </div>

            <div className="space-y-2">
              {incompleteHabits.slice(0, 3).map((h) => (
                <div 
                  key={h.id}
                  onClick={() => {
                    onClose();
                    navigate.push('/rebuild');
                  }}
                  className="p-3 bg-bg border-2 border-ink/15 hover:border-ink flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-sans text-xs font-bold text-ink block group-hover:text-brand-dark truncate">
                      {h.name}
                    </span>
                    {h.why_note && (
                      <span className="font-sans text-[11px] text-ink/60 line-clamp-1 italic mt-0.5">
                        &quot;{h.why_note}&quot;
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[9px] font-bold uppercase px-2 py-1 bg-ink text-bg group-hover:bg-[#3FA9D6] transition-colors">
                    Do This &rarr;
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            Talk to Companion
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
