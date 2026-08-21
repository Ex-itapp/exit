"use client";

import React from "react";
import { Sparkles, BookOpen, ShieldCheck, Flag, CheckCircle, Zap, PenLine, Award, Lock } from "lucide-react";
import { type RewardBadge } from "@/lib/useRewards";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface BadgeTileProps {
  badge: RewardBadge;
  onClick: () => void;
}

export function BadgeTile({ badge, onClick }: BadgeTileProps) {
  const getIcon = () => {
    const props = { className: "w-8 h-8 sm:w-10 sm:h-10 shrink-0", strokeWidth: 2.2 };
    switch (badge.iconName) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Flag': return <Flag {...props} />;
      case 'CheckCircle': return <CheckCircle {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'PenLine': return <PenLine {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Award {...props} />;
    }
  };

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "aspect-square rounded-3xl border-4 border-ink p-4 sm:p-5 flex flex-col justify-between items-center text-center transition-colors cursor-pointer relative overflow-hidden group select-none shadow-lg",
        badge.isUnlocked
          ? "bg-brand text-ink"
          : "bg-white/60 text-ink/50 border-ink/40 hover:bg-white hover:border-ink/70"
      )}
    >
      {/* Subtle background decorative icon for unlocked badges */}
      {badge.isUnlocked && (
        <div className="absolute -right-6 -bottom-6 opacity-[0.08] pointer-events-none transform rotate-12 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">
          {getIcon()}
        </div>
      )}

      {/* Top: Category Pill */}
      <div className="w-full flex justify-center z-10">
        <span className={cn(
          "font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
          badge.isUnlocked 
            ? "bg-white/90 text-ink border-ink" 
            : "bg-ink/5 text-ink/50 border-ink/20"
        )}>
          {badge.category}
        </span>
      </div>

      {/* Center: Large Featured Icon */}
      <div className="my-auto z-10 flex items-center justify-center">
        {badge.isUnlocked ? (
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 8 }} 
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="p-3.5 sm:p-4 bg-white rounded-2xl border-3 border-ink shadow-sm group-hover:shadow-md transition-shadow"
          >
            {getIcon()}
          </motion.div>
        ) : (
          <div className="p-3.5 sm:p-4 bg-ink/5 rounded-2xl border-2 border-dashed border-ink/30 flex items-center justify-center">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-ink/30" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Bottom: Title & Progress */}
      <div className="w-full z-10 space-y-0.5">
        <h3 className={cn(
          "text-xs sm:text-sm font-heading tracking-tight uppercase leading-tight line-clamp-1",
          badge.isUnlocked ? "text-ink font-bold" : "text-ink/60 font-medium"
        )}>
          {badge.title}
        </h3>
        <p className="font-mono text-[9px] sm:text-[10px] opacity-75 line-clamp-1">
          {badge.isUnlocked ? "✨ UNLOCKED" : badge.progressText || "Keep going"}
        </p>
      </div>
    </motion.div>
  );
}
