"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { useUser } from "@/lib/useUser";
import { useAuth } from "@/lib/useAuth";
import { CompulsoryAuthGate } from "@/components/auth/CompulsoryAuthGate";
import { LogOut, ArrowLeft } from "lucide-react";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { appMode, setAppMode } = useUser();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const hideBottomNav = ['/onboarding', '/therapist', '/closure', '/diary/new', '/flags/new'].includes(pathname) || 
                        pathname.startsWith('/closure') || 
                        pathname.startsWith('/therapist') || 
                        pathname.startsWith('/onboarding');

  const toggleMode = () => {
    setAppMode(appMode === 'no_contact' ? 'evaluating' : 'no_contact');
  };

  // Prevent flash of home or onboarding while verifying auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="border-4 border-ink bg-white p-6 brutalist-shadow text-center">
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">VERIFYING SANCTUARY ACCESS...</p>
        </div>
      </div>
    );
  }

  // Compulsory Auth Gate: Must be logged in before accessing onboarding or any route
  if (!user) {
    return <CompulsoryAuthGate />;
  }

  // If user is logged in, Onboarding is handled inside Onboarding page or via route redirect in main app
  if (pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand selection:text-ink">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand selection:text-ink">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col border-x-0 md:border-x-4 border-ink bg-bg relative shadow-2xl">
        
        {/* Persistent App Header */}
        <header className="h-20 border-b-4 border-ink bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {pathname !== '/' && pathname !== '/onboarding' && (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 h-10 bg-white border-2 border-ink brutalist-shadow-sm hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div className="w-6 h-6 bg-brand border-2 border-ink block transform -rotate-6" />
            <h1 
              className="font-heading text-2xl md:text-3xl tracking-tight font-black uppercase cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => router.push('/')}
            >
              UNSENT<span className="text-brand">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher Pill */}
            <button
              onClick={toggleMode}
              className="group relative flex items-center h-12 bg-bg border-[3px] border-ink p-1 cursor-pointer overflow-hidden brutalist-shadow-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_var(--color-ink)] transition-all"
              title="Toggle Healing Mode"
            >
              {/* Sliding Background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-ink transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  appMode === 'no_contact' ? 'translate-x-0' : 'translate-x-[100%]'
                }`} 
              />
              
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
          <div className="w-full h-full">
            {children}
            {/* Explicit spacer to prevent floating nav overlap */}
            {!hideBottomNav && <div className="h-32 w-full shrink-0 pointer-events-none" />}
          </div>
        </main>
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
