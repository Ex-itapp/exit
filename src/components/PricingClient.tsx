'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePro } from '../lib/usePro';
import { supabase } from '../lib/supabase';
import { savePaymentDebugRecord } from '../lib/paymentDebug';
import type { User } from '@supabase/supabase-js';
import {
  Zap,
  Shield,
  MessageSquare,
  Heart,
  Star,
  ArrowLeft,
  Check,
  Crown,
} from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';

const PLANS = {
  monthly: {
    price: '$10',
    period: '/mo',
    badge: null,
    dodoProductId: process.env.NEXT_PUBLIC_DODO_PRODUCT_MONTHLY || 'YOUR_MONTHLY_PRODUCT_ID',
  },
  annual: {
    price: '$39',
    period: '/yr',
    perMonth: '$3.25/mo',
    badge: 'BEST VALUE — 67% OFF',
    dodoProductId: process.env.NEXT_PUBLIC_DODO_PRODUCT_YEARLY || 'YOUR_YEARLY_PRODUCT_ID',
  },
};

const PRO_FEATURES = [
  { icon: MessageSquare, label: 'Unlimited AI Closure Sessions', color: 'text-purple' },
  { icon: Zap, label: 'Advanced Memory Bank Search', color: 'text-brand' },
  { icon: Heart, label: 'Full Emotional Pattern Insights', color: 'text-accent' },
  { icon: Shield, label: 'Priority AI Response Pipeline', color: 'text-blue' },
  { icon: Star, label: 'Custom Sanctuary Themes', color: 'text-positive' },
  { icon: Crown, label: 'All Future Features — Forever', color: 'text-purple' },
];

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, authLoading };
}

