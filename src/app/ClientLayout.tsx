"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { useUser } from "@/lib/useUser";
import { useAuth } from "@/lib/useAuth";
import { CompulsoryAuthGate } from "@/components/auth/CompulsoryAuthGate";
import { LogOut } from "lucide-react";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { appMode, setAppMode } = useUser();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  const toggleMode = () => {
    setAppMode(appMode === 'no_contact' ? 'evaluating' : 'no_contact');
  };

  // Prevent flash of home or onboarding while verifying auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg w-full flex items-center justify-center">
        <div className="p-8 bg-white border-4 border-ink brutalist-shadow text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-ink border-t-brand rounded-full animate-spin" />
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">VERIFYING SANCTUARY ACCESS...</p>
        </div>
      </div>
    );
  }

  // Compulsory Auth Gate: Must be logged in before accessing onboarding or any route
  if (!user) {
    return <CompulsoryAuthGate />;
  }

  if (pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-bg w-full transition-colors duration-500">
        {children}
      </div>
    );
  }

  return (
    <div className={`flex justify-center min-h-screen w-full transition-colors duration-500 ${appMode === 'evaluating' ? 'bg-purple/10' : 'bg-bg'}`}>
      <div className="flex-1 flex flex-col h-[100dvh] w-full relative overflow-hidden">
        <header className="border-b-4 border-ink p-4 flex items-center justify-between sticky top-0 z-40 bg-transparent shrink-0 backdrop-blur-md">
          <h1 className="text-2xl font-heading tracking-tighter">UNSENT</h1>
          
          <div className="flex items-center gap-3">
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

            {/* Global Log Out Button */}
            <button
              onClick={signOut}
              className="flex items-center justify-center w-12 h-12 bg-white border-[3px] border-ink rounded-full brutalist-shadow-sm hover:bg-danger/10 hover:text-danger hover:border-danger transition-colors shrink-0"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
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
