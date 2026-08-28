"use client";

import { cn } from "@/lib/utils";
import type { ChatMood } from "@/lib/useTheme";

interface Message {
  role: string;
  content?: string;
  parts?: Array<{ text: string }>;
}

interface MessageBubbleProps {
  message: Message;
  mood: ChatMood;
  isScreenshotMode?: boolean;
  timestamp?: string;
  showTimestamp?: boolean;
  animationDelay?: number;
}

// Tiny healing doodles that rotate on AI bubbles
const HEALING_DOODLES = ["✿", "❀", "♡", "☽", "✦", "⊹", "˚", "⟡", "❋", "✧"];

export function MessageBubble({
  message,
  mood,
  isScreenshotMode,
  timestamp,
  showTimestamp,
  animationDelay = 0,
}: MessageBubbleProps) {
  const isCompanion = mood === "companion";
  const isUser = message.role === "user";
  const content = message.parts?.[0]?.text || message.content || "";

  // Pick a deterministic doodle from the message content
  const doodleIndex = content.length % HEALING_DOODLES.length;
  const doodle = HEALING_DOODLES[doodleIndex];
  const doodle2 = HEALING_DOODLES[(doodleIndex + 3) % HEALING_DOODLES.length];

  // Should we show the healing decoration?
  const showHealingDecor = isCompanion && !isUser && !isScreenshotMode;

  // Bubble styles based on mood and sender
  let bubbleClasses = "";
  if (isUser) {
    if (isCompanion) {
      // User bubble in companion mode: soft, rounded, warm
      bubbleClasses =
        "bg-bubble-self text-bubble-text-self rounded-2xl rounded-br-sm border border-ink/8 shadow-sm";
    } else {
      bubbleClasses =
        "bg-bubble-self text-bubble-text-self rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
    }
  } else {
    if (isCompanion) {
      // AI bubble in companion mode: the cute healing style
      bubbleClasses =
        "bg-gradient-to-br from-brand/12 to-accent/6 text-ink rounded-2xl rounded-bl-sm border border-brand/20 shadow-sm backdrop-blur-sm";
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
        
        {/* Healing doodle accent above AI bubbles */}
        {showHealingDecor && (
          <div className="flex items-center gap-1.5 mb-1 ml-2 select-none">
            <span className="text-[10px] text-brand/50 animate-float-slow">{doodle}</span>
            <span className="text-[8px] text-accent/30 animate-float-slow" style={{ animationDelay: '0.5s' }}>{doodle2}</span>
          </div>
        )}

        <div className={cn(
          "relative px-4 py-2.5 font-sans text-[15px] leading-relaxed whitespace-pre-wrap",
          bubbleClasses,
          // Companion mode gets a subtle glow on AI messages
          showHealingDecor && "ring-1 ring-brand/10"
        )}>
          {content}

          {/* Tiny corner sparkle on AI companion bubbles */}
          {showHealingDecor && (
            <span className="absolute -top-1 -right-1 text-[10px] text-brand/40 animate-pulse-soft select-none pointer-events-none">
              ✦
            </span>
          )}
        </div>

        {showTimestamp && timestamp && (
          <span className={cn(
            "font-mono text-[9px] font-bold uppercase tracking-wider mt-1.5",
            isCompanion ? "text-ink/35" : "text-ink/40"
          )}>
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
