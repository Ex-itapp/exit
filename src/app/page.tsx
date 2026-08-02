"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  HeartCrack, Heart, MessageSquare, Flag, BookHeart,
  Flame, Check, ArrowRight
} from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Typewriter — cycles through three messages
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
      className="bg-white border-4 border-ink p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] w-full max-w-lg mx-auto rotate-1"
      whileHover={{ rotate: 0, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-brand border-4 border-ink flex items-center justify-center font-heading text-xs shrink-0">EX</div>
        <div>
          <p className="font-heading text-sm uppercase tracking-wide">Unsent Message</p>
          <p className="font-mono text-xs text-ink/50 font-bold">Just now</p>
        </div>
      </div>
      <div className="min-h-[72px] font-sans text-base leading-relaxed text-ink/80 italic">
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
    // Changed bg-purple/20 to bg-bg to provide strong contrast against the black section background
    <div className="bg-bg border-4 border-ink p-5 sm:p-8 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-xl mx-auto -rotate-1 relative">
      <AnimatePresence>
        {boom && (
          <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="absolute inset-0 m-auto w-fit h-fit bg-positive border-4 border-ink text-ink font-heading px-6 py-4 z-10 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] text-2xl uppercase tracking-widest">
            FLAG DROPPED! 🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-heading text-xl sm:text-2xl tracking-tighter">Red flag dropper</h3>
        <div className="bg-accent text-white font-mono px-3 py-1 border-4 border-ink font-bold text-sm shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
          {count} 🚩
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 border-3 border-ink font-mono text-xs font-bold uppercase transition-all ${cat === c ? "bg-brand shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] -translate-x-[1px] -translate-y-[1px]" : "bg-white hover:bg-white/80"}`}>
            {c}
          </button>
        ))}
      </div>

      <textarea value={flagText} onChange={e => setFlagText(e.target.value)}
        placeholder="What did they do this time? Don't hold back."
        className="w-full bg-white border-4 border-ink p-4 font-mono text-sm font-bold resize-none h-24 mb-4 focus:outline-none focus:bg-brand/10 transition-colors placeholder:text-ink/40" />

      <button onClick={drop} disabled={!flagText.trim()}
        className="w-full bg-accent text-white disabled:opacity-40 border-4 border-ink py-4 font-heading text-xl shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all active:shadow-none flex items-center justify-center gap-2">
        <Flag size={20} /> Drop flag
      </button>

      {recent.length > 0 && (
        <div className="mt-4 pt-4 border-t-4 border-ink/10 space-y-2">
          {recent.map((f, i) => (
            <motion.div key={`${f}-${i}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 font-mono text-xs font-bold text-ink/70 bg-white border-4 border-ink p-2.5 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]">
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
   Scroll-driven Feature Reveal (Apple-style)
───────────────────────────────────────────── */
const features = [
  {
    icon: <Flame className="w-10 h-10" />,
    color: "bg-accent",
    label: "01",
    title: "No-contact streak.",
    body: "Every day you don't text them is a point on the board. Watch your streak grow. Feel yourself getting stronger.",
    accent: "text-accent",
  },
  {
    icon: <MessageSquare className="w-10 h-10" />,
    color: "bg-purple",
    label: "02",
    title: "Say it here.",
    body: "Send every unsent text to the void instead of to them. All the catharsis, zero consequences.",
    accent: "text-purple",
  },
  {
    icon: <Flag className="w-10 h-10" />,
    color: "bg-brand",
    label: "03",
    title: "Red flag tracker.",
    body: "Log every toxic thing they did. Read it back when you miss them. You'll remember fast.",
    accent: "text-ink",
  },
  {
    icon: <Heart className="w-10 h-10" />,
    color: "bg-blue",
    label: "04",
    title: "Healing companion.",
    body: "An AI that knows your story, doesn't judge, and is available at 3am when you're about to relapse.",
    accent: "text-blue",
  },
];

const FeatureRow = ({ f, i }: { f: typeof features[0]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const even = i % 2 === 0;

  return (
    <motion.div ref={ref} style={{ opacity, y }}
      className={`flex flex-col ${even ? "sm:flex-row" : "sm:flex-row-reverse"} gap-6 sm:gap-12 items-stretch mb-8`}>
      {/* Icon block */}
      <div className="shrink-0 flex items-center justify-center">
        <motion.div
          whileHover={{ rotate: even ? 8 : -8, scale: 1.05 }}
          className={`${f.color} w-28 h-28 sm:w-36 sm:h-36 border-4 border-ink flex items-center justify-center text-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] rotate-${even ? "2" : "-1"}`}
          style={{ rotate: even ? 2 : -1 }}
        >
          {f.icon}
        </motion.div>
      </div>

      {/* Card */}
      <div className="flex-1 border-4 border-ink bg-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] p-6 sm:p-8 relative overflow-hidden">
        {/* Colored accent bar on the left */}
        <div className={`absolute top-0 left-0 w-2 h-full ${f.color}`} />

        <div className="pl-4">
          <span className={`font-mono text-xs font-bold uppercase tracking-[0.25em] ${f.accent} block mb-2`}>{f.label}</span>
          <h3 className="font-heading text-2xl sm:text-4xl tracking-tighter mb-3 leading-tight">{f.title}</h3>
          <p className="font-sans text-base sm:text-lg text-ink/60 leading-relaxed max-w-lg">{f.body}</p>
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

  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden selection:bg-brand selection:text-ink">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b-4 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: -8, scale: 1.1 }}
              className="bg-accent w-8 h-8 border-4 border-ink rotate-3 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]">
              <HeartCrack className="text-white w-4 h-4" />
            </motion.div>
            {/* Removed uppercase for cleaner look */}
            <span className="font-heading text-xl tracking-tighter">EX-it.</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/auth" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/auth"
              className="bg-brand border-4 border-ink px-4 py-2 font-heading text-sm shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-all whitespace-nowrap">
              Start healing
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* ── HERO — full-viewport, one idea ── */}
        <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-8 text-center relative overflow-hidden">
          {/* Subtle dot grid — Apple-like depth layer */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #111 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center">
            {/* Removed uppercase from heading */}
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-[13vw] sm:text-7xl lg:text-[110px] tracking-tighter leading-[0.88] text-ink mb-6"
              style={{ WebkitTextStroke: "1.5px #111" }}
            >
              Stop texting<br />
              <span className="text-accent relative inline-block" style={{ WebkitTextStroke: "1.5px var(--color-accent)" }}>
                your ex.
                <motion.div
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-4 bg-brand -z-10 -rotate-1"
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
              className="font-sans text-base sm:text-xl text-ink/65 max-w-lg leading-relaxed mb-10 font-medium"
            >
              You broke up for a reason. Put the phone down. Vent here, track your distance, and{" "}
              <span className="text-ink font-bold underline decoration-accent decoration-2 underline-offset-2">get your power back.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              {/* Removed uppercase from buttons */}
              <Link href="/auth"
                className="group flex items-center justify-center gap-3 bg-ink text-white border-4 border-ink px-8 py-4 font-heading text-lg shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                Start healing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth"
                className="flex items-center justify-center gap-2 border-4 border-ink px-8 py-4 font-heading text-lg bg-white hover:bg-bg shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Log in
              </Link>
            </motion.div>
          </motion.div>

          {/* Typewriter card — drifts in from below */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full mt-14 sm:mt-20"
          >
            <TypewriterEffect />
          </motion.div>
        </section>

        {/* ── FEATURES — Apple-style alternating scroll reveals ── */}
        <section className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center pt-12 pb-4 sm:pt-20 sm:pb-8"
          >
            <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl tracking-tighter mb-5 leading-[0.95]">
              Built to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">break</span>
                <span className="absolute left-0 right-0 top-1/2 h-[4px] bg-accent z-20" />
              </span>{" "}
              <span className="relative inline-block">
                free
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[6px] bg-brand -z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </span>.
            </h2>
            <p className="font-sans text-base sm:text-lg text-ink/50 max-w-md mx-auto leading-relaxed">
              Four tools. Zero fluff.{" "}
              <span className="text-ink/80 font-semibold">Everything you need to stop going back.</span>
            </p>
          </motion.div>

          <div>
            {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
          </div>
        </section>

        {/* ── DEMO — full-bleed dark, one focal point ── */}
        <section className="py-16 sm:py-28 px-4 bg-ink relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%)", backgroundPosition: "0 0, 20px 20px", backgroundSize: "40px 40px" }} />

          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="font-heading text-4xl sm:text-6xl tracking-tighter text-white mb-4 drop-shadow-[5px_5px_0px_rgba(255,51,102,1)]">
                Try it right now.
              </h2>
              <p className="font-sans text-base sm:text-lg text-white/50 max-w-md mx-auto">
                Drop a red flag. It&apos;s more satisfying than you think.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>
        </section>

        {/* ── PRICING — breathe, let the numbers speak ── */}
        <section className="py-16 sm:py-28 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-12 sm:mb-20"
            >
              <h2 className="font-heading text-4xl sm:text-6xl tracking-tighter mb-4">Simple pricing.</h2>
              <p className="font-sans text-base sm:text-lg text-ink/60 max-w-md mx-auto">
                Cheaper than therapy. More honest than your friends.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-white border-4 border-ink p-7 sm:p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/40 mb-3">Monthly</p>
                <div className="font-heading text-5xl sm:text-6xl mb-1">$10<span className="text-xl text-ink/35">/mo</span></div>
                <p className="font-mono text-xs text-ink/35 mb-6 pb-4 border-b-4 border-ink/10">Cancel anytime</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Unlimited unsent messages", "Red flag tracker", "Healing companion", "Private diary"].map(item => (
                    <li key={item} className="flex items-center gap-3 font-sans text-sm font-medium text-ink/80">
                      <Check className="w-5 h-5 text-positive shrink-0" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block text-center border-4 border-ink py-3.5 font-heading text-base shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:bg-ink hover:text-white hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Start healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                whileHover={{ y: -6 }}
                className="bg-ink text-white border-4 border-ink p-7 sm:p-8 shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] flex flex-col relative"
              >
                <motion.div
                  animate={{ rotate: [3, -2, 3] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-4 right-4 bg-brand text-ink font-heading text-xs px-4 py-1.5 border-4 border-ink shadow-[3px_3px_0px_0px_rgba(255,51,102,1)]"
                >
                  BEST VALUE
                </motion.div>
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Yearly</p>
                <div className="font-heading text-5xl sm:text-6xl mb-1">$40<span className="text-xl text-white/35">/yr</span></div>
                <p className="font-mono text-xs text-brand mb-6 pb-4 border-b-4 border-white/10">Save 67% — $3.33/month</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {["Everything in Monthly", "Exclusive themes", "Priority support", "Lifetime badges"].map(item => (
                    <li key={item} className="flex items-center gap-3 font-sans text-sm font-medium text-white/80">
                      <Check className="w-5 h-5 text-brand shrink-0" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block text-center bg-brand text-ink border-4 border-ink py-3.5 font-heading text-base shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  Most popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA — Apple-style single-focus close ── */}
        <section className="py-24 sm:py-40 px-4 bg-positive relative overflow-hidden">
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
              <h2 className="font-heading text-[11vw] sm:text-7xl md:text-8xl tracking-tighter text-ink leading-[0.88] mb-8">
                You deserve<br />to heal.
              </h2>
              <Link href="/auth"
                className="group inline-flex items-center gap-3 bg-ink text-white border-4 border-ink px-10 py-5 font-heading text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Start your era
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="font-mono text-xs font-bold text-ink/50 uppercase tracking-widest mt-6">
                Free to start · No credit card required
              </p>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-ink text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-heading text-xl tracking-tighter">EX-it.</span>
          <p className="font-mono text-xs text-white/40">© {new Date().getFullYear()} EX-it. All rights reserved.</p>
          <div className="flex gap-6 font-mono text-xs font-bold uppercase tracking-widest text-white/50">
            <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-brand transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
