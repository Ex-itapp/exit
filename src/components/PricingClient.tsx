'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePro } from '../lib/usePro';
import { supabase } from '../lib/supabase';
import { savePaymentDebugRecord } from '../lib/paymentDebug';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  MessageSquare,
  Heart,
  Star,
  Check,
  Crown,
  Sparkles,
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple/30 selection:text-white -m-2 sm:-m-4 md:-m-8 -mt-20 sm:-mt-24 pt-20 px-4 pb-24 overflow-hidden relative">
      
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <main className="max-w-6xl mx-auto relative z-10 pt-8">
        
        {/* ── HERO ── */}
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 shadow-lg"
          >
            <Crown className="w-4 h-4 text-purple" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/80">
              {isPro ? 'Pro Access Active ✓' : 'Unlock The Full Experience'}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter uppercase font-black"
          >
            Go all-in on <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple via-[#ff88cc] to-brand">
              your healing.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Try annual with 3 days free, or subscribe monthly. 
            <br className="hidden sm:block" /> Unlimited sessions, deep emotional insights, and advanced memory recall.
          </motion.p>
        </div>

        {/* ── PRICING TOGGLE & CARDS ── */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
          
          {/* Features Column (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[450px] space-y-6 lg:pt-8"
          >
            <h2 className="text-2xl font-heading uppercase font-bold tracking-tight mb-8">Everything in Pro</h2>
            <div className="space-y-6">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-purple/10 group-hover:border-purple/30 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-white/70 group-hover:text-purple transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white/90">{feature.label}</h4>
                    <p className="text-xs text-white/50 mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Card Column (Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-[500px]"
          >
            {/* Billing Toggle */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto mb-8 backdrop-blur-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Annual
                {billingCycle !== 'annual' && (
                  <span className="absolute -top-2 -right-2 bg-purple text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    SAVE 67%
                  </span>
                )}
              </button>
            </div>

            {/* Premium Glass Card */}
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-purple/40 to-transparent rounded-[32px] opacity-100 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-12 overflow-hidden shadow-2xl">
                
                {activePlan.badge && (
                  <div className="inline-flex items-center gap-1.5 bg-purple/10 border border-purple/30 text-purple px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" />
                    {activePlan.badge}
                  </div>
                )}

                <div className="flex items-end gap-2 mb-2">
                  <span className="font-heading text-6xl tracking-tighter font-black">
                    {activePlan.price}
                  </span>
                  <span className="font-mono text-sm text-white/50 mb-2">{activePlan.period}</span>
                </div>

                {'perMonth' in activePlan && activePlan.perMonth && (
                  <p className="font-mono text-xs text-white/50 mb-8 pb-8 border-b border-white/10">
                    That&apos;s just <span className="text-white font-bold">{activePlan.perMonth}</span> — less than a coffee ☕
                  </p>
                )}

                {/* Trial acknowledgment */}
                <AnimatePresence mode="wait">
                  {!isPro && billingCycle === 'annual' && (
                    <motion.label 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={acknowledgedTrial}
                        onChange={(e) => setAcknowledgedTrial(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-purple accent-purple shrink-0"
                      />
                      <span className="font-sans text-xs text-white/70 leading-relaxed">
                        I understand the first 3 days are free, then I will be <span className="text-white underline">charged {activePlan.price}{activePlan.period} automatically</span>. Cancel anytime before trial ends. <span className="text-white">No refunds</span> after billing starts.
                      </span>
                    </motion.label>
                  )}
                </AnimatePresence>

                {/* CTA */}
                {isPro ? (
                  <div className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl text-center font-mono text-xs font-bold uppercase tracking-widest text-white">
                    ✓ Pro Access Active
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading || loading || (billingCycle === 'annual' && !acknowledgedTrial)}
                    className="w-full py-5 bg-white text-black rounded-2xl font-mono text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
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

                <p className="mt-6 text-center font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  Secure Checkout via Dodo Payments
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FAQ ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-32 max-w-4xl mx-auto border-t border-white/10 pt-16"
        >
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tighter uppercase font-black text-center mb-12">
            Quick Questions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel instantly from your account settings. No questions, no fees. No refunds on the current billing period.' },
              { q: 'Payment methods?', a: 'We use Dodo Payments, accepting all major cards, UPI, and local payment methods globally.' },
              { q: 'Is my data private?', a: '100%. Your diary, sessions, and conversations are strictly confidential and encrypted.' },
            ].map(({ q, a }) => (
              <div key={q} className="space-y-3">
                <h4 className="font-sans text-sm font-bold text-white">{q}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

    </div>
  );
}
