"use client";

import { Sparkles, Flag, MessageSquare, Gamepad2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  visible: boolean;
  onOpenGames?: () => void;
}

export function QuickActions({ onSelect, visible, onOpenGames }: QuickActionsProps) {
  const router = useRouter();

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
      isIntercept: true,
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
              onClick={() => {
                if (action.isIntercept) {
                  router.push('/play/interceptor');
                } else if (action.prompt) {
                  onSelect(action.prompt);
                }
              }}
              className={cn(
                "shrink-0 rounded-none bg-bg border-2 border-ink/20 px-4 py-2 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px] hover:shadow-ink/15 transition-all duration-200 text-left animate-pill-in"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="shrink-0">{action.icon}</div>
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}

          {/* Games pill */}
          {onOpenGames && (
            <button
              onClick={onOpenGames}
              className="shrink-0 rounded-none bg-brand border-2 border-ink px-4 py-2 flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px] hover:shadow-ink/15 transition-all duration-200 text-left animate-pill-in"
              style={{ animationDelay: `${actions.length * 80}ms` }}
            >
              <Gamepad2 className="w-4 h-4 text-ink" />
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-ink whitespace-nowrap">
                Play a game
              </span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
