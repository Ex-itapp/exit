"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { BookOpen, Clock, CheckCircle, Flag, Zap, MessageSquare } from "lucide-react";
import { useCheckins } from "@/lib/useCheckins";
import { useUser } from "@/lib/useUser";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { CalendarTile } from "@/components/CalendarTile";
import { RedFlagTile } from "@/components/RedFlagTile";
import { AnchorModal } from "@/components/AnchorModal";
import { Anchor } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const navigate = useRouter();
  const { appMode, userName, hasCompletedOnboarding } = useUser();
  const { checkins, addCheckin } = useCheckins();
  const { entries } = useDiary();
  const { flags } = useFlags();
  const [checkinText, setCheckinText] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasCompletedOnboarding) {
      const isDone = localStorage.getItem('unsent_onboarding_done_clean');
      if (isDone !== 'true') {
        navigate.push('/onboarding');
      }
    }
  }, [hasCompletedOnboarding, navigate]);

  // Get today's checkin if it exists
  const todayCheckin = checkins.find(c => {
    return new Date(c.createdAt).toDateString() === new Date().toDateString();
  });

  const handleCheckin = () => {
    if (!checkinText.trim()) return;
    addCheckin(checkinText);
    setCheckinText("");
    setCheckinDone(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-20">
      
      {/* Personalized Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 max-w-6xl mx-auto w-full border-b-4 border-ink pb-4">
        <div>
          <span className="font-mono text-xs font-bold uppercase bg-brand text-ink px-2 py-0.5 border border-ink inline-block mb-1">
            Sanctuary Active
          </span>
          <h1 className="text-3xl md:text-4xl font-heading tracking-tighter uppercase">
            WELCOME BACK, {userName}
          </h1>
        </div>
        <Button 
          variant="secondary"
          onClick={() => setShowAnchor(true)}
          className="bg-white hover:bg-white/90 text-ink border-2 border-ink brutalist-shadow-sm h-12 px-4 shrink-0"
        >
          <Anchor className="w-5 h-5 mr-2 text-brand animate-pulse" />
          My Personal Anchor
        </Button>
      </div>

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
                <div className="bg-white border-2 border-ink p-4 brutalist-shadow-sm h-full">
                  <p className="font-mono text-xs text-ink/50 uppercase font-bold mb-2">Your Check-In</p>
                  <p className="font-sans font-medium text-ink">{todayCheckin?.content || checkinText}</p>
                </div>
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
                <Button 
                  className="w-full h-12 text-lg brutalist-shadow-sm hover:-translate-y-0.5 transition-transform" 
                  onClick={handleCheckin} 
                  disabled={!checkinText.trim()}
                >
                  Log Check-in
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* THE ARSENAL */}
      <div className="space-y-4 pt-4 max-w-6xl mx-auto w-full">
        <h3 className="font-heading tracking-tighter text-2xl uppercase">THE ARSENAL</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Button 
            variant="secondary" 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-brand text-ink hover:bg-brand/90 border-4 border-ink relative overflow-hidden group"
            onClick={() => navigate.push('/closure')}
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-ink text-bg text-[8px] font-mono font-bold uppercase tracking-widest">
              AI Simulation
            </div>
            <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-ink group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest uppercase text-center">Talk to Them</span>
          </Button>

          <Button 
            variant="secondary" 
            className="h-32 sm:h-40 flex-col gap-3 brutalist-shadow-sm hover:scale-[1.02] transition-transform bg-white text-ink hover:bg-white/90 border-4 border-ink"
            onClick={() => navigate.push('/therapist')}
          >
            <Zap className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest uppercase text-center">AI Therapist</span>
          </Button>

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

      {/* Anchor Modal */}
      {showAnchor && <AnchorModal onClose={() => setShowAnchor(false)} />}
    </div>
  );
}
