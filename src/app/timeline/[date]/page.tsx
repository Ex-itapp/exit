"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTimeline, type TimelineEvent } from "@/lib/useTimeline";
import { CheckCircle, Flag, BookOpen, Lock, ArrowLeft, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Next.js 15 requires awaiting dynamic route params using `use()` if they are promises.
// In Next 13/14 App Router, it's just an object, but wrapping in `use()` handles Next 15.
// We'll safely treat params as a promise-like object.
export default function DailyDetail({ params }: { params: Promise<{ date: string }> | { date: string } }) {
  const router = useRouter();
  const { events } = useTimeline();
  
  // React.use() unwraps the Promise in React 19/Next 15
  // If it's not a promise, use() might complain in older versions, 
  // but let's assume standard Next app router typing.
  // A safe way for both:
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const dateStr = resolvedParams.date; // format: YYYY-MM-DD

  const displayDate = useMemo(() => {
    // Parse the date carefully avoiding timezone offset issues
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  }, [dateStr]);

  const dailyEvents = useMemo(() => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return events.filter(e => {
      // e.timestamp is already a Date object
      return e.timestamp.getDate() === d && 
             e.timestamp.getMonth() === (m - 1) && 
             e.timestamp.getFullYear() === y;
    });
  }, [events, dateStr]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
  };

  const renderEvent = (event: TimelineEvent) => {
    if (event.type === 'mood') {
      const data = event.data;
      return (
        <div key={event.id} className="border-3 border-ink bg-blue/10 brutalist-shadow-sm hover:-translate-y-0.5 transition-transform p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl leading-none">{data.emoji}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] bg-blue text-ink font-bold uppercase px-2 py-0.5 border border-ink">Mood Logged</span>
                </div>
                {data.note && <p className="font-sans text-sm font-medium text-ink/90 mt-1">"{data.note}"</p>}
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-ink/50 uppercase shrink-0">{formatTime(event.timestamp)}</span>
          </div>
        </div>
      );
    }

    if (event.type === 'checkin') {
      const data = event.data;
      return (
        <div key={event.id} className="border-3 border-ink bg-positive/10 brutalist-shadow-sm hover:-translate-y-0.5 transition-transform p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-positive" />
              <span className="font-mono text-[10px] bg-positive text-ink font-bold uppercase px-2 py-0.5 border border-ink">Daily Check-in</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-ink/50 uppercase shrink-0">{formatTime(event.timestamp)}</span>
          </div>
          <p className="font-sans text-sm sm:text-base font-medium text-ink/90 leading-relaxed">"{data.content}"</p>
        </div>
      );
    }
    
    if (event.type === 'flag') {
      const data = event.data;
      return (
        <div key={event.id} className="border-3 border-ink bg-purple/10 brutalist-shadow-sm hover:-translate-y-0.5 transition-transform p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-purple" />
              <span className="font-mono text-[10px] bg-purple text-white font-bold uppercase px-2 py-0.5 border border-ink">{data.category}</span>
            </div>
            <span className="font-mono text-[10px] font-bold text-ink/50 uppercase shrink-0">{formatTime(event.timestamp)}</span>
          </div>
          <p className="font-sans text-sm sm:text-base font-medium text-ink/90 leading-relaxed">"{data.content}"</p>
        </div>
      );
    }

    if (event.type === 'diary') {
      const data = event.data;
      const isUnsent = data.isUnsent;
      return (
        <div key={event.id} className={`border-3 border-ink ${isUnsent ? 'bg-accent/10' : 'bg-brand/10'} brutalist-shadow-sm hover:-translate-y-0.5 transition-transform p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {isUnsent ? (
                <>
                  <Lock className="w-4 h-4 text-accent" />
                  <span className="font-mono text-[10px] bg-accent text-white font-bold uppercase px-2 py-0.5 border border-ink">Unsent Message</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-brand" />
                  <span className="font-mono text-[10px] bg-brand text-ink font-bold uppercase px-2 py-0.5 border border-ink">Diary Entry</span>
                  {data.moods?.map((m: string) => <span key={m} className="font-mono text-[10px] bg-white text-ink font-bold uppercase px-1.5 py-0.5 border border-ink">{m}</span>)}
                </>
              )}
            </div>
            <span className="font-mono text-[10px] font-bold text-ink/50 uppercase shrink-0">{formatTime(event.timestamp)}</span>
          </div>
          <p className={`font-sans text-sm sm:text-base leading-relaxed ${isUnsent ? 'italic text-accent font-medium' : 'font-medium text-ink/90'}`}>"{data.content}"</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-150 max-w-3xl mx-auto px-4 pb-24">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/timeline')}
        className="mb-4 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Calendar
      </Button>

      <header>
        <h1 className="text-3xl md:text-5xl font-heading tracking-tighter uppercase">{displayDate}</h1>
        <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">ALL ACTIVITY LOGGED ON THIS DAY.</p>
      </header>

      <div className="space-y-4 pt-4 border-t-4 border-ink">
        {dailyEvents.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-ink/20 opacity-50">
            <p className="font-mono font-bold tracking-widest uppercase text-sm">No activity logged on this date.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {dailyEvents.map(event => (
              <div key={event.id} className="w-full">
                {renderEvent(event)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
