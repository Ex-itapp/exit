"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { HeartCrack, Heart, MessageSquare, Flag, BookHeart, Calendar, Flame, Check, Sparkles, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

// Fake Unsent Message Typing Effect
const TypewriterEffect = () => {
  const [text, setText] = useState("");
  const fullText = "I saw a dog today that looked exactly like Buster. I almost called you. I miss you... but I know I can't text you.";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        setTimeout(() => {
          setText("");
          i = 0;
        }, 3000);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-4 border-ink p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] relative max-w-md w-full mx-auto mt-8 rotate-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brand border-2 border-ink flex items-center justify-center font-heading text-xl">
          Ex
        </div>
        <div>
          <p className="font-heading text-sm">Unsent Message</p>
          <p className="font-mono text-xs text-ink/70">Just now</p>
        </div>
      </div>
      <div className="min-h-[100px] font-mono text-sm leading-relaxed">
        {text}
        <span className="animate-pulse inline-block w-2 h-4 bg-accent ml-1 align-middle"></span>
      </div>
    </div>
  );
};

const RedFlagDemo = () => {
  const [count, setCount] = useState(0);
  const [flagText, setFlagText] = useState("");
  const [category, setCategory] = useState("Disrespect");
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ["Disrespect", "Manipulation", "Inconsistency", "Boundary Crossing"];

  const handleDrop = () => {
    if (!flagText.trim()) return;
    setCount(c => c + 1);
    setShowSuccess(true);
    setFlagText("");
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="bg-purple/10 border-4 border-ink p-6 md:p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] max-w-xl mx-auto -rotate-1 relative">
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-positive border-4 border-ink text-ink font-heading p-4 z-10 rotate-6 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] text-xl"
        >
          FLAG DROPPED! 🚩
        </motion.div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-xl">RED FLAG DROPPER</h3>
        <div className="bg-accent text-bg font-mono px-3 py-1 border-2 border-ink font-bold">
          TOTAL: {count}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 border-2 border-ink font-mono text-xs uppercase transition-colors ${
              category === c ? 'bg-brand shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-bg'
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
        className="w-full bg-white border-2 border-ink p-4 font-sans text-sm resize-none h-24 mb-4 focus:outline-none focus:bg-brand/10 transition-colors"
      />

      <button
        onClick={handleDrop}
        className="w-full bg-accent text-white hover:bg-accent/90 border-4 border-ink py-4 font-heading text-xl uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2"
      >
        <Flag size={24} />
        Drop Flag 🚩
      </button>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-bg overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-bg/90 backdrop-blur-sm border-b-4 border-ink z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent w-8 h-8 flex items-center justify-center border-2 border-ink rounded-sm rotate-3">
              <HeartCrack className="text-white w-5 h-5" />
            </div>
            <span className="font-heading text-2xl tracking-tighter">EX-it.</span>
          </div>
          <Link href="/onboarding" className="bg-brand border-2 border-ink px-4 py-2 font-heading text-sm uppercase shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        {/* HERO */}
        <section className="px-4 py-20 lg:py-32 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase leading-[0.9] mb-6 text-ink">
              Stop Texting <br/>
              <span className="text-accent relative inline-block">
                Your Ex.
                <motion.div 
                  className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-6 bg-brand -z-10 -rotate-2"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </h1>
            <p className="font-mono text-lg md:text-xl max-w-2xl mx-auto text-ink/80 mb-10 leading-relaxed">
              The breakup recovery app that actually gets it. Track your streak, send the unsent messages, and remember why you left. Your healing era starts now.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding" className="bg-ink text-white border-4 border-ink px-8 py-4 font-heading text-xl uppercase shadow-[6px_6px_0px_0px_rgba(255,51,102,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,51,102,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                Start Healing <ArrowRight size={24} />
              </Link>
              <p className="font-mono text-xs uppercase tracking-widest text-ink/60 mt-2 sm:mt-0 sm:ml-4">
                No credit card required.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="mt-20 relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TypewriterEffect />
          </motion.div>
        </section>

        {/* FEATURES */}
        <section className="py-24 bg-brand border-y-4 border-ink px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4">Everything You Need</h2>
              <p className="font-mono text-lg max-w-xl mx-auto">To survive the worst heartbreak of your life.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: <Flame className="w-8 h-8"/>, title: "No-Contact Streak", desc: "Track your progress. Every day without them is a win.", color: "bg-white" },
                { icon: <MessageSquare className="w-8 h-8"/>, title: "Talk To Them (Safely)", desc: "Send unsent messages. Get it out without breaking your streak.", color: "bg-purple text-white" },
                { icon: <Flag className="w-8 h-8"/>, title: "Red Flag Tracker", desc: "Document toxic patterns so you never forget why it ended.", color: "bg-accent text-white" },
                { icon: <Heart className="w-8 h-8"/>, title: "Healing Companion", desc: "A warm, 24/7 listener who remembers your story.", color: "bg-blue text-white" },
                { icon: <BookHeart className="w-8 h-8"/>, title: "Private Diary", desc: "Journal your healing journey, completely private.", color: "bg-white" },
                { icon: <Sparkles className="w-8 h-8"/>, title: "Timeline & Rewards", desc: "See how far you've come and earn badges along the way.", color: "bg-positive text-ink" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`border-4 border-ink p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(17,17,17,1)] transition-all ${f.color}`}
                >
                  <div className="mb-6 bg-ink text-white w-14 h-14 flex items-center justify-center border-2 border-white/20 rotate-3">
                    {f.icon}
                  </div>
                  <h3 className="font-heading text-2xl uppercase mb-3">{f.title}</h3>
                  <p className="font-sans text-sm opacity-90 leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO SECTION */}
        <section className="py-24 px-4 bg-bg overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4">See How It Feels</h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-ink/80">Try the Red Flag Dropper. Get it out of your system.</p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <RedFlagDemo />
            </motion.div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 opacity-10 pointer-events-none">
            <Flag className="w-96 h-96" />
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-24 bg-ink text-bg px-4 border-y-4 border-ink">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: "I wanted to text him so bad last night. Instead I sent it to the unsent inbox here. Woke up so proud of myself.", author: "Sarah, 24" },
                { quote: "The red flag tracker is brutal but necessary. Whenever I miss them, I just read my list.", author: "Marcus, 29" },
                { quote: "It actually feels like having a friend who never gets tired of hearing you cry about the same person.", author: "Elena, 22" }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-bg text-ink border-4 border-brand p-8 shadow-[6px_6px_0px_0px_rgba(255,223,0,1)] relative"
                >
                  <div className="absolute -top-4 -left-4 text-4xl bg-accent text-white w-12 h-12 flex items-center justify-center border-2 border-ink font-heading rotate-12">
                    &quot;
                  </div>
                  <p className="font-mono text-sm leading-relaxed mb-6 mt-4">"{t.quote}"</p>
                  <p className="font-heading text-lg uppercase">— {t.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-24 px-4 bg-bg">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-5xl md:text-7xl uppercase tracking-tighter mb-4">Invest In Your Healing</h2>
              <p className="font-mono text-lg max-w-xl mx-auto text-ink/80">Cheaper than therapy. More effective than texting your ex.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
              {/* Monthly */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-white border-4 border-ink p-8 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] flex flex-col"
              >
                <h3 className="font-heading text-2xl uppercase mb-2">Monthly</h3>
                <div className="font-heading text-5xl mb-6">$10<span className="text-xl">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited Unsent Messages', 'Red Flag Tracker', 'Healing Companion', 'Private Diary'].map(f => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm">
                      <Check className="w-5 h-5 text-positive shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className="block w-full text-center bg-white text-ink border-4 border-ink py-4 font-heading text-xl uppercase hover:bg-bg transition-colors">
                  Start Healing
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 bg-accent border-4 border-brand p-8 shadow-[8px_8px_0px_0px_rgba(255,223,0,1)] flex flex-col relative scale-100 md:scale-105 z-10"
              >
                <div className="absolute -top-4 right-4 bg-brand text-ink font-heading px-4 py-1 border-2 border-ink rotate-3 shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]">
                  BEST VALUE
                </div>
                <h3 className="font-heading text-2xl uppercase mb-2 text-white">Yearly</h3>
                <div className="font-heading text-5xl mb-2 text-white">$40<span className="text-xl">/yr</span></div>
                <p className="font-mono text-brand font-bold mb-6 text-sm">Save 67%</p>
                <ul className="space-y-4 mb-8 flex-1 text-white">
                  {['Everything in Monthly', 'Exclusive Themes', 'Priority Support', 'Lifetime Badges'].map(f => (
                    <li key={f} className="flex items-center gap-3 font-mono text-sm">
                      <Check className="w-5 h-5 text-brand shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className="block w-full text-center bg-brand text-ink border-4 border-ink py-4 font-heading text-xl uppercase shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all">
                  Get Most Popular
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-positive border-y-4 border-ink text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <HeartCrack className="w-[120vw] h-[120vh] text-ink" />
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="font-heading text-6xl md:text-8xl uppercase tracking-tighter mb-8 text-ink">
              YOU DESERVE<br/>TO HEAL.
            </h2>
            <Link href="/onboarding" className="inline-block bg-ink text-white border-4 border-ink px-12 py-6 font-heading text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all mb-4">
              Start Your Era
            </Link>
            <p className="font-mono text-sm font-bold text-ink/80">No credit card required. Start free.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-ink text-bg py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-heading text-xl tracking-tighter">EX-it.</div>
          <p className="font-mono text-sm opacity-70">© 2025 EX-it. All rights reserved.</p>
          <div className="flex gap-4 font-mono text-sm">
            <Link href="/privacy" className="hover:text-brand transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brand transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
