'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePro } from '../../lib/usePro';

function SuccessPageContent() {
  const { isPro, subscriptionStatus, expiresAt, paymentFailed, refreshSubscription } = usePro();
  const [dots, setDots] = useState('');
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showRefresh, setShowRefresh] = useState(false);
  const [proConfirmed, setProConfirmed] = useState(false);
  const [confirmedStatus, setConfirmedStatus] = useState<string | null>(null);
  const [confirmedExpiresAt, setConfirmedExpiresAt] = useState<string | null>(null);

  const isFullyPro = isPro || proConfirmed;

  // Show manual refresh after 5s
  useEffect(() => {
    if (isFullyPro || paymentFailed || isTimedOut) return;
    const timer = setTimeout(() => setShowRefresh(true), 5000);
    return () => clearTimeout(timer);
  }, [isFullyPro, paymentFailed, isTimedOut]);

  // Poll /api/user (admin, bypasses RLS) every 2s
  const pollServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.isPro) {
        setProConfirmed(true);
        setConfirmedStatus(data.subscriptionStatus || null);
        setConfirmedExpiresAt(data.expiresAt || null);
        refreshSubscription();
        return true;
      }
    } catch { /* retry on next tick */ }
    return false;
  }, [refreshSubscription]);

  useEffect(() => {
    if (isFullyPro || paymentFailed || isTimedOut) return;
    pollServerStatus();
    const interval = setInterval(async () => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
      const found = await pollServerStatus();
      if (found) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [isFullyPro, paymentFailed, isTimedOut, pollServerStatus]);

  // Timeout after 60s
  useEffect(() => {
    if (isFullyPro || paymentFailed) return;
    const timeout = setTimeout(() => setIsTimedOut(true), 60000);
    return () => clearTimeout(timeout);
  }, [isFullyPro, paymentFailed]);

  // ── WAITING ──
  if (!isFullyPro && !paymentFailed && !isTimedOut) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6">
        <div className="bg-white border-4 border-ink brutalist-shadow p-10 max-w-sm w-full text-center">
          {/* Spinning square — on-brand brutalist loader */}
          <div className="w-12 h-12 bg-brand border-3 border-ink mx-auto mb-8 animate-spin" />

          <h1 className="font-heading text-2xl tracking-tighter uppercase font-black mb-2">
            Finalizing Order
          </h1>
          <p className="font-mono text-xs text-ink/50 uppercase tracking-widest mb-8">
            Waiting for payment confirmation{dots}
          </p>

          {showRefresh && (
            <button
              onClick={() => pollServerStatus()}
              className="px-6 py-3 bg-white border-2 border-ink brutalist-shadow-sm font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-brand hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Refresh Status
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── FAILURE / TIMEOUT ──
  if (paymentFailed || isTimedOut) {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
        <div className="bg-white border-4 border-ink brutalist-shadow p-10 max-w-md w-full text-center">
          {/* X mark */}
          <div className="w-16 h-16 bg-accent border-3 border-ink flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="font-heading text-3xl tracking-tighter uppercase font-black mb-4">
            {paymentFailed ? 'Payment Failed' : 'Still Processing'}
          </h1>
          <p className="font-sans text-sm text-ink/60 leading-relaxed mb-10">
            {paymentFailed
              ? 'Your payment was declined or could not be processed. Check your payment method and try again.'
              : "We're still waiting for payment confirmation. Your payment may still be processing — try refreshing or check back shortly."}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => { setIsTimedOut(false); pollServerStatus(); }}
              className="block w-full py-4 px-6 bg-brand border-3 border-ink brutalist-shadow font-mono text-xs font-bold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Refresh Status
            </button>
            <Link
              href="/pricing"
              className="block w-full py-4 px-6 bg-white border-3 border-ink brutalist-shadow-sm font-mono text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-bg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center"
            >
              Back to Pricing
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] text-ink/30 uppercase tracking-widest">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    );
  }

  // ── SUCCESS ──
  const displayStatus = confirmedStatus || subscriptionStatus;
  const displayExpiresAt = confirmedExpiresAt || expiresAt;
  const formattedDate = displayExpiresAt
    ? new Date(displayExpiresAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
      <div className="bg-white border-4 border-ink brutalist-shadow p-10 max-w-md w-full text-center">
        {/* Check mark */}
        <div className="w-16 h-16 bg-positive border-3 border-ink flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl tracking-tighter uppercase font-black mb-4">
          You&apos;re In. 💛
        </h1>
        <p className="font-sans text-sm text-ink/60 leading-relaxed mb-10">
          Welcome to EX-it Pro. Your sanctuary has been fully unlocked — unlimited sessions, insights, and support are ready for you.
        </p>

        {/* Plan details */}
        <div className="border-3 border-ink p-5 mb-8 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Plan</span>
            <span className="font-mono text-xs font-bold uppercase">
              {displayStatus === 'lifetime' ? 'Lifetime Access' : 'Pro Subscription'}
            </span>
          </div>
          {formattedDate && (
            <div className="flex justify-between items-center border-t-2 border-ink/10 pt-3">
              <span className="font-mono text-xs uppercase tracking-widest text-ink/50">Next Billing</span>
              <span className="font-mono text-xs font-bold">{formattedDate}</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="block w-full py-4 px-6 bg-brand border-3 border-ink brutalist-shadow font-mono text-sm font-bold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center"
        >
          Enter My Sanctuary →
        </Link>

        <p className="mt-8 font-mono text-[10px] text-ink/30 uppercase tracking-widest">
          Thank you for trusting EX-it. 🤍
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 bg-brand border-3 border-ink animate-spin mb-8" />
          <h1 className="font-heading text-2xl tracking-tighter uppercase font-black mb-2">
            Finalizing Order
          </h1>
          <p className="font-mono text-xs text-ink/50 uppercase tracking-widest">
            Loading your session...
          </p>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
