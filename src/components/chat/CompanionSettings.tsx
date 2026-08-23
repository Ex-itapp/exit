"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChatTheme, ToneOption, THEME_PREVIEWS, TONE_OPTIONS } from '@/lib/useTheme';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Trash2, Check } from 'lucide-react';

interface CompanionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ChatTheme;
  onChangeTheme: (theme: ChatTheme) => void;
  tone: ToneOption;
  onChangeTone: (tone: ToneOption) => void;
  isScreenshotMode: boolean;
  onToggleScreenshotMode: () => void;
  onClearChat: () => void;
}

export function CompanionSettings({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  tone,
  onChangeTone,
  isScreenshotMode,
  onToggleScreenshotMode,
  onClearChat,
}: CompanionSettingsProps) {
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Panel — brutalist: sharp top, theme-aware */}
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

            <div className="px-6 pb-[env(safe-area-inset-bottom)] mb-8 space-y-8 mt-2">
              {/* Section 1: VIBE CHECK */}
              <section>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-3">
                  Vibe Check
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TONE_OPTIONS.map((t) => {
                    const isActive = t.id === tone;
                    return (
                      <div
                        key={t.id}
                        onClick={() => onChangeTone(t.id as ToneOption)}
                        className={cn(
                          "rounded-none border-2 p-3 cursor-pointer transition-all duration-200 flex flex-col gap-1",
                          isActive
                            ? "border-ink bg-brand/10 shadow-[2px_2px_0px_0px] shadow-ink/20"
                            : "border-ink/15 hover:border-ink/30"
                        )}
                      >
                        <div className="text-xl">{t.emoji}</div>
                        <div className="font-heading text-sm uppercase text-ink">{t.label}</div>
                        <div className="font-sans text-[11px] text-ink/60">{t.description}</div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 2: AESTHETIC */}
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

              {/* Section 3: SCREENSHOT MODE */}
              <section className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-ink font-mono text-xs font-bold uppercase">
                  <Camera className="w-4 h-4" />
                  Screenshot Mode
                </div>
                <button
                  onClick={onToggleScreenshotMode}
                  className={cn(
                    "w-11 h-[22px] rounded-none p-[2px] transition-colors duration-200 ease-in-out focus:outline-none border-2",
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

              {/* Section 4: CLEAR CHAT */}
              <section className="mt-6 pt-6 border-t-2 border-ink/10">
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
