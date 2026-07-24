"use client";

import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useUser } from "@/lib/useUser";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { appMode, setAppMode } = useUser();

  const toggleMode = () => {
    setAppMode(appMode === 'no_contact' ? 'evaluating' : 'no_contact');
  };

  return (
    <div className={`flex justify-center min-h-screen w-full transition-colors duration-500 ${appMode === 'evaluating' ? 'bg-purple/10' : 'bg-bg'}`}>
      <div className="flex-1 flex flex-col h-[100dvh] w-full relative overflow-hidden">
        <header className="border-b-4 border-ink p-4 flex items-center justify-between sticky top-0 z-40 bg-transparent shrink-0 backdrop-blur-md">
          <h1 className="text-2xl font-heading tracking-tighter">UNSENT</h1>
          
          <div className="flex items-center gap-4">
            {/* Sleek Mode Toggle */}
            <button 
              onClick={toggleMode}
              className="relative flex items-center w-48 h-12 bg-white border-[3px] border-ink rounded-full p-1 cursor-pointer brutalist-shadow-sm group select-none"
            >
              {/* Sliding Pill Container */}
              <div className="absolute inset-1 pointer-events-none">
                <div 
                  className={`w-1/2 h-full bg-ink rounded-full transition-transform duration-500 ease-out ${
                    appMode === 'no_contact' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
              </div>
              
              {/* Text Labels */}
              <div className="relative z-10 flex-1 h-full flex items-center justify-center">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest font-mono transition-colors duration-500 ${appMode === 'no_contact' ? 'text-bg' : 'text-ink/60 group-hover:text-ink'}`}>
                  No Contact
                </span>
              </div>
              <div className="relative z-10 flex-1 h-full flex items-center justify-center">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest font-mono transition-colors duration-500 ${appMode === 'evaluating' ? 'text-bg' : 'text-ink/60 group-hover:text-ink'}`}>
                  Clarity
                </span>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
          {/* Subtle background grid pattern for brutalist feel */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10 w-full h-full">
            {children}
            {/* Explicit spacer to prevent floating nav overlap */}
            <div className="h-32 w-full shrink-0 pointer-events-none" />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
