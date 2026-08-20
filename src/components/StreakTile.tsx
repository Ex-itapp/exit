"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";

interface StreakTileProps {
  actualStreak: number;
  lastSeenStreak: number;
  onPeelComplete: (newStreak: number) => void;
}

export function StreakTile({ actualStreak, lastSeenStreak, onPeelComplete }: StreakTileProps) {
  const navigate = useRouter();
  const [isPeeling, setIsPeeling] = useState(false);
  const [showOldStreak, setShowOldStreak] = useState(true);

  // If actual is greater than last seen, we trigger a peel animation shortly after mount
  useEffect(() => {
    if (actualStreak > lastSeenStreak && lastSeenStreak > 0) {
      const timer = setTimeout(() => {
        setIsPeeling(true);
      }, 1000); // Wait 1 second before peeling
      return () => clearTimeout(timer);
    } else {
      setShowOldStreak(false);
      // Initialize it if it's the first time
      if (lastSeenStreak === 0 && actualStreak > 0) {
        onPeelComplete(actualStreak);
      }
    }
  }, [actualStreak, lastSeenStreak, onPeelComplete]);

  const handleAnimationComplete = () => {
    if (isPeeling) {
      setShowOldStreak(false);
      setIsPeeling(false);
      onPeelComplete(actualStreak);
    }
  };

  return (
    <div 
      onClick={() => navigate.push('/streak')}
      className="relative bg-brand border-2 sm:border-3 border-ink brutalist-shadow-sm flex flex-col justify-between cursor-pointer hover:translate-y-[-2px] transition-transform overflow-visible"
      style={{ perspective: "1000px" }}
    >
      {/* ── BOTTOM LAYER (New Streak) ── */}
      <div className="p-3 sm:p-4 w-full h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/70">Streak</span>
          <Flame className="w-4 h-4 text-ink" />
        </div>
        <div className="mt-2">
          <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
            {actualStreak}d
          </span>
          <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">No Contact</span>
        </div>
      </div>

      {/* ── TOP LAYER (Old Streak) - Positioned Absolutely over the bottom layer ── */}
      <AnimatePresence onExitComplete={handleAnimationComplete}>
        {showOldStreak && (
          <motion.div
            key="old-streak"
            initial={false}
            animate={isPeeling ? { 
              rotateX: -110, 
              y: 20, 
              opacity: 0,
              boxShadow: "0px 20px 25px rgba(0,0,0,0.3)" 
            } : { 
              rotateX: 0, 
              y: 0, 
              opacity: 1 
            }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformOrigin: "bottom center", zIndex: 10 }}
            className="absolute inset-0 bg-brand p-3 sm:p-4 flex flex-col justify-between origin-bottom border-2 sm:border-3 border-ink brutalist-shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/70">Streak</span>
              <Flame className="w-4 h-4 text-ink" />
            </div>
            <div className="mt-2">
              <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
                {lastSeenStreak}d
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">No Contact</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
