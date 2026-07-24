"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useUser } from "@/lib/useUser";
import { AlertTriangle, RefreshCcw, Settings2, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CalendarTile } from "@/components/CalendarTile";

export default function Streak() {
  const { streakDays, breakupDate, appMode, setAppMode } = useUser();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [newBreakupDate, setNewBreakupDate] = useState(
    breakupDate ? new Date(breakupDate).toISOString().split('T')[0] : ""
  );

  const handleUpdateBreakupDate = () => {
    if (newBreakupDate) {
      localStorage.setItem('unsent_breakup_date', new Date(newBreakupDate).toISOString());
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your streak? This cannot be undone.")) {
      localStorage.setItem('unsent_breakup_date', new Date().toISOString());
      localStorage.setItem('unsent_punched_dates', JSON.stringify([]));
      window.location.reload();
    }
  };

  if (appMode === 'evaluating') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 relative h-full flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-4">
        <ShieldAlert className="w-24 h-24 text-ink opacity-20 mb-4" />
        <h1 className="text-4xl md:text-5xl font-heading tracking-tighter uppercase">Streaks are Locked</h1>
        <p className="text-lg opacity-80 mt-4 font-medium max-w-md">
          Streaks become available once you initiate No Contact. Take your time to gather clarity. When you're ready to leave, switch modes.
        </p>
        <Button 
          className="mt-8 h-14 px-8 text-lg brutalist-shadow-sm"
          onClick={() => setAppMode('no_contact')}
        >
          I'M READY FOR NO CONTACT
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-150 relative">

      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">STREAK</h1>
          <p className="font-mono text-ink/70 mt-2 text-sm md:text-base">PROTECT YOUR PEACE.</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-heading tracking-tighter leading-none text-ink">{streakDays}</div>
          <p className="font-mono text-xs font-bold tracking-widest uppercase">DAYS</p>
        </div>
      </header>

      {/* Hero Calendar Tile */}
      <div className="flex justify-center py-4">
        <CalendarTile />
      </div>

      {/* Streak Settings & Adjustments */}
      <Card className="border-[4px] border-ink">
        <CardHeader className="border-b-[4px] border-ink bg-bg p-4 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsEditingSettings(!isEditingSettings)}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5" />
            STREAK SETTINGS
          </CardTitle>
          <Button variant="ghost" className="h-8 px-2 text-xs">
            {isEditingSettings ? "Done" : "Edit"}
          </Button>
        </CardHeader>
        {isEditingSettings && (
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2 pt-4">
              <label className="text-sm font-bold font-mono uppercase">Change Day Zero Date</label>
              <div className="flex gap-2">
                <Input 
                  type="date" 
                  value={newBreakupDate}
                  onChange={(e) => setNewBreakupDate(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUpdateBreakupDate}>Update</Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="border-t-8 border-t-danger">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" />
            DANGER ZONE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm md:text-base font-medium">
            Did you break no contact? It happens. The most important thing is that you start again today. Be honest with yourself.
          </p>
          <Button variant="danger" className="w-full h-14 text-base" onClick={handleReset}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Streak to 0
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
