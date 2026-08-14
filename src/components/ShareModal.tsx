import { useRef, useState, useEffect } from "react";
import domtoimage from "dom-to-image-more";
import { X, Download, Lock, Flag as FlagIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { getMoodColor } from "@/lib/visualSystem";

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
  const [ogUrl, setOgUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState(() => entry ? getMoodColor(entry.tags[0] || 'DEFAULT') : '#F5EFE6');

  if (!entry) return null;

  const handleGenerate = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/render-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'diary-share',
          data: {
            content: entry.content,
            date: formatTime(entry.createdAt),
            mood: entry.tags[0] || 'default',
            tag: entry.type === 'flag' ? 'Red Flag' : entry.isUnsent ? 'Unsent' : 'Diary',
            bgColor: bgColor
          }
        })
      });
      const blob = await res.blob();
      setOgUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgColor]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-bg border-4 border-ink brutalist-shadow flex flex-col max-h-[90vh] relative">
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 w-10 h-10 bg-accent text-bg border-2 border-ink flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center">
          {isDownloading && !ogUrl ? (
            <div className="flex flex-col items-center justify-center flex-1 h-64 space-y-4">
               <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
               <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">Generating Canvas...</p>
            </div>
          ) : (
            <div className="w-full">
              {ogUrl && (
                <div className="relative mb-6">
                  <img src={ogUrl} alt="Diary Share Card" className={`w-full h-auto border-4 border-ink brutalist-shadow-sm transition-opacity ${isDownloading ? 'opacity-50' : 'opacity-100'}`} />
                  {isDownloading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex items-center justify-between border-2 border-ink p-3 bg-white">
                  <span className="font-mono text-xs font-bold uppercase">Background Color</span>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-ink cursor-pointer p-0 overflow-hidden"
                  />
                </div>
                <a 
                  href={ogUrl || '#'} 
                  download={`exit_${entry.type}_${new Date().getTime()}.png`}
                  className={`w-full flex items-center justify-center gap-2 h-14 bg-brand text-ink border-4 border-ink font-heading uppercase text-sm brutalist-shadow-sm transition-transform ${isDownloading ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-1'}`}
                >
                  <Download className="w-5 h-5" /> Save Image
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
