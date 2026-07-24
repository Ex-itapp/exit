import { useState } from "react";
import { useUser } from "../lib/useUser";

export function CalendarTile() {
  const { streakDays, punchToday, punchedDates } = useUser();
  const [isTearing, setIsTearing] = useState(false);
  const [hasTorn, setHasTorn] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isPunchedToday = punchedDates.includes(todayStr);
  const todayDate = new Date();
  
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const currentMonth = monthNames[todayDate.getMonth()];
  const currentDay = todayDate.getDate();

  const handleTear = () => {
    if (isTearing) return; // Prevent double clicks during animation
    
    setIsTearing(true);
    setTimeout(() => {
      if (!isPunchedToday) {
        punchToday();
      }
      setIsTearing(false);
      setHasTorn(true);
      // Reset hasTorn after a short delay so they can tear it again!
      setTimeout(() => setHasTorn(false), 500);
    }, 600); // Matches CSS animation duration
  };

  const renderTileContent = (isTopLayer: boolean, isPunched: boolean) => (
    <div className="w-full h-full bg-white border-4 border-ink rounded-xl flex flex-col overflow-hidden brutalist-shadow-sm select-none">
      <div className="bg-brand text-ink py-2 text-center font-heading text-xl md:text-2xl uppercase tracking-widest border-b-4 border-ink">
        {currentMonth}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-bg relative">
        <span className="text-7xl md:text-8xl font-heading tracking-tighter leading-none text-ink drop-shadow-md">
          {currentDay}
        </span>
        <div className="mt-4 px-4 py-2 border-4 border-ink bg-white rounded-full flex items-center justify-center -rotate-2">
          <span className="font-mono text-sm md:text-base font-bold uppercase whitespace-nowrap">
            STREAK: {isTopLayer && !isPunched ? streakDays : (hasTorn || isPunched ? streakDays : streakDays + 1)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto cursor-pointer group" onClick={handleTear}>
      {/* Bottom Layer */}
      <div className="absolute inset-0">
        {renderTileContent(false, isPunchedToday)}
      </div>

      {/* Top Layer */}
      {(!isPunchedToday || isTearing) && (
        <div className={`absolute inset-0 z-10 origin-top-left ${isTearing ? 'animate-paper-tear pointer-events-none' : 'group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform'}`}>
          {renderTileContent(true, isPunchedToday)}
          {!isTearing && (
            <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );
}
