"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Home, CalendarDays, User, X, Pause, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const navItems = [
  { icon: Home, path: "/dashboard", label: "Home" },
  { icon: Book, path: "/diary", label: "Logs" },
  { icon: CalendarDays, path: "/timeline", label: "Timeline" },
  { icon: User, path: "/account", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();

  const [showStory, setShowStory] = useState(false);

  if (pathname === '/onboarding' || pathname.startsWith('/closure') || pathname.startsWith('/therapist') || pathname.startsWith('/onboarding') || pathname.includes('/new') || pathname.includes('/edit')) return null;

  return (
    <>
      <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center w-full px-2 sm:px-4">
        <div className="flex items-center gap-3 w-full max-w-2xl pointer-events-auto">
          {/* Main Nav Pill */}
          <nav className="flex-1 bg-bg border-3 sm:border-4 border-ink brutalist-shadow rounded-full flex items-center justify-between p-1 sm:p-1.5 shadow-2xl">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative flex-1 flex justify-center items-center py-3 sm:py-3.5 px-2 rounded-full transition-colors group select-none cursor-pointer",
                    isActive ? "text-bg" : "text-ink hover:text-ink/80"
                  )}
                >
                  {/* Smooth Sliding Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavActivePill"
                      className="absolute inset-0 bg-ink rounded-full z-0 border-2 border-ink"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30
                      }}
                    />
                  )}

                  {/* Icon with Hover / Active Animation */}
                  <motion.div 
                    className="relative z-10 flex flex-col items-center justify-center"
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 shrink-0" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Story Circle */}
          <button
            onClick={() => setShowStory(true)}
            className="shrink-0 relative w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] rounded-full border-3 sm:border-4 border-ink bg-bg brutalist-shadow flex items-center justify-center overflow-visible hover:scale-105 transition-transform"
          >
            {/* Story Ring (Gradient) */}
            <div className="absolute -inset-[5px] sm:-inset-[6px] rounded-full border-[3px] border-blue pointer-events-none" />
            
            <div className="w-full h-full bg-ink rounded-full flex items-center justify-center p-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            </div>
          </button>
        </div>
      </div>

      {/* Fullscreen Story Viewer Modal */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-ink flex flex-col items-center justify-center sm:p-4 overflow-hidden"
          >
            {/* Story Container */}
            <div className="relative w-full h-full sm:max-w-md sm:h-[90vh] bg-blue/20 sm:rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border-0 sm:border-4 border-ink">
              
              {/* Top Progress Bars */}
              <div className="absolute top-0 left-0 right-0 p-4 pt-8 sm:pt-6 z-20 flex gap-1.5">
                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-full"></div>
                </div>
                <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
                <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
              </div>

              {/* Top Controls */}
              <div className="absolute top-12 sm:top-10 left-0 right-0 px-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span className="text-white font-heading text-sm uppercase tracking-widest drop-shadow-md">Pattern Report</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-white/80 hover:text-white transition-colors drop-shadow-md">
                    <Pause className="w-5 h-5" />
                  </button>
                  <button onClick={() => setShowStory(false)} className="text-white hover:text-accent transition-colors drop-shadow-md">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Placeholder Content - to be replaced by @vercel/og images */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 bg-gradient-to-b from-blue/40 to-ink/90">
                <h2 className="text-white font-heading text-4xl uppercase mb-4 drop-shadow-lg">
                  YOU'VE BEEN DOING THE WORK.
                </h2>
                <p className="text-white/80 font-sans text-lg font-medium">
                  3 Diary Entries. 1 Red Flag Logged.<br/>And 0 messages sent to them.
                </p>
                <div className="mt-12 w-32 h-32 border-4 border-brand rounded-full flex items-center justify-center brutalist-shadow-sm rotate-12">
                  <span className="font-heading text-6xl text-brand">3</span>
                  <span className="font-mono text-xs absolute -bottom-3 bg-bg text-ink px-2 font-bold uppercase border-2 border-ink">Days</span>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-center pb-12 sm:pb-8 bg-gradient-to-t from-ink/80 to-transparent">
                <button className="bg-white text-ink px-6 py-3 rounded-full font-heading uppercase text-sm brutalist-shadow-sm hover:scale-105 transition-transform flex items-center gap-2 border-2 border-ink">
                  Share to Story
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
