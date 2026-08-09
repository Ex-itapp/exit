"use client";

import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/useAuth";
import { usePro } from "@/lib/usePro";
import { ArrowLeft, Crown } from "lucide-react";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isPro } = usePro();
  const pathname = usePathname();
  const router = useRouter();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  React.useEffect(() => {
    if (!loading && user && pathname === '/') {
      router.replace(localStorage.getItem('unsent_onboarding_done_clean') === 'true' ? '/dashboard' : '/onboarding');
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



  const isPublicPage = pathname === '/' || pathname === '/onboarding' || pathname === '/tos' || pathname === '/privacy' || pathname === '/support' || pathname === '/auth';

  // If user is not authenticated and not on a public page, gate them (unless on localhost)
  // Auth removed for Vercel testing
  // if (!user && !isLocalhost && !isPublicPage) {
  //   return <CompulsoryAuthGate />;
  // }

  // Public pages
  if (isPublicPage) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand selection:text-ink">
        {children}
      </div>
    );
  }

  return (
      <div suppressHydrationWarning className="w-full min-h-screen flex flex-col bg-bg relative">
        
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
          {user && (
            <div className="pointer-events-auto shrink-0">
              {isPro ? (
                <button
                  onClick={() => router.push('/account')}
                  className="flex items-center gap-1.5 sm:gap-2 bg-ink text-bg px-2.5 sm:px-3 py-1 sm:py-1.5 border-2 border-ink brutalist-shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  title="Pro status"
                >
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand" />
                  <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">Pro Active</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 border-2 border-ink brutalist-shadow-sm hover:bg-brand hover:text-ink transition-colors cursor-pointer"
                  title="Upgrade to Pro"
                >
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ink" />
                  <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">Pro</span>
                </button>
              )}
            </div>
          )}
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
        <PWAInstallBanner />
      </div>
  );
}
