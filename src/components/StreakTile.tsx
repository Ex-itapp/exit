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

  const hasPendingUpdate = actualStreak > lastSeenStreak && lastSeenStreak > 0;

  useEffect(() => {
    if (!hasPendingUpdate) {
      setShowOldStreak(false);
      // Initialize it if it's the first time
      if (lastSeenStreak === 0 && actualStreak > 0) {
        onPeelComplete(actualStreak);
      }
    }
  }, [actualStreak, lastSeenStreak, hasPendingUpdate, onPeelComplete]);

  const handleTileClick = (e: React.MouseEvent) => {
    if (showOldStreak && hasPendingUpdate && !isPeeling) {
      e.stopPropagation();
      setIsPeeling(true);
    } else if (!showOldStreak) {
      navigate.push('/streak');
    }
  };

  const handleAnimationComplete = () => {
    if (isPeeling) {
      setShowOldStreak(false);
      setIsPeeling(false);
      onPeelComplete(actualStreak);
    }
  };

  return (
    <div 
      onClick={handleTileClick}
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
              rotateY: 0,
              x: 0,
              y: 50, 
              opacity: 0,
              boxShadow: "0px 20px 25px rgba(0,0,0,0.3)" 
            } : { 
              // Gentle top-left corner lift (3D rotate around bottom-right)
              rotateX: [0, 6, 0], 
              rotateY: [0, -8, 0],
              z: [0, 10, 0],
              boxShadow: [
                "4px 4px 0px 0px #111111",
                "10px 10px 20px 0px rgba(17,17,17,0.25)",
                "4px 4px 0px 0px #111111"
              ]
            }}
            transition={isPeeling ? { 
              duration: 0.8, 
              ease: [0.2, 0.8, 0.2, 1] 
            } : {
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "bottom right", zIndex: 10 }}
            className="absolute inset-0 bg-brand p-3 sm:p-4 flex flex-col justify-between origin-bottom border-2 sm:border-3 border-ink"
          >
            {/* Top Left Dog-Ear Indicator */}
            <div className="absolute top-0 left-0 w-4 h-4 overflow-hidden pointer-events-none">
              <div className="absolute top-[-8px] left-[-8px] w-4 h-4 bg-white border-2 border-ink rotate-45 transform origin-center shadow-sm" />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase text-ink/70 pl-3">Streak</span>
              <Flame className="w-4 h-4 text-ink" />
            </div>
            <div className="mt-2">
              <span className="font-heading text-2xl sm:text-4xl font-black tracking-tighter leading-none text-ink block">
                {lastSeenStreak}d
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-ink/60 uppercase block mt-1">No Contact (Tap to claim)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
