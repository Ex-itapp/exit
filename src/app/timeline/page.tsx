"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTimeline } from "@/lib/useTimeline";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarTimeline() {
  const router = useRouter();
  const { events } = useTimeline();
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate blank cells for days before the 1st
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  // Generate days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.timestamp);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleDateClick = (day: number) => {
    // Format YYYY-MM-DD for URL
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    router.push(`/timeline/${year}-${m}-${d}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-150 max-w-5xl mx-auto px-4 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase">CALENDAR</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">YOUR HEALING JOURNEY, DAY BY DAY.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border-4 border-ink brutalist-shadow-sm p-2">
          <button onClick={prevMonth} className="p-1 hover:bg-ink hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="font-heading text-lg min-w-[140px] text-center uppercase tracking-tight">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-ink hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <Card className="border-4 border-ink brutalist-shadow bg-white overflow-hidden mt-8">
        <CardContent className="p-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b-4 border-ink bg-ink text-bg">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-3 text-center font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest border-r-2 border-ink/20 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="min-h-[80px] sm:min-h-[120px] bg-bg/50 border-r-2 border-b-2 border-ink/10" />
            ))}
            
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              
              const hasDiary = dayEvents.some(e => e.type === 'diary');
              const hasFlag = dayEvents.some(e => e.type === 'flag');
              const hasCheckin = dayEvents.some(e => e.type === 'checkin');
              
              const moodEvent = dayEvents.find(e => e.type === 'mood');
              const moodEmoji = moodEvent ? moodEvent.data.emoji : null;

              return (
                <div 
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[80px] sm:min-h-[120px] p-2 sm:p-3 relative border-r-2 border-b-2 border-ink/10 cursor-pointer transition-all hover:bg-brand/10 group",
                    isToday(day) ? "bg-brand/5 border-2 border-brand z-10" : "bg-white"
                  )}
                >
                  <span className={cn(
                    "font-heading text-lg sm:text-xl",
                    isToday(day) ? "text-brand drop-shadow-md" : "text-ink"
                  )}>
                    {day}
                  </span>

                  {/* Event Indicators */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {hasFlag && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple" title="Red Flag" />}
                    {hasDiary && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue" title="Diary" />}
                    {hasCheckin && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-positive" title="Check-in" />}
                  </div>

                  {/* Mood Emoji */}
                  {moodEmoji && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                      {moodEmoji}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4 font-mono text-[10px] sm:text-xs text-ink/60 uppercase justify-center mt-6">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple" /> Red Flag</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue" /> Diary</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-positive" /> Check-in</div>
      </div>
    </div>
  );
}