export function PricingClient() {
  const { user, authLoading } = useCurrentUser();
  const { isPro, loading: proLoading } = usePro();
  const router = useRouter();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [acknowledgedTrial, setAcknowledgedTrial] = useState(false);

  const activePlan = PLANS[billingCycle];
  const loading = authLoading || proLoading;

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/pricing` },
    });
  };

  const handleCheckout = async () => {
    if (!user) { handleSignIn(); return; }
    if (user.is_anonymous) {
      alert('Please sign in with your email before subscribing. Guest accounts cannot make payments.');
      return;
    }
    if (isPro) return;

    setIsCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: activePlan.dodoProductId,
          payment_type: 'subscription',
        }),
      });

      const data = await res.json();

      if (res.ok && data.payment_link) {
        if (data.request_id) {
          savePaymentDebugRecord({
            requestId: data.request_id,
            productId: activePlan.dodoProductId,
            paymentType: 'subscription',
            startedAt: new Date().toISOString(),
          });
        }
        window.location.href = data.payment_link;
      } else if (res.status === 409 && data.code === 'ALREADY_PRO') {
        alert('Your account already has Pro access!');
      } else {
        alert(`${data.error || 'Failed to create checkout. Please try again.'}${data.request_id ? ` (Debug: ${data.request_id})` : ''}`);
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-brand selection:text-ink">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b-4 border-ink px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => router.push('/')}
        >
          <div className="w-6 h-6 bg-brand border-2 border-ink block transform -rotate-6 group-hover:rotate-0 transition-transform" />
          <span className="font-heading text-xl tracking-tighter uppercase font-black">
            EX-it<span className="text-brand">.</span>
          </span>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-transparent hover:border-ink hover:bg-white transition-all font-mono text-xs font-bold uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {!authLoading && (user ? (
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 border-2 border-ink" />
              )}
              {isPro && (
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-brand border-2 border-ink px-2 py-0.5 brutalist-shadow-sm">
                  PRO ✓
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-white border-2 border-ink brutalist-shadow-sm font-mono text-xs font-bold uppercase hover:bg-ink hover:text-bg transition-all"
            >
              Sign In
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-20">

        {/* ── HERO ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border-3 border-ink px-4 py-1.5 brutalist-shadow-sm mb-6">
            <Crown className="w-4 h-4 text-purple" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              {isPro ? 'Pro Access Active ✓' : 'Unlock Your Full Sanctuary'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading tracking-tighter uppercase leading-[0.95] font-black mb-4">
            GO ALL-IN ON<br />
            <span className="bg-brand px-3 py-1 border-3 border-ink inline-block transform -rotate-1 mt-1">
              YOUR HEALING.
            </span>
          </h1>
          <p className="text-ink/70 text-base sm:text-lg font-sans max-w-xl mx-auto leading-relaxed mt-4">
            Try annual with 3 days free, or subscribe monthly with no trial. Unlimited AI closure sessions, memory bank search, and emotional insights.
          </p>
        </div>

        {/* ── BILLING TOGGLE ── */}
        <div className="flex justify-center mb-10">
          <div className="flex border-3 border-ink brutalist-shadow">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-ink text-bg'
                  : 'bg-white text-ink hover:bg-brand'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-ink text-bg'
                  : 'bg-white text-ink hover:bg-brand'
              }`}
            >
              Annual
              <span className="absolute -top-3 -right-2 bg-accent text-bg text-[9px] font-bold px-1.5 py-0.5 border-2 border-ink">
                -67%
              </span>
            </button>
          </div>
        </div>

        {/* ── PRICING CARD ── */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white border-4 border-ink brutalist-shadow p-8 sm:p-10 relative">

            {/* Best value badge */}
            {activePlan.badge && (
              <div className="absolute -top-4 left-6 bg-brand border-2 border-ink px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
                {activePlan.badge}
              </div>
            )}

            {/* Plan label */}
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50 mb-3">
              EX-IT PRO
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-heading text-6xl tracking-tighter font-black">
                {activePlan.price}
              </span>
              <span className="font-mono text-sm text-ink/50">{activePlan.period}</span>
            </div>

            {'perMonth' in activePlan && activePlan.perMonth && (
              <p className="font-mono text-xs text-ink/50 mb-8">
                That&apos;s just <span className="text-ink font-bold">{activePlan.perMonth}</span> — less than a coffee ☕
              </p>
            )}

            {/* Divider */}
            <div className="border-t-3 border-ink my-6" />

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {PRO_FEATURES.map(({ icon: Icon, label, color }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-brand border-2 border-ink flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-ink" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="font-sans text-sm font-medium text-ink">{label}</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Trial acknowledgment */}
            {!isPro && billingCycle === 'annual' && (
              <label className="flex items-start gap-3 p-3 border-2 border-ink mb-4 cursor-pointer hover:bg-ink/5 transition-colors">
                <input
                  type="checkbox"
                  checked={acknowledgedTrial}
                  onChange={(e) => setAcknowledgedTrial(e.target.checked)}
                  className="mt-0.5 w-5 h-5 border-3 border-ink accent-accent shrink-0"
                />
                <span className="font-mono text-xs font-bold leading-relaxed">
                  I understand the first 3 days are free, then I will be <span className="text-accent underline">charged {activePlan.price}{activePlan.period} automatically</span>. Cancel anytime before the trial ends to avoid charges. <span className="text-accent">No refunds</span> after billing starts.
                </span>
              </label>
            )}

            {/* CTA */}
            {isPro ? (
              <div className="w-full py-4 bg-positive border-3 border-ink text-center font-mono text-xs font-bold uppercase tracking-widest brutalist-shadow-sm">
                ✓ Pro Access Active
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading || loading || (billingCycle === 'annual' && !acknowledgedTrial)}
                className="w-full py-5 bg-brand border-3 border-ink brutalist-shadow font-mono text-sm font-bold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isCheckoutLoading || loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isCheckoutLoading ? 'Creating checkout...' : 'Loading...'}
                  </>
                ) : !user ? (
                  billingCycle === 'annual' ? 'Sign In & Start 3-Day Free Trial →' : 'Sign In & Subscribe →'
                ) : (
                  billingCycle === 'annual' ? `Start 3-Day Free Trial — ${activePlan.price}${activePlan.period} after →` : `Subscribe — ${activePlan.price}${activePlan.period} →`
                )}
              </button>
            )}

            <p className="mt-4 text-center font-mono text-[10px] text-ink/40 uppercase tracking-widest">
              3-day free trial on Annual · Cancel before trial ends to avoid charges · <span className="text-accent">No refunds</span> after billing starts · Secure via Dodo Payments
            </p>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-20">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tighter uppercase font-black text-center mb-8">
            Quick Q&amp;A
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-3 border-ink">
            {[
              { q: 'Cancel anytime?', a: 'Yes. Cancel instantly from your account settings. No questions, no fees. No refunds on the current billing period.' },
              { q: 'Payment methods?', a: 'Dodo Payments — all major cards, UPI, and more. Fully secure.' },
              { q: 'Is my data private?', a: '100%. Your diary, sessions, and conversations are encrypted and only yours.' },
            ].map(({ q, a }, i) => (
              <div key={q} className={`p-6 ${i < 2 ? 'sm:border-r-3 sm:border-ink' : ''} border-b-3 sm:border-b-0 border-ink last:border-b-0`}>
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-2">{q}</h4>
                <p className="text-sm text-ink/60 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t-4 border-ink py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
          © {new Date().getFullYear()} EX-it. · Built for your healing
        </p>
      </footer>
    </div>
  );
}
