"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTimeline, type TimelineEvent } from "@/lib/useTimeline";
import { CheckCircle, Flag, BookOpen, Lock } from "lucide-react";

export default function Timeline() {
  const { events } = useTimeline();

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase();
  };

  const renderEvent = (event: TimelineEvent) => {
    if (event.type === 'checkin') {
      const data = event.data;
      return (
        <Card key={event.id} className="border-l-8 border-l-positive bg-positive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-positive" />
              <Badge variant="positive">Daily Check-in</Badge>
              <span className="font-mono text-xs opacity-50 ml-auto">{formatTime(event.timestamp)}</span>
            </div>
            <p className="text-base">{data.content}</p>
          </CardContent>
        </Card>
      );
    }
    
    if (event.type === 'flag') {
      const data = event.data;
      return (
        <Card key={event.id} className="border-l-8 border-l-purple bg-purple/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-4 h-4 text-purple" />
              <Badge variant="accent" className="bg-purple text-ink border-ink">{data.category}</Badge>
              <span className="font-mono text-xs opacity-50 ml-auto">{formatTime(event.timestamp)}</span>
            </div>
            <p className="text-base font-medium">{data.content}</p>
          </CardContent>
        </Card>
      );
    }

    if (event.type === 'diary') {
      const data = event.data;
      const isUnsent = data.isUnsent;
      return (
        <Card key={event.id} className={`border-l-8 ${isUnsent ? 'border-l-accent bg-accent/10' : 'border-l-brand bg-brand/5'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isUnsent ? (
                <>
                  <Lock className="w-4 h-4 text-accent" />
                  <Badge variant="accent">Unsent Message</Badge>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-brand" />
                  <Badge variant="outline">Diary Entry</Badge>
                  {data.moods?.map((m: string) => <Badge key={m} variant="outline" className="text-[10px] py-0">{m}</Badge>)}
                </>
              )}
              <span className="font-mono text-xs opacity-50 ml-auto">{formatTime(event.timestamp)}</span>
            </div>
            <p className={`text-base ${isUnsent ? 'italic text-accent font-medium' : ''}`}>{data.content}</p>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-150">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">TIMELINE</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">EVERYTHING YOU'VE LOGGED SO FAR.</p>
        </div>
      </header>

      <div className="space-y-4 pt-4 border-t-4 border-ink">
        {events.length === 0 ? (
          <div className="text-center py-12 border-4 border-dashed border-ink/20 opacity-50">
            <p className="font-mono">TIMELINE IS EMPTY.</p>
          </div>
        ) : (
          <div className="relative space-y-4 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-ink/10 pl-8 md:pl-0">
            {events.map(event => (
              <div key={event.id} className="relative z-10">
                {/* Timeline node dot */}
                <div className="absolute -left-[30px] md:left-1/2 md:-ml-2 top-4 w-4 h-4 rounded-full border-4 border-ink bg-bg hidden md:block"></div>
                {renderEvent(event)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
