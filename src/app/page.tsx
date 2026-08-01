"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HeartCrack, Heart, MessageSquare, Flag, BookHeart, Flame, Check, Sparkles, ArrowRight, ArrowDown, Zap, ShieldOff, TrendingUp, Plus } from "lucide-react";
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
      className="bg-white border-4 border-ink p-5 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] relative w-full max-w-xl mx-auto rotate-1"
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-brand border-4 border-ink flex items-center justify-center font-heading text-sm shrink-0">
          EX
        </div>
        <div>
          <p className="font-heading text-base tracking-wide uppercase">Unsent Message</p>
          <p className="font-mono text-xs text-ink/60 font-bold uppercase">Just now</p>
        </div>
      </div>
      <div className="min-h-[80px] font-mono text-sm leading-relaxed text-ink/90 font-bold">
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
    <div className="bg-purple/20 border-4 border-ink p-5 sm:p-8 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] w-full max-w-2xl mx-auto relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-positive border-4 border-ink text-ink font-heading p-4 z-10 whitespace-nowrap shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] text-xl sm:text-3xl uppercase tracking-widest"
          >
            FLAG DROPPED! 🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-heading text-xl sm:text-3xl uppercase tracking-tighter">RED FLAG DROPPER</h3>
        <div className="bg-accent text-white font-mono px-3 py-1.5 border-4 border-ink font-bold text-sm sm:text-lg shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] shrink-0 ml-2">
          TOTAL: {count}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 border-3 border-ink font-mono text-xs font-bold uppercase transition-all ${
              category === c
                ? 'bg-brand shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] -translate-x-[2px] -translate-y-[2px]'
                : 'bg-white hover:bg-bg'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <textarea
        value={flagText}
        onChange={(e) => setFlagText(e.target.value)}
        placeholder="What did they do this time? Don't hold back."
        className="w-full bg-white border-4 border-ink p-4 font-mono text-sm font-bold resize-none h-24 mb-4 focus:outline-none focus:bg-brand/10 transition-colors text-ink placeholder:text-ink/40"
      />

      <button
        onClick={handleDrop}
        disabled={!flagText.trim()}
        className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-ink py-4 font-heading text-xl uppercase tracking-widest shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all active:shadow-none active:translate-x-[5px] active:translate-y-[5px] flex items-center justify-center gap-2"
      >
        <Flag size={22} />
        Drop Flag 🚩
      </button>

      {recentFlags.length > 0 && (
        <div className="mt-5 pt-4 border-t-4 border-ink/20 space-y-2">
          {recentFlags.map((f, i) => (
            <motion.div
              key={`${f}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 font-mono text-xs font-bold text-ink/80 bg-white border-4 border-ink p-3 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
            >
              <span className="text-accent shrink-0">🚩</span>
              <span className="line-clamp-2">{f}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Accordion FAQ ─── */
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-4 border-ink bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 sm:p-6 text-left hover:bg-bg transition-colors gap-4"
      >
        <span className="font-heading text-lg sm:text-2xl uppercase tracking-tight leading-tight">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <Plus className="w-7 h-7" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 pt-0 font-mono text-sm sm:text-base font-bold text-ink/80 leading-relaxed border-t-4 border-ink/10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const features = [
    { icon: <Flame className="w-8 h-8" />, title: "No-Contact Streak", desc: "Track your progress. Every day without them is a massive win.", color: "bg-white" },
    { icon: <MessageSquare className="w-8 h-8" />, title: "Talk To Them (Safely)", desc: "Send unsent messages. Get it out without breaking your streak.", color: "bg-purple text-white" },
    { icon: <Flag className="w-8 h-8" />, title: "Red Flag Tracker", desc: "Document toxic patterns so you never forget why it ended.", color: "bg-accent text-white" },
    { icon: <Heart className="w-8 h-8" />, title: "Healing Companion", desc: "A brutal but honest AI listener who remembers your story.", color: "bg-blue text-white" },
    { icon: <BookHeart className="w-8 h-8" />, title: "Private Diary", desc: "Journal your healing journey, completely private and secure.", color: "bg-white" },
    { icon: <Sparkles className="w-8 h-8" />, title: "Timeline & Rewards", desc: "See how far you've come and earn badass badges along the way.", color: "bg-positive text-ink" },
  ];

  const howItWorks = [
    { step: "01", icon: <ShieldOff className="w-10 h-10" />, title: "Break free", desc: "Sign up and set your no-contact commitment. The clock starts now." },
    { step: "02", icon: <Zap className="w-10 h-10" />, title: "Get it out", desc: "Urge to text them? Send it here instead. Drop flags. Write in your diary." },
    { step: "03", icon: <TrendingUp className="w-10 h-10" />, title: "Grow stronger", desc: "Watch your streak climb. Earn rewards. Read your flags when you waver." },
  ];

  const faqs = [
    { question: "Is this just another journaling app?", answer: "No. This is an active recovery tool. It gamifies the no-contact rule, forces you to confront the red flags you ignored, and provides a safe space to send the texts you shouldn't send to them." },
    { question: "What happens if I break my streak?", answer: "You reset to zero and own it. Healing isn't linear, but accountability matters. The app will help you figure out what triggered the relapse." },
    { question: "Are my unsent messages private?", answer: "100%. Everything you write is encrypted and stored securely. Not even we can read your darkest thoughts." },
  ];

  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden selection:bg-brand selection:text-ink">

      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 w-full bg-bg/90 backdrop-blur-md z-50 border-b-4 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              className="bg-accent w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-4 border-ink rotate-3 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
              whileHover={{ rotate: -6, scale: 1.1 }}
            >
              <HeartCrack className="text-white w-4 h-4 sm:w-6 sm:h-6" />
            </motion.div>
            <span className="font-heading text-2xl sm:text-3xl tracking-tighter uppercase">EX-it.</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/auth" className="font-mono text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors hidden sm:block">
              Log In
            </Link>
            {/* Mobile: compact button */}
            <Link href="/auth" className="bg-brand border-4 border-ink px-3 py-2 sm:px-6 sm:py-3 font-heading text-sm sm:text-lg uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] transition-all whitespace-nowrap">
              Start Healing
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 sm:pt-28">

        {/* ─── HERO ─── */}
        <section className="px-4 py-10 sm:py-16 lg:py-24 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <h1
              className="font-heading text-5xl sm:text-7xl lg:text-9xl tracking-tighter uppercase leading-[0.9] mb-6 sm:mb-8 text-ink"
              style={{ WebkitTextStroke: "2px #111111" }}
            >
              Stop Texting <br />
              <span className="text-accent relative inline-block" style={{ WebkitTextStroke: "2px var(--color-accent)" }}>
                Your Ex.
                <motion.div
                  className="absolute -bottom-1 sm:-bottom-2 md:-bottom-4 left-0 w-full h-2 sm:h-3 md:h-6 bg-brand -z-10 -rotate-2 border-y-4 border-ink"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </h1>

            <p className="font-sans text-base sm:text-xl md:text-2xl max-w-2xl mx-auto text-ink/90 mb-8 sm:mb-12 font-medium leading-relaxed border-4 border-ink bg-white p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] -rotate-1">
              You broke up for a reason. Put the phone down. Track your distance, vent your unsent messages here, and{" "}
              <span className="text-accent underline decoration-4 underline-offset-4 font-bold">get your power back.</span>
            </p>

            <Link
              href="/auth"
              className="group inline-flex items-center justify-center gap-3 bg-ink text-white border-4 border-ink px-8 py-4 sm:px-10 sm:py-5 font-heading text-xl sm:text-2xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all w-full sm:w-auto"
            >
              Start Healing <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          {/* Unsent Message Demo */}
          <motion.div
            className="mt-12 sm:mt-20 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
          >
            <TypewriterEffect />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="mt-10 sm:mt-16 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ArrowDown className="w-6 h-6 text-ink" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-16 sm:py-24 px-4 bg-ink text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)",
              backgroundPosition: "0 0, 20px 20px",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-20 text-center"
            >
              <h2 className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter mb-4 text-brand drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                How It Works
              </h2>
              <p className="font-mono text-base sm:text-xl font-bold max-w-2xl mx-auto">Three steps. No bullshit.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", bounce: 0.5 }}
                  className="bg-bg text-ink border-4 border-white p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] relative text-center"
                >
                  <div className="absolute -top-5 -left-5 bg-brand text-ink font-heading text-2xl sm:text-4xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-4 border-ink rotate-6 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]">
                    {item.step}
                  </div>
                  <motion.div
                    className="mb-6 mx-auto bg-ink text-white w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center border-4 border-ink rotate-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="font-heading text-2xl sm:text-3xl uppercase mb-3 tracking-tight">{item.title}</h3>
                  <p className="font-mono text-sm font-bold text-ink/80 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-16 sm:py-24 bg-brand border-b-4 border-ink px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 sm:mb-20 text-center"
            >
              <h2 className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter mb-4 bg-white inline-block px-5 py-3 sm:px-8 sm:py-4 border-4 border-ink shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] -rotate-2">
                Everything You Need
              </h2>
              <p className="font-mono text-base sm:text-xl font-bold max-w-2xl mx-auto text-ink mt-6">
                To survive the worst heartbreak of your life.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.08, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -8, rotate: i % 2 === 0 ? 1 : -1, transition: { duration: 0.2 } }}
                  className={`border-4 border-ink p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] transition-all ${f.color}`}
                >
                  <motion.div
                    className="mb-5 bg-ink text-white w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center border-4 border-ink/20 rotate-3 shadow-[3px_3px_0px_0px_rgba(17,17,17,0.3)]"
                    whileHover={{ rotate: -12, scale: 1.15 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="font-heading text-xl sm:text-3xl uppercase mb-3 tracking-tight leading-none">{f.title}</h3>
                  <p className="font-mono text-sm font-bold opacity-90 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMO SECTION ─── */}
        <section className="py-16 sm:py-24 px-4 bg-bg border-b-4 border-ink overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-10 sm:mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter mb-5 text-ink drop-shadow-[4px_4px_0px_rgba(255,51,102,1)]"
              >
                See How It Feels
              </motion.h2>
              <p className="font-mono text-sm sm:text-xl font-bold max-w-2xl mx-auto text-ink border-4 border-ink bg-brand px-4 py-2 sm:px-6 sm:py-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] inline-block rotate-1">
                Try the Red Flag Dropper. Get it out of your system.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>

          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 opacity-5 pointer-events-none hidden sm:block"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
          >
            <Flag className="w-[600px] h-[600px] text-ink" />
          </motion.div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-16 sm:py-24 px-4 bg-purple/10 border-b-4 border-ink">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 sm:mb-16 text-center"
            >
              <h2 className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter text-ink">FAQ</h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="py-16 sm:py-24 px-4 bg-bg border-b-4 border-ink">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-4xl sm:text-6xl md:text-8xl uppercase tracking-tighter mb-4"
              >
                Invest In Your Healing
              </motion.h2>
              <p className="font-mono text-base sm:text-xl font-bold max-w-2xl mx-auto text-ink/70">
                Cheaper than therapy. More effective than texting your ex.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-10 justify-center items-stretch max-w-5xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-white border-4 border-ink p-7 sm:p-10 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <h3 className="font-heading text-2xl sm:text-4xl uppercase mb-3 tracking-tight">Monthly</h3>
                <div className="font-heading text-5xl sm:text-7xl mb-2">
                  $10<span className="text-2xl text-ink/40">/mo</span>
                </div>
                <p className="font-mono text-sm font-bold text-ink/40 mb-6 border-b-4 border-ink/10 pb-3">Cancel anytime</p>
                <ul className="space-y-4 mb-8 flex-1">
                  {["Unlimited Unsent Messages", "Red Flag Tracker", "Healing Companion", "Private Diary"].map((f) => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm sm:text-base font-bold">
                      <Check className="w-6 h-6 text-positive shrink-0" strokeWidth={4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className="block w-full text-center bg-white text-ink border-4 border-ink py-4 font-heading text-xl uppercase hover:bg-ink hover:text-white transition-colors shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
                >
                  Start Healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex-1 bg-accent border-4 border-ink p-7 sm:p-10 shadow-[8px_8px_0px_0px_rgba(255,223,0,1)] flex flex-col relative mt-4 md:mt-0"
              >
                <motion.div
                  className="absolute -top-5 right-4 sm:right-6 bg-brand text-ink font-heading px-4 py-1.5 border-4 border-ink rotate-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] text-base sm:text-xl tracking-wider"
                  animate={{ rotate: [3, -3, 3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  BEST VALUE
                </motion.div>
                <h3 className="font-heading text-2xl sm:text-4xl uppercase mb-3 text-white tracking-tight">Yearly</h3>
                <div className="font-heading text-5xl sm:text-7xl mb-2 text-white">
                  $40<span className="text-2xl text-white/50">/yr</span>
                </div>
                <p className="font-mono text-brand font-bold mb-6 text-sm border-b-4 border-white/20 pb-3">
                  Save 67% — that&apos;s $3.33/month
                </p>
                <ul className="space-y-4 mb-8 flex-1 text-white">
                  {["Everything in Monthly", "Exclusive Themes", "Priority Support", "Lifetime Badges"].map((f) => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm sm:text-base font-bold">
                      <Check className="w-6 h-6 text-brand shrink-0" strokeWidth={4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth"
                  className="block w-full text-center bg-brand text-ink border-4 border-ink py-4 font-heading text-xl uppercase shadow-[5px_5px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all"
                >
                  Get Most Popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 sm:py-32 md:py-48 bg-positive text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <HeartCrack className="w-[100vw] h-[100vh] text-ink" />
            </motion.div>
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              <h2 className="font-heading text-5xl sm:text-7xl md:text-9xl uppercase tracking-tighter mb-8 text-ink leading-[0.85]">
                YOU DESERVE<br />TO HEAL.
              </h2>
              <Link
                href="/auth"
                className="group inline-flex items-center gap-4 bg-ink text-white border-4 border-ink px-8 py-5 sm:px-16 sm:py-8 font-heading text-2xl sm:text-3xl md:text-4xl uppercase shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all mb-6"
              >
                Start Your Era
                <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <p className="font-mono text-sm sm:text-lg font-bold text-ink/70 uppercase tracking-widest bg-white inline-block px-5 py-2 border-4 border-ink rotate-2">
                No credit card required.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-ink text-bg py-8 sm:py-12 px-4 border-t-8 border-ink">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="font-heading text-2xl sm:text-4xl tracking-tighter">EX-it.</div>
          <p className="font-mono text-sm font-bold opacity-50 text-center">© {new Date().getFullYear()} EX-it. All rights reserved.</p>
          <div className="flex gap-6 font-mono text-sm font-bold uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-brand transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
