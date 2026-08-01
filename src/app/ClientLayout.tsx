"use client";

import React, { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/useAuth";
import { CompulsoryAuthGate } from "@/components/auth/CompulsoryAuthGate";
import { ArrowLeft } from "lucide-react";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const hideBottomNav = ['/onboarding', '/therapist', '/closure', '/diary/new', '/flags/new'].includes(pathname) || 
                        pathname.startsWith('/closure') || 
                        pathname.startsWith('/therapist') || 
                        pathname.startsWith('/onboarding') ||
                        pathname.includes('/new') ||
                        pathname.includes('/edit');

  // Prevent flash of home or onboarding while verifying auth session, except on the landing page which should load instantly
  if (loading && pathname !== '/') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="border-4 border-ink bg-white p-6 brutalist-shadow text-center">
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">VERIFYING SANCTUARY ACCESS...</p>
        </div>
      </div>
    );
  }

  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.')
  );

  const isPublicPage = pathname === '/' || pathname === '/onboarding' || pathname === '/tos' || pathname === '/privacy' || pathname === '/support' || pathname === '/auth';

  // If user is not authenticated and not on a public page, gate them (unless on localhost)
  if (!user && !isLocalhost && !isPublicPage) {
    return <CompulsoryAuthGate />;
  }

  // Public pages
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand selection:text-ink">
        {children}
      </div>
    );
  }

  return (
      <div className="w-full min-h-screen flex flex-col bg-bg relative">
        
        {/* Clean, Minimal Floating Logo Header */}
        <header className="px-3 sm:px-4 md:px-8 pt-3 sm:pt-6 pb-2 flex items-center justify-between sticky top-0 z-40 bg-transparent pointer-events-none">
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {pathname !== '/dashboard' && pathname !== '/onboarding' && (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 h-9 sm:h-10 bg-white border-2 border-ink brutalist-shadow-sm hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="inline">Back</span>
              </button>
            )}
            <div 
              className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 border-2 border-ink brutalist-shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => router.push('/dashboard')}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-brand border border-ink block transform -rotate-6" />
              <h1 className="font-heading text-lg sm:text-xl tracking-tight font-black uppercase">
                EX-it<span className="text-brand">.</span>
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 relative custom-scrollbar">
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
  );
}
