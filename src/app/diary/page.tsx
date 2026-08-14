"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lock, PenLine, Flag as FlagIcon, Plus, Archive } from "lucide-react";
import { useDiary } from "@/lib/useDiary";
import { useFlags } from "@/lib/useFlags";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

type Tab = 'diary' | 'flags' | 'archive';

export default function Diary() {
  const navigate = useRouter();
  const { entries: activeEntries, archivedEntries } = useDiary();
  const { flags: activeFlags, archivedFlags } = useFlags();
  
  const [activeTab, setActiveTab] = useState<Tab>('diary');

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  const handleDiaryClick = (id: string) => {
    navigate.push(`/diary/${id}`);
  };

  const handleFlagClick = (id: string) => {
    navigate.push(`/flags/${id}`);
  };

  const allArchived = [
    ...archivedEntries.map(e => ({ ...e, type: 'diary' })),
    ...archivedFlags.map(f => ({ ...f, type: 'flag' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-150 pb-20 max-w-[1200px] mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-ink pb-6 relative">
        <div className="z-10">
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter">LOGBOOK</h1>
          <div className="h-6 mt-2">
            <p className="font-mono text-ink/70 text-sm md:text-base uppercase tracking-widest whitespace-nowrap">
              {activeTab === 'diary' && 'Your week, unfiltered.'}
              {activeTab === 'flags' && 'Write it down so you don\'t forget.'}
              {activeTab === 'archive' && 'Soft-deleted records.'}
            </p>
          </div>
        </div>
        
        {/* Tab Switcher - Absolutely centered on desktop, normal flow on mobile */}
        <div className="static sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 z-10 flex w-full sm:w-auto justify-start sm:justify-center overflow-x-auto pb-2 sm:pb-0">
          <div className="flex bg-white border-3 border-ink p-1 brutalist-shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab('diary')}
              className={cn(
                "px-4 py-2 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === 'diary' ? "bg-ink text-bg" : "hover:bg-bg"
              )}
            >
              <PenLine className="w-4 h-4" /> Diary
            </button>
            <button
              onClick={() => setActiveTab('flags')}
              className={cn(
                "px-4 py-2 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === 'flags' ? "bg-accent text-bg" : "hover:bg-bg"
              )}
            >
              <FlagIcon className="w-4 h-4" /> Flags
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={cn(
                "px-4 py-2 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === 'archive' ? "bg-ink text-bg opacity-70" : "hover:bg-bg"
              )}
            >
              <Archive className="w-4 h-4" /> Archive
            </button>
          </div>
        </div>

        <div className="flex gap-2 z-10 w-full sm:w-auto justify-start sm:justify-end min-h-[40px]">
          {activeTab === 'diary' && (
            <Button onClick={() => navigate.push('/diary/new')} className="brutalist-shadow-sm group h-10 px-4 shrink-0">
              <PenLine className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              New Entry
            </Button>
          )}
          {activeTab === 'flags' && (
            <Button onClick={() => navigate.push('/flags/new')} className="brutalist-shadow-sm group bg-accent hover:bg-accent/90 text-bg border-accent h-10 px-4 shrink-0">
              <Plus className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform" />
              Log Flag
            </Button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* DIARY TAB */}
          {activeTab === 'diary' && (
            <>
              {activeEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
                  <div className="w-24 h-24 border-4 border-dashed border-ink flex items-center justify-center rounded-xl">
                    <PenLine className="w-8 h-8" />
                  </div>
                  <p className="font-mono uppercase font-bold tracking-widest">No entries yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeEntries.map(entry => (
                    <Card 
                      key={entry.id} 
                      onClick={() => handleDiaryClick(entry.id)}
                      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)] cursor-pointer ${
                        entry.isUnsent ? "bg-ink text-bg border-ink" : "bg-[#f4f1ea] border-ink"
                      }`}
                    >
                      {!entry.isUnsent && (
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                      )}
                      <CardContent className="p-6 flex flex-col h-full min-h-[250px] relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-wrap gap-2">
                            {entry.isUnsent ? (
                              <Badge variant="accent" className="border-bg bg-accent text-bg font-bold">
                                <Lock className="w-3 h-3 mr-1 inline-block" /> Sealed
                              </Badge>
                            ) : (
                              entry.moods.map(mood => (
                                <Badge key={mood} variant="outline" className="border-ink bg-white/50 backdrop-blur-sm font-bold">
                                  {mood}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                        <p className={`flex-1 text-lg leading-relaxed mb-6 whitespace-pre-wrap line-clamp-6 ${
                          entry.isUnsent ? 'font-mono italic opacity-90' : 'font-medium'
                        }`}>
                          {entry.content}
                        </p>
                        <div className="mt-auto pt-4 border-t-2 border-current opacity-30 flex justify-between items-center">
                          <span className="font-mono text-xs font-bold tracking-widest">
                            {formatTime(entry.createdAt)}
                          </span>
                          {!entry.isUnsent && <span className="font-heading text-xl">#</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* FLAGS TAB */}
          {activeTab === 'flags' && (
            <>
              {activeFlags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
                  <div className="w-24 h-24 border-4 border-dashed border-ink flex items-center justify-center rounded-xl bg-accent/5">
                    <FlagIcon className="w-8 h-8 text-accent" />
                  </div>
                  <p className="font-mono uppercase font-bold tracking-widest">No flags logged yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeFlags.map(flag => (
                    <Card 
                      key={flag.id} 
                      onClick={() => handleFlagClick(flag.id)}
                      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white border-ink hover:shadow-[8px_8px_0_var(--color-accent)] border-t-8 border-t-accent cursor-pointer"
                    >
                      <CardContent className="p-6 flex flex-col h-full min-h-[200px] relative z-10">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <Badge variant="accent" className="font-bold text-xs uppercase tracking-widest">{flag.category}</Badge>
                        </div>
                        <p className="flex-1 text-lg font-medium leading-relaxed whitespace-pre-wrap mb-6 text-ink/90 line-clamp-6">
                          {flag.content}
                        </p>
                        <div className="mt-auto pt-4 border-t-2 border-ink/10 flex justify-between items-center text-ink/40">
                          <span className="font-mono text-xs font-bold tracking-widest">
                            {formatTime(flag.createdAt)}
                          </span>
                          <FlagIcon className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ARCHIVE TAB */}
          {activeTab === 'archive' && (
            <>
              {allArchived.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 space-y-4">
                  <div className="w-24 h-24 border-4 border-dashed border-ink flex items-center justify-center rounded-xl bg-ink/5">
                    <Archive className="w-8 h-8 text-ink" />
                  </div>
                  <p className="font-mono uppercase font-bold tracking-widest">Archive is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allArchived.map((item: any) => (
                    <Card 
                      key={item.id} 
                      onClick={() => item.type === 'diary' ? handleDiaryClick(item.id) : handleFlagClick(item.id)}
                      className="group relative overflow-hidden bg-white border-ink cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <CardContent className="p-6 flex flex-col h-full min-h-[200px]">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <Badge variant="outline" className="font-bold text-xs uppercase tracking-widest">
                            {item.type === 'diary' ? 'Diary Entry' : 'Red Flag'}
                          </Badge>
                        </div>
                        <p className="flex-1 text-lg font-medium leading-relaxed whitespace-pre-wrap mb-6 text-ink/90 line-clamp-6">
                          {item.content}
                        </p>
                        <div className="mt-auto pt-4 border-t-2 border-ink/10 flex justify-between items-center text-ink/40">
                          <span className="font-mono text-xs font-bold tracking-widest">
                            {formatTime(item.createdAt)}
                          </span>
                          <Archive className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
