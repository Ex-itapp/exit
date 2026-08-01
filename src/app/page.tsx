"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { HeartCrack, Heart, MessageSquare, Flag, BookHeart, Flame, Check, Sparkles, ArrowRight, ArrowDown, Zap, ShieldOff, TrendingUp } from "lucide-react";
import Link from "next/link";

/* ─── Typewriter with multiple messages ─── */
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
    <motion.div
      className="bg-white border-4 border-ink p-6 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] relative max-w-md w-full mx-auto rotate-1"
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand border-3 border-ink flex items-center justify-center font-heading text-sm">
          Ex
        </div>
        <div>
          <p className="font-heading text-sm tracking-wide">Unsent Message</p>
          <p className="font-mono text-xs text-ink/50">Just now</p>
        </div>
      </div>
      <div className="min-h-[100px] font-mono text-sm leading-relaxed text-ink/90">
        {text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block w-2 h-4 bg-accent ml-1 align-middle"
        />
      </div>
    </motion.div>
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
    <div className="bg-purple/10 border-4 border-ink p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] max-w-xl mx-auto -rotate-1 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-positive border-4 border-ink text-ink font-heading p-4 z-10 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] text-xl"
          >
            FLAG DROPPED! 🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-xl">RED FLAG DROPPER</h3>
        <div className="bg-accent text-white font-mono px-3 py-1 border-3 border-ink font-bold text-sm">
          TOTAL: {count}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 border-2 border-ink font-mono text-xs uppercase transition-all ${
              category === c ? 'bg-brand shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] -translate-x-[2px] -translate-y-[2px]' : 'bg-white hover:bg-bg'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <textarea
        value={flagText}
        onChange={(e) => setFlagText(e.target.value)}
        placeholder="What did they do this time?"
        className="w-full bg-white border-3 border-ink p-4 font-sans text-sm resize-none h-24 mb-4 focus:outline-none focus:bg-brand/10 transition-colors"
      />

      <button
        onClick={handleDrop}
        disabled={!flagText.trim()}
        className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-ink py-4 font-heading text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2"
      >
        <Flag size={24} />
        Drop Flag 🚩
      </button>

      {recentFlags.length > 0 && (
        <div className="mt-5 pt-4 border-t-3 border-ink/20 space-y-2">
          {recentFlags.map((f, i) => (
            <motion.div
              key={`${f}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 font-mono text-xs text-ink/60 bg-white/60 border-2 border-ink/10 p-2"
            >
              <span className="text-accent shrink-0">🚩</span>
              <span className="line-clamp-1">{f}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const features = [
    { icon: <Flame className="w-8 h-8" />, title: "No-Contact Streak", desc: "Track your progress. Every day without them is a win.", color: "bg-white" },
    { icon: <MessageSquare className="w-8 h-8" />, title: "Talk To Them (Safely)", desc: "Send unsent messages. Get it out without breaking your streak.", color: "bg-purple text-white" },
    { icon: <Flag className="w-8 h-8" />, title: "Red Flag Tracker", desc: "Document toxic patterns so you never forget why it ended.", color: "bg-accent text-white" },
    { icon: <Heart className="w-8 h-8" />, title: "Healing Companion", desc: "A warm, 24/7 listener who remembers your story.", color: "bg-blue text-white" },
    { icon: <BookHeart className="w-8 h-8" />, title: "Private Diary", desc: "Journal your healing journey, completely private.", color: "bg-white" },
    { icon: <Sparkles className="w-8 h-8" />, title: "Timeline & Rewards", desc: "See how far you've come and earn badges along the way.", color: "bg-positive text-ink" },
  ];

  const howItWorks = [
    { step: "01", icon: <ShieldOff className="w-10 h-10" />, title: "Break free", desc: "Sign up and set your no-contact commitment. The clock starts now." },
    { step: "02", icon: <Zap className="w-10 h-10" />, title: "Get it out", desc: "Urge to text them? Send it here instead. Drop flags. Write in your diary." },
    { step: "03", icon: <TrendingUp className="w-10 h-10" />, title: "Grow stronger", desc: "Watch your streak climb. Earn rewards. Read your flags when you waver." },
  ];

  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden">

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 w-full bg-bg/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="bg-accent w-8 h-8 flex items-center justify-center border-2 border-ink rounded-sm rotate-3"
              whileHover={{ rotate: -3, scale: 1.1 }}
            >
              <HeartCrack className="text-white w-5 h-5" />
            </motion.div>
            <span className="font-heading text-2xl tracking-tighter">EX-it.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="font-mono text-sm font-bold uppercase tracking-wide hover:text-accent transition-colors">
              Log In
            </Link>
            <Link href="/auth" className="bg-brand border-3 border-ink px-5 py-2 font-heading text-sm uppercase shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-all">
              Start Healing
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* ─── HERO ─── */}
        <section className="px-4 py-20 lg:py-32 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase leading-[0.9] mb-6 text-ink">
              Stop Texting <br />
              <span className="text-accent relative inline-block">
                Your Ex.
                <motion.div
                  className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-6 bg-brand -z-10 -rotate-2"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </h1>
            <p className="font-mono text-lg md:text-xl max-w-2xl mx-auto text-ink/70 mb-10 leading-relaxed">
              The breakup recovery app that actually gets it. Track your streak, send the unsent messages, and remember why you left. <span className="text-ink font-bold">Your healing era starts now.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth" className="group bg-ink text-white border-4 border-ink px-8 py-4 font-heading text-xl uppercase shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                Start Healing <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="font-mono text-xs uppercase tracking-widest text-ink/40 mt-2 sm:mt-0 sm:ml-4">
                No credit card required.
              </p>
            </div>
          </motion.div>

          {/* Unsent Message Demo */}
          <motion.div
            className="mt-20 relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <TypewriterEffect />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="mt-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ArrowDown className="w-5 h-5 text-ink/20" />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-24 bg-brand border-y-4 border-ink px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4">Everything You Need</h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-ink/70">To survive the worst heartbreak of your life.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 25 }}
                  whileHover={{ y: -8, rotate: i % 2 === 0 ? 1 : -1, transition: { duration: 0.2 } }}
                  className={`border-4 border-ink p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:shadow-[10px_10px_0px_0px_rgba(17,17,17,1)] transition-shadow ${f.color}`}
                >
                  <motion.div
                    className="mb-6 bg-ink text-white w-14 h-14 flex items-center justify-center border-2 border-white/20 rotate-3"
                    whileHover={{ rotate: -6, scale: 1.1 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="font-heading text-2xl uppercase mb-3">{f.title}</h3>
                  <p className="font-sans text-sm opacity-80 leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-24 px-4 bg-bg relative overflow-hidden">
          {/* Dot pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #111 1.5px, transparent 1.5px)", backgroundSize: "30px 30px" }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4">How It Works</h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-ink/70">Three steps. No bullshit.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 200, damping: 25 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-full h-[4px] bg-ink/10 z-0" />
                  )}

                  <div className="bg-white border-4 border-ink p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] relative z-10 text-center">
                    {/* Step number */}
                    <div className="absolute -top-5 -left-3 bg-brand text-ink font-heading text-3xl w-12 h-12 flex items-center justify-center border-3 border-ink rotate-6 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]">
                      {item.step}
                    </div>

                    <motion.div
                      className="mb-6 mx-auto bg-ink text-brand w-20 h-20 flex items-center justify-center border-2 border-white/20"
                      whileHover={{ rotate: 12, scale: 1.05 }}
                    >
                      {item.icon}
                    </motion.div>

                    <h3 className="font-heading text-2xl uppercase mb-3">{item.title}</h3>
                    <p className="font-sans text-sm text-ink/70 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMO SECTION ─── */}
        <section className="py-24 px-4 bg-ink border-y-4 border-ink overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4 text-white"
              >
                See How It Feels
              </motion.h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-white/50">Try the Red Flag Dropper. Get it out of your system.</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>

          {/* Background decoration */}
          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-5 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          >
            <Flag className="w-96 h-96 text-white" />
          </motion.div>
          <motion.div
            className="absolute top-1/4 right-0 translate-x-1/3 opacity-5 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
          >
            <HeartCrack className="w-64 h-64 text-white" />
          </motion.div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="py-24 px-4 bg-bg">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4"
              >
                Invest In Your Healing
              </motion.h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-ink/60">Cheaper than therapy. More effective than texting your ex.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="flex-1 bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <h3 className="font-heading text-2xl uppercase mb-2">Monthly</h3>
                <div className="font-heading text-5xl mb-1">$10<span className="text-xl text-ink/40">/mo</span></div>
                <p className="font-mono text-xs text-ink/40 mb-6">Cancel anytime</p>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited Unsent Messages', 'Red Flag Tracker', 'Healing Companion', 'Private Diary'].map(f => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm">
                      <Check className="w-5 h-5 text-positive shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-white text-ink border-4 border-ink py-4 font-heading text-xl uppercase hover:bg-bg transition-colors shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Start Healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="flex-1 bg-accent border-4 border-ink p-8 shadow-[8px_8px_0px_0px_rgba(255,223,0,1)] flex flex-col relative scale-100 md:scale-105 z-10"
              >
                <motion.div
                  className="absolute -top-5 right-4 bg-brand text-ink font-heading px-4 py-1.5 border-3 border-ink rotate-3 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
                  animate={{ rotate: [3, -2, 3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  BEST VALUE
                </motion.div>
                <h3 className="font-heading text-2xl uppercase mb-2 text-white">Yearly</h3>
                <div className="font-heading text-5xl mb-1 text-white">$40<span className="text-xl text-white/50">/yr</span></div>
                <p className="font-mono text-brand font-bold mb-6 text-sm">Save 67% — that&apos;s $3.33/month</p>
                <ul className="space-y-4 mb-8 flex-1 text-white">
                  {['Everything in Monthly', 'Exclusive Themes', 'Priority Support', 'Lifetime Badges'].map(f => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm">
                      <Check className="w-5 h-5 text-brand shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-brand text-ink border-4 border-ink py-4 font-heading text-xl uppercase shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all">
                  Get Most Popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-32 bg-positive border-y-4 border-ink text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            >
              <HeartCrack className="w-[80vw] h-[80vh] text-ink" />
            </motion.div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-8 text-ink">
                YOU DESERVE<br />TO HEAL.
              </h2>
              <Link href="/auth" className="group inline-block bg-ink text-white border-4 border-ink px-12 py-6 font-heading text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all mb-4">
                <span className="flex items-center gap-3">
                  Start Your Era
                  <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
              <p className="font-mono text-sm font-bold text-ink/70 mt-4">No credit card required. Start free.</p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-ink text-bg py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-heading text-xl tracking-tighter">EX-it.</div>
          <p className="font-mono text-sm opacity-50">© {new Date().getFullYear()} EX-it. All rights reserved.</p>
          <div className="flex gap-6 font-mono text-sm">
            <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-brand transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
