"use client";

import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/lib/useAuth";
import { usePro } from "@/lib/usePro";
import { ArrowLeft, Crown } from "lucide-react";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { PWANotificationsPrompt } from "@/components/PWANotificationsPrompt";

export function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isPro } = usePro();
  const pathname = usePathname();
  const router = useRouter();



  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const removeAttr = (el: Element) => {
      if (el && el.removeAttribute) el.removeAttribute('bis_skin_checked');
    };
    document.querySelectorAll('[bis_skin_checked]').forEach(removeAttr);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
          removeAttr(m.target as Element);
        } else if (m.addedNodes.length) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              removeAttr(node as Element);
              (node as Element).querySelectorAll('[bis_skin_checked]').forEach(removeAttr);
            }
          });
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked']
    });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!loading && user) {
      // Fast path: if localStorage says they finished onboarding, trust it instantly to unblock the UI!
      const localOnboarding = localStorage.getItem('unsent_onboarding_done_clean');
      if (localOnboarding === 'true') {
        setHasCompletedOnboarding(true);
        setProfileLoading(false);
      } else {
        // Slow path: Only hit Supabase if we don't have a local cache (e.g. fresh PWA install)
        setProfileLoading(true);
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.from('user_profiles').select('has_completed_onboarding').eq('id', user.id).maybeSingle()
            .then(({ data }) => {
              if (data?.has_completed_onboarding) {
                 localStorage.setItem('unsent_onboarding_done_clean', 'true');
                 setHasCompletedOnboarding(true);
              } else {
                 setHasCompletedOnboarding(false);
              }
              setProfileLoading(false);
            });
        });
      }
    } else if (!loading && !user) {
      setProfileLoading(false);
    }
  }, [user, loading]);

  React.useEffect(() => {
    if (!loading && !profileLoading && user && pathname === '/') {
      router.replace(hasCompletedOnboarding ? '/dashboard' : '/onboarding');
    }
  }, [user, loading, profileLoading, hasCompletedOnboarding, pathname, router]);

  const hideBottomNav = ['/onboarding', '/therapist', '/closure', '/diary/new', '/flags/new', '/pricing'].includes(pathname) || 
                        pathname.startsWith('/closure') || 
                        pathname.startsWith('/therapist') || 
                        pathname.startsWith('/onboarding') ||
                        pathname.includes('/new') ||
                        pathname.includes('/edit');

  // Prevent flash of home or onboarding while verifying auth session, except on the landing page which should load instantly (unless we detect a stored session)
  const hasLocalSession = typeof window !== 'undefined' && Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  
  const isResolvingAuth = loading || (user && profileLoading);
  const isPublicPage = pathname === '/' || pathname === '/onboarding' || pathname === '/tos' || pathname === '/privacy' || pathname === '/support' || pathname === '/auth';

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // During SSR and the very first client render, we must match the server output
  // to avoid hydration mismatch errors.
  if (!mounted) {
    if (isPublicPage) {
      return (
        <div suppressHydrationWarning className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-brand selection:text-ink">
          {children}
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="border-4 border-ink bg-white p-6 brutalist-shadow text-center">
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">PREPARING YOUR SPACE...</p>
        </div>
      </div>
    );
  }

  if (isResolvingAuth && (pathname !== '/' || hasLocalSession)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="border-4 border-ink bg-white p-6 brutalist-shadow text-center">
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">PREPARING YOUR SPACE...</p>
        </div>
      </div>
    );
  }

  // If a user is fully authenticated and still on the landing page, block the rendering of the landing page completely
  // to prevent heavy entrance animations from firing for 1 frame before the router pushes them away.
  if (user && pathname === '/') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="border-4 border-ink bg-white p-6 brutalist-shadow text-center">
          <p className="font-mono font-bold text-sm tracking-widest uppercase text-ink">PREPARING YOUR SPACE...</p>
        </div>
      </div>
    );
  }



  const isPublicPage = pathname === '/' || pathname === '/onboarding' || pathname === '/tos' || pathname === '/privacy' || pathname === '/support' || pathname === '/auth';

  // If user is not authenticated and not on a public page, gate them
  if (!user && !isPublicPage) {
    return <CompulsoryAuthGate />;
  }

  const hasCustomBackButton = [
    '/dashboard', 
    '/onboarding', 
    '/auth',
    '/roadmap',
    '/therapist',
    '/closure',
    '/diary/new',
    '/flags/new',
    '/privacy',
    '/tos',
    '/support',
    '/talk'
  ].includes(pathname) || pathname?.startsWith('/timeline/');

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
        <header className="px-3 sm:px-4 md:px-8 pt-3 sm:pt-6 pb-2 flex items-center justify-between sticky top-0 z-40 bg-transparent pointer-events-none transition-all duration-200">
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {!hasCustomBackButton && (
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
                  <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">Try Pro</span>
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
        <PWANotificationsPrompt />
      </div>
  );
}
