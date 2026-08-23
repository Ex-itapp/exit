"use client";

import { cn } from "@/lib/utils";
import type { ChatMood } from "@/lib/useTheme";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  mood: ChatMood;
  timestamp?: string;
  showTimestamp?: boolean;
  animationDelay?: number;
}

export function MessageBubble({
  content,
  isUser,
  mood,
  timestamp,
  showTimestamp,
  animationDelay = 0,
}: MessageBubbleProps) {
  const isCompanion = mood === "companion";

  // Bubble styles based on mood and sender
  let bubbleClasses = "";
  if (isUser) {
    bubbleClasses =
      "bg-bubble-self text-bubble-text-self rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
  } else {
    if (isCompanion) {
      bubbleClasses =
        "bg-ink/5 text-ink rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
    } else {
      bubbleClasses =
        "bg-bubble-other text-bubble-text-other rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
    }
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "flex w-full animate-bubble-in",
        isUser ? "justify-end" : "justify-start"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={cn("max-w-[80%] md:max-w-[65%] flex flex-col", isUser ? "items-end" : "items-start")}>
        <div className={cn("px-4 py-2.5 font-sans text-[15px] leading-relaxed whitespace-pre-wrap", bubbleClasses)}>
          {content}
        </div>

        {showTimestamp && timestamp && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink/40 mt-1.5">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
