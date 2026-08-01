"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { HeartCrack, Heart, MessageSquare, Flag, BookHeart, Calendar, Flame, Check, Sparkles, Shield, ArrowRight, ArrowDown, X, Zap } from "lucide-react";
import Link from "next/link";

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

/* ─── Typewriter Unsent Message ─── */
const TypewriterEffect = () => {
  const messages = [
    "I saw a dog today that looked exactly like Buster. I almost called you. I miss you... but I know I can't.",
    "I heard our song at the coffee shop. I left before it finished. Progress, right?",
    "Your mom's birthday is next week. I still have the date memorized. I probably always will.",
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = messages[msgIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text.length < fullText.length) {
      timeout = setTimeout(() => setText(fullText.slice(0, text.length + 1)), 35);
    } else if (!isDeleting && text.length === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 3000);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -2)), 15);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, msgIndex]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-3 border-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] relative max-w-md w-full mx-auto">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-ink/10">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple flex items-center justify-center text-white font-heading text-xs">
          Ex
        </div>
        <div>
          <p className="font-heading text-xs tracking-wide">UNSENT MESSAGE</p>
          <p className="font-mono text-[10px] text-ink/50">never sent · just now</p>
        </div>
        <div className="ml-auto">
          <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-accent" />
          </div>
        </div>
      </div>
      <div className="min-h-[80px] font-sans text-sm leading-relaxed text-ink/85">
        {text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[2px] h-4 bg-accent ml-0.5 align-middle"
        />
      </div>
      <div className="mt-4 pt-3 border-t-2 border-ink/10 flex items-center gap-2">
        <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-purple rounded-full"
            animate={{ width: isDeleting ? "0%" : `${(text.length / messages[msgIndex].length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-ink/40 uppercase">catharsis</span>
      </div>
    </div>
  );
};

/* ─── Interactive Red Flag Demo ─── */
const RedFlagDemo = () => {
  const [count, setCount] = useState(0);
  const [flagText, setFlagText] = useState("");
  const [category, setCategory] = useState("Disrespect");
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentFlags, setRecentFlags] = useState<string[]>([]);

  const categories = ["Disrespect", "Manipulation", "Inconsistency", "Boundary Crossing"];

  const handleDrop = () => {
    if (!flagText.trim()) return;
    setCount(c => c + 1);
    setRecentFlags(prev => [flagText, ...prev].slice(0, 3));
    setShowSuccess(true);
    setFlagText("");
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="bg-white border-3 border-ink p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] max-w-xl mx-auto relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white font-heading px-6 py-2 z-10 whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] border-2 border-ink text-sm"
          >
            🚩 FLAG DROPPED!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-heading text-lg tracking-wide">RED FLAG DROPPER</h3>
          <p className="font-mono text-[10px] text-ink/50 mt-0.5">TRY IT RIGHT NOW — IT&apos;S CATHARTIC</p>
        </div>
        <div className="bg-ink text-white font-mono px-3 py-1.5 text-xs font-bold tracking-wider">
          🚩 {count}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 border-2 border-ink font-mono text-[10px] uppercase tracking-wider transition-all ${
              category === c
                ? 'bg-ink text-white shadow-none translate-x-0 translate-y-0'
                : 'bg-bg hover:bg-brand/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <textarea
        value={flagText}
        onChange={(e) => setFlagText(e.target.value)}
        placeholder="What did they do this time? Be honest..."
        className="w-full bg-bg border-2 border-ink/20 p-4 font-sans text-sm resize-none h-20 mb-3 focus:outline-none focus:border-accent focus:bg-white transition-all placeholder:text-ink/30"
      />

      <button
        onClick={handleDrop}
        disabled={!flagText.trim()}
        className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed border-3 border-ink py-3.5 font-heading text-base uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] flex items-center justify-center gap-2"
      >
        <Flag size={18} />
        Drop This Flag
      </button>

      {recentFlags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-ink/10 space-y-1.5">
          {recentFlags.map((f, i) => (
            <motion.div
              key={`${f}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs font-mono text-ink/50"
            >
              <span className="text-accent mt-0.5">🚩</span>
              <span className="line-clamp-1">{f}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon, title, desc, index }: { icon: React.ReactNode; title: string; desc: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 30 }}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
    className="group bg-white border-3 border-ink p-7 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] transition-shadow"
  >
    <div className="mb-5 w-12 h-12 bg-ink text-white flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
      {icon}
    </div>
    <h3 className="font-heading text-base tracking-wide uppercase mb-2">{title}</h3>
    <p className="font-sans text-sm text-ink/65 leading-relaxed">{desc}</p>
  </motion.div>
);

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  const features = [
    { icon: <Flame className="w-6 h-6" />, title: "No-Contact Streak", desc: "Track every day without them. Watch your strength grow in real time." },
    { icon: <MessageSquare className="w-6 h-6" />, title: "Talk To Them (Safely)", desc: "Say everything you need to—without actually sending it." },
    { icon: <Flag className="w-6 h-6" />, title: "Red Flag Tracker", desc: "Document the patterns. Read them when you miss them." },
    { icon: <Heart className="w-6 h-6" />, title: "Healing Companion", desc: "A 24/7 AI listener who actually remembers your story." },
    { icon: <BookHeart className="w-6 h-6" />, title: "Private Diary", desc: "Journal your journey. Completely private, always yours." },
    { icon: <Sparkles className="w-6 h-6" />, title: "Rewards & Timeline", desc: "See how far you've come. Earn badges for real progress." },
  ];

  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden">

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 w-full bg-bg/80 backdrop-blur-md z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-accent w-8 h-8 flex items-center justify-center border-2 border-ink rounded-sm">
              <HeartCrack className="text-white w-4 h-4" />
            </div>
            <span className="font-heading text-xl tracking-tight">EX-it.</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/auth" className="font-mono text-xs font-bold uppercase tracking-wider hover:text-accent transition-colors hidden sm:block">
              Log In
            </Link>
            <Link href="/auth" className="bg-ink text-white px-4 py-2 font-heading text-xs uppercase tracking-wider hover:bg-accent transition-colors">
              Start Healing →
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* ─── HERO ─── */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="px-4 pt-28 pb-8 sm:pt-32 sm:pb-12 lg:pt-40 lg:pb-16 max-w-5xl mx-auto text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tiny pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white border-2 border-ink/15 px-4 py-1.5 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink/70"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
              Breakup recovery, reimagined
            </motion.div>

            <h1 className="font-heading text-[clamp(2.8rem,8vw,7rem)] tracking-tighter uppercase leading-[0.88] mb-8 text-ink">
              Stop Texting{" "}
              <span className="text-accent relative inline-block">
                Your Ex.
                <motion.div
                  className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-2 md:h-3 bg-brand -z-10"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg max-w-xl mx-auto text-ink/60 mb-10 leading-relaxed font-medium">
              The breakup recovery app that actually gets it. Track your streak, send the unsent messages, and remember why you left.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth"
                className="group bg-ink text-white border-3 border-ink px-8 py-4 font-heading text-base uppercase tracking-wide shadow-[5px_5px_0px_0px_rgba(255,51,102,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Start Healing
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Free to start · No credit card
              </span>
            </div>
          </motion.div>

          {/* Unsent Message Demo */}
          <motion.div
            className="mt-16 sm:mt-20 relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <TypewriterEffect />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="mt-16 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink/25">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              <ArrowDown className="w-4 h-4 text-ink/20" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ─── SOCIAL PROOF STRIP ─── */}
        <section className="py-6 border-y-2 border-ink/10 bg-white/50">
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              { num: 12847, label: "Messages Unsent" },
              { num: 4391, label: "Streaks Active" },
              { num: 8720, label: "Red Flags Logged" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-heading text-2xl sm:text-3xl tracking-tight">
                  <AnimatedNumber target={stat.num} />+
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 sm:mb-16"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">Features</p>
              <h2 className="font-heading text-3xl sm:text-5xl uppercase tracking-tighter mb-3">
                Everything you need
              </h2>
              <p className="font-sans text-base text-ink/50 max-w-md">
                To survive the worst heartbreak of your life. And come out stronger.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {features.map((f, i) => (
                <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── INTERACTIVE DEMO ─── */}
        <section className="py-20 sm:py-28 px-4 bg-bg relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #111 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 sm:mb-16 text-center"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">Try It</p>
              <h2 className="font-heading text-3xl sm:text-5xl uppercase tracking-tighter mb-3">
                See How It Feels
              </h2>
              <p className="font-sans text-base text-ink/50 max-w-md mx-auto">
                Drop a red flag right now. It&apos;s more satisfying than you think.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="py-20 sm:py-28 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14 sm:mb-16"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">Pricing</p>
              <h2 className="font-heading text-3xl sm:text-5xl uppercase tracking-tighter mb-3">
                Invest In Your Healing
              </h2>
              <p className="font-sans text-base text-ink/50 max-w-lg mx-auto">
                Cheaper than therapy. More effective than drunk-texting your ex at 2am.
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-5 justify-center items-stretch max-w-3xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-white border-3 border-ink p-7 sm:p-8 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 mb-1">Monthly</p>
                <div className="font-heading text-4xl mb-1">$10<span className="text-lg text-ink/40">/mo</span></div>
                <p className="font-mono text-[10px] text-ink/30 mb-6">Cancel anytime</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Unlimited Unsent Messages", "Red Flag Tracker", "Healing Companion", "Private Diary"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 font-sans text-sm text-ink/70">
                      <Check className="w-4 h-4 text-positive shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-bg text-ink border-3 border-ink py-3.5 font-heading text-sm uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
                  Start Healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex-1 bg-ink text-white p-7 sm:p-8 shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] flex flex-col relative md:scale-[1.03]"
              >
                <div className="absolute -top-3 right-5 bg-brand text-ink font-heading px-3 py-1 text-[10px] uppercase tracking-wider border-2 border-ink shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                  Save 67%
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Yearly</p>
                <div className="font-heading text-4xl mb-1">$40<span className="text-lg text-white/40">/yr</span></div>
                <p className="font-mono text-[10px] text-brand mb-6">That&apos;s $3.33/month</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Everything in Monthly", "Exclusive Themes", "Priority Support", "Lifetime Badges"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 font-sans text-sm text-white/70">
                      <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-brand text-ink border-3 border-ink py-3.5 font-heading text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Most Popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-24 sm:py-32 bg-ink text-white text-center px-4 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter mb-4 leading-[0.9]">
                You Deserve<br />To Heal.
              </h2>
              <p className="font-sans text-base sm:text-lg text-white/50 mb-10 max-w-md mx-auto">
                Every minute you spend here is a minute you didn&apos;t spend texting them. That&apos;s progress.
              </p>
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 bg-brand text-ink border-3 border-brand px-10 py-5 font-heading text-lg uppercase tracking-wider shadow-[5px_5px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Start Your Era
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 mt-6">
                Free to start · No credit card required
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-ink text-white/40 py-8 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm tracking-tight text-white/60">EX-it.</span>
            <span className="font-mono text-[10px]">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 font-mono text-[11px] uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
