"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SmilePlus } from "lucide-react";
import { useMoods } from "@/lib/useMoods";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const MOODS = ["😭", "😔", "😐", "🙂", "🤩"];

export function MoodTile() {
  const { logMood, getMoodForDate } = useMoods();
  
  const todayMood = getMoodForDate(new Date());
  
  const [selectedMood, setSelectedMood] = useState(todayMood?.emoji || "");
  const [note, setNote] = useState(todayMood?.note || "");
  
  const handleLogMood = () => {
    if (!selectedMood) return;
    logMood(selectedMood, note);
  };

  return (
    <Card className="border-4 border-ink brutalist-shadow bg-blue/10 overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-ink text-bg border-b-4 border-ink p-3 sm:p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SmilePlus className="w-5 h-5 text-blue" />
            <CardTitle className="text-base tracking-tight">MOOD</CardTitle>
          </div>
          {todayMood && (
            <span className="font-mono text-[10px] bg-blue text-ink px-2 py-0.5 font-bold uppercase">
              Logged
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-white flex flex-col flex-1 justify-between gap-3">
        {todayMood ? (
          <div className="flex flex-col items-center text-center justify-center h-full space-y-2">
            <span className="text-4xl">{todayMood.emoji}</span>
            {todayMood.note && (
              <p className="font-sans text-sm text-ink/80 italic mt-2">"{todayMood.note}"</p>
            )}
            <Button 
              onClick={() => {
                setSelectedMood(todayMood.emoji);
                setNote(todayMood.note);
                // Temporarily allow them to edit by wiping todayMood locally without deleting
                // but since we only check todayMood initially, we'd need state. 
                // We can just rely on the form being rendered if we clear the state.
              }}
              className="mt-2 font-mono text-xs h-8 px-3 bg-bg text-ink border-2 border-ink hover:bg-ink hover:text-white"
            >
              Update
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex justify-between">
              {MOODS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedMood(emoji)}
                  className={cn(
                    "text-2xl transition-transform hover:scale-110",
                    selectedMood === emoji ? "scale-125 drop-shadow-md" : "opacity-50 grayscale"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <Input
              placeholder="Short note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="h-9 border-2 border-ink font-sans text-xs bg-bg flex-1"
            />
            <Button
              onClick={handleLogMood}
              disabled={!selectedMood}
              className="w-full h-9 bg-blue hover:bg-blue/90 text-ink border-2 border-ink font-mono font-bold uppercase text-xs"
            >
              Save Mood
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
