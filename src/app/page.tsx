"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { BookOpen, Clock, CheckCircle, Flag, Zap } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { CalendarTile } from "@/components/CalendarTile";
import { RedFlagTile } from "@/components/RedFlagTile";

export default function Home() {
  const navigate = useRouter();
  const { appMode } = useUser();
  const { checkins, addCheckin, addFollowUp } = useCheckins();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const [checkinText, setCheckinText] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get today's checkin if it exists
  const todayCheckin = checkins.find(c => {
    return new Date(c.createdAt).toDateString() === new Date().toDateString();
  });

  const handleCheckin = async () => {
    if (!checkinText.trim()) return;
    setIsLoading(true);
    
    try {
      // Build Context Block
      const recentEntries = entries.slice(0, 5).map((e, i) => 
        `${i + 1}. [${e.moods.join(', ')}] ${e.content.substring(0, 150)}${e.content.length > 150 ? '...' : ''}`
      ).join('\n');

      const recentFlags = flags
        .filter(f => (new Date().getTime() - new Date(f.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000)
        .map(f => f.category)
        .join(', ') || 'none logged';

      const yesterdayCheckin = checkins.find(c => {
        const checkinDate = new Date(c.createdAt);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return checkinDate.toDateString() === yesterday.toDateString();
      });
      const yesterdaySummary = yesterdayCheckin ? yesterdayCheckin.content.substring(0, 100) : 'no entry yesterday';

      const contextBlock = `Recent diary entries (most recent first):
${recentEntries || 'none'}

Red flags logged this week: ${recentFlags}

Yesterday's check-in summary: ${yesterdaySummary}`;

      // Call API
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextBlock, userText: checkinText })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      addCheckin(checkinText, data.classifierResult, data.aiReply, data.crisisPathTriggered);
      setCheckinText("");
      setCheckinDone(true);
    } catch (error: any) {
      console.error(error);
      alert(`AI Check-In Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
              {todayCheckin || checkinDone ? (
                <Badge variant="positive" className="border-bg">Logged</Badge>
              ) : (
                <Badge variant="accent" className="animate-pulse border-bg">Required</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 bg-bg overflow-y-auto">
            {todayCheckin || checkinDone ? (
              <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500 space-y-4">
                {/* User's Original Text */}
                <div className="bg-white border-2 border-ink p-4 brutalist-shadow-sm">
                  <p className="font-mono text-xs text-ink/50 uppercase font-bold mb-2">Your Check-In</p>
                  <p className="font-sans font-medium text-ink">{todayCheckin?.content || checkinText}</p>
                </div>

                {/* AI Reply / Crisis Response */}
                {(todayCheckin?.aiReply) && (
                  todayCheckin.crisisPathTriggered ? (
                    <div className="bg-ink text-bg border-2 border-ink p-6 brutalist-shadow-sm space-y-4">
                      <p className="font-sans text-lg font-bold">
                        It sounds like you're carrying something heavy right now, and I want to take that seriously.
                      </p>
                      <p className="font-sans text-base">
                        I'm not the right support for this moment — please reach out to a crisis line or someone you trust right now:
                      </p>
                      <div className="space-y-2 py-2">
                        <a href="tel:9152987821" className="block w-full bg-bg text-ink p-3 text-center font-bold font-mono text-lg brutalist-shadow-sm active:translate-y-1">iCall: 9152987821</a>
                        <a href="tel:18602662345" className="block w-full bg-bg text-ink p-3 text-center font-bold font-mono text-lg brutalist-shadow-sm active:translate-y-1">Vandrevala: 1860-2662-345</a>
                        <a href="tel:112" className="block w-full bg-bg text-ink p-3 text-center font-bold font-mono text-lg brutalist-shadow-sm active:translate-y-1">Emergency: 112</a>
                      </div>
                      <p className="font-sans text-base font-medium">You don't have to handle this alone.</p>
                    </div>
                  ) : (
                    <div className="bg-brand border-2 border-ink p-6 brutalist-shadow-sm relative">
                      <div className="absolute top-0 left-0 w-full h-2 bg-ink/10" />
                      <p className="font-mono text-xs text-ink/50 uppercase font-bold mb-4">Therapist Note</p>
                      
                      <div className="font-mono text-sm leading-relaxed text-ink space-y-4">
                        {todayCheckin.aiReply.split('\n\n').map((paragraph, i, arr) => (
                          <p key={i} className={i === arr.length - 1 ? "font-bold text-base mt-6" : ""}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* Follow Up Section */}
                {(todayCheckin?.aiReply && !todayCheckin.crisisPathTriggered) && (
                  todayCheckin.followUpAnswer ? (
                    <div className="bg-white border-2 border-ink p-4 brutalist-shadow-sm">
                      <p className="font-mono text-xs text-ink/50 uppercase font-bold mb-2">Your Answer</p>
                      <p className="font-sans font-medium text-ink">{todayCheckin.followUpAnswer}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-4">
                      <Textarea 
                        placeholder="Answer the question..." 
                        className="w-full min-h-[100px] resize-none border-ink"
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                      />
                      <Button 
                        className="w-full h-12 text-lg brutalist-shadow-sm hover:-translate-y-0.5 transition-transform"
                        disabled={!followUpText.trim()}
                        onClick={() => {
                          if (todayCheckin.id) {
                            addFollowUp(todayCheckin.id, followUpText);
                          }
                        }}
                      >
                        Complete Session
                      </Button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full">
                <p className="text-sm font-medium">Any quick thoughts you want to drop?</p>
                <Textarea 
                  placeholder="Just a quick note..." 
                  className="flex-1 min-h-[120px] resize-none border-ink"
                  value={checkinText}
                  onChange={(e) => setCheckinText(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  className="w-full h-12 text-lg brutalist-shadow-sm hover:-translate-y-0.5 transition-transform" 
                  onClick={handleCheckin} 
                  disabled={!checkinText.trim() || isLoading}
                >
                  {isLoading ? "Analyzing..." : "Log Check-in"}
                </Button>
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
            onClick={() => navigate.push('/diary')}
          >
            <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Full Diary</span>
          </Button>
          
          {appMode !== 'no_contact' ? (
            <Button 
              className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-purple text-ink hover:bg-purple/90 border-4 border-ink"
              onClick={() => navigate.push('/flags')}
            >
              <Flag className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Log Red Flag</span>
            </Button>
          ) : (
            <Button 
              className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-accent text-bg hover:bg-accent/90 border-4 border-ink"
              onClick={() => navigate.push('/streak')}
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Your Streak</span>
            </Button>
          )}

          <Button 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-brand text-ink hover:bg-brand/90 border-4 border-ink"
            onClick={() => navigate.push('/timeline')}
          >
            <Clock className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-sm md:text-base font-bold font-mono tracking-widest uppercase">Timeline</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
