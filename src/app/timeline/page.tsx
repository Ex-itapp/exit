"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { useTimeline } from "@/lib/useTimeline";
import { useUser } from "@/lib/useUser";
import { ChevronLeft, ChevronRight, Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS_FULL = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const moodColorMap: Record<string, string> = {
  '😭': '#00B4D8',
  '😔': '#9D4EDD',
  '😐': '#888888',
  '🙂': '#FFDF00',
  '🤩': '#00E676'
};

function hexToRgba(hex: string, alpha: number) {
  if (!hex) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function CalendarTimeline() {
  const router = useRouter();
  const { events } = useTimeline();
  const { breakupDate } = useUser();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

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
    setSelectedDay(day);
  };
  
  const navigateToDay = () => {
    if (!selectedDay) return;
    const m = (month + 1).toString().padStart(2, '0');
    const d = selectedDay.toString().padStart(2, '0');
    router.push(`/timeline/${year}-${m}-${d}`);
  };

  const selectedDateStr = selectedDay 
    ? new Date(year, month, selectedDay).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

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
            {DAY_LABELS_FULL.map((day, i) => (
              <div key={day} className="py-2 sm:py-3 text-center font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest border-r border-ink/20 last:border-r-0">
                <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="min-h-[60px] sm:min-h-[100px] lg:min-h-[120px] bg-bg/50 border-r border-b border-ink/10" />
            ))}
            
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              
              const hasDiary = dayEvents.some(e => e.type === 'diary');
              const hasFlag = dayEvents.some(e => e.type === 'flag');
              const hasCheckin = dayEvents.some(e => e.type === 'checkin');
              
              const moodEvent = dayEvents.find(e => e.type === 'mood');
              const moodEmoji = moodEvent ? moodEvent.data.emoji : null;

              const dateObj = new Date(year, month, day);
              const todayObj = new Date();
              todayObj.setHours(23, 59, 59, 999);
              const breakupDateObj = breakupDate ? new Date(breakupDate) : null;
              if (breakupDateObj) breakupDateObj.setHours(0, 0, 0, 0);

              const isInStreak = breakupDateObj && dateObj >= breakupDateObj && dateObj <= todayObj;

              return (
                <div 
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "min-h-[60px] sm:min-h-[100px] lg:min-h-[120px] p-1.5 sm:p-2.5 relative border-r border-b border-ink/10 cursor-pointer transition-all hover:bg-brand/10 active:bg-brand/20 group",
                    isToday(day) ? "bg-brand/5 ring-2 ring-brand ring-inset z-10" : "bg-white"
                  )}
                  style={{
                    backgroundColor: moodEmoji ? hexToRgba(moodColorMap[moodEmoji], 0.12) : undefined,
                    borderBottom: isInStreak ? '3px solid var(--color-brand)' : undefined,
                  }}
                >
                  <span className={cn(
                    "font-heading text-base sm:text-lg lg:text-xl relative z-10",
                    isToday(day) ? "text-brand" : "text-ink"
                  )}>
                    {day}
                  </span>

                  {/* Event Indicators */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex gap-0.5 sm:gap-1 items-center z-10">
                    {hasFlag && <Flag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent" />}
                    {hasDiary && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue" />}
                    {hasCheckin && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-positive" />}
                  </div>

                  {/* Mood Emoji */}
                  {moodEmoji && (
                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-2 sm:right-2 text-sm sm:text-xl lg:text-2xl group-hover:scale-110 transition-transform z-10">
                      {moodEmoji}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {selectedDay && selectedEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-4 border-ink bg-white brutalist-shadow p-4 mt-4 relative"
          >
            <button 
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 text-ink hover:text-accent transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-heading text-xl uppercase mb-4 pr-8">{selectedDateStr}</h3>
            
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {selectedEvents.map((event, idx) => (
                <div key={idx} className="flex gap-3 items-start border-b-2 border-ink/10 pb-3 last:border-0 last:pb-0">
                  <div className="mt-1">
                    {event.type === 'mood' && <span className="text-2xl">{event.data.emoji}</span>}
                    {event.type === 'flag' && <Flag className="w-5 h-5 text-accent" />}
                    {event.type === 'diary' && <div className="w-4 h-4 mt-1 rounded-full bg-blue" />}
                    {event.type === 'checkin' && <div className="w-4 h-4 mt-1 rounded-full bg-positive" />}
                  </div>
                  <div>
                    <span className="font-heading text-sm uppercase block mb-1">
                      {event.type === 'mood' && 'Mood Logged'}
                      {event.type === 'flag' && 'Red Flag'}
                      {event.type === 'diary' && 'Diary Entry'}
                      {event.type === 'checkin' && 'Check-in'}
                    </span>
                    <p className="font-mono text-sm text-ink/80 line-clamp-2">
                      {event.type === 'mood' && event.data.note}
                      {event.type === 'flag' && event.data.title}
                      {event.type === 'diary' && event.data.content}
                      {event.type === 'checkin' && 'Daily check-in completed.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={navigateToDay}
              className="w-full bg-brand text-ink font-heading uppercase py-3 border-2 border-ink hover:bg-brand/90 transition-colors"
            >
              View full day &rarr;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-wrap gap-4 font-mono text-[10px] sm:text-xs text-ink/60 uppercase justify-center mt-6">
        <div className="flex items-center gap-1.5"><Flag className="w-3 h-3 text-accent" /> Red Flag</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue" /> Diary</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-positive" /> Check-in</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-1 bg-brand" /> Streak Day</div>
      </div>
    </div>
  );
}
