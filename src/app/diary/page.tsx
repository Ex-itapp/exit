"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lock, Filter, Trash2, PenLine } from "lucide-react";
import { useDiary } from "@/lib/useDiary";
import { ShareModal, type ShareEntryData } from "@/components/ShareModal";

export default function Diary() {
  const navigate = useRouter();
  const { entries, deleteEntry } = useDiary();
  const [selectedEntry, setSelectedEntry] = useState<ShareEntryData | null>(null);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const handleCardClick = (entry: any) => {
    setSelectedEntry({
      type: 'diary',
      id: entry.id,
      content: entry.content,
      createdAt: entry.createdAt,
      tags: entry.moods,
      isUnsent: entry.isUnsent
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">DIARY</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">YOUR WEEK, UNFILTERED.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="border-2 border-transparent hover:border-ink">
            <Filter className="w-5 h-5" />
          </Button>
          <Button onClick={() => navigate.push('/diary/new')} className="brutalist-shadow-sm group">
            <PenLine className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            New Entry
          </Button>
        </div>
      </header>

      {/* Entries Gallery */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
          <div className="w-24 h-24 border-4 border-dashed border-ink flex items-center justify-center rounded-xl">
            <PenLine className="w-8 h-8" />
          </div>
          <p className="font-mono uppercase font-bold tracking-widest">No entries yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => (
            <Card 
              key={entry.id} 
              onClick={() => handleCardClick(entry)}
              className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)] cursor-pointer ${
                entry.isUnsent 
                  ? "bg-ink text-bg border-ink" 
                  : "bg-[#f4f1ea] border-ink"
              }`}
            >
              {/* Aesthetic subtle background pattern for standard entries */}
              {!entry.isUnsent && (
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
              )}
              
              <CardContent className="p-6 flex flex-col h-full min-h-[250px] relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    {entry.isUnsent ? (
                      <Badge variant="accent" className="border-bg bg-accent text-bg font-bold">
                        <Lock className="w-3 h-3 mr-1 inline-block" /> Sealed
                      </Badge>
                    ) : (
                      entry.moods.map(mood => (
                        <Badge key={mood} variant="outline" className="border-ink bg-white/50 backdrop-blur-sm font-bold">
                          {mood}
                        </Badge>
                      ))
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} 
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-black/10 z-20 ${entry.isUnsent ? 'text-bg' : 'text-ink'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className={`flex-1 text-lg leading-relaxed mb-6 whitespace-pre-wrap line-clamp-6 ${
                  entry.isUnsent ? 'font-mono italic opacity-90' : 'font-medium'
                }`}>
                  {entry.content}
                </p>
                
                <div className="mt-auto pt-4 border-t-2 border-current opacity-30 flex justify-between items-center">
                  <span className="font-mono text-xs font-bold tracking-widest">
                    {formatTime(entry.createdAt)}
                  </span>
                  {!entry.isUnsent && <span className="font-heading text-xl">#</span>}
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
