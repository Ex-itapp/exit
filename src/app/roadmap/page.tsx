"use client";

import { useUser } from "@/lib/useUser";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Milestone = {
  day: number;
  title: string;
  subtitle: string;
};

const getMilestones = (goal: string): Milestone[] => {
  switch (goal) {
    case "Breaking the urge to reach out":
      return [
        { day: 0, title: "Committed to No Contact", subtitle: "The journey begins" },
        { day: 3, title: "Survived the First 72 Hours", subtitle: "The hardest part is over" },
        { day: 7, title: "One Full Week Strong", subtitle: "Building momentum" },
        { day: 14, title: "The Urge is Weakening", subtitle: "Rewiring the brain" },
        { day: 30, title: "A Full Month of Freedom", subtitle: "Breaking the habit" },
        { day: 60, title: "They Don't Control You Anymore", subtitle: "Reclaiming your power" },
        { day: 90, title: "Fully Detached", subtitle: "True independence" },
      ];
    case "Rebuilding my self-esteem":
      return [
        { day: 0, title: "Chose Myself Today", subtitle: "Putting you first" },
        { day: 3, title: "Started the Inner Work", subtitle: "Laying the foundation" },
        { day: 7, title: "Finding My Own Voice", subtitle: "Reconnecting with self" },
        { day: 14, title: "Growing Without Them", subtitle: "Flourishing independently" },
        { day: 30, title: "Self-Worth Restored", subtitle: "Knowing your value" },
        { day: 60, title: "Thriving Solo", subtitle: "Embracing independence" },
        { day: 90, title: "Unshakeable", subtitle: "Bulletproof confidence" },
      ];
    case "Processing heartbreak & grief":
      return [
        { day: 0, title: "Allowed Myself to Feel", subtitle: "Honoring the pain" },
        { day: 3, title: "The Tears Are Healing", subtitle: "Releasing the sorrow" },
        { day: 7, title: "Lighter Than Last Week", subtitle: "The storm is passing" },
        { day: 14, title: "Grief is Becoming Gratitude", subtitle: "Shifting perspective" },
        { day: 30, title: "The Weight is Lifting", subtitle: "Finding relief" },
        { day: 60, title: "Peace is Settling In", subtitle: "Emotional equilibrium" },
        { day: 90, title: "Fully Healed Heart", subtitle: "Ready for the future" },
      ];
    default:
      return [
        { day: 0, title: "Eyes Wide Open", subtitle: "Facing reality" },
        { day: 3, title: "Seeing the Patterns", subtitle: "Connecting the dots" },
        { day: 7, title: "Understanding What Happened", subtitle: "Gaining perspective" },
        { day: 14, title: "Clarity is Coming", subtitle: "The fog is lifting" },
        { day: 30, title: "Lessons Learned", subtitle: "Integrating the past" },
        { day: 60, title: "Wisdom Gained", subtitle: "Deepening understanding" },
        { day: 90, title: "Complete Clarity", subtitle: "Moving forward with purpose" },
      ];
  }
};

export default function RoadmapPage() {
  const { userGoal, streakDays } = useUser();
  const router = useRouter();

  const milestones = getMilestones(userGoal || "");
  
  // Find the highest milestone the user has reached
  const currentIndex = milestones.findLastIndex((m) => streakDays >= m.day);
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="min-h-screen bg-bg text-ink pb-36 pt-8 px-4 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/")}
          className="p-2 border-4 border-ink brutalist-shadow-sm bg-bg active:translate-y-1 active:shadow-none transition-transform"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={24} className="stroke-[3]" />
        </button>
        <h1 className="font-heading text-2xl uppercase">Healing Roadmap</h1>
      </div>

      {/* Streak summary */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand border-4 border-ink brutalist-shadow p-6 mb-12 relative overflow-hidden"
      >
        <div className="font-mono text-sm uppercase font-bold mb-2">
          Current Progress
        </div>
        <div className="font-heading text-4xl">{streakDays} DAYS</div>
        <div className="font-sans font-bold mt-2 text-ink/80 text-sm">
          {userGoal || "Finding peace and clarity"}
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative pl-2">
        {/* Continuous dashed line background */}
        <div className="absolute left-[26px] top-6 bottom-6 w-0 border-l-4 border-dashed border-ink/20 z-0" />

        {/* Solid line for completed sections */}
        <div
          className="absolute left-[26px] top-6 w-1 bg-ink z-0 transition-all duration-1000"
          style={{
            height: `calc(${(safeCurrentIndex / Math.max(1, milestones.length - 1)) * 100}%)`,
          }}
        />

        <div className="space-y-8 relative z-10">
          {milestones.map((m, i) => {
            const isCompleted = i < safeCurrentIndex;
            const isCurrent = i === safeCurrentIndex;
            const isLocked = i > safeCurrentIndex;

            return (
              <motion.div
                key={m.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 sm:gap-6 relative group"
              >
                {/* Node icon */}
                <div
                  className={cn(
                    "shrink-0 w-12 h-12 flex items-center justify-center border-4 z-10 transition-colors",
                    isCompleted && "bg-positive border-ink brutalist-shadow-sm text-ink",
                    isCurrent && "bg-brand border-ink brutalist-shadow text-ink animate-pulse",
                    isLocked && "bg-bg border-dashed border-ink/30 text-ink/40"
                  )}
                >
                  {isCompleted && <Check size={24} className="stroke-[3]" />}
                  {isCurrent && <Star size={24} className="stroke-[3]" />}
                  {isLocked && <Lock size={20} className="stroke-[2]" />}
                </div>

                {/* Node content */}
                <div
                  className={cn(
                    "flex-1 pt-1 border-4 bg-bg p-4 transition-all duration-300",
                    isCompleted && "border-ink brutalist-shadow-sm",
                    isCurrent && "border-ink brutalist-shadow scale-[1.02]",
                    isLocked && "border-dashed border-ink/30 bg-bg/50 shadow-none"
                  )}
                >
                  <div
                    className={cn(
                      "font-mono text-xs font-bold uppercase mb-1",
                      isLocked ? "text-ink/40" : "text-ink"
                    )}
                  >
                    Day {m.day}
                  </div>
                  <h3
                    className={cn(
                      "font-heading text-lg leading-tight uppercase mb-2",
                      isLocked ? "text-ink/40" : "text-ink"
                    )}
                  >
                    {m.title}
                  </h3>
                  <p
                    className={cn(
                      "font-sans text-sm font-medium",
                      isLocked ? "text-ink/40" : "text-ink/70"
                    )}
                  >
                    {m.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
