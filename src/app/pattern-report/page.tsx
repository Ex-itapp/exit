"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Sparkles, 
  Lock, 
  Download, 
  BookOpen, 
  Flag, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { useUser, DEFAULT_AVATAR } from "@/lib/useUser";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useRealityCheck } from "@/lib/useRealityCheck";
import type { RealityCheckData } from "@/lib/useRealityCheck";
import { getMoodColor, getFlagColor, MOOD_EMOJIS } from "@/lib/visualSystem";
import { cn } from "@/lib/utils";

export default function RealityCheckPage() {
  const { userAvatar } = useUser();
  const {
    currentReport,
    history,
    isLoaded,
    hasEnoughData,
    eligibleLogCount,
    minRequiredLogs,
    canGenerate,
    isCooldownActive,
    daysUntilNext,
    calculatedWeek,
    isGenerating,
    generationStep,
    error,
    generateReport
  } = useRealityCheck();

  const [activeTab, setActiveTab] = useState<'overview' | 'diary' | 'redflags'>('overview');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [selectedHistoricalReport, setSelectedHistoricalReport] = useState<RealityCheckData | null>(null);

  const displayReport = selectedHistoricalReport || currentReport;

  // Handler to export as image via /api/render-card
  const handleExportCard = async () => {
    if (!displayReport) return;
    setIsExporting(true);

    try {
      const templateMap = {
        overview: 'pattern-report-1',
        diary: 'pattern-report-2',
        redflags: 'pattern-report-3'
      };

      const res = await fetch('/api/render-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: templateMap[activeTab],
          data: displayReport
        })
      });

      if (!res.ok) throw new Error('Failed to render card');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reality-check-week-${displayReport.weekNumber}-${activeTab}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg text-ink p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="border-2 border-ink bg-white p-6 shadow-sm text-center">
          <p className="font-mono font-bold text-xs uppercase tracking-widest text-ink/70">
            LOADING REALITY CHECK...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink p-4 sm:p-6 md:p-8 flex flex-col items-center pb-28">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 text-ink/60 hover:text-ink font-mono text-xs uppercase tracking-wider font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {isCooldownActive && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-ink/5 border border-ink/15 text-ink/70">
              Next in {daysUntilNext} day{daysUntilNext === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Hero Banner */}
        <header className="bg-white border-2 border-ink/15 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-ink/20 shadow-sm bg-brand flex items-center justify-center shrink-0 overflow-hidden">
            <Avatar config={typeof userAvatar === 'object' ? userAvatar : DEFAULT_AVATAR} size="100%" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand text-ink border border-ink/20 font-mono text-[10px] uppercase font-bold tracking-wider mb-1.5">
              <Eye className="w-3 h-3" /> Weekly Audit
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight text-ink">
              The Reality Check
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink/70 mt-1">
              No rose-tinted glasses. An honest weekly breakdown of your unfiltered logs, patterns, and progress.
            </p>
          </div>
        </header>

        {/* State 1: Generation In Progress */}
        {isGenerating && (
          <div className="bg-white border-2 border-ink p-8 shadow-sm text-center space-y-5 animate-pulse">
            <div className="w-12 h-12 mx-auto bg-brand border-2 border-ink flex items-center justify-center transform rotate-6">
              <Sparkles className="w-6 h-6 text-ink animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading uppercase text-xl font-bold">Generating Week {calculatedWeek} Reality Check</h3>
              <p className="font-mono text-xs text-ink/70">{generationStep || "Analyzing your unfiltered logs..."}</p>
            </div>
            <div className="w-full bg-ink/10 h-2 overflow-hidden border border-ink/20">
              <div className="h-full bg-brand w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isGenerating && (
          <div className="bg-accent/10 border-2 border-accent p-4 flex items-center gap-3 text-accent font-mono text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 2: Locked / Not Enough Logs */}
        {!hasEnoughData && !displayReport && !isGenerating && (
          <div className="bg-white border-2 border-ink/15 p-6 sm:p-8 shadow-sm space-y-6 text-center">
            <div className="w-14 h-14 mx-auto bg-ink/5 border-2 border-ink/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-ink/60" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="font-heading uppercase text-2xl tracking-tight font-black">
                Reality Check Locked
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ink/70 leading-relaxed">
                To give you a brutally accurate report rather than superficial guesses, the Reality Check requires at least <strong>{minRequiredLogs} entries</strong> (across diary, red flags, or check-ins).
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between font-mono text-xs font-bold uppercase text-ink/60">
                <span>Progress</span>
                <span>{eligibleLogCount} / {minRequiredLogs} Logged</span>
              </div>
              <div className="w-full bg-ink/10 h-3 border-2 border-ink/15 overflow-hidden">
                <div 
                  className="bg-brand h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (eligibleLogCount / minRequiredLogs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Direct Action Shortcuts */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link 
                href="/diary/new" 
                className="p-3 border-2 border-ink/15 bg-bg hover:border-ink hover:bg-white transition-all group shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-ink/60 group-hover:text-brand mb-2" />
                <div className="font-heading uppercase text-xs font-bold">Write in Diary</div>
                <div className="font-mono text-[10px] text-ink/50">Vent raw thoughts</div>
              </Link>

              <Link 
                href="/flags/new" 
                className="p-3 border-2 border-ink/15 bg-bg hover:border-ink hover:bg-white transition-all group shadow-xs"
              >
                <Flag className="w-4 h-4 text-ink/60 group-hover:text-accent mb-2" />
                <div className="font-heading uppercase text-xs font-bold">Log Red Flag</div>
                <div className="font-mono text-[10px] text-ink/50">Name a blindspot</div>
              </Link>

              <Link 
                href="/dashboard" 
                className="p-3 border-2 border-ink/15 bg-bg hover:border-ink hover:bg-white transition-all group shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-ink/60 group-hover:text-positive mb-2" />
                <div className="font-heading uppercase text-xs font-bold">Daily Check-in</div>
                <div className="font-mono text-[10px] text-ink/50">Log today's mood</div>
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Ready to Generate First/New Report */}
        {canGenerate && !displayReport && !isGenerating && (
          <div className="bg-white border-2 border-ink p-6 sm:p-8 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-brand border-2 border-ink flex items-center justify-center transform -rotate-3">
              <Sparkles className="w-8 h-8 text-ink" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="font-mono text-xs uppercase font-bold text-positive tracking-wider">
                ● Ready to Unlock
              </span>
              <h2 className="font-heading text-3xl uppercase tracking-tight font-black">
                Week {calculatedWeek} Is Waiting
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ink/70">
                You've logged {eligibleLogCount} entries. The engine is ready to synthesize your week and cut through the fog.
              </p>
            </div>

            <Button
              onClick={generateReport}
              className="w-full max-w-sm mx-auto h-12 bg-ink text-white hover:bg-ink/90 font-mono uppercase font-bold tracking-wider text-xs border-2 border-ink shadow-sm"
            >
              Generate Week {calculatedWeek} Reality Check
            </Button>
          </div>
        )}

        {/* State 4: Active Report Display */}
        {displayReport && !isGenerating && (
          <div className="space-y-6">
            
            {/* Report Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-2 border-ink/15 p-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading uppercase text-lg sm:text-xl font-black">
                    Week {displayReport.weekNumber} Reality Check
                  </h2>
                  {selectedHistoricalReport && (
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-ink/10 text-ink/70">
                      Archived
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-ink/50 mt-0.5">
                  {displayReport.dateRange} • Generated {new Date(displayReport.generatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canGenerate && (
                  <Button
                    onClick={generateReport}
                    variant="outline"
                    className="h-9 px-3 font-mono text-xs uppercase font-bold border-2 border-ink/15 hover:border-ink"
                    title="Generate updated check for this week"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New Week
                  </Button>
                )}

                <Button
                  onClick={handleExportCard}
                  disabled={isExporting}
                  className="h-9 px-3.5 bg-ink text-white hover:bg-ink/90 font-mono text-xs uppercase font-bold border-2 border-ink"
                >
                  {downloadSuccess ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-positive" /> Saved!</>
                  ) : isExporting ? (
                    <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Rendering...</>
                  ) : (
                    <><Download className="w-3.5 h-3.5 mr-1.5" /> Save Story</>
                  )}
                </Button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-3 gap-2 border-b-2 border-ink/15 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "py-2.5 px-2 font-mono text-xs uppercase font-bold tracking-wider border-2 transition-all text-center",
                  activeTab === 'overview' 
                    ? "bg-ink text-bg border-ink shadow-xs" 
                    : "bg-white text-ink/60 border-ink/15 hover:border-ink/40"
                )}
              >
                1. Overview
              </button>

              <button
                onClick={() => setActiveTab('diary')}
                className={cn(
                  "py-2.5 px-2 font-mono text-xs uppercase font-bold tracking-wider border-2 transition-all text-center",
                  activeTab === 'diary' 
                    ? "bg-ink text-bg border-ink shadow-xs" 
                    : "bg-white text-ink/60 border-ink/15 hover:border-ink/40"
                )}
              >
                2. Emotional Ground
              </button>

              <button
                onClick={() => setActiveTab('redflags')}
                className={cn(
                  "py-2.5 px-2 font-mono text-xs uppercase font-bold tracking-wider border-2 transition-all text-center",
                  activeTab === 'redflags' 
                    ? "bg-ink text-bg border-ink shadow-xs" 
                    : "bg-white text-ink/60 border-ink/15 hover:border-ink/40"
                )}
              >
                3. Blindspots
              </button>
            </div>

            {/* Card Content Presentation */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="bg-ink text-bg border-4 border-ink p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-bg/20 pb-4">
                    <span className="font-heading uppercase tracking-tight text-brand text-lg font-black">
                      EX-IT. / REALITY CHECK
                    </span>
                    <span className="font-mono text-xs uppercase font-bold tracking-widest text-bg/50">
                      CARD 01
                    </span>
                  </div>

                  <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                    {displayReport.page1_overview.headline}
                  </h3>

                  <div className="bg-brand text-ink p-6 border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-1">
                    <div className="font-mono text-[10px] uppercase font-black tracking-widest opacity-60">
                      Core Metric
                    </div>
                    <div className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight">
                      {displayReport.page1_overview.stat_highlight}
                    </div>
                  </div>

                  <p className="font-sans text-sm sm:text-base leading-relaxed text-bg/90 font-medium">
                    {displayReport.page1_overview.subtext}
                  </p>
                </motion.div>
              )}

              {activeTab === 'diary' && (
                <motion.div
                  key="diary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white text-ink border-4 border-ink p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8"
                >
                  <div className="flex items-center justify-between border-b-2 border-ink/15 pb-4">
                    <span className="font-heading uppercase tracking-tight text-purple text-lg font-black">
                      EMOTIONAL SPECTRUM
                    </span>
                    <span className="font-mono text-xs uppercase font-bold tracking-widest text-ink/40">
                      CARD 02
                    </span>
                  </div>

                  <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight text-ink">
                    {displayReport.page2_diary.headline}
                  </h3>

                  {/* Mood Pills */}
                  <div className="space-y-2">
                    <div className="font-mono text-xs uppercase font-bold tracking-wider text-ink/50">
                      Dominant Moods Detected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {displayReport.page2_diary.mood_breakdown?.map((m) => (
                        <div 
                          key={m.mood}
                          className="px-3.5 py-1.5 border-2 border-ink font-mono text-xs font-bold uppercase flex items-center gap-1.5 shadow-xs"
                          style={{ backgroundColor: getMoodColor(m.mood) }}
                        >
                          <span>{MOOD_EMOJIS[m.mood.toLowerCase()] || '💭'}</span>
                          <span>{m.mood}</span>
                          <span className="opacity-60 text-[10px]">({m.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standout Grounded Line */}
                  <div className="p-5 bg-ink/5 border-l-4 border-ink space-y-1">
                    <div className="font-mono text-[10px] uppercase font-bold text-ink/40 tracking-wider">
                      Most Grounded Thought (Paraphrased)
                    </div>
                    <p className="font-sans text-base sm:text-lg font-bold italic text-ink">
                      "{displayReport.page2_diary.standout_line}"
                    </p>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-ink/80 leading-relaxed font-medium">
                    {displayReport.page2_diary.coping_comparison}
                  </p>
                </motion.div>
              )}

              {activeTab === 'redflags' && (
                <motion.div
                  key="redflags"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="bg-ink text-bg border-4 border-ink p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-bg/20 pb-4">
                    <span className="font-heading uppercase tracking-tight text-accent text-lg font-black">
                      EX-IT. / BLINDSPOTS
                    </span>
                    <span className="font-mono text-xs uppercase font-bold tracking-widest text-bg/50">
                      CARD 03
                    </span>
                  </div>

                  <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
                    {displayReport.page3_redflags.headline}
                  </h3>

                  {/* Dominant Pattern Box */}
                  <div 
                    className="p-6 border-2 border-bg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.4)] space-y-1 text-ink"
                    style={{ backgroundColor: getFlagColor(displayReport.page3_redflags.top_pattern) }}
                  >
                    <div className="font-mono text-[10px] uppercase font-black tracking-widest opacity-70">
                      Top Recurring Toxic Dynamic
                    </div>
                    <div className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight">
                      {displayReport.page3_redflags.top_pattern}
                    </div>
                  </div>

                  {/* Pattern Counts */}
                  {displayReport.page3_redflags.pattern_counts && displayReport.page3_redflags.pattern_counts.length > 0 && (
                    <div className="space-y-2 border-t border-bg/15 pt-4">
                      {displayReport.page3_redflags.pattern_counts.map((p) => (
                        <div key={p.category} className="flex justify-between items-center py-1 font-mono text-xs uppercase font-bold border-b border-bg/10 pb-1.5">
                          <span className="text-bg/80">{p.category}</span>
                          <span className="px-2 py-0.5 bg-bg/10 border border-bg/20">{p.count}x logged</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-bg/10 border-2 border-bg/20 font-sans text-sm sm:text-base font-semibold leading-relaxed text-brand">
                    {displayReport.page3_redflags.insight_line}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Historical Reports Drawer */}
            {history.length > 1 && (
              <div className="bg-white border-2 border-ink/15 p-5 shadow-sm space-y-3">
                <div className="font-mono text-xs uppercase font-bold tracking-wider text-ink/50">
                  Past Reality Checks
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {history.map((h) => {
                    const isSelected = displayReport.id === h.id;
                    return (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHistoricalReport(h)}
                        className={cn(
                          "p-3 text-left border-2 transition-all font-mono text-xs flex items-center justify-between",
                          isSelected 
                            ? "border-ink bg-brand text-ink font-bold shadow-xs" 
                            : "border-ink/15 bg-bg hover:border-ink/40 text-ink/70"
                        )}
                      >
                        <div>
                          <div className="uppercase">Week {h.weekNumber}</div>
                          <div className="text-[10px] opacity-60 font-sans">{h.dateRange}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
