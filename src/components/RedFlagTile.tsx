import { useNavigate } from "react-router-dom";
import { Flag, ShieldAlert } from "lucide-react";
import { useFlags } from "../lib/useFlags";

export function RedFlagTile() {
  const navigate = useNavigate();
  const { flags } = useFlags();
  
  // Count flags in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentFlags = flags.filter(f => new Date(f.createdAt) >= thirtyDaysAgo);
  const flagCount = recentFlags.length;

  return (
    <div 
      className="relative w-full aspect-square max-w-[280px] mx-auto cursor-pointer group hover:-translate-y-1 hover:translate-x-1 transition-transform"
      onClick={() => navigate('/flags')}
    >
      {/* Shadow */}
      <div className="absolute inset-0 bg-ink rounded-xl translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform" />
      
      <div className="relative w-full h-full bg-purple border-4 border-ink rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-ink text-purple py-2 text-center font-heading text-xl md:text-2xl uppercase tracking-widest border-b-4 border-ink flex items-center justify-center gap-2">
          <ShieldAlert className="w-6 h-6" />
          CLARITY
        </div>
        
        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          <span className="text-7xl md:text-8xl font-heading tracking-tighter leading-none text-ink drop-shadow-md">
            {flagCount}
          </span>
          <span className="font-mono text-sm font-bold uppercase mt-2 opacity-80 text-center">
            Red Flags<br/>Last 30 Days
          </span>
          
          <div className="mt-4 px-4 py-2 border-4 border-ink bg-white rounded-full flex items-center justify-center -rotate-2 group-hover:scale-110 transition-transform">
            <Flag className="w-4 h-4 mr-2" />
            <span className="font-mono text-xs md:text-sm font-bold uppercase whitespace-nowrap text-ink">
              LOG A FLAG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
