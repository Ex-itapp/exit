"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { BookOpen, Clock, CheckCircle, Flag } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { CalendarTile } from "@/components/CalendarTile";
import { RedFlagTile } from "@/components/RedFlagTile";

export default function Home() {
  const navigate = useRouter();
  const { appMode } = useUser();
  const { addCheckin } = useCheckins();
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);

  const handleCheckin = () => {
    if (!checkinText.trim()) return;
    addCheckin(checkinText);
    setCheckinText("");
    setCheckinDone(true);
    setTimeout(() => setCheckinDone(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150">
      
      {/* HERO SECTION: Calendar & Daily Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 pt-4 items-start max-w-6xl mx-auto w-full">
        {/* Conditional Hero Tile */}
        <div className="flex justify-center w-full lg:w-[320px] shrink-0">
          {appMode === 'no_contact' ? <CalendarTile /> : <RedFlagTile />}
        </div>

        {/* DAILY MISSION */}
        <Card className="flex flex-col border-[4px] h-full shadow-none brutalist-shadow-sm w-full">
          <CardHeader className="bg-ink text-bg border-b-[4px] border-ink p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">DAILY MISSION</CardTitle>
              {checkinDone ? (
                <Badge variant="positive" className="border-bg">Logged</Badge>
              ) : (
                <Badge variant="accent" className="animate-pulse border-bg">Required</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 bg-bg">
            {checkinDone ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-6 text-center">
                <CheckCircle className="w-10 h-10 text-positive" />
                <p className="font-heading uppercase">Check-in Complete.</p>
                <p className="font-mono text-xs opacity-70">Good job showing up for yourself today.</p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full">
                <p className="text-sm font-medium">Any quick thoughts you want to drop?</p>
                <Textarea 
                  placeholder="Just a quick note..." 
                  className="flex-1 min-h-[120px] resize-none border-ink"
                  value={checkinText}
                  onChange={(e) => setCheckinText(e.target.value)}
                />
                <Button className="w-full h-12 text-lg brutalist-shadow-sm hover:-translate-y-0.5 transition-transform" onClick={handleCheckin} disabled={!checkinText.trim()}>Log Check-in</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* THE ARSENAL */}
      <div className="space-y-4 pt-4 max-w-6xl mx-auto w-full">
        <h3 className="font-heading tracking-tighter text-2xl uppercase">THE ARSENAL</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="secondary" 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-blue text-ink hover:bg-blue/90 border-4 border-ink"
            onClick={() => navigate('/diary')}
          >
            <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Full Diary</span>
          </Button>
          
          <Button 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-purple text-ink hover:bg-purple/90 border-4 border-ink"
            onClick={() => navigate('/flags')}
          >
            <Flag className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Log Red Flag</span>
          </Button>

          <Button 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-brand text-ink hover:bg-brand/90 border-4 border-ink"
            onClick={() => navigate('/timeline')}
          >
            <Clock className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Timeline</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
