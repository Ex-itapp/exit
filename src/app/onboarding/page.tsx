"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useUser } from "@/lib/useUser";
import { Shield, Sparkles, Heart, Compass, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const TOTAL_STEPS = 5;

const goals = [
  { label: "Breaking the urge to reach out", icon: Shield,   desc: "Strict accountability and streak tracking." },
  { label: "Rebuilding my self-esteem",       icon: Sparkles, desc: "Focus on your own growth and worth." },
  { label: "Processing heartbreak & grief",   icon: Heart,    desc: "A safe space to vent and release heavy thoughts." },
  { label: "Finding peace and clarity",       icon: Compass,  desc: "Reflecting on patterns without pressure." },
];

export default function OnboardingPage() {
  const navigate = useRouter();
  const { completeOnboarding, hasCompletedOnboarding, isProfileSyncing } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined" && !isProfileSyncing &&
      (hasCompletedOnboarding || localStorage.getItem("unsent_onboarding_done_clean") === "true")) {
      navigate.push("/dashboard");
    }
  }, [isProfileSyncing, hasCompletedOnboarding, navigate]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Finding peace and clarity");
  const [anchor, setAnchor] = useState("");
  const [breakupDate, setBreakupDate] = useState(new Date().toISOString().split("T")[0]);

  const handleFinish = async () => {
    completeOnboarding(
      name.trim() || "Friend",
      goal || "Finding peace and clarity",
      anchor.trim() || "I deserve someone who chooses me every single day.",
      "no_contact",
      new Date(breakupDate).toISOString()
    );
    navigate.push("/dashboard");
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background dots */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(var(--color-ink) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <div className="w-full max-w-lg relative z-10">

        {/* Progress bar + step counter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40">
              Step {step} of {TOTAL_STEPS}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-5 h-1.5 transition-all duration-300",
                    i < step ? "bg-ink" : "bg-ink/15"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="h-0.5 bg-ink/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ink"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card */}
        <motion.div
          layout
          className="bg-white border-4 border-ink brutalist-shadow p-6 sm:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">

            {/* ── STEP 1: WELCOME ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="inline-flex flex-col items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 0, scale: 1.08 }}
                    className="w-16 h-16 bg-brand border-4 border-ink brutalist-shadow-sm flex items-center justify-center transform -rotate-6"
                  >
                    <Heart className="w-8 h-8 text-ink" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink/40 bg-ink/5 px-3 py-1">
                    Your healing starts here
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight leading-none">
                    You made the brave choice.
                  </h1>
                  <p className="font-sans text-base text-ink/70 leading-relaxed">
                    EX-it is your private sanctuary to heal, process, and rebuild — without ever texting them back.
                    Takes 2 minutes to set up. Completely private. No judgement.
                  </p>
                </div>

                {/* Social proof strip */}
                <div className="border-2 border-ink/10 bg-ink/[0.02] p-3 flex items-center gap-3 text-left">
                  <div className="flex -space-x-2 shrink-0">
                    {["#f9c5d1", "#c5e1f9", "#c5f9d6"].map((c, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="font-mono text-[10px] text-ink/60 leading-relaxed">
                    <span className="font-black text-ink">2,400+</span> people are healing in EX-it right now.
                  </p>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-ink text-bg font-mono font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity brutalist-shadow"
                >
                  Let&apos;s Build Your Sanctuary <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: NAME ── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/40 font-bold">About you</span>
                  <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mt-1">
                    What should we call you?
                  </h2>
                  <p className="font-mono text-xs text-ink/50 mt-1">
                    A first name, nickname, or whatever feels safe — this is your private space.
                  </p>
                </div>

                <Input
                  placeholder="e.g. Alex, Riya, Sunshine..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setStep(3)}
                  className="h-14 text-xl font-medium border-4 border-ink px-4"
                  autoFocus
                />

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="h-12 px-5 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 h-12 bg-ink text-bg font-mono font-bold uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {name.trim() ? `Hi ${name.trim().split(" ")[0]}, let's go` : "Continue"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: FOCUS GOAL ── */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/40 font-bold">Your focus</span>
                  <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mt-1">
                    What do you need most right now?
                  </h2>
                  <p className="font-mono text-xs text-ink/50 mt-1">
                    We&apos;ll tailor your experience around this. You can change it anytime.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {goals.map((g) => {
                    const Icon = g.icon;
                    const selected = goal === g.label;
                    return (
                      <motion.button
                        key={g.label}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGoal(g.label)}
                        className={cn(
                          "w-full p-4 border-2 border-ink text-left flex items-center gap-4 transition-all",
                          selected ? "bg-brand brutalist-shadow-sm" : "bg-bg hover:bg-white"
                        )}
                      >
                        <div className={cn("p-2 border-2 border-ink shrink-0", selected ? "bg-white" : "bg-ink/5")}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-heading text-sm sm:text-base uppercase leading-tight">{g.label}</div>
                          <div className="font-mono text-[10px] text-ink/60 mt-0.5 truncate">{g.desc}</div>
                        </div>
                        {selected && <Check className="w-4 h-4 shrink-0 text-ink" />}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(2)} className="h-12 px-5 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 h-12 bg-ink text-bg font-mono font-bold uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: ANCHOR ── */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <span className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] bg-brand text-ink px-2 py-0.5 border border-ink font-bold mb-2">
                    Your anchor
                  </span>
                  <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight">
                    Why are you staying strong?
                  </h2>
                  <p className="font-sans text-sm text-ink/70 leading-relaxed mt-1">
                    When the urge to reach out peaks, <strong>what&apos;s the one truth you need to hear?</strong> This becomes your daily grounding reminder — visible every time you open the app.
                  </p>
                </div>

                <Textarea
                  placeholder={`"I deserve someone who chooses me without hesitation."\n"My peace is worth more than their attention."`}
                  value={anchor}
                  onChange={(e) => setAnchor(e.target.value)}
                  className="min-h-[110px] text-base font-medium border-4 border-ink p-4 leading-relaxed"
                  autoFocus
                />

                <p className="font-mono text-[9px] text-ink/40 uppercase tracking-widest -mt-2">
                  💡 This only ever shows to you.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="h-12 px-5 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="flex-1 h-12 bg-ink text-bg font-mono font-bold uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: DAY ZERO ── */}
            {step === 5 && (
              <motion.div
                key="s5"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink/40 font-bold">Almost there</span>
                  <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mt-1">
                    Set your Day Zero
                  </h2>
                  <p className="font-sans text-sm text-ink/70 leading-relaxed mt-1">
                    When did the breakup — or your last contact — happen? We&apos;ll use this to count your healing streak and celebrate your milestones.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block text-ink/60">
                    Date of last contact / breakup
                  </label>
                  <Input
                    type="date"
                    value={breakupDate}
                    onChange={(e) => setBreakupDate(e.target.value)}
                    className="h-14 font-mono text-lg border-4 border-ink px-4"
                  />
                </div>

                {/* What you unlock */}
                <div className="border-2 border-ink/10 bg-ink/[0.02] p-4 space-y-2">
                  <p className="font-mono text-[9px] uppercase tracking-widest font-bold text-ink/40 mb-2">What you unlock today</p>
                  {[
                    "🔥 Healing streak counter",
                    "🚩 Red flag logbook",
                    "📖 Private diary & mood tracking",
                    "🤖 AI healing companion (24/7)",
                    "💬 AI Ex Simulator — say what you need to say",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink/80">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(4)} className="h-14 px-5 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-ink/5 transition-colors flex items-center">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 h-14 bg-brand text-ink border-4 border-ink font-mono font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 brutalist-shadow"
                  >
                    Enter My Sanctuary <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Footer trust line */}
        <p className="text-center font-mono text-[10px] text-ink/30 uppercase tracking-widest mt-4">
          Private · Encrypted · Never shared
        </p>
      </div>
    </div>
  );
}
