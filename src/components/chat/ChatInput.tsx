"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import type { ChatMood } from "@/lib/useTheme";

interface ChatInputProps {
  mood: ChatMood;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  mood,
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const isCompanion = mood === "companion";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200); // Wait for punch animation
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = disabled || !value.trim();

  return (
    <div
      className={cn(
        "flex flex-row items-end gap-2 p-2 rounded-none w-full transition-colors bg-bg border-2 border-ink shadow-[3px_3px_0px_0px] shadow-ink/15"
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "flex-1 font-sans text-[15px] resize-none outline-none bg-transparent py-2.5 px-3 max-h-[120px] overflow-y-auto scrollbar-hide text-ink placeholder:text-ink/40"
        )}
      />
      <button
        onClick={handleSend}
        disabled={isDisabled}
        className={cn(
          "w-11 h-11 rounded-none flex items-center justify-center shrink-0 transition-all border-2 border-ink",
          isCompanion ? "bg-brand text-ink hover:bg-brand/90" : "bg-accent text-bg hover:bg-accent/90",
          isDisabled && "opacity-30 pointer-events-none",
          isAnimating && "animate-punch"
        )}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
