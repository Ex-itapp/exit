"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiary, DiaryEntry } from "@/lib/useDiary";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Share2, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { getMoodColor, getMoodTailwind, getMoodEmoji } from "@/lib/visualSystem";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";

export default function DiaryEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { allEntries, archivedEntries, archiveEntry, unarchiveEntry, deleteEntry } = useDiary();
  
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
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
    <div className="min-h-screen w-full flex flex-col bg-bg text-ink animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
      
      {/* Off-screen Export Node (Perfect 1080x1920 / 9:16) */}
      <div 
        ref={exportRef} 
        className="fixed pointer-events-none flex flex-col overflow-hidden"
        style={{ 
          top: '-9999px', 
          left: '-9999px', 
          width: '1080px', 
          height: '1920px', 
          backgroundColor: bgColor, 
          color: textColor,
          padding: '96px',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {/* Header */}
        <div className="flex w-full justify-between items-center z-10 pb-8" style={{ borderBottom: `4px solid ${textColor}` }}>
          <span className="text-[32px] font-mono opacity-50 uppercase tracking-widest">
            {dateStr}
          </span>
          {primaryMood !== 'DEFAULT' && (
             <span className="text-[32px] font-mono opacity-50 uppercase tracking-widest">
               {primaryMood}
             </span>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full">
          {/* Subtle Watermark */}
          {primaryMood !== 'DEFAULT' && (
            <div 
              className="absolute pointer-events-none opacity-5 font-bold"
              style={{ fontSize: '300px', lineHeight: 0.8, letterSpacing: '-0.05em', whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', zIndex: 0 }}
            >
              {primaryMood}
            </div>
          )}
          <p className="text-[100px] font-voice leading-[1.2] font-medium tracking-tight text-center z-10 w-full px-12" style={{ wordWrap: 'break-word' }}>
            {entry.content}
          </p>
        </div>

        {/* Footer Branding */}
        <div className="w-full flex justify-center mt-auto z-10">
          <div className="flex items-center px-10 py-4 border-[4px]" style={{ borderColor: textColor, backgroundColor: bgColor }}>
             <span className="text-[32px] font-black tracking-[8px] uppercase font-sans whitespace-nowrap">
               EX-IT.
             </span>
          </div>
        </div>
      </div>

      {/* Visible Header */}
      <header className="px-4 py-4 sm:px-8 flex items-center justify-between z-10 sticky top-0 bg-bg border-b-2 border-ink/10">
        <button 
          onClick={() => router.push("/diary")}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 font-mono text-[10px] sm:text-xs font-bold opacity-60 tracking-widest uppercase">
          <span>{dateStr}</span>
          {primaryMood !== 'DEFAULT' && (
            <>
              <span className="opacity-50">•</span>
              <span style={{ color: defaultBgColor }} className="opacity-100">{primaryMood}</span>
            </>
          )}
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center p-2 hover:bg-ink/5 rounded-full transition-colors"
          title="Share/Export as Quote Card"
        >
          {isExporting ? <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin"></div> : <Share2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden max-w-5xl mx-auto w-full">

        <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
          <p className="text-2xl sm:text-4xl md:text-5xl font-voice leading-relaxed sm:leading-relaxed md:leading-relaxed text-ink/90 whitespace-pre-wrap">
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

      <BrandMark className="opacity-10 pointer-events-none" />

      {/* Action Footer */}
      <footer className="px-4 py-6 sm:px-8 border-t-2 border-ink/10 flex flex-col sm:flex-row items-center justify-center gap-4 sticky bottom-0 z-10 bg-bg">
        <div className="flex w-full sm:w-auto gap-3 items-center">
          <Button 
            onClick={handleArchiveToggle}
            variant="outline"
            className="flex-1 sm:flex-none h-14 px-6 border-2 rounded-none hover:-translate-y-1 transition-transform border-ink text-ink bg-transparent"
          >
            {isArchived ? (
              <><ArchiveRestore className="w-5 h-5 mr-2" /> UNARCHIVE</>
            ) : (
              <><Archive className="w-5 h-5 mr-2" /> ARCHIVE</>
            )}
          </Button>
          <Button 
            onClick={handleDelete}
            variant="destructive"
            className="flex-1 sm:flex-none h-14 px-6 border-2 border-transparent rounded-none hover:border-destructive bg-transparent text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 mr-2" /> DELETE
          </Button>
        </div>
      </footer>
    </div>
  );
}
