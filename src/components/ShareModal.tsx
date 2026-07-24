import { useRef, useState } from "react";
import domtoimage from "dom-to-image-more";
import { X, Download, Lock, Flag as FlagIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export interface ShareEntryData {
  type: 'diary' | 'flag';
  id: string;
  content: string;
  createdAt: string;
  tags: string[];
  isUnsent?: boolean;
}

interface ShareModalProps {
  entry: ShareEntryData | null;
  onClose: () => void;
}

export function ShareModal({ entry, onClose }: ShareModalProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!entry) return null;

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsDownloading(true);
    
    try {
      const bgColor = entry.type === 'flag' ? '#ffffff' : entry.isUnsent ? '#111111' : '#f4f1ea';
      
      const dataUrl = await domtoimage.toPng(exportRef.current, {
        quality: 1,
        scale: 3, // High resolution output
        bgcolor: bgColor
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `unsent_${entry.type}_${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-bg border-[4px] border-ink brutalist-shadow flex flex-col max-h-[90vh] relative">
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 w-10 h-10 bg-accent text-bg border-2 border-ink flex items-center justify-center rounded-full hover:scale-110 transition-transform z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center">
          {/* THE EXPORTABLE SQUARE */}
          <div 
            ref={exportRef}
            className={`w-[320px] h-[320px] md:w-[360px] md:h-[360px] shrink-0 p-6 flex flex-col relative overflow-hidden ${
              entry.type === 'flag' 
                ? 'bg-white border-[4px] border-accent shadow-[8px_8px_0_#FF3366]' 
                : entry.isUnsent 
                  ? 'bg-ink text-bg border-[4px] border-ink' 
                  : 'bg-[#f4f1ea] border-[4px] border-ink shadow-[8px_8px_0_#111111]'
            }`}
          >
            {/* Background Pattern for standard diary entries */}
            {entry.type === 'diary' && !entry.isUnsent && (
              <div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(#111111 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
            )}
            
            {/* Header / Tags */}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex flex-wrap gap-2">
                {entry.isUnsent ? (
                  <Badge variant="accent" className="border-bg bg-accent text-bg font-bold">
                    <Lock className="w-3 h-3 mr-1 inline-block" /> Sealed
                  </Badge>
                ) : entry.type === 'flag' ? (
                  <Badge variant="accent" className="font-bold text-[10px] uppercase tracking-widest">{entry.tags[0]}</Badge>
                ) : (
                  entry.tags.map(mood => (
                    <Badge key={mood} variant="outline" className={`border-ink bg-white/80 font-bold text-[10px]`}>
                      {mood}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Content */}
            <p className={`flex-1 overflow-hidden relative z-10 text-base md:text-lg leading-relaxed whitespace-pre-wrap ${
              entry.isUnsent ? 'font-mono italic opacity-90' : 'font-medium'
            } ${entry.type === 'flag' ? 'text-ink' : ''}`}>
              {entry.content.length > 250 ? entry.content.substring(0, 250) + "..." : entry.content}
            </p>

            {/* Footer / Branding */}
            <div className="mt-4 pt-4 border-t-[3px] opacity-40 flex justify-between items-center relative z-10 border-current">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                {formatTime(entry.createdAt)}
              </span>
              <div className="flex items-center gap-1 font-heading text-lg tracking-tighter">
                UNSENT {entry.type === 'flag' ? <FlagIcon className="w-3 h-3 inline" /> : '#'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t-[4px] border-ink bg-white">
          <Button 
            className="w-full h-12 text-lg brutalist-shadow-sm group bg-brand hover:bg-brand/90 text-ink border-ink"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className={`w-5 h-5 mr-2 ${isDownloading ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
            {isDownloading ? 'GENERATING POST...' : 'DOWNLOAD & SHARE'}
          </Button>
        </div>
      </div>
    </div>
  );
}
