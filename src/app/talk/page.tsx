"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Zap, MessageSquare, ChevronRight, PenLine, Settings } from "lucide-react";
import { useDiary } from "@/lib/useDiary";
import { getMoodEmoji } from "@/lib/visualSystem";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } }
};

const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function TalkPage() {
  const router = useRouter();
  const { entries } = useDiary();
  
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-2 pb-24">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
        
        {/* Header */}
        <motion.div variants={item} className="mb-6 px-1">
          <h1 className="font-heading text-2xl uppercase text-ink">Messages</h1>
          <p className="font-sans text-sm text-ink/60">Connect and reflect.</p>
        </motion.div>

        {/* Chat List */}
        <motion.div variants={item} className="flex flex-col border-t-2 border-ink">
          
          {/* Chat Item 1 */}
          <div 
            onClick={() => router.push('/therapist')}
            className="flex items-center p-3 border-b-2 border-ink cursor-pointer hover:bg-ink/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple border-2 border-ink flex items-center justify-center shrink-0 mr-4 group-hover:rotate-3 transition-transform">
              <Zap className="w-6 h-6 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold text-base text-ink truncate">Healing Companion</h3>
              <p className="font-sans text-sm text-ink/50 truncate">Your ride-or-die through the hard days</p>
            </div>
            <div className="ml-2 pl-2 flex items-center gap-1">
              <ChevronRight className="w-5 h-5 text-ink/30 group-hover:text-ink/60 transition-colors" />
            </div>
          </div>

          {/* Chat Item 2 */}
          <div 
            onClick={() => router.push('/closure')}
            className="flex items-center p-3 border-b-2 border-ink cursor-pointer hover:bg-ink/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-brand border-2 border-ink flex items-center justify-center shrink-0 mr-4 group-hover:rotate-3 transition-transform">
              <MessageSquare className="w-6 h-6 text-ink" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold text-base text-ink truncate">Talk to Them</h3>
              <p className="font-sans text-sm text-ink/50 truncate">Simulate closure conversations</p>
            </div>
            <div className="ml-2 pl-2 flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/closure?mode=settings');
                }}
                className="p-2 border-2 border-ink bg-white hover:bg-brand text-ink transition-colors brutalist-shadow-sm shrink-0"
                title="Persona Settings"
              >
                <Settings className="w-4 h-4 text-ink" />
              </button>
              <ChevronRight className="w-5 h-5 text-ink/30 group-hover:text-ink/60 transition-colors" />
            </div>
          </div>

        </motion.div>

        {/* Reflections Section */}
        <motion.div variants={item} className="mt-8">
          <div className="flex items-center mb-3 px-1">
            <div className="h-px bg-ink/10 flex-1 mr-3"></div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Reflections</h2>
            <div className="h-px bg-ink/10 flex-1 ml-3"></div>
          </div>

          <div className="flex flex-col gap-2">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <div key={entry.id} className="border-2 border-ink bg-white p-3 flex flex-col gap-2 brutalist-shadow-sm transition-transform hover:-translate-y-0.5">
                  <div className="flex items-start gap-2">
                    {entry.mood && <span className="text-base leading-none pt-0.5">{getMoodEmoji(entry.mood)}</span>}
                    <p className="font-sans text-sm text-ink line-clamp-2 leading-relaxed flex-1">
                      {entry.content}
                    </p>
                  </div>
                  <div className="font-mono text-[10px] text-ink/40 text-right">
                    {formatDate(entry.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-2 border-ink/10 border-dashed bg-ink/5">
                <p className="font-sans text-sm text-ink/40 flex flex-col items-center gap-2">
                  <PenLine className="w-5 h-5 opacity-50" />
                  Your reflections will appear here as you journal
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/diary" className="font-mono text-xs uppercase text-ink/60 hover:text-ink transition-colors inline-flex items-center gap-1">
              View all entries <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
