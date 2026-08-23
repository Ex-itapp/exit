"use client";

import { ChatMood } from "@/lib/useTheme";
import { ArrowLeft, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  mood: ChatMood;
  onBack: () => void;
  onOpenSettings: () => void;
  isScreenshotMode?: boolean;
  personaName?: string;
  personaInitial?: string;
  isPrivacyBlur?: boolean;
}

export function ChatHeader({
  mood,
  onBack,
  onOpenSettings,
  isScreenshotMode = false,
  personaName = "Them",
  personaInitial = "?",
  isPrivacyBlur = false,
}: ChatHeaderProps) {
  const isEx = mood === "ex";

  return (
    <div
      className={cn(
        "h-16 shrink-0 flex items-center justify-between px-4 z-10 sticky top-0 bg-bg border-b-2 border-ink"
      )}
    >
      <div className="flex-1 flex items-center justify-start">
        {!isScreenshotMode && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-none border-2 border-ink/20 flex items-center justify-center transition-colors hover:bg-ink/5"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
        )}
      </div>

      <div className="flex-none flex items-center justify-center space-x-2">
        {!isEx ? (
          <>
            <span className="font-heading text-lg uppercase tracking-tight text-ink">COMPANION</span>
            <Sparkles className="w-4 h-4 text-ink" />
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-none border-2 border-ink/20 flex items-center justify-center text-sm font-heading bg-ink/10 text-ink">
              {isPrivacyBlur ? "?" : personaInitial}
            </div>
            <span className="font-heading text-lg uppercase text-ink">
              {isPrivacyBlur ? "Them" : personaName}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-end">
        {!isScreenshotMode && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-none border-2 border-ink/20 flex items-center justify-center transition-colors hover:bg-ink/5"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4 text-ink" />
          </button>
        )}
      </div>
    </div>
  );
}
