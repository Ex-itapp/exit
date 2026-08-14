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
  const [ogUrl, setOgUrl] = useState<string | null>(null);

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
            tag: entry.type === 'flag' ? 'Red Flag' : entry.isUnsent ? 'Unsent' : 'Diary'
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
          {ogUrl ? (
            <div className="w-full">
              <img src={ogUrl} alt="Diary Share Card" className="w-full h-auto border-4 border-ink brutalist-shadow-sm mb-6" />
              <a 
                href={ogUrl} 
                download={`exit_${entry.type}_${new Date().getTime()}.png`}
                className="w-full flex items-center justify-center gap-2 h-14 bg-brand text-ink border-4 border-ink font-heading uppercase text-sm brutalist-shadow-sm hover:-translate-y-1 transition-transform"
              >
                <Download className="w-5 h-5" /> Save Image
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-ink text-white rounded-full flex items-center justify-center border-4 border-ink mb-4">
                {entry.type === 'flag' ? <FlagIcon className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
              </div>
              <h3 className="font-heading text-2xl uppercase tracking-tighter">Ready to Share?</h3>
              <p className="font-mono text-sm opacity-80">
                Generate a beautifully formatted typography card of your entry, perfect for Instagram Stories.
              </p>
              <Button 
                onClick={handleGenerate}
                disabled={isDownloading}
                className="w-full h-14 font-heading text-lg tracking-widest uppercase bg-ink text-bg hover:bg-ink/80 border-0 flex items-center gap-2 group"
              >
                {isDownloading ? (
                  "Generating..."
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Generate Card
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
