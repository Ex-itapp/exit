"use client";

import { cn } from "@/lib/utils";
import type { ChatMood } from "@/lib/useTheme";

interface TypingIndicatorProps {
  mood?: ChatMood;
  className?: string;
}

export function TypingIndicator({ mood, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex w-full justify-start animate-indicator-in", className)}>
      <div className="flex items-center justify-center gap-1.5 rounded-none border-2 border-ink/15 bg-ink/5 w-[60px] h-[32px]">
        <div className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-wave-dot-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-wave-dot-2" />
        <div className="w-1.5 h-1.5 rounded-full bg-ink/40 animate-wave-dot-3" />
      </div>
    </div>
  );
}
