"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Flag as FlagIcon, Plus, Trash2 } from "lucide-react";
import { useFlags } from "@/lib/useFlags";
import { ShareModal, type ShareEntryData } from "@/components/ShareModal";

export default function Flags() {
  const navigate = useRouter();
  const { flags, deleteFlag } = useFlags();
  const [selectedEntry, setSelectedEntry] = useState<ShareEntryData | null>(null);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const handleCardClick = (flag: any) => {
    setSelectedEntry({
      type: 'flag',
      id: flag.id,
      content: flag.content,
      createdAt: flag.createdAt,
      tags: [flag.category]
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">RED FLAGS</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">WRITE IT DOWN SO YOU DON'T FORGET.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/flags/new')} className="brutalist-shadow-sm group bg-accent hover:bg-accent/90 text-bg border-accent">
            <Plus className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform" />
            Log Flag
          </Button>
        </div>
      </header>

      {/* Flag Log Gallery */}
      {flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
          <div className="w-24 h-24 border-4 border-dashed border-ink flex items-center justify-center rounded-xl bg-accent/5">
            <FlagIcon className="w-8 h-8 text-accent" />
          </div>
          <p className="font-mono uppercase font-bold tracking-widest">No flags logged yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flags.map(flag => (
            <Card 
              key={flag.id} 
              onClick={() => handleCardClick(flag)}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white border-ink hover:shadow-[8px_8px_0_var(--color-accent)] border-t-8 border-t-accent cursor-pointer"
            >
              <CardContent className="p-6 flex flex-col h-full min-h-[200px] relative z-10">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <Badge variant="accent" className="font-bold text-xs uppercase tracking-widest">{flag.category}</Badge>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFlag(flag.id); }} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-accent/10 text-accent z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="flex-1 text-lg font-medium leading-relaxed whitespace-pre-wrap mb-6 text-ink/90 line-clamp-6">
                  {flag.content}
                </p>
                
                <div className="mt-auto pt-4 border-t-2 border-ink/10 flex justify-between items-center text-ink/40">
                  <span className="font-mono text-xs font-bold tracking-widest">
                    {formatTime(flag.createdAt)}
                  </span>
                  <FlagIcon className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {selectedEntry && (
        <ShareModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  );
}
