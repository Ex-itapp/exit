"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Plus, Trash2, BookOpen } from "lucide-react";
import { useDiary } from "@/lib/useDiary";
import { ShareModal, type ShareEntryData } from "@/components/ShareModal";

export default function DiaryPage() {
  const navigate = useRouter();
  const { entries, deleteEntry } = useDiary();
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

  const handleEntryClick = (entry: any) => {
    setSelectedEntry({
      type: "diary",
      id: entry.id,
      content: entry.content,
      createdAt: entry.createdAt,
      tags: entry.moods,
      isUnsent: entry.isUnsent,
    });
  };

  // ── EMPTY STATE ──────────────────────────────────────────────
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4 animate-in fade-in duration-200">
        <div className="w-20 h-20 border-4 border-dashed border-ink/30 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-ink/40" />
        </div>
        <div className="space-y-1">
          <p className="font-heading text-xl tracking-tight">No diary entries yet</p>
          <p className="font-mono text-xs text-ink/50 uppercase tracking-widest">Your thoughts deserve a home</p>
        </div>
        <button
          onClick={() => navigate.push("/diary/new")}
          className="flex items-center gap-2 bg-ink text-bg font-mono text-sm font-bold uppercase tracking-widest px-6 py-3 hover:opacity-90 transition-opacity brutalist-shadow"
        >
          <PenLine className="w-4 h-4" />
          Write First Entry
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
          <h1 className="font-heading text-2xl sm:text-3xl tracking-tighter">MY DIARY</h1>
          <p className="font-mono text-[10px] text-ink/50 uppercase tracking-widest mt-0.5">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2.5">
        {entries.map((entry) => {
          const f = formatDate(entry.createdAt);
          const preview = entry.content.replace(/\n+/g, " ").trim();
          return (
            <div
              key={entry.id}
              onClick={() => handleEntryClick(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleEntryClick(entry)}
              className="w-full bg-white border-2 border-ink brutalist-shadow-sm p-4 text-left flex items-start gap-4 hover:bg-[#fdfaf4] transition-colors group cursor-pointer"
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
                  {entry.moods?.length > 0 && (
                    <span className="font-mono text-[9px] bg-ink/5 px-1.5 py-0.5 text-ink/60 uppercase tracking-widest">
                      {entry.moods.slice(0, 2).join(" · ")}
                    </span>
                  )}
                  {entry.isUnsent && (
                    <span className="font-mono text-[9px] bg-ink text-bg px-1.5 py-0.5 uppercase tracking-widest">
                      Sealed
                    </span>
                  )}
                </div>
                <p className="font-mono text-sm text-ink/80 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                  {preview}
                </p>
                <span className="font-mono text-[9px] text-ink/30 mt-1.5 block">{f.time}</span>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-accent/10 text-accent"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating + FAB */}
      <button
        onClick={() => navigate.push("/diary/new")}
        className="fixed bottom-24 right-5 sm:right-8 w-14 h-14 bg-ink text-bg border-2 border-ink brutalist-shadow flex items-center justify-center hover:scale-105 transition-transform z-40"
        aria-label="New diary entry"
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
