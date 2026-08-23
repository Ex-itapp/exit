"use client";

import React, { useState } from "react";
import { useSparks } from "@/lib/useSparks";
import { Sparkles, Flame, Image as ImageIcon, ShieldAlert, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  category: 'utility' | 'cosmetic' | 'content';
  sourceId: any; // The ID passed to spendSparks
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: "streak_freeze",
    name: "Streak Freeze",
    description: "Protect your No-Contact streak if you slip up and text them. One-time use.",
    cost: 100,
    icon: <Flame className="w-6 h-6" />,
    category: 'utility',
    sourceId: 'spend_streak_freeze'
  },
  {
    id: "cert_theme_obsidian",
    name: "Obsidian Certificate",
    description: "Unlock the ultra-dark, premium Obsidian theme for your 90-day closure certificate.",
    cost: 150,
    icon: <BadgeCheck className="w-6 h-6" />,
    category: 'cosmetic',
    sourceId: 'spend_cosmetic_cert'
  },
  {
    id: "bubble_skin_neon",
    name: "Neon Bubbles",
    description: "A retro-neon skin for the Companion chat interface. Cosmetic only.",
    cost: 100,
    icon: <ImageIcon className="w-6 h-6" />,
    category: 'cosmetic',
    sourceId: 'spend_cosmetic_bubble'
  },
  {
    id: "pack_boundaries",
    name: "Boundaries Pack",
    description: "Unlock 5 new deep-dive reflection prompts focused exclusively on boundary setting.",
    cost: 150,
    icon: <ShieldAlert className="w-6 h-6" />,
    category: 'content',
    sourceId: 'spend_bonus_pack'
  }
];

export default function SparksStore() {
  const { balance, spendSparks, isLoading } = useSparks();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePurchase = async (item: StoreItem) => {
    if (balance < item.cost) return;
    
    setPurchasing(item.id);
    setMessage(null);
    
    const success = await spendSparks(item.sourceId, item.cost);
    
    if (success) {
      setMessage({ text: `Successfully purchased ${item.name}!`, type: 'success' });
      // Here we would also typically set a flag in the user profile that they own this item.
    } else {
      setMessage({ text: `Failed to purchase ${item.name}. Please try again.`, type: 'error' });
    }
    
    setPurchasing(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <h2 className="font-heading text-3xl uppercase tracking-wider text-ink">Sparks Catalog</h2>
          <p className="font-sans text-sm text-ink/70 mt-1 max-w-md">
            Spend the Sparks you've earned from building healthy habits. None of these items bypass harm-reduction features.
          </p>
        </div>
        <div className="bg-ink text-bg px-6 py-3 flex items-center gap-3 border-2 border-transparent shadow-[4px_4px_0px_0px] shadow-ink/20">
          <Sparkles className="w-6 h-6 text-accent" />
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-80">Available</span>
            <span className="font-mono text-xl font-bold leading-none">{isLoading ? "..." : balance}</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 border-2 font-mono text-sm font-bold uppercase",
          message.type === 'success' ? "bg-green-500/20 border-green-600 text-green-900 dark:text-green-400" : "bg-red-500/20 border-red-600 text-red-900 dark:text-red-400"
        )}>
          {message.text}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STORE_ITEMS.map((item) => {
          const canAfford = balance >= item.cost;
          const isPurchasing = purchasing === item.id;
          
          return (
            <div 
              key={item.id} 
              className={cn(
                "border-2 border-ink bg-bg p-6 flex flex-col transition-all",
                canAfford ? "hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px] hover:shadow-ink/20" : "opacity-60 grayscale cursor-not-allowed"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="p-3 bg-ink/5 border-2 border-ink/20 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 text-right">
                  <span className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1",
                    item.category === 'utility' ? "bg-accent/20 text-accent" : 
                    item.category === 'cosmetic' ? "bg-brand/20 text-brand" : 
                    "bg-blue/20 text-blue"
                  )}>
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex-1">
                <h3 className="font-heading text-xl uppercase text-ink">{item.name}</h3>
                <p className="font-voice text-sm italic text-ink/70 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t-2 border-ink/10 flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-accent" />
                  {item.cost}
                </div>
                
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || isPurchasing}
                  className={cn(
                    "border-2 font-mono text-xs font-bold uppercase px-6 py-2 transition-colors",
                    canAfford 
                      ? "border-ink bg-ink text-bg hover:bg-bg hover:text-ink active:scale-95" 
                      : "border-ink/20 bg-ink/5 text-ink/40 cursor-not-allowed"
                  )}
                >
                  {isPurchasing ? "Processing..." : canAfford ? "Purchase" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
