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
  
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customBg, setCustomBg] = useState<string | null>(null);
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
  const defaultBgColor = getMoodColor(primaryMood);
  const bgColor = customBg || defaultBgColor;
  const textColor = (bgColor.toLowerCase() === '#111111' || bgColor.toLowerCase() === '#8a2be2' || bgColor.toLowerCase() === '#ff3366' || bgColor.toLowerCase() === '#000000') ? '#F5EFE6' : '#111111';

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const domtoimage = (await import('dom-to-image-more')).default;
      const dataUrl = await domtoimage.toPng(exportRef.current, {
        quality: 1,
        bgcolor: bgColor,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = `exit_diary_${entry.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ backgroundColor: bgColor, color: textColor }}>
      
      <div ref={exportRef} className="flex-1 flex flex-col w-full relative bg-inherit text-inherit">
        {/* Header */}
        <header className="px-4 py-6 sm:px-8 flex items-center justify-between z-10 sticky top-0" style={{ borderBottom: `4px solid ${textColor}`, backgroundColor: bgColor }}>
        <button 
          onClick={() => router.push("/diary")}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Logbook
        </button>
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-bold opacity-70">
            {dateStr}
          </div>
          {primaryMood !== 'DEFAULT' && (
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4"
              style={{ borderColor: textColor, color: textColor, backgroundColor: 'transparent' }}
            >
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center leading-tight px-1">
                {primaryMood}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden">
        {/* Subtle Watermark - Only show if mood is genuinely selected */}
        {primaryMood !== 'DEFAULT' && (
          <div 
            className="absolute pointer-events-none opacity-5 font-bold"
            style={{ fontSize: '30vw', lineHeight: 0.8, letterSpacing: '-0.05em', whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', zIndex: 0 }}
          >
            {primaryMood}
          </div>
        )}

        <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
          <p className="text-3xl sm:text-5xl md:text-6xl font-serif leading-tight sm:leading-tight md:leading-tight font-medium tracking-tight">
            {entry.content}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-12">
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
      </div>

      {/* Action Footer */}
      <footer className="px-4 py-6 sm:px-8 border-t-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10" style={{ borderColor: textColor, backgroundColor: bgColor }}>
        <div className="flex w-full sm:w-auto gap-3 items-center">
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-14 px-8 brutalist-shadow-sm border-2 rounded-none hover:-translate-y-1 transition-transform"
            style={{ backgroundColor: textColor, color: bgColor, borderColor: textColor }}
          >
            {isExporting ? (
               <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div> EXPORTING...</>
            ) : (
               <><Share2 className="w-5 h-5 mr-2" /> EXPORT ENTRY</>
            )}
          </Button>
          <div className="flex items-center justify-center border-2 px-3 h-14" style={{ borderColor: textColor, backgroundColor: 'transparent' }}>
            <span className="font-mono text-xs font-bold uppercase mr-2 opacity-70">BG Color</span>
            <input 
              type="color" 
              value={bgColor} 
              onChange={(e) => setCustomBg(e.target.value)}
              className="w-6 h-6 rounded-full cursor-pointer p-0 border-none"
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
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
    </div>
  );
}
