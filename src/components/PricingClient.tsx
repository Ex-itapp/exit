'use client';

import { useState, useEffect } from 'react';
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
  { icon: MessageSquare, label: 'Unlimited Closure Sessions', desc: 'Talk to them without limits' },
  { icon: Heart, label: 'Full Emotional Insights', desc: 'Discover hidden emotional patterns' },
  { icon: Zap, label: 'Advanced Memory Bank Search', desc: 'Instant recall of any detail' },
  { icon: Shield, label: 'Priority Response Pipeline', desc: 'No waiting in queue during peaks' },
  { icon: Star, label: 'Custom App Themes', desc: 'Personalize your entire experience' },
  { icon: Crown, label: 'All Future Features — Forever', desc: 'Pro users get early, free access' },
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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
    <div className="w-full text-ink font-sans selection:bg-brand selection:text-ink pt-8 pb-24">
      <main className="max-w-5xl mx-auto">
        
        {/* ── HERO ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border-3 border-ink px-4 py-1.5 brutalist-shadow-sm mb-6">
            <Crown className="w-4 h-4 text-purple" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">
              {isPro ? 'Pro Access Active ✓' : 'Unlock The Full Experience'}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter uppercase font-black">
            GO ALL-IN ON <br className="hidden sm:block"/>
            <span className="bg-brand px-3 py-1 border-3 border-ink inline-block transform -rotate-1 mt-1">
              YOUR HEALING.
            </span>
          </h1>
          <p className="text-ink/70 text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Try annual with 3 days free, or subscribe monthly. 
            <br className="hidden sm:block" /> Unlimited sessions, deep emotional insights, and advanced memory recall.
          </p>
        </div>

        {/* ── PRICING TOGGLE & CARDS ── */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12 px-4">
          
          {/* Features Column (Left) */}
          <div className="w-full lg:w-[450px] space-y-6 lg:pt-8">
            <h2 className="text-2xl font-heading uppercase font-bold tracking-tight mb-8">Everything in Pro</h2>
            <div className="space-y-6">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-white border-3 border-ink flex items-center justify-center shrink-0 brutalist-shadow-sm">
                    <feature.icon className="w-5 h-5 text-ink" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-ink">{feature.label}</h4>
                    <p className="text-xs text-ink/70 mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Card Column (Right) */}
          <div className="w-full lg:w-[500px]">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex border-3 border-ink brutalist-shadow-sm bg-white">
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
                  {billingCycle !== 'annual' && (
                     <span className="absolute -top-3 -right-2 bg-accent text-bg text-[9px] font-bold px-1.5 py-0.5 border-2 border-ink">
                       SAVE 67%
                     </span>
                  )}
                </button>
              </div>
            </div>

            {/* Premium Card */}
            <div className="bg-white border-4 border-ink brutalist-shadow p-8 sm:p-10 relative">
              {activePlan.badge && (
                <div className="absolute -top-4 left-6 bg-brand border-2 border-ink px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
                  {activePlan.badge}
                </div>
              )}

              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50 mb-3">
                EX-IT PRO
              </p>

              <div className="flex items-end gap-2 mb-2">
                <span className="font-heading text-6xl tracking-tighter font-black">
                  {activePlan.price}
                </span>
                <span className="font-mono text-sm text-ink/50 mb-2">{activePlan.period}</span>
              </div>

              {'perMonth' in activePlan && activePlan.perMonth && (
                <p className="font-mono text-xs text-ink/50 mb-8 pb-8 border-b-3 border-ink">
                  That&apos;s just <span className="text-ink font-bold">{activePlan.perMonth}</span> — less than a coffee ☕
                </p>
              )}

              {/* Trial acknowledgment */}
              {!isPro && billingCycle === 'annual' && (
                <label className="flex items-start gap-3 p-3 border-2 border-ink bg-white hover:bg-ink/5 transition-colors mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgedTrial}
                    onChange={(e) => setAcknowledgedTrial(e.target.checked)}
                    className="mt-1 w-5 h-5 border-3 border-ink accent-accent shrink-0"
                  />
                  <span className="font-mono text-[11px] font-bold text-ink leading-relaxed">
                    I understand the first 3 days are free, then I will be <span className="text-accent underline">charged {activePlan.price}{activePlan.period} automatically</span>. Cancel anytime before trial ends. <span className="text-accent">No refunds</span> after billing starts.
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
                      {isCheckoutLoading ? 'Creating secure session...' : 'Loading...'}
                    </>
                  ) : !user ? (
                    billingCycle === 'annual' ? 'Sign In & Start Free Trial' : 'Sign In & Subscribe'
                  ) : (
                    billingCycle === 'annual' ? 'Start 3-Day Free Trial' : 'Subscribe Now'
                  )}
                </button>
              )}

              <p className="mt-6 text-center font-mono text-[10px] text-ink/40 uppercase tracking-widest">
                Secure Checkout via Dodo Payments
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-24 max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tighter uppercase font-black text-center mb-8">
            Quick Q&amp;A
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-3 border-ink bg-white">
            {[
              { q: 'Cancel anytime?', a: 'Yes. Cancel instantly from your account settings. No questions, no fees. No refunds on the current billing period.' },
              { q: 'Payment methods?', a: 'We use Dodo Payments, accepting all major cards, UPI, and local payment methods globally.' },
              { q: 'Is my data private?', a: '100%. Your diary, sessions, and conversations are strictly confidential and encrypted.' },
            ].map(({ q, a }, i) => (
              <div key={q} className={`p-6 ${i < 2 ? 'sm:border-r-3 sm:border-ink' : ''} border-b-3 sm:border-b-0 border-ink last:border-b-0`}>
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-2 text-ink">{q}</h4>
                <p className="text-xs text-ink/70 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
