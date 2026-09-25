"use client";

import { cn } from "@/lib/utils";
import type { ChatMood } from "@/lib/useTheme";
import { useUser, DEFAULT_AVATAR } from "@/lib/useUser";
import { Avatar } from "@/components/ui/Avatar";

interface Message {
  role: string;
  content?: string;
  parts?: Array<{ text: string }>;
}

interface MessageBubbleProps {
  message?: Message;
  content?: string;
  isUser?: boolean;
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
  content,
  isUser,
  mood,
  isScreenshotMode,
  timestamp,
  showTimestamp,
  animationDelay = 0,
}: MessageBubbleProps) {
  const { userAvatar } = useUser();
  const isCompanion = mood === "companion";
  const finalIsUser = isUser !== undefined ? isUser : (message?.role === "user");
  const finalContent = content !== undefined ? content : (message?.parts?.[0]?.text || message?.content || "");

  // Pick a deterministic doodle from the message content
  const doodleIndex = finalContent.length % HEALING_DOODLES.length;
  const doodle = HEALING_DOODLES[doodleIndex];
  const doodle2 = HEALING_DOODLES[(doodleIndex + 3) % HEALING_DOODLES.length];

  // Should we show the healing decoration?
  const showHealingDecor = isCompanion && !finalIsUser && !isScreenshotMode;

  // Bubble styles based on mood and sender
  let bubbleClasses = "";
  if (finalIsUser) {
    bubbleClasses = "bg-bubble-self text-bubble-text-self rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
  } else {
    if (isCompanion) {
      bubbleClasses = "bg-ink/5 text-ink rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
    } else {
      bubbleClasses = "bg-bubble-other text-bubble-text-other rounded-none border-2 border-ink/15 shadow-[2px_2px_0px_0px] shadow-ink/10";
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
        finalIsUser ? "justify-end" : "justify-start"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className={cn("max-w-[80%] md:max-w-[80%] flex items-end gap-2", finalIsUser ? "flex-row-reverse" : "flex-row")}>
        
        {/* User Avatar */}
        {finalIsUser && (
          <div className="w-8 h-8 flex items-center justify-center shrink-0 mb-[14px]">
            <Avatar config={typeof userAvatar === 'object' ? userAvatar : DEFAULT_AVATAR} size="100%" />
          </div>
        )}

        <div className={cn("flex flex-col", finalIsUser ? "items-end" : "items-start")}>
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
            {finalContent}

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
    </div>
  );
}
