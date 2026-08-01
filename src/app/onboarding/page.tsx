"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useUser } from "@/lib/useUser";
import { Sparkles, Heart, Shield, Compass, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function OnboardingPage() {
  const navigate = useRouter();
  const { completeOnboarding, hasCompletedOnboarding, isProfileSyncing } = useUser();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isProfileSyncing && (hasCompletedOnboarding || localStorage.getItem('unsent_onboarding_done_clean') === 'true')) {
      navigate.push('/dashboard');
    }
  }, [isProfileSyncing, hasCompletedOnboarding, navigate]);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Finding peace and clarity");
  const [anchor, setAnchor] = useState("");
  const [breakupDate, setBreakupDate] = useState(new Date().toISOString().split('T')[0]);

  const goals = [
    { label: "Breaking the urge to reach out", icon: Shield, desc: "Strict accountability and streak tracking." },
    { label: "Rebuilding my self-esteem", icon: Sparkles, desc: "Focusing on my own growth and worth." },
    { label: "Processing heartbreak & grief", icon: Heart, desc: "A safe space to vent and release heavy thoughts." },
    { label: "Finding peace and clarity", icon: Compass, desc: "Reflecting on patterns without pressure." },
  ];

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

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-xl w-full bg-white border-4 border-ink brutalist-shadow p-6 md:p-10 relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 border-b-4 border-ink pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-brand border-2 border-ink block animate-pulse"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest">Setup: Step {step} of 5</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <motion.div 
                key={s} 
                className={cn(
                  "w-6 h-2 border-2 border-ink transition-colors",
                  s <= step ? "bg-ink" : "bg-bg"
                )}
                layout
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-center"
            >
              <motion.div 
                whileHover={{ rotate: 0, scale: 1.1 }}
                className="w-20 h-20 mx-auto bg-brand border-4 border-ink brutalist-shadow-sm flex items-center justify-center transform -rotate-6 cursor-pointer"
              >
                <Heart className="w-10 h-10 text-ink" strokeWidth={2.5} />
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-heading uppercase tracking-tight leading-none">
                Welcome to Your Healing Space
              </h1>
              <p className="font-sans text-base md:text-lg text-ink/80 leading-relaxed">
                Breakup recovery isn't a straight line. You don't have to carry the weight alone anymore. Let's personalize your sanctuary so it supports you exactly where you are today.
              </p>
              <Button className="w-full h-14 text-lg mt-4 shadow-md" onClick={() => setStep(2)}>
                Let's Begin <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: NAME */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading uppercase tracking-tight">
                What should we call you?
              </h2>
              <p className="font-mono text-sm text-ink/70">
                Your name, nickname, or whatever feels comfortable. We're here for you.
              </p>
              <Input
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-xl font-medium border-4 border-ink"
                autoFocus
              />
              <div className="flex gap-4 pt-4">
                <Button variant="secondary" className="h-14 px-6" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button className="flex-1 h-14 text-lg" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FOCUS GOAL */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading uppercase tracking-tight">
                What is your main focus right now?
              </h2>
              <p className="font-mono text-sm text-ink/70">
                Pick the affirmation that resonates most with where your heart is today.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const isSelected = goal === g.label;
                  return (
                    <motion.div
                      key={g.label}
                      whileHover={{ scale: 1.015, x: 4 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setGoal(g.label)}
                      className={cn(
                        "p-4 border-4 border-ink cursor-pointer transition-colors flex items-center gap-4",
                        isSelected 
                          ? "bg-brand text-ink brutalist-shadow-sm" 
                          : "bg-bg text-ink/80 hover:bg-white"
                      )}
                    >
                      <div className={cn("p-2 border-2 border-ink", isSelected ? "bg-white" : "bg-ink/10")}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-heading text-lg uppercase leading-tight">{g.label}</div>
                        <div className="font-mono text-xs opacity-80 mt-0.5">{g.desc}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="secondary" className="h-14 px-6" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button className="flex-1 h-14 text-lg" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: YOUR REASON */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <span className="bg-brand text-ink font-mono text-xs font-bold uppercase px-2 py-1 border-2 border-ink inline-block mb-2">
                  Your Reason for Leaving
                </span>
                <h2 className="text-3xl font-heading uppercase tracking-tight">
                  Why are you staying strong?
                </h2>
              </div>
              
              <p className="font-sans text-sm text-ink/80 leading-relaxed">
                When a hard moment strikes or the urge to reach out hits its peak, what is the <strong>#1 reminder</strong> you want to tell yourself? This will be your daily grounding reminder.
              </p>

              <Textarea
                placeholder="e.g., I deserve someone who chooses me without hesitation. I am choosing my future over my past..."
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
                className="min-h-[120px] text-lg font-medium border-4 border-ink p-4"
                autoFocus
              />

              <div className="flex gap-4 pt-4">
                <Button variant="secondary" className="h-14 px-6" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button className="flex-1 h-14 text-lg" onClick={() => setStep(5)}>
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: DAY ZERO */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-heading uppercase tracking-tight">
                Set Your Starting Date
              </h2>

              <div className="space-y-2 pt-2">
                <label className="font-mono text-xs font-bold uppercase tracking-wider block">
                  When did the breakup or last contact happen? (Day Zero)
                </label>
                <Input
                  type="date"
                  value={breakupDate}
                  onChange={(e) => setBreakupDate(e.target.value)}
                  className="h-14 font-mono text-lg border-4 border-ink"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="secondary" className="h-14 px-6" onClick={() => setStep(4)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button className="flex-1 h-14 text-lg bg-positive hover:bg-positive/90 text-ink shadow-md" onClick={handleFinish}>
                  Enter Sanctuary <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
