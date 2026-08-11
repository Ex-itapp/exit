"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  HeartCrack, Heart, MessageSquare, Flag, Flame, Check, ArrowRight, ChevronDown
} from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Typewriter
───────────────────────────────────────────── */
const TypewriterEffect = () => {
  const messages = [
    "I saw a dog today that looked exactly like Buster. I almost called you.",
    "I heard our song at the coffee shop. I left before it finished.",
    "Your mom's birthday is next week. I still have the date memorized.",
  ];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = messages[idx];
    let t: NodeJS.Timeout;
    if (!deleting && text.length < full.length)
      t = setTimeout(() => setText(full.slice(0, text.length + 1)), 40);
    else if (!deleting && text.length === full.length)
      t = setTimeout(() => setDeleting(true), 2800);
    else if (deleting && text.length > 0)
      t = setTimeout(() => setText(text.slice(0, -2)), 15);
    else { setDeleting(false); setIdx(p => (p + 1) % messages.length); }
    return () => clearTimeout(t);
  }, [text, deleting, idx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border-3 sm:border-4 border-ink p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] sm:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-lg mx-auto mt-10 relative z-10"
      whileHover={{ scale: 1.02, rotate: -1, transition: { type: "spring", stiffness: 400, damping: 20 } }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand border-3 sm:border-4 border-ink flex items-center justify-center font-heading text-[10px] sm:text-xs shrink-0">EX</div>
        <div>
          <p className="font-heading text-xs sm:text-sm uppercase tracking-wide">Unsent Message</p>
          <p className="font-mono text-[10px] sm:text-xs text-ink/50 font-bold">Just now</p>
        </div>
      </div>
      <div className="min-h-[60px] sm:min-h-[72px] font-sans text-sm sm:text-base leading-relaxed text-ink/80 italic">
        {text}
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block w-2 h-4 bg-accent ml-1 align-middle" />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Red Flag Demo
───────────────────────────────────────────── */
const RedFlagDemo = () => {
  const [count, setCount] = useState(0);
  const [flagText, setFlagText] = useState("");
  const [cat, setCat] = useState("Disrespect");
  const [boom, setBoom] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const cats = ["Disrespect", "Manipulation", "Inconsistency", "Boundary Crossing"];

  const drop = () => {
    if (!flagText.trim()) return;
    setCount(c => c + 1);
    setRecent(p => [flagText, ...p].slice(0, 2));
    setBoom(true); setFlagText("");
    setTimeout(() => setBoom(false), 1800);
  };

  return (
    <div className="bg-bg border-3 sm:border-4 border-ink p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] sm:shadow-[12px_12px_0px_0px_rgba(255,51,102,1)] w-full max-w-xl mx-auto sm:-rotate-1 relative transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[4px] hover:translate-y-[4px]">
      <AnimatePresence>
        {boom && (
          <motion.div initial={{ opacity: 0, scale: 0.5, rotate: -15 }} animate={{ opacity: 1, scale: 1, rotate: 5 }}
            exit={{ opacity: 0, scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="absolute inset-0 m-auto w-fit h-fit bg-positive border-3 sm:border-4 border-ink text-ink font-heading px-6 py-4 sm:px-8 sm:py-6 z-20 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] text-xl sm:text-3xl uppercase tracking-widest text-center">
            FLAG DROPPED!<br/>🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-heading text-xl sm:text-3xl tracking-tighter">Red flag dropper</h3>
        <motion.div 
          key={count}
          initial={{ scale: 1.5, color: "#FF3366" }}
          animate={{ scale: 1, color: "#ffffff" }}
          className="bg-ink text-white font-mono px-3 py-1.5 border-3 sm:border-4 border-ink font-bold text-xs sm:text-base shadow-[3px_3px_0px_0px_rgba(255,51,102,1)]">
          {count} 🚩
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 sm:border-3 border-ink font-mono text-[10px] sm:text-xs font-bold uppercase transition-all ${cat === c ? "bg-accent text-white shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] -translate-x-[1.5px] -translate-y-[1.5px]" : "bg-white hover:bg-white/80"}`}>
            {c}
          </button>
        ))}
      </div>

      <textarea value={flagText} onChange={e => setFlagText(e.target.value)}
        placeholder="What did they do this time?"
        className="w-full bg-white border-3 sm:border-4 border-ink p-4 sm:p-5 font-mono text-sm sm:text-base font-bold resize-none h-24 sm:h-32 mb-4 focus:outline-none focus:bg-accent/5 focus:ring-4 focus:ring-accent/20 transition-all placeholder:text-ink/30" />

      <button onClick={drop} disabled={!flagText.trim()}
        className="w-full bg-accent text-white disabled:opacity-40 border-3 sm:border-4 border-ink py-3.5 sm:py-5 font-heading text-lg sm:text-2xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] sm:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] hover:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[5px] hover:translate-y-[5px] transition-all active:shadow-none flex items-center justify-center gap-3">
        <Flag size={20} className="sm:w-7 sm:h-7" /> Drop flag
      </button>

      {recent.length > 0 && (
        <div className="mt-4 pt-4 border-t-4 border-ink/10 space-y-2">
          {recent.map((f, i) => (
            <motion.div key={`${f}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 items-center font-mono text-[10px] sm:text-sm font-bold text-ink/80 bg-white border-3 sm:border-4 border-ink p-3 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]">
              <span className="shrink-0 text-lg">🚩</span>
              <span className="line-clamp-1">{f}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Features data
───────────────────────────────────────────── */
const features = [
  {
    icon: <MessageSquare className="w-8 h-8 sm:w-16 sm:h-16" />,
    color: "bg-purple",
    label: "01",
    title: "AI Ex Simulator.",
    body: "Text an AI that responds exactly like your ex. Say whatever you need to say to get closure, with zero real-life consequences.",
    accent: "text-purple",
  },
  {
    icon: <Flame className="w-8 h-8 sm:w-16 sm:h-16" />,
    color: "bg-accent",
    label: "02",
    title: "No-contact streak.",
    body: "Every day you don't text them is a point on the board. Watch your streak grow. Feel yourself getting stronger.",
    accent: "text-accent",
  },
  {
    icon: <Flag className="w-8 h-8 sm:w-16 sm:h-16" />,
    color: "bg-brand",
    label: "03",
    title: "Red flag tracker.",
    body: "Log every toxic thing they did. Read it back when you miss them. You'll remember fast.",
    accent: "text-ink",
  },
  {
    icon: <Heart className="w-8 h-8 sm:w-16 sm:h-16" />,
    color: "bg-blue",
    label: "04",
    title: "Healing companion.",
    body: "An AI that knows your story, doesn't judge, and is available at 3am when you're about to relapse.",
    accent: "text-blue",
  },
];

/* ─────────────────────────────────────────────
   Animated Headline
───────────────────────────────────────────── */
const AnimatedTitle = ({ text }: { text: string }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className="gap-x-3 sm:gap-x-6"
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block pb-2">
          {word === "ex." ? (
            <span className="text-accent relative inline-block" style={{ WebkitTextStroke: "1px var(--color-accent)" }}>
              {word}
              <motion.div
                className="absolute -bottom-1 sm:-bottom-3 left-0 w-full h-2 sm:h-5 bg-brand -z-10 -rotate-2"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          ) : (
            word
          )}
        </motion.span>
      ))}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Main Page (Scroll Snapping)
───────────────────────────────────────────── */
export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  
  useEffect(() => {
    const t = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Floating nav entrance
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { delay: 1.5, duration: 0.8, ease: "easeOut" } }
  };

  return (
    <>
      {/* Floating Elements */}
      <motion.div 
        variants={navVariants} initial="hidden" animate="visible"
        className="fixed top-5 left-5 sm:top-8 sm:left-8 z-50 pointer-events-auto"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: -15, scale: 1.15 }} transition={{ type: "spring", stiffness: 400 }}
            className="bg-ink w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-bg rotate-3 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] group-hover:shadow-[5px_5px_0px_0px_rgba(255,51,102,1)] transition-shadow">
            <HeartCrack className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
          <span className="font-heading text-xl sm:text-2xl tracking-tighter hidden sm:block">EX-it.</span>
        </Link>
      </motion.div>

      <motion.div 
        variants={navVariants} initial="hidden" animate="visible"
        className="fixed top-5 right-5 sm:top-8 sm:right-8 z-50 pointer-events-auto flex gap-3 sm:gap-5 items-center"
      >
        <Link href="/auth"
          className="bg-brand border-3 sm:border-4 border-ink px-4 py-2 sm:px-6 sm:py-3 font-heading text-sm sm:text-base shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] sm:shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[7px_7px_0px_0px_rgba(17,17,17,1)] transition-all whitespace-nowrap">
          LOG IN
        </Link>
      </motion.div>

      {/* Main Container */}
      <div className="overflow-x-hidden scroll-smooth font-sans bg-bg text-ink selection:bg-brand selection:text-ink relative">
        
        {/* ── SECTION 1: HERO ── */}
        <section className="min-h-[100svh] w-full flex flex-col items-center justify-center relative shrink-0 px-4 pt-28 sm:pt-16 pb-16">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center relative z-10">
            <div className="font-heading text-[13vw] sm:text-[9vw] lg:text-[120px] tracking-tighter leading-[0.9] text-ink mb-6 sm:mb-8 text-center" style={{ WebkitTextStroke: "1px #111" }}>
              <AnimatedTitle text="Stop texting your ex." />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="font-sans text-base sm:text-2xl text-ink/70 max-w-md sm:max-w-2xl text-center leading-relaxed font-medium px-4 mb-8 sm:mb-12"
            >
              You broke up for a reason. Put the phone down. Vent here, track your distance, and{" "}
              <span className="text-ink font-bold underline decoration-accent decoration-4 underline-offset-4">get your power back.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mb-8"
            >
              <Link href="/auth"
                className="bg-brand border-3 sm:border-4 border-ink px-8 py-4 sm:px-10 sm:py-5 font-heading text-lg sm:text-2xl shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] sm:shadow-[10px_10px_0px_0px_rgba(17,17,17,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] transition-all flex items-center gap-3">
                Start healing <ArrowRight className="w-6 h-6" strokeWidth={3} />
              </Link>
            </motion.div>

            <TypewriterEffect />
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-8 sm:bottom-12 flex flex-col items-center gap-2 text-ink/40 pointer-events-none"
          >
            <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── SECTION 2: FEATURES ── */}
        <section className="min-h-[100svh] w-full flex flex-col items-center justify-center relative shrink-0 px-4 py-24 sm:py-32 bg-bg">
          <div className="w-full max-w-6xl mx-auto z-10 flex flex-col h-full py-16 sm:py-24 justify-between">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-6 sm:mb-12 shrink-0"
            >
              <h2 className="font-heading text-5xl sm:text-8xl tracking-tighter leading-[0.95]">
                Built to{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">break</span>
                  <span className="absolute left-0 right-0 top-1/2 h-[4px] sm:h-[6px] bg-accent z-20" />
                </span>{" "}
                free.
              </h2>
            </motion.div>

            <div className="flex-1 flex items-center justify-center relative w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full max-w-4xl border-4 border-ink bg-bg shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] sm:shadow-[16px_16px_0px_0px_rgba(17,17,17,1)] p-6 sm:p-16 flex flex-col sm:flex-row items-center gap-8 sm:gap-16 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-3 sm:w-6 h-full ${features[activeFeature].color}`} />
                  
                  <motion.div 
                    initial={{ rotate: -15, scale: 0.5 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                    className={`shrink-0 w-24 h-24 sm:w-48 sm:h-48 border-4 border-ink ${features[activeFeature].color} flex items-center justify-center text-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] sm:shadow-[12px_12px_0px_0px_rgba(17,17,17,1)]`}
                  >
                    {features[activeFeature].icon}
                  </motion.div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className={`font-mono text-sm sm:text-lg font-bold uppercase tracking-[0.3em] ${features[activeFeature].accent} block mb-3 sm:mb-4`}>
                      {features[activeFeature].label} / 04
                    </span>
                    <h3 className="font-heading text-3xl sm:text-6xl tracking-tighter mb-4 sm:mb-6 leading-tight">
                      {features[activeFeature].title}
                    </h3>
                    <p className="font-sans text-base sm:text-2xl text-ink/70 leading-relaxed font-medium">
                      {features[activeFeature].body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4 mt-8 shrink-0">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-12 h-3 sm:w-20 sm:h-4 border-2 border-ink transition-all ${
                    activeFeature === i ? "bg-accent shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]" : "bg-white opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`Go to feature ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: INTERACTIVE DEMO ── */}
        <section className="min-h-[100svh] w-full flex flex-col items-center justify-center relative shrink-0 px-4 py-24 sm:py-32 bg-brand text-ink">
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%), repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%)", backgroundPosition: "0 0, 40px 40px", backgroundSize: "80px 80px" }} />
          
          <div className="w-full max-w-5xl mx-auto z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="font-heading text-4xl sm:text-8xl tracking-tighter mb-4 drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] sm:drop-shadow-[8px_8px_0px_rgba(255,255,255,1)]">
                Try it right now.
              </h2>
              <p className="font-sans text-base sm:text-2xl text-ink/70 max-w-xl mx-auto font-medium">
                Drop a red flag. It&apos;s more satisfying than you think.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full"
            >
              <RedFlagDemo />
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 4: PRICING ── */}
        <section className="min-h-[100svh] w-full flex flex-col items-center justify-center relative shrink-0 px-4 py-24 sm:py-32 bg-bg">
          <div className="w-full max-w-5xl mx-auto z-10 flex flex-col items-center h-full py-16 sm:py-24 justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-8 sm:mb-16"
            >
              <h2 className="font-heading text-4xl sm:text-8xl tracking-tighter mb-4">Simple pricing.</h2>
              <p className="font-sans text-base sm:text-2xl text-ink/60 max-w-xl mx-auto font-medium">
                Cheaper than therapy. More honest than your friends.
              </p>
            </motion.div>

            {/* Mobile Toggle Selector */}
            <div className="sm:hidden flex justify-center mb-8 w-full max-w-xs mx-auto">
              <div className="flex bg-white border-3 border-ink shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] p-1 rounded-sm w-full">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`flex-1 py-3 font-heading text-sm uppercase tracking-wider transition-colors ${billing === "monthly" ? "bg-ink text-white" : "text-ink/50"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`flex-1 py-3 font-heading text-sm uppercase tracking-wider transition-colors ${billing === "yearly" ? "bg-brand text-ink" : "text-ink/50"}`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Desktop Grid & Mobile Animated Single Card */}
            <div className="w-full flex items-center justify-center relative min-h-[480px] sm:min-h-0 sm:h-auto">
              
              <div className="hidden sm:grid sm:grid-cols-2 gap-8 lg:gap-12 w-full">
                {/* Monthly Desktop */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ amount: 0.5 }}
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                  className="bg-white border-4 border-ink p-10 lg:p-12 shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-ink/40 mb-4">Monthly</p>
                    <div className="font-heading text-7xl lg:text-8xl mb-2">$10<span className="text-3xl text-ink/35">/mo</span></div>
                    <p className="font-mono text-xs lg:text-sm text-ink/50 mb-8 pb-6 border-b-4 border-ink/10">Billed monthly · Cancel anytime</p>
                    <ul className="space-y-4 mb-10">
                      {["Unlimited unsent messages", "Red flag tracker & analytics", "AI Healing companion", "Private encrypted diary"].map(item => (
                        <li key={item} className="flex items-center gap-4 font-sans text-base lg:text-lg font-bold text-ink/80">
                          <Check className="w-6 h-6 text-positive shrink-0" strokeWidth={3.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/pricing" className="block text-center border-4 border-ink py-4 lg:py-5 font-heading text-xl lg:text-2xl shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-bg">
                    Choose Monthly
                  </Link>
                </motion.div>

                {/* Yearly Desktop */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ amount: 0.5 }}
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                  className="bg-ink text-white border-4 border-ink p-10 lg:p-12 shadow-[16px_16px_0px_0px_rgba(255,51,102,1)] flex flex-col justify-between relative"
                >
                  <motion.div
                    animate={{ rotate: [4, -3, 4] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-6 right-6 lg:-top-8 lg:right-8 bg-brand text-ink font-heading text-sm lg:text-base px-6 py-2 border-4 border-ink shadow-[4px_4px_0px_0px_rgba(255,51,102,1)]"
                  >
                    3-DAY FREE TRIAL
                  </motion.div>
                  <div>
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Annual (Save 67%)</p>
                    <div className="font-heading text-7xl lg:text-8xl mb-2">$39<span className="text-3xl text-white/35">/yr</span></div>
                    <p className="font-mono text-xs lg:text-sm text-brand mb-8 pb-6 border-b-4 border-white/15">🎁 3 Days Free · Then $3.25/mo</p>
                    <ul className="space-y-4 mb-10">
                      {["3 Days 100% Free Trial", "Everything in Monthly", "Exclusive sanctuary themes", "Priority AI response pipeline", "Lifetime recovery badges"].map(item => (
                        <li key={item} className="flex items-center gap-4 font-sans text-base lg:text-lg font-bold text-white/90">
                          <Check className="w-6 h-6 text-brand shrink-0" strokeWidth={3.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href="/pricing" className="block text-center bg-brand text-ink border-4 border-ink py-4 lg:py-5 font-heading text-xl lg:text-2xl shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                    Start Free Trial
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Single Card Container */}
              <div className="sm:hidden absolute inset-0 w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait">
                  {billing === "monthly" ? (
                    <motion.div
                      key="monthly"
                      initial={{ opacity: 0, rotateY: -90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full bg-white border-4 border-ink p-6 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col justify-between"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Monthly</p>
                        <div className="font-heading text-6xl mb-1">$10<span className="text-xl text-ink/35">/mo</span></div>
                        <p className="font-mono text-[10px] text-ink/50 mb-5 pb-4 border-b-4 border-ink/10">Billed monthly · Cancel anytime</p>
                        <ul className="space-y-3 mb-8">
                          {["Unlimited unsent messages", "Red flag tracker", "Healing companion", "Private diary"].map(item => (
                            <li key={item} className="flex items-center gap-3 font-sans text-sm font-bold text-ink/80">
                              <Check className="w-5 h-5 text-positive shrink-0" strokeWidth={3} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href="/pricing" className="block text-center border-4 border-ink py-3.5 font-heading text-lg shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all bg-bg">
                        Choose Monthly
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="yearly"
                      initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full bg-ink text-white border-4 border-ink p-6 shadow-[10px_10px_0px_0px_rgba(255,51,102,1)] flex flex-col justify-between relative"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <motion.div
                        animate={{ rotate: [4, -3, 4] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute -top-4 right-4 bg-brand text-ink font-heading text-[10px] px-3 py-1.5 border-3 border-ink shadow-[3px_3px_0px_0px_rgba(255,51,102,1)]"
                      >
                        3-DAY FREE TRIAL
                      </motion.div>
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Annual (Save 67%)</p>
                        <div className="font-heading text-6xl mb-1">$39<span className="text-xl text-white/35">/yr</span></div>
                        <p className="font-mono text-[10px] text-brand mb-5 pb-4 border-b-4 border-white/15">🎁 3 Days Free · Then $3.25/mo</p>
                        <ul className="space-y-3 mb-8">
                          {["🎁 3-Day Free Trial", "Everything in Monthly", "Exclusive themes", "Priority AI responses"].map(item => (
                            <li key={item} className="flex items-center gap-3 font-sans text-sm font-bold text-white/90">
                              <Check className="w-5 h-5 text-brand shrink-0" strokeWidth={3} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href="/pricing" className="block text-center bg-brand text-ink border-4 border-ink py-3.5 font-heading text-lg shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
                        Start Free Trial
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 5: FINAL CTA ── */}
        <section className="min-h-[100svh] w-full flex flex-col items-center justify-center relative shrink-0 px-4 py-24 sm:py-32 bg-positive overflow-hidden">
          
          {/* Ambient Background Animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
             <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="w-[150vw] h-[150vw] sm:w-[80vw] sm:h-[80vw] rounded-full bg-gradient-radial from-brand/50 to-transparent blur-3xl"
             />
             <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
              className="absolute w-[120vw] h-[120vw] sm:w-[60vw] sm:h-[60vw] rounded-full bg-gradient-radial from-accent/30 to-transparent blur-3xl -translate-x-1/4 translate-y-1/4"
             />
          </div>

          <div className="w-full max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center h-full justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="flex flex-col items-center"
            >
              <h2 className="font-heading text-[15vw] sm:text-[10vw] lg:text-9xl tracking-tighter text-ink leading-[0.85] mb-8 sm:mb-12 uppercase drop-shadow-[4px_4px_0px_rgba(255,255,255,0.7)] sm:drop-shadow-[8px_8px_0px_rgba(255,255,255,0.7)]">
                You deserve<br />to heal.
              </h2>
              
              <Link href="/auth"
                className="group flex items-center justify-center gap-3 sm:gap-4 bg-ink text-white border-4 sm:border-[6px] border-ink px-10 py-5 sm:px-14 sm:py-7 font-heading text-xl sm:text-4xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] sm:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Start your era
                <ArrowRight className="w-6 h-6 sm:w-10 sm:h-10 group-hover:translate-x-2 transition-transform duration-300" strokeWidth={3} />
              </Link>
              
              <p className="font-mono text-xs sm:text-sm font-bold text-ink/70 uppercase tracking-widest mt-8 sm:mt-10 bg-white/50 px-4 py-2 border-2 border-ink inline-block">
                Free to start · No credit card required
              </p>
            </motion.div>
          </div>

          {/* Footer inline at bottom of last section */}
          <footer className="absolute bottom-0 w-full border-t-4 border-ink bg-ink text-white py-4 sm:py-6 px-4 z-20">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <span className="font-heading text-lg sm:text-xl tracking-tighter">EX-it.</span>
              <p className="font-mono text-[10px] sm:text-xs text-white/40">© {new Date().getFullYear()} EX-it. All rights reserved.</p>
              <div className="flex gap-4 sm:gap-6 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">
                <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
                <Link href="/tos" className="hover:text-brand transition-colors">Terms</Link>
                <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
              </div>
            </div>
          </footer>
        </section>

      </div>
    </>
  );
}
