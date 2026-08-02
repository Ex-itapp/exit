"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  HeartCrack, Heart, MessageSquare, Flag, Flame, Check, ArrowRight
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
      t = setTimeout(() => setText(full.slice(0, text.length + 1)), 38);
    else if (!deleting && text.length === full.length)
      t = setTimeout(() => setDeleting(true), 2800);
    else if (deleting && text.length > 0)
      t = setTimeout(() => setText(text.slice(0, -2)), 14);
    else { setDeleting(false); setIdx(p => (p + 1) % messages.length); }
    return () => clearTimeout(t);
  }, [text, deleting, idx]);

  return (
    <motion.div
      className="bg-white border-3 sm:border-4 border-ink p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] sm:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] w-full max-w-lg mx-auto sm:rotate-1"
      whileHover={{ rotate: 0, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-brand border-3 sm:border-4 border-ink flex items-center justify-center font-heading text-[10px] sm:text-xs shrink-0">EX</div>
        <div>
          <p className="font-heading text-xs sm:text-sm uppercase tracking-wide">Unsent Message</p>
          <p className="font-mono text-[10px] sm:text-xs text-ink/50 font-bold">Just now</p>
        </div>
      </div>
      <div className="min-h-[56px] sm:min-h-[72px] font-sans text-sm sm:text-base leading-relaxed text-ink/80 italic">
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
    <div className="bg-bg border-3 sm:border-4 border-ink p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] sm:shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-xl mx-auto sm:-rotate-1 relative">
      <AnimatePresence>
        {boom && (
          <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute inset-0 m-auto w-fit h-fit bg-positive border-3 sm:border-4 border-ink text-ink font-heading px-4 py-3 sm:px-6 sm:py-4 z-10 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] text-lg sm:text-2xl uppercase tracking-widest">
            FLAG DROPPED! 🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg sm:text-2xl tracking-tighter">Red flag dropper</h3>
        <div className="bg-accent text-white font-mono px-2.5 py-1 border-3 sm:border-4 border-ink font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          {count} 🚩
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-2 py-1 sm:px-3 sm:py-1.5 border-2 sm:border-3 border-ink font-mono text-[10px] sm:text-xs font-bold uppercase transition-all ${cat === c ? "bg-brand shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] -translate-x-[1px] -translate-y-[1px]" : "bg-white"}`}>
            {c}
          </button>
        ))}
      </div>

      <textarea value={flagText} onChange={e => setFlagText(e.target.value)}
        placeholder="What did they do this time?"
        className="w-full bg-white border-3 sm:border-4 border-ink p-3 sm:p-4 font-mono text-xs sm:text-sm font-bold resize-none h-20 sm:h-24 mb-3 focus:outline-none focus:bg-brand/10 transition-colors placeholder:text-ink/30" />

      <button onClick={drop} disabled={!flagText.trim()}
        className="w-full bg-accent text-white disabled:opacity-40 border-3 sm:border-4 border-ink py-3 sm:py-4 font-heading text-base sm:text-xl shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] sm:shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all active:shadow-none flex items-center justify-center gap-2">
        <Flag size={16} /> Drop flag
      </button>

      {recent.length > 0 && (
        <div className="mt-3 pt-3 border-t-3 border-ink/10 space-y-1.5">
          {recent.map((f, i) => (
            <motion.div key={`${f}-${i}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 font-mono text-[10px] sm:text-xs font-bold text-ink/70 bg-white border-2 sm:border-4 border-ink p-2 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
              <span className="shrink-0">🚩</span>
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
    icon: <Flame className="w-5 h-5 sm:w-10 sm:h-10" />,
    color: "bg-accent",
    label: "01",
    title: "No-contact streak.",
    body: "Every day you don't text them is a point on the board. Watch your streak grow. Feel yourself getting stronger.",
    accent: "text-accent",
  },
  {
    icon: <MessageSquare className="w-5 h-5 sm:w-10 sm:h-10" />,
    color: "bg-purple",
    label: "02",
    title: "Say it here.",
    body: "Send every unsent text to the void instead of to them. All the catharsis, zero consequences.",
    accent: "text-purple",
  },
  {
    icon: <Flag className="w-5 h-5 sm:w-10 sm:h-10" />,
    color: "bg-brand",
    label: "03",
    title: "Red flag tracker.",
    body: "Log every toxic thing they did. Read it back when you miss them. You'll remember fast.",
    accent: "text-ink",
  },
  {
    icon: <Heart className="w-5 h-5 sm:w-10 sm:h-10" />,
    color: "bg-blue",
    label: "04",
    title: "Healing companion.",
    body: "An AI that knows your story, doesn't judge, and is available at 3am when you're about to relapse.",
    accent: "text-blue",
  },
];

/* Desktop: alternating scroll-reveal rows */
const FeatureRow = ({ f, i }: { f: typeof features[0]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const even = i % 2 === 0;

  return (
    <motion.div ref={ref} style={{ opacity, y }}
      className={`hidden sm:flex ${even ? "sm:flex-row" : "sm:flex-row-reverse"} gap-12 items-stretch mb-8`}>
      <div className="shrink-0 flex items-center justify-center">
        <motion.div
          whileHover={{ rotate: even ? 8 : -8, scale: 1.05 }}
          className={`${f.color} w-36 h-36 border-4 border-ink flex items-center justify-center text-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]`}
          style={{ rotate: even ? 2 : -1 }}
        >
          {f.icon}
        </motion.div>
      </div>
      <div className="flex-1 border-4 border-ink bg-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] p-8 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-2 h-full ${f.color}`} />
        <div className="pl-4">
          <span className={`font-mono text-xs font-bold uppercase tracking-[0.25em] ${f.accent} block mb-2`}>{f.label}</span>
          <h3 className="font-heading text-4xl tracking-tighter mb-3 leading-tight">{f.title}</h3>
          <p className="font-sans text-lg text-ink/60 leading-relaxed max-w-lg">{f.body}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, -80]);
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  // Mobile Features Auto-Switcher
  const [activeFeature, setActiveFeature] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Mobile Pricing Toggle
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden selection:bg-brand selection:text-ink">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b-4 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: -8, scale: 1.1 }}
              className="bg-accent w-7 h-7 sm:w-8 sm:h-8 border-3 sm:border-4 border-ink rotate-3 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
              <HeartCrack className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.div>
            <span className="font-heading text-lg sm:text-xl tracking-tighter">EX-it.</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/auth" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
              Log in
            </Link>
            <Link href="/auth"
              className="bg-brand border-3 sm:border-4 border-ink px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] sm:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-all whitespace-nowrap">
              Start healing
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section ref={heroRef} className="min-h-[75vh] sm:min-h-screen flex flex-col items-center justify-center px-4 pt-20 sm:pt-16 pb-4 sm:pb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #111 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-[12.5vw] sm:text-7xl lg:text-[110px] tracking-tighter leading-[0.9] text-ink mb-3 sm:mb-6"
              style={{ WebkitTextStroke: "1px #111" }}
            >
              Stop texting<br />
              <span className="text-accent relative inline-block" style={{ WebkitTextStroke: "1px var(--color-accent)" }}>
                your ex.
                <motion.div
                  className="absolute -bottom-0.5 sm:-bottom-2 left-0 w-full h-1.5 sm:h-4 bg-brand -z-10 -rotate-1"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-sm sm:text-xl text-ink/70 max-w-sm sm:max-w-lg leading-relaxed mb-6 sm:mb-10 font-medium px-2"
            >
              You broke up for a reason. Put the phone down. Vent here, track your distance, and{" "}
              <span className="text-ink font-bold underline decoration-accent decoration-2 underline-offset-2">get your power back.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center w-full"
            >
              <Link href="/auth"
                className="group flex items-center justify-center gap-2 bg-ink text-white border-3 sm:border-4 border-ink px-8 py-3.5 sm:px-10 sm:py-5 font-heading text-base sm:text-xl shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] sm:shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                Start healing <ArrowRight size={18} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Typewriter — much tighter spacing on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full mt-8 sm:mt-20"
          >
            <TypewriterEffect />
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-4 sm:px-8 py-10 sm:py-8 max-w-5xl mx-auto overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pb-6 sm:pt-20 sm:pb-8"
          >
            <h2 className="font-heading text-4xl sm:text-7xl tracking-tighter mb-2 sm:mb-5 leading-[0.95]">
              Built to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">break</span>
                <span className="absolute left-0 right-0 top-1/2 h-[3px] sm:h-[4px] bg-accent z-20" />
              </span>{" "}
              <span className="relative inline-block">
                free
                <motion.span
                  className="absolute -bottom-0.5 sm:-bottom-1 left-0 w-full h-[4px] sm:h-[6px] bg-brand -z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </span>.
            </h2>
            <p className="font-sans text-sm sm:text-lg text-ink/50 max-w-md mx-auto leading-relaxed">
              Four tools. Zero fluff.{" "}
              <span className="text-ink/80 font-semibold">Everything you need to stop going back.</span>
            </p>
          </motion.div>

          {/* Desktop: alternating rows */}
          <div className="hidden sm:block">
            {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
          </div>

          {/* Mobile: Interactive Switcher */}
          <div className="sm:hidden flex flex-col items-center">
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {features.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-12 h-12 flex items-center justify-center border-3 border-ink transition-all ${
                    activeFeature === i
                      ? `${f.color} text-white shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] -translate-y-1`
                      : "bg-white text-ink shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]"
                  }`}
                >
                  {React.cloneElement(f.icon as React.ReactElement, { className: "w-6 h-6" })}
                </button>
              ))}
            </div>

            {/* Active Card Container */}
            <div className="w-full relative min-h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 border-3 border-ink bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] p-5"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${features[activeFeature].color}`} />
                  <div className="pl-3">
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${features[activeFeature].accent} block mb-1.5`}>
                      {features[activeFeature].label}
                    </span>
                    <h3 className="font-heading text-2xl tracking-tighter mb-2 leading-tight">
                      {features[activeFeature].title}
                    </h3>
                    <p className="font-sans text-sm text-ink/70 leading-relaxed">
                      {features[activeFeature].body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── DEMO ── */}
        <section className="py-10 sm:py-28 px-4 bg-ink relative overflow-hidden mt-6 sm:mt-0">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)", backgroundPosition: "0 0, 20px 20px", backgroundSize: "40px 40px" }} />

          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-6 sm:mb-16"
            >
              <h2 className="font-heading text-3xl sm:text-6xl tracking-tighter text-white mb-2 sm:mb-4 drop-shadow-[3px_3px_0px_rgba(255,51,102,1)] sm:drop-shadow-[5px_5px_0px_rgba(255,51,102,1)]">
                Try it right now.
              </h2>
              <p className="font-sans text-xs sm:text-lg text-white/50 max-w-md mx-auto">
                Drop a red flag. It&apos;s more satisfying than you think.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="py-12 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-6 sm:mb-20"
            >
              <h2 className="font-heading text-3xl sm:text-6xl tracking-tighter mb-2 sm:mb-4">Simple pricing.</h2>
              <p className="font-sans text-sm sm:text-lg text-ink/60 max-w-md mx-auto">
                Cheaper than therapy. More honest than your friends.
              </p>
            </motion.div>

            {/* Mobile Toggle Selector */}
            <div className="sm:hidden flex justify-center mb-6">
              <div className="flex bg-bg border-3 border-ink shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] p-1 rounded-sm">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-5 py-2 font-heading text-xs uppercase tracking-wider transition-colors ${billing === "monthly" ? "bg-ink text-white" : "text-ink/50"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`px-5 py-2 font-heading text-xs uppercase tracking-wider transition-colors ${billing === "yearly" ? "bg-brand text-ink" : "text-ink/50"}`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Desktop: Grid. Mobile: Hidden */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Desktop Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-white border-4 border-ink p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <div className="block">
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40 mb-3">Monthly</p>
                    <div className="font-heading text-6xl mb-1">$10<span className="text-xl text-ink/35">/mo</span></div>
                  </div>
                  <p className="font-mono text-xs text-ink/35 mb-6 pb-4 border-b-4 border-ink/10">Cancel anytime</p>
                </div>
                <div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {["Unlimited unsent messages", "Red flag tracker", "Healing companion", "Private diary"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-sans text-sm font-medium text-ink/80">
                        <Check className="w-5 h-5 text-positive shrink-0" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className="block text-center border-4 border-ink py-3.5 font-heading text-base shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:bg-ink hover:text-white hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                    Start healing
                  </Link>
                </div>
              </motion.div>

              {/* Desktop Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-ink text-white border-4 border-ink p-8 shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] flex flex-col relative"
              >
                <motion.div
                  animate={{ rotate: [3, -2, 3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-4 right-4 bg-brand text-ink font-heading text-xs px-4 py-1.5 border-4 border-ink shadow-[3px_3px_0px_0px_rgba(255,51,102,1)]"
                >
                  BEST VALUE
                </motion.div>
                <div className="block">
                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Yearly</p>
                    <div className="font-heading text-6xl mb-1">$40<span className="text-xl text-white/35">/yr</span></div>
                  </div>
                  <p className="font-mono text-xs text-brand mb-6 pb-4 border-b-4 border-white/10">Save 67%</p>
                </div>
                <div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {["Everything in Monthly", "Exclusive themes", "Priority support", "Lifetime badges"].map(item => (
                      <li key={item} className="flex items-center gap-3 font-sans text-sm font-medium text-white/80">
                        <Check className="w-5 h-5 text-brand shrink-0" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth" className="block text-center bg-brand text-ink border-4 border-ink py-3.5 font-heading text-base shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                    Most popular
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Mobile: Dynamic Single Card based on Toggle */}
            <div className="sm:hidden w-full max-w-sm mx-auto min-h-[400px] relative">
              <AnimatePresence mode="wait">
                {billing === "monthly" ? (
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-white border-3 border-ink p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex flex-col"
                  >
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Monthly</p>
                    <div className="font-heading text-5xl mb-0.5">$10<span className="text-base text-ink/35">/mo</span></div>
                    <p className="font-mono text-[10px] text-ink/35 mb-4 pb-3 border-b-3 border-ink/10">Cancel anytime</p>
                    
                    <ul className="space-y-3 mb-6 flex-1">
                      {["Unlimited unsent messages", "Red flag tracker", "Healing companion", "Private diary"].map(item => (
                        <li key={item} className="flex items-center gap-2 font-sans text-sm font-medium text-ink/80">
                          <Check className="w-4 h-4 text-positive shrink-0" strokeWidth={3} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth" className="block text-center border-3 border-ink py-3 font-heading text-sm shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">
                      Start healing
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="yearly"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-ink text-white border-3 border-ink p-5 shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] flex flex-col"
                  >
                    <motion.div
                      animate={{ rotate: [3, -2, 3] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="absolute -top-3 right-3 bg-brand text-ink font-heading text-[10px] px-3 py-1 border-3 border-ink shadow-[2px_2px_0px_0px_rgba(255,51,102,1)]"
                    >
                      BEST VALUE
                    </motion.div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Yearly</p>
                    <div className="font-heading text-5xl mb-0.5">$40<span className="text-base text-white/35">/yr</span></div>
                    <p className="font-mono text-[10px] text-brand mb-4 pb-3 border-b-3 border-white/10">Save 67%</p>
                    
                    <ul className="space-y-3 mb-6 flex-1">
                      {["Everything in Monthly", "Exclusive themes", "Priority support", "Lifetime badges"].map(item => (
                        <li key={item} className="flex items-center gap-2 font-sans text-sm font-medium text-white/80">
                          <Check className="w-4 h-4 text-brand shrink-0" strokeWidth={3} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth" className="block text-center bg-brand text-ink border-3 border-ink py-3 font-heading text-sm shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">
                      Most popular
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-16 sm:py-40 px-4 bg-positive relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
            >
              <HeartCrack className="w-[120vw] h-[120vw] text-ink" />
            </motion.div>
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-heading text-[11vw] sm:text-7xl md:text-8xl tracking-tighter text-ink leading-[0.88] mb-6 sm:mb-8">
                You deserve<br />to heal.
              </h2>
              <Link href="/auth"
                className="group inline-flex items-center gap-2 sm:gap-3 bg-ink text-white border-3 sm:border-4 border-ink px-8 py-4 sm:px-10 sm:py-5 font-heading text-base sm:text-xl shadow-[5px_5px_0px_0px_rgba(255,255,255,0.5)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Start your era
                <ArrowRight size={18} className="sm:w-[22px] sm:h-[22px] group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="font-mono text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-4 sm:mt-6">
                Free to start · No credit card required
              </p>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-ink text-white py-6 sm:py-8 px-4">
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
    </div>
  );
}
