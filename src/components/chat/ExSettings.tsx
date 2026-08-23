"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChatTheme, THEME_PREVIEWS } from '@/lib/useTheme';
import type { MemoryBankEntry } from '@/lib/useClosure';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Trash2, Check, BrainCircuit, ChevronRight, EyeOff } from 'lucide-react';

interface ExSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ChatTheme;
  onChangeTheme: (theme: ChatTheme) => void;
  isScreenshotMode: boolean;
  onToggleScreenshotMode: () => void;
  isPrivacyBlur: boolean;
  onTogglePrivacyBlur: () => void;
  onClearChat: () => void;
  // Memory bank
  onAddMemory: (content: string, tags: string[], weight: MemoryBankEntry['emotional_weight']) => void;
  // Persona engine
  personaName: string;
  onOpenPersonaEngine: () => void;
  // Session info
  sessionMessageCount: number;
  sessionStartTime?: string;
}

const WEIGHT_COLORS: Record<MemoryBankEntry['emotional_weight'], string> = {
  hurt: '#FF3366',
  fond: '#9D4EDD',
  angry: '#FF5252',
  confusing: '#FFAB00',
  neutral: '#666666',
};

export function ExSettings({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  isScreenshotMode,
  onToggleScreenshotMode,
  isPrivacyBlur,
  onTogglePrivacyBlur,
  onClearChat,
  onAddMemory,
  personaName,
  onOpenPersonaEngine,
  sessionMessageCount,
  sessionStartTime,
}: ExSettingsProps) {
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryWeight, setMemoryWeight] = useState<MemoryBankEntry['emotional_weight']>('neutral');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAddMemory = () => {
    if (!memoryContent.trim()) return;
    onAddMemory(memoryContent, [], memoryWeight);
    setMemoryContent('');
    setMemoryWeight('neutral');
    setShowToast(true);
  };

  const formattedStartTime = sessionStartTime
    ? new Date(sessionStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel — brutalist: sharp corners, theme-aware colors */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-bg border-t-4 border-ink max-h-[85vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="py-3 flex justify-center sticky top-0 bg-bg z-10" onClick={onClose}>
              <div className="w-12 h-1 bg-ink/20" />
            </div>

            <div className="px-6 pb-[env(safe-area-inset-bottom)] mb-8 space-y-8 mt-2 text-ink">
              
              {/* Section 1: DROP A MEMORY */}
              <section>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-3">
                  Drop a Memory
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={memoryContent}
                    onChange={(e) => setMemoryContent(e.target.value)}
                    placeholder="E.g., That time we fought at IKEA..."
                    className="w-full rounded-none bg-ink/5 border-2 border-ink/15 p-3 text-sm font-sans text-ink placeholder:text-ink/30 outline-none focus:border-brand transition-colors"
                  />
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(Object.keys(WEIGHT_COLORS) as Array<MemoryBankEntry['emotional_weight']>).map((weight) => {
                      const isActive = memoryWeight === weight;
                      const color = WEIGHT_COLORS[weight];
                      return (
                        <button
                          key={weight}
                          onClick={() => setMemoryWeight(weight)}
                          className={cn(
                            "rounded-none px-3 py-1 text-[10px] font-mono font-bold uppercase border-2 transition-colors whitespace-nowrap flex-shrink-0",
                            isActive ? "text-bg" : "border-ink/20 text-ink/50 hover:border-ink/40"
                          )}
                          style={{
                            backgroundColor: isActive ? color : 'transparent',
                            borderColor: isActive ? color : undefined,
                          }}
                        >
                          {weight}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleAddMemory}
                      disabled={!memoryContent.trim()}
                      className="rounded-none bg-brand text-ink px-4 py-2 font-mono text-xs font-bold uppercase border-2 border-ink disabled:opacity-50 transition-opacity active:scale-95 shadow-[2px_2px_0px_0px] shadow-ink/20"
                    >
                      Add Memory
                    </button>
                    {showToast && (
                      <div className="font-mono text-[10px] text-brand flex items-center gap-1 animate-fade-in-up">
                        <Check className="w-3 h-3" /> Added
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 2: THEIR PROFILE */}
              <section>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-3">
                  Their Profile
                </div>
                <div
                  onClick={() => {
                    onOpenPersonaEngine();
                    onClose();
                  }}
                  className="rounded-none bg-ink/5 border-2 border-ink/15 p-4 flex items-center justify-between cursor-pointer hover:bg-ink/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="w-5 h-5 text-brand" />
                    <span className="font-heading uppercase text-sm tracking-wide">{personaName || "Unknown"}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink/50" />
                </div>
                <div className="font-mono text-[10px] text-ink/40 mt-2 ml-1">
                  Voice profile • Trait profile • Sample texts
                </div>
              </section>

              {/* Section 3: AESTHETIC */}
              <section>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-3">
                  Aesthetic
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {THEME_PREVIEWS.map((p) => {
                    const isActive = p.id === theme;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onChangeTheme(p.id as ChatTheme)}
                        className={cn(
                          "w-10 h-10 rounded-none border-2 flex items-center justify-center transition-all duration-200 relative",
                          isActive ? "border-ink scale-110 shadow-[2px_2px_0px_0px] shadow-ink/30" : "border-ink/20 hover:scale-110 hover:border-ink/40"
                        )}
                        style={{ backgroundColor: p.bg }}
                        aria-label={p.name}
                      >
                        <div
                          className="w-3 h-3 rounded-none"
                          style={{ backgroundColor: p.accent }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-4 h-4 drop-shadow-md" style={{ color: p.ink }} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="font-mono text-[11px] text-ink/50 text-center mt-3">
                  {THEME_PREVIEWS.find((p) => p.id === theme)?.name || 'Theme'}
                </div>
              </section>

              {/* Section 4: PRIVACY BLUR */}
              <section>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                    <EyeOff className="w-4 h-4" />
                    Privacy Blur
                  </div>
                  <button
                    onClick={onTogglePrivacyBlur}
                    className={cn(
                      "w-11 h-[22px] rounded-none p-[2px] transition-colors duration-200 ease-in-out focus:outline-none flex-shrink-0 border-2",
                      isPrivacyBlur ? "bg-brand border-ink" : "bg-ink/10 border-ink/20"
                    )}
                  >
                    <div
                      className={cn(
                        "w-[14px] h-[14px] bg-bg border border-ink rounded-none shadow-sm transform transition-transform duration-200 ease-in-out",
                        isPrivacyBlur ? "translate-x-[22px]" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
                <div className="font-mono text-[10px] text-ink/40 ml-6">
                  Hides their name and avatar
                </div>
              </section>

              {/* Section 5: SCREENSHOT MODE */}
              <section className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase">
                  <Camera className="w-4 h-4" />
                  Screenshot Mode
                </div>
                <button
                  onClick={onToggleScreenshotMode}
                  className={cn(
                    "w-11 h-[22px] rounded-none p-[2px] transition-colors duration-200 ease-in-out focus:outline-none flex-shrink-0 border-2",
                    isScreenshotMode ? "bg-brand border-ink" : "bg-ink/10 border-ink/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-[14px] h-[14px] bg-bg border border-ink rounded-none shadow-sm transform transition-transform duration-200 ease-in-out",
                      isScreenshotMode ? "translate-x-[22px]" : "translate-x-0"
                    )}
                  />
                </button>
              </section>

              {/* Section 6: SESSION INFO */}
              <section className="mt-4 pt-4 border-t-2 border-ink/10 flex flex-col gap-1">
                <div className="font-mono text-[10px] text-ink/40">
                  Session started: {formattedStartTime}
                </div>
                <div className="font-mono text-[10px] text-ink/40">
                  Messages: {sessionMessageCount}
                </div>
              </section>

              {/* Section 7: CLEAR CHAT */}
              <section className="mt-2 pt-4 border-t-2 border-ink/10">
                <button
                  onClick={() => {
                    onClearChat();
                    onClose();
                  }}
                  className="text-accent font-mono text-xs font-bold uppercase flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear conversation
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
