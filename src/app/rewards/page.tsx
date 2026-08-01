"use client";

import { useState } from "react";
import { useRewards, type RewardBadge } from "@/lib/useRewards";
import { BadgeTile } from "@/components/BadgeTile";
import { Button } from "@/components/ui/Button";
import { Award, Lock, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RewardsPage() {
  const { badges, unlockedCount, totalCount } = useRewards();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBadge, setSelectedBadge] = useState<RewardBadge | null>(null);

  const categories = ["All", "Milestones", "Streaks", "Diary", "Insights"];

  const filteredBadges = selectedCategory === "All"
    ? badges
    : badges.filter(b => b.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase">REWARDS & MILESTONES</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">CELEBRATE EVERY STEP OF YOUR HEALING.</p>
        </div>
        
        {/* Stats Badge */}
        <div className="bg-ink text-bg px-6 py-3 border-4 border-ink brutalist-shadow-sm flex items-center gap-4">
          <Award className="w-8 h-8 text-brand animate-pulse" />
          <div>
            <div className="font-mono text-xs uppercase opacity-70">Milestones Reached</div>
            <div className="font-heading text-2xl leading-none">{unlockedCount} / {totalCount}</div>
          </div>
        </div>
      </header>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "primary" : "ghost"}
            className={cn(
              "h-10 px-6 font-mono text-xs font-bold uppercase tracking-wider border-2",
              selectedCategory === cat 
                ? "border-ink bg-ink text-bg brutalist-shadow-sm" 
                : "border-ink/20 hover:border-ink bg-white text-ink"
            )}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {filteredBadges.map((badge) => (
          <BadgeTile
            key={badge.id}
            badge={badge}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {/* Badge Inspection Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-bg border-4 border-ink brutalist-shadow max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 border-2 border-ink bg-white hover:bg-black/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className={cn(
                "p-6 border-4 border-ink brutalist-shadow-sm mb-2",
                selectedBadge.isUnlocked ? "bg-brand text-ink" : "bg-ink/10 text-ink/40 border-ink/40"
              )}>
                {selectedBadge.isUnlocked ? <Award className="w-16 h-16" /> : <Lock className="w-16 h-16" />}
              </div>

              <span className="font-mono text-xs font-bold uppercase px-3 py-1 border-2 border-ink bg-white">
                {selectedBadge.category}
              </span>

              <h2 className="text-3xl font-heading uppercase">{selectedBadge.title}</h2>
              
              <p className="font-sans text-base leading-relaxed opacity-90 max-w-sm">
                {selectedBadge.description}
              </p>

              <div className="w-full pt-4 border-t-2 border-ink/20 mt-4 flex justify-between items-center font-mono text-sm font-bold">
                <span>Status:</span>
                <span className={cn(
                  "px-2 py-1 uppercase border border-ink",
                  selectedBadge.isUnlocked ? "bg-positive text-ink" : "bg-white text-ink/60"
                )}>
                  {selectedBadge.isUnlocked ? "Unlocked" : selectedBadge.progressText}
                </span>
              </div>

              <Button
                className="w-full h-12 text-base mt-4"
                onClick={() => setSelectedBadge(null)}
              >
                {selectedBadge.isUnlocked ? "Keep Going" : "Got It"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
