"use client";

import { useRouter } from "next/navigation";
import { Flag, ShieldAlert } from "lucide-react";
import { useFlags } from "@/lib/useFlags";

export function RedFlagTile() {
  const router = useRouter();
  const { flags } = useFlags();
  
  // Count flags in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentFlags = flags.filter(f => new Date(f.createdAt) >= thirtyDaysAgo);
  const flagCount = recentFlags.length;

  return (
    <div 
      className="relative w-full aspect-square max-w-[280px] mx-auto cursor-pointer group hover:-translate-y-1 hover:translate-x-1 transition-transform"
      onClick={() => router.push('/flags')}
    >
      {/* Shadow */}
      <div className="absolute inset-0 bg-ink rounded-xl translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
      
      <div className="relative w-full h-full bg-purple border-4 border-ink rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-purple py-1.5 sm:py-2 text-center font-heading text-lg sm:text-xl md:text-2xl uppercase tracking-widest border-b-4 border-ink flex items-center justify-center gap-1.5 sm:gap-2">
          <ShieldAlert className="w-4 h-4 sm:w-6 sm:h-6" />
          CLARITY
        </div>
        
        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
          <span className="text-5xl sm:text-7xl md:text-8xl font-heading tracking-tighter leading-none text-ink drop-shadow-md">
            {flagCount}
          </span>
          <span className="font-mono text-[10px] sm:text-sm font-bold uppercase mt-1 sm:mt-2 opacity-80 text-center leading-tight">
            Red Flags<br/>Last 30 Days
          </span>
          
          <div className="mt-2 sm:mt-4 px-2.5 sm:px-4 py-1 sm:py-2 border-3 sm:border-4 border-ink bg-white rounded-full flex items-center justify-center -rotate-2 group-hover:scale-110 transition-transform">
            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="font-mono text-[10px] sm:text-xs md:text-sm font-bold uppercase whitespace-nowrap text-ink">
              LOG A FLAG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
