"use client";

import { Sparkles, Flag, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  visible: boolean;
}

export function QuickActions({ onSelect, visible }: QuickActionsProps) {
  const actions = [
    {
      id: "analyze",
      icon: <Sparkles className="w-4 h-4 text-brand" />,
      label: "Analyze my past week",
      prompt: "Please analyze my recent history and start our conversation.",
    },
    {
      id: "text",
      icon: <Flag className="w-4 h-4 text-accent" />,
      label: "I want to text them",
      prompt: "I really want to text my ex right now. Can you help me work through this urge?",
    },
    {
      id: "vent",
      icon: <MessageSquare className="w-4 h-4 text-blue" />,
      label: "I need to vent",
      prompt: "I just need to vent and talk about something else.",
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={false}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl mx-auto flex flex-row overflow-x-auto gap-2.5 px-4 py-2 scrollbar-hide"
        >
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => onSelect(action.prompt)}
              className={cn(
                "shrink-0 rounded-none bg-bg border border-ink/12 px-4 py-2.5 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-left animate-pill-in"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="shrink-0">{action.icon}</div>
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
