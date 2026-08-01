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
      className="bg-white border-4 border-ink p-6 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] relative max-w-xl w-full mx-auto rotate-1"
      whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-brand border-4 border-ink flex items-center justify-center font-heading text-lg">
          EX
        </div>
        <div>
          <p className="font-heading text-lg tracking-wide uppercase">Unsent Message</p>
          <p className="font-mono text-sm text-ink/60 font-bold uppercase">Just now</p>
        </div>
      </div>
      <div className="min-h-[100px] font-mono text-base leading-relaxed text-ink/90 font-bold">
        {text}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block w-3 h-5 bg-accent ml-1 align-middle"
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
    <div className="bg-purple/20 border-4 border-ink p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] max-w-2xl mx-auto -rotate-1 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-positive border-4 border-ink text-ink font-heading p-6 z-10 whitespace-nowrap shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] text-3xl uppercase tracking-widest"
          >
            FLAG DROPPED! 🚩
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8">
        <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-tighter">RED FLAG DROPPER</h3>
        <div className="bg-accent text-white font-mono px-4 py-2 border-4 border-ink font-bold text-lg shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
          TOTAL: {count}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 border-4 border-ink font-mono text-sm font-bold uppercase transition-all ${
              category === c ? 'bg-brand shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] -translate-x-[2px] -translate-y-[2px]' : 'bg-white hover:bg-bg hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]'
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
        className="w-full bg-white border-4 border-ink p-5 font-mono text-base font-bold resize-none h-32 mb-6 focus:outline-none focus:bg-brand/10 transition-colors shadow-inner text-ink placeholder:text-ink/40"
      />

      <button
        onClick={handleDrop}
        disabled={!flagText.trim()}
        className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-ink py-5 font-heading text-2xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px] flex items-center justify-center gap-3"
      >
        <Flag size={28} />
        Drop Flag 🚩
      </button>

      {recentFlags.length > 0 && (
        <div className="mt-8 pt-6 border-t-4 border-ink/20 space-y-3">
          {recentFlags.map((f, i) => (
            <motion.div
              key={`${f}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 font-mono text-sm font-bold text-ink/80 bg-white border-4 border-ink p-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
            >
              <span className="text-accent shrink-0 text-lg">🚩</span>
              <span className="line-clamp-2">{f}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Accordion FAQ ─── */
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-4 border-ink bg-white mb-4 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-bg transition-colors"
      >
        <span className="font-heading text-xl md:text-2xl uppercase tracking-tight">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-8 h-8" />
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
            <div className="p-6 pt-0 font-mono text-base font-bold text-ink/80 leading-relaxed border-t-4 border-ink/10">
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
    { icon: <Flame className="w-10 h-10" />, title: "No-Contact Streak", desc: "Track your progress. Every day without them is a massive win.", color: "bg-white" },
    { icon: <MessageSquare className="w-10 h-10" />, title: "Talk To Them (Safely)", desc: "Send unsent messages. Get it out without breaking your streak.", color: "bg-purple text-white" },
    { icon: <Flag className="w-10 h-10" />, title: "Red Flag Tracker", desc: "Document toxic patterns so you never forget why it ended.", color: "bg-accent text-white" },
    { icon: <Heart className="w-10 h-10" />, title: "Healing Companion", desc: "A brutal but honest AI listener who remembers your story.", color: "bg-blue text-white" },
    { icon: <BookHeart className="w-10 h-10" />, title: "Private Diary", desc: "Journal your healing journey, completely private and secure.", color: "bg-white" },
    { icon: <Sparkles className="w-10 h-10" />, title: "Timeline & Rewards", desc: "See how far you've come and earn badass badges along the way.", color: "bg-positive text-ink" },
  ];

  const howItWorks = [
    { step: "01", icon: <ShieldOff className="w-12 h-12" />, title: "Break free", desc: "Sign up and set your no-contact commitment. The clock starts now." },
    { step: "02", icon: <Zap className="w-12 h-12" />, title: "Get it out", desc: "Urge to text them? Send it here instead. Drop flags. Write in your diary." },
    { step: "03", icon: <TrendingUp className="w-12 h-12" />, title: "Grow stronger", desc: "Watch your streak climb. Earn rewards. Read your flags when you waver." },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="bg-accent w-10 h-10 flex items-center justify-center border-4 border-ink rotate-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
              whileHover={{ rotate: -6, scale: 1.1 }}
            >
              <HeartCrack className="text-white w-6 h-6" />
            </motion.div>
            <span className="font-heading text-3xl tracking-tighter uppercase">EX-it.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="font-mono text-base font-bold uppercase tracking-widest hover:text-accent transition-colors underline-offset-4 hover:underline hidden sm:block">
              Log In
            </Link>
            <Link href="/auth" className="bg-brand border-4 border-ink px-6 py-3 font-heading text-lg uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] transition-all">
              Start Healing
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28">
        {/* ─── HERO ─── */}
        <section className="px-4 py-20 lg:py-32 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <h1 className="font-heading text-[12vw] sm:text-8xl lg:text-[140px] tracking-tighter uppercase leading-[0.85] mb-8 text-ink drop-shadow-sm">
              Stop Texting <br />
              <span className="text-accent relative inline-block">
                Your Ex.
                <motion.div
                  className="absolute -bottom-2 md:-bottom-5 left-0 w-full h-4 md:h-8 bg-brand -z-10 -rotate-2 border-y-4 border-ink"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </h1>
            <p className="font-mono text-xl md:text-2xl max-w-3xl mx-auto text-ink/80 mb-12 font-bold leading-relaxed border-4 border-ink bg-white p-6 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] -rotate-1">
              The brutalist breakup recovery app that actually gets it. Track your streak, send the unsent messages, and remember why you left. <span className="text-accent underline decoration-4 underline-offset-4">Your healing era starts now.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/auth" className="group bg-ink text-white border-4 border-ink px-10 py-5 font-heading text-2xl md:text-3xl uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(255,51,102,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all w-full sm:w-auto flex items-center justify-center gap-4">
                Start Healing <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Unsent Message Demo */}
          <motion.div
            className="mt-24 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
          >
            <TypewriterEffect />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="mt-20 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ArrowDown className="w-8 h-8 text-ink" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-28 px-4 bg-ink border-y-4 border-ink text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), repeating-linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff)", backgroundPosition: "0 0, 20px 20px", backgroundSize: "40px 40px" }}
          />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 text-center"
            >
              <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-6 text-brand drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">How It Works</h2>
              <p className="font-mono text-2xl font-bold max-w-2xl mx-auto">Three steps. No bullshit.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", bounce: 0.5 }}
                  className="bg-bg text-ink border-4 border-white p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative text-center"
                >
                  <div className="absolute -top-6 -left-6 bg-brand text-ink font-heading text-4xl w-16 h-16 flex items-center justify-center border-4 border-ink rotate-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
                    {item.step}
                  </div>

                  <motion.div
                    className="mb-8 mx-auto bg-ink text-white w-24 h-24 flex items-center justify-center border-4 border-ink rotate-3 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.div>

                  <h3 className="font-heading text-3xl uppercase mb-4 tracking-tight">{item.title}</h3>
                  <p className="font-mono text-base font-bold text-ink/80 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-28 bg-brand border-b-4 border-ink px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 text-center"
            >
              <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-6 bg-white inline-block px-8 py-4 border-4 border-ink shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] -rotate-2">
                Everything You Need
              </h2>
              <p className="font-mono text-2xl font-bold max-w-2xl mx-auto text-ink mt-8">To survive the worst heartbreak of your life.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -10, rotate: i % 2 === 0 ? 2 : -2, transition: { duration: 0.2 } }}
                  className={`border-4 border-ink p-10 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] hover:shadow-[16px_16px_0px_0px_rgba(17,17,17,1)] transition-all ${f.color}`}
                >
                  <motion.div
                    className="mb-8 bg-ink text-white w-20 h-20 flex items-center justify-center border-4 border-ink/20 rotate-3 shadow-[4px_4px_0px_0px_rgba(17,17,17,0.3)]"
                    whileHover={{ rotate: -12, scale: 1.15 }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="font-heading text-3xl uppercase mb-4 tracking-tight leading-none">{f.title}</h3>
                  <p className="font-mono text-base font-bold opacity-90 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMO SECTION ─── */}
        {/* Changed background from bg-ink back to bg-bg for maximum brutalist contrast */}
        <section className="py-28 px-4 bg-bg border-b-4 border-ink overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-6 text-ink drop-shadow-[6px_6px_0px_rgba(255,51,102,1)]"
              >
                See How It Feels
              </motion.h2>
              <p className="font-mono text-2xl font-bold max-w-2xl mx-auto text-ink border-4 border-ink bg-brand px-6 py-3 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] inline-block rotate-1">
                Try the Red Flag Dropper. Get it out of your system.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>

          {/* Background decoration */}
          <motion.div
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-10 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
          >
            <Flag className="w-[800px] h-[800px] text-ink" />
          </motion.div>
        </section>

        {/* ─── FAQ SECTION ─── */}
        <section className="py-28 px-4 bg-purple/10 border-b-4 border-ink">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-6 text-ink">
                FAQ
              </h2>
            </motion.div>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="py-28 px-4 bg-bg border-b-4 border-ink">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-6"
              >
                Invest In Your Healing
              </motion.h2>
              <p className="font-mono text-xl font-bold max-w-2xl mx-auto text-ink/70">
                Cheaper than therapy. More effective than texting your ex.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch max-w-5xl mx-auto">
              {/* Monthly */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="flex-1 bg-white border-4 border-ink p-10 shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <h3 className="font-heading text-3xl md:text-4xl uppercase mb-4 tracking-tight">Monthly</h3>
                <div className="font-heading text-6xl md:text-7xl mb-2">$10<span className="text-3xl text-ink/40">/mo</span></div>
                <p className="font-mono text-base font-bold text-ink/40 mb-8 border-b-4 border-ink/10 pb-4">Cancel anytime</p>
                <ul className="space-y-5 mb-10 flex-1">
                  {['Unlimited Unsent Messages', 'Red Flag Tracker', 'Healing Companion', 'Private Diary'].map(f => (
                    <li key={f} className="flex items-center gap-4 font-mono text-lg font-bold">
                      <Check className="w-8 h-8 text-positive shrink-0" strokeWidth={4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-white text-ink border-4 border-ink py-5 font-heading text-2xl uppercase hover:bg-ink hover:text-white transition-colors shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[4px] hover:translate-y-[4px]">
                  Start Healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8 }}
                className="flex-1 bg-accent border-4 border-ink p-10 shadow-[12px_12px_0px_0px_rgba(255,223,0,1)] flex flex-col relative scale-100 md:scale-105 z-10"
              >
                <motion.div
                  className="absolute -top-6 right-6 bg-brand text-ink font-heading px-6 py-2 border-4 border-ink rotate-3 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] text-xl tracking-wider"
                  animate={{ rotate: [3, -3, 3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  BEST VALUE
                </motion.div>
                <h3 className="font-heading text-3xl md:text-4xl uppercase mb-4 text-white tracking-tight">Yearly</h3>
                <div className="font-heading text-6xl md:text-7xl mb-2 text-white">$40<span className="text-3xl text-white/50">/yr</span></div>
                <p className="font-mono text-brand font-bold mb-8 text-lg border-b-4 border-white/20 pb-4">Save 67% — that&apos;s $3.33/month</p>
                <ul className="space-y-5 mb-10 flex-1 text-white">
                  {['Everything in Monthly', 'Exclusive Themes', 'Priority Support', 'Lifetime Badges'].map(f => (
                    <li key={f} className="flex items-center gap-4 font-mono text-lg font-bold">
                      <Check className="w-8 h-8 text-brand shrink-0" strokeWidth={4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" className="block w-full text-center bg-brand text-ink border-4 border-ink py-5 font-heading text-2xl uppercase shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all">
                  Get Most Popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-32 md:py-48 bg-positive text-center px-4 relative overflow-hidden">
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
              <h2 className="font-heading text-[12vw] sm:text-8xl md:text-9xl uppercase tracking-tighter mb-10 text-ink leading-[0.85]">
                YOU DESERVE<br />TO HEAL.
              </h2>
              <Link href="/auth" className="group inline-block bg-ink text-white border-4 border-ink px-16 py-8 font-heading text-3xl md:text-4xl uppercase shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all mb-6">
                <span className="flex items-center gap-4">
                  Start Your Era
                  <ArrowRight size={36} className="group-hover:translate-x-3 transition-transform" />
                </span>
              </Link>
              <p className="font-mono text-lg font-bold text-ink/70 mt-4 uppercase tracking-widest bg-white inline-block px-6 py-2 border-4 border-ink rotate-2">No credit card required.</p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-ink text-bg py-12 px-4 border-t-8 border-ink">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-heading text-4xl tracking-tighter">EX-it.</div>
          <p className="font-mono text-base font-bold opacity-50">© {new Date().getFullYear()} EX-it. All rights reserved.</p>
          <div className="flex gap-8 font-mono text-base font-bold uppercase tracking-wider">
            <Link href="/privacy" className="hover:text-brand transition-colors underline-offset-4 hover:underline">Privacy</Link>
            <Link href="/tos" className="hover:text-brand transition-colors underline-offset-4 hover:underline">Terms</Link>
            <Link href="/support" className="hover:text-brand transition-colors underline-offset-4 hover:underline">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
