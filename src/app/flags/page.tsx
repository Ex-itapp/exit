"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag as FlagIcon, Plus, Trash2 } from "lucide-react";
import { useFlags } from "@/lib/useFlags";
import { ShareModal, type ShareEntryData } from "@/components/ShareModal";

const CATEGORY_COLORS: Record<string, string> = {
  "Emotional Manipulation": "bg-rose-500",
  "Disrespect": "bg-orange-400",
  "Control": "bg-amber-500",
  "Isolation": "bg-yellow-500",
  "Jealousy": "bg-lime-500",
  "Gaslighting": "bg-purple-500",
  "Verbal Abuse": "bg-red-600",
};

export default function FlagsPage() {
  const navigate = useRouter();
  const { flags, deleteFlag } = useFlags();
  const [selectedEntry, setSelectedEntry] = useState<ShareEntryData | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: d.getFullYear(),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  };

  const handleFlagClick = (flag: any) => {
    setSelectedEntry({
      type: "flag",
      id: flag.id,
      content: flag.content,
      createdAt: flag.createdAt,
      tags: [flag.category],
    });
  };

  // ── EMPTY STATE ──────────────────────────────────────────────
  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4 animate-in fade-in duration-200">
        <div className="w-20 h-20 border-4 border-dashed border-accent/40 flex items-center justify-center">
          <FlagIcon className="w-8 h-8 text-accent/50" />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-xl tracking-tight">No red flags logged</p>
          <p className="font-mono text-xs text-ink/50 uppercase tracking-widest">Write it down so you don&apos;t forget</p>
        </div>
        <button
          onClick={() => navigate.push("/flags/new")}
          className="flex items-center gap-2 bg-accent text-white font-mono text-sm font-bold uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity brutalist-shadow border-2 border-accent"
        >
          <Plus className="w-4 h-4" />
          Log First Flag
        </button>
      </div>
    );
  }

  // ── LIST STATE ───────────────────────────────────────────────
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-200 pb-28 max-w-2xl mx-auto w-full px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 pb-5 border-b-2 border-ink/10 mb-5">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tighter">RED FLAGS</h1>
          <p className="font-mono text-[10px] text-ink/50 uppercase tracking-widest mt-0.5">
            {flags.length} {flags.length === 1 ? "incident" : "incidents"} logged
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2.5">
        {flags.map((flag) => {
          const f = formatDate(flag.createdAt);
          const preview = flag.content.replace(/\n+/g, " ").trim();
          const dotColor = CATEGORY_COLORS[flag.category] ?? "bg-accent";
          return (
            <button
              key={flag.id}
              onClick={() => handleFlagClick(flag)}
              className="w-full bg-white border-2 border-ink brutalist-shadow-sm p-4 text-left flex items-start gap-4 hover:bg-rose-50/30 transition-colors group"
            >
              {/* Date Stamp */}
              <div className="shrink-0 w-12 text-center border-r-2 border-ink/10 pr-3">
                <span className="font-mono text-[9px] font-bold text-ink/40 block">{f.day}</span>
                <span className="font-heading text-2xl leading-none font-black text-ink block">{f.date}</span>
                <span className="font-mono text-[9px] font-bold text-ink/50 block">{f.month}</span>
                <span className="font-mono text-[8px] text-ink/30 block">{f.year}</span>
              </div>

              {/* Content Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-accent">
                    {flag.category}
                  </span>
                </div>
                <p className="font-mono text-sm text-ink/80 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                  {preview}
                </p>
                <span className="font-mono text-[9px] text-ink/30 mt-1.5 block">{f.time}</span>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteFlag(flag.id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-accent/10 text-accent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          );
        })}
      </div>

      {/* Floating + FAB */}
      <button
        onClick={() => navigate.push("/flags/new")}
        className="fixed bottom-24 right-5 sm:right-8 w-14 h-14 bg-accent text-white border-2 border-accent brutalist-shadow flex items-center justify-center hover:scale-105 transition-transform z-40"
        aria-label="Log new red flag"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Share / Read Modal */}
      {selectedEntry && (
        <ShareModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
