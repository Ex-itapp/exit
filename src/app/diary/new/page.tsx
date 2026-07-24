"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Lock, Send, ArrowLeft } from "lucide-react";
import { useDiary } from "@/lib/useDiary";

const MOODS = ["Numb", "Angry", "Nostalgic", "Relieved", "Spiraling"];

export default function NewDiaryEntry() {
  const navigate = useRouter();
  const { addEntry } = useDiary();
  const [isUnsentMode, setIsUnsentMode] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  
  const handleSave = () => {
    if (!content.trim()) return;
    addEntry(content, isUnsentMode ? [] : selectedMoods, isUnsentMode);
    navigate('/diary');
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200 min-h-[80vh] flex flex-col">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/diary')} className="px-0 hover:bg-transparent hover:opacity-70">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Diary
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase opacity-60">MODE:</span>
          <button 
            onClick={() => setIsUnsentMode(!isUnsentMode)}
            className={`px-3 py-1 text-xs font-bold font-mono tracking-widest uppercase border-2 border-ink rounded-full transition-colors ${
              isUnsentMode ? 'bg-accent text-bg' : 'bg-transparent text-ink hover:bg-ink/5'
            }`}
          >
            {isUnsentMode ? 'Unsent Letter' : 'Standard Log'}
          </button>
        </div>
      </header>

      <Card className={`flex-1 flex flex-col brutalist-shadow ${isUnsentMode ? "border-accent shadow-[8px_8px_0_var(--color-accent)]" : ""}`}>
        <CardHeader className={isUnsentMode ? "bg-ink text-bg border-b-accent" : ""}>
          <CardTitle className="text-2xl font-heading flex items-center gap-2">
            {isUnsentMode ? (
              <>
                <Lock className="w-6 h-6 text-accent" />
                <span className="text-accent">Letter You'll Never Send</span>
              </>
            ) : (
              "Log an Entry"
            )}
          </CardTitle>
          {isUnsentMode && (
            <p className="text-bg/70 text-sm font-mono mt-2">
              THIS STAYS HERE. NO SEND BUTTON EXISTS.
            </p>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4 pt-6 p-4 md:p-6 bg-bg">
          {!isUnsentMode && (
            <div className="flex flex-wrap gap-2 mb-2">
              {MOODS.map(mood => (
                <Badge 
                  key={mood}
                  variant={selectedMoods.includes(mood) ? "default" : "outline"} 
                  className="cursor-pointer hover:bg-ink hover:text-brand px-3 py-1.5"
                  onClick={() => toggleMood(mood)}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          )}
          
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isUnsentMode ? "Dear..." : "What's on your mind?"} 
            className={`flex-1 resize-none text-lg md:text-xl p-4 bg-transparent border-0 focus-visible:ring-0 ${isUnsentMode ? "placeholder:text-ink/30" : "placeholder:text-ink/30"}`}
            autoFocus
          />
          
          <div className="flex justify-end pt-4 border-t-2 border-ink/10">
            {isUnsentMode ? (
              <Button variant="danger" size="lg" onClick={handleSave} disabled={!content.trim()} className="brutalist-shadow-sm">
                <Lock className="w-5 h-5 mr-2" />
                Seal It Away
              </Button>
            ) : (
              <Button size="lg" onClick={handleSave} disabled={!content.trim()} className="brutalist-shadow-sm">
                <Send className="w-5 h-5 mr-2" />
                Save Entry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
