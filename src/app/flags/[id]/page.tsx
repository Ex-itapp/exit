"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlags, Flag } from "@/lib/useFlags";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Share2, Archive, ArchiveRestore, Trash2, Flag as FlagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FlagEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { allFlags, archivedFlags, archiveFlag, unarchiveFlag, deleteFlag } = useFlags();
  
  const [flag, setFlag] = useState<Flag | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    if (id && allFlags.length > 0) {
      const found = allFlags.find((f) => f.id === id);
      if (found) {
        setFlag(found);
        setIsArchived(archivedFlags.some(f => f.id === id));
      } else {
        router.push("/diary");
      }
    }
  }, [id, allFlags, archivedFlags, router]);

  if (!flag) return null;

  const handleArchiveToggle = () => {
    if (isArchived) {
      unarchiveFlag(flag.id);
    } else {
      archiveFlag(flag.id);
      router.push("/diary");
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this flag? This cannot be undone.")) {
      deleteFlag(flag.id);
      router.push("/diary");
    }
  };

  const dateStr = new Date(flag.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).toUpperCase();

  const bgColor = "#FF3366"; // Standard accent color for flags
  const textColor = "#111111"; // Ink
  const cardColor = "#F5EFE6"; // Offwhite

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
      link.download = `exit_flag_${flag.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ backgroundColor: bgColor, color: cardColor }}>
      
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
          color: cardColor,
          padding: '96px',
          fontFamily: 'var(--font-inter)'
        }}
      >
        {/* Header */}
        <div className="flex w-full justify-between items-center z-10 pb-8" style={{ borderBottom: `4px solid ${cardColor}` }}>
          <span className="text-[32px] font-mono opacity-50 uppercase tracking-widest">
            {dateStr}
          </span>
          <div className="flex items-center gap-4 opacity-50">
             <FlagIcon className="w-8 h-8" />
             <span className="text-[32px] font-mono uppercase tracking-widest">
               {flag.category}
             </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full">
          {/* Subtle Watermark */}
          <div 
            className="absolute pointer-events-none font-bold opacity-10"
            style={{ fontSize: '200px', lineHeight: 0.8, letterSpacing: '-0.05em', whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', zIndex: 0 }}
          >
            RED FLAG
          </div>

          <div className="relative z-10 w-[90%] text-center bg-white p-16 border-[12px] brutalist-shadow-lg" style={{ borderColor: textColor, color: textColor, boxShadow: `24px 24px 0px ${textColor}` }}>
            <div className="flex justify-center mb-12">
               <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor, color: cardColor }}>
                 <FlagIcon className="w-12 h-12" />
               </div>
            </div>
            <p className="text-[80px] font-serif leading-[1.2] font-medium tracking-tight" style={{ wordWrap: 'break-word' }}>
              {flag.content}
            </p>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="w-full flex justify-center pb-12 z-10 mt-12">
          <div className="flex items-center px-16 py-8 border-[8px]" style={{ borderColor: cardColor, backgroundColor: bgColor, boxShadow: `16px 16px 0px ${cardColor}` }}>
             <div className="w-12 h-12 border-[8px] mr-8 -rotate-12" style={{ backgroundColor: '#FEFF9C', borderColor: '#111111' }} />
             <span className="text-[64px] font-black tracking-[8px] uppercase font-sans">
               EX-IT.
             </span>
          </div>
        </div>
      </div>

      {/* Visible Header */}
      <header className="px-4 py-6 sm:px-8 flex items-center justify-between z-10 sticky top-0" style={{ borderBottom: `2px solid ${cardColor}`, backgroundColor: bgColor }}>
        <button 
          onClick={() => router.push("/diary")}
          className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 font-mono text-xs font-bold opacity-50 tracking-widest uppercase">
          <span>{dateStr}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <FlagIcon className="w-3 h-3" />
            <span>{flag.category}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Full Page Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden">
        {/* Subtle Watermark */}
        <div 
          className="absolute pointer-events-none font-bold opacity-10"
          style={{ fontSize: '20vw', lineHeight: 0.8, letterSpacing: '-0.05em', whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', zIndex: 0 }}
        >
          RED FLAG
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-12 bg-white p-12 sm:p-20 border-8 brutalist-shadow-lg" style={{ borderColor: textColor, color: textColor }}>
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor, color: cardColor }}>
               <FlagIcon className="w-8 h-8" />
             </div>
          </div>
          <p className="text-3xl sm:text-5xl md:text-6xl font-serif leading-tight sm:leading-tight md:leading-tight font-medium tracking-tight">
            {flag.content}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-12">
            <span 
              className="px-6 py-2 rounded-full font-mono text-xs sm:text-sm font-bold uppercase tracking-widest"
              style={{ backgroundColor: textColor, color: cardColor }}
            >
              CATEGORY: {flag.category}
            </span>
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
      <footer className="px-4 py-6 sm:px-8 border-t-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10" style={{ borderColor: cardColor, backgroundColor: bgColor }}>
        <div className="flex w-full sm:w-auto gap-3 items-center">
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none h-14 px-8 brutalist-shadow-sm border-2 rounded-none hover:-translate-y-1 transition-transform"
            style={{ backgroundColor: cardColor, color: textColor, borderColor: cardColor }}
          >
            {isExporting ? (
               <><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div> EXPORTING...</>
            ) : (
               <><Share2 className="w-5 h-5 mr-2" /> EXPORT FLAG</>
            )}
          </Button>
          <Button 
            onClick={handleArchiveToggle}
            variant="outline"
            className="flex-1 sm:flex-none h-14 px-6 border-2 rounded-none hover:-translate-y-1 transition-transform"
            style={{ borderColor: cardColor, color: cardColor, backgroundColor: 'transparent' }}
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
          className="w-full sm:w-auto h-14 px-6 border-2 border-transparent rounded-none hover:border-destructive bg-transparent hover:bg-destructive/10 text-white"
        >
          <Trash2 className="w-5 h-5 mr-2" /> PERMANENT DELETE
        </Button>
      </footer>
    </div>
  );
}
