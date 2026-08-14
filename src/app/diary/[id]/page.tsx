"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiary, DiaryEntry } from "@/lib/useDiary";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Share2, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";
import { getMoodColor, getMoodTailwind } from "@/lib/visualSystem";
import { cn } from "@/lib/utils";

export default function DiaryEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { allEntries, archivedEntries, archiveEntry, unarchiveEntry, deleteEntry } = useDiary();
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    if (id && allEntries.length > 0) {
      const found = allEntries.find((e) => e.id === id);
      if (found) {
        setEntry(found);
        setIsArchived(archivedEntries.some(e => e.id === id));
      } else {
        router.push("/diary");
      }
    }
  }, [id, allEntries, archivedEntries, router]);

  if (!entry) return null;

  const handleArchiveToggle = () => {
    if (isArchived) {
      unarchiveEntry(entry.id);
    } else {
      archiveEntry(entry.id);
      router.push("/diary");
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this entry? This cannot be undone.")) {
      deleteEntry(entry.id);
      router.push("/diary");
    }
  };

  const dateStr = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).toUpperCase();

  const primaryMood = entry.moods?.[0] || 'DEFAULT';
  const bgColor = getMoodColor(primaryMood);
  const textColor = (bgColor === '#111111' || bgColor === '#8A2BE2') ? '#F5EFE6' : '#111111';

  return (
    <div className="min-h-screen w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ backgroundColor: bgColor, color: textColor }}>
      
      {/* Header */}
      <header className="px-4 py-6 sm:px-8 flex items-center justify-between z-10 sticky top-0" style={{ borderBottom: `4px solid ${textColor}`, backgroundColor: bgColor }}>
        <button 
          onClick={() => router.push("/diary")}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Logbook
        </button>
        <div className="font-mono text-sm font-bold opacity-70">
          {dateStr}
        </div>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden">
        {/* Subtle Watermark */}
        <div 
          className="absolute pointer-events-none opacity-5 font-bold"
          style={{ fontSize: '30vw', lineHeight: 0.8, letterSpacing: '-0.05em', whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', zIndex: 0 }}
        >
          {primaryMood}
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
          <span className="text-[8rem] sm:text-[12rem] font-serif leading-[0] opacity-30 block -mb-16">"</span>
          <p className="text-3xl sm:text-5xl md:text-6xl font-serif leading-tight sm:leading-tight md:leading-tight font-medium tracking-tight">
            {entry.content}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-12">
            {entry.moods.map(mood => (
              <span 
                key={mood} 
                className="px-6 py-2 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-widest"
                style={{ border: `2px solid ${textColor}`, color: textColor }}
              >
                {mood}
              </span>
            ))}
            {entry.isUnsent && (
              <span 
                className="px-6 py-2 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-widest"
                style={{ backgroundColor: textColor, color: bgColor }}
              >
                UNSENT MESSAGE
              </span>
            )}
            {isArchived && (
              <span 
                className="px-6 py-2 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-widest bg-destructive text-white"
              >
                ARCHIVED
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Action Footer */}
      <footer className="px-4 py-6 sm:px-8 border-t-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10" style={{ borderColor: textColor, backgroundColor: bgColor }}>
        <div className="flex w-full sm:w-auto gap-3">
          <Button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-none h-14 px-8 brutalist-shadow-sm border-2 rounded-none hover:-translate-y-1 transition-transform"
            style={{ backgroundColor: textColor, color: bgColor, borderColor: textColor }}
          >
            <Share2 className="w-5 h-5 mr-2" /> SHARE ENTRY
          </Button>
          <Button 
            onClick={handleArchiveToggle}
            variant="outline"
            className="flex-1 sm:flex-none h-14 px-6 border-2 rounded-none hover:-translate-y-1 transition-transform"
            style={{ borderColor: textColor, color: textColor, backgroundColor: 'transparent' }}
          >
            {isArchived ? (
              <><ArchiveRestore className="w-5 h-5 mr-2" /> UNARCHIVE</>
            ) : (
              <><Archive className="w-5 h-5 mr-2" /> ARCHIVE</>
            )}
          </Button>
        </div>
        
        <Button 
          onClick={handleDelete}
          variant="destructive"
          className="w-full sm:w-auto h-14 px-6 border-2 border-transparent rounded-none hover:border-destructive bg-transparent text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-5 h-5 mr-2" /> PERMANENT DELETE
        </Button>
      </footer>

      {isShareModalOpen && (
        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)}
          entry={{
            type: 'diary',
            id: entry.id,
            content: entry.content,
            createdAt: entry.createdAt,
            tags: entry.moods,
            isUnsent: entry.isUnsent
          }}
        />
      )}
    </div>
  );
}
