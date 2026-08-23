"use client";

import React, { useState, useEffect } from "react";
import { useSparks } from "@/lib/useSparks";
import { ShieldAlert, Fingerprint, Scissors, Wind, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

type InterceptorState = 'writing' | 'shredding' | 'breathing' | 'complete';

export default function UrgeInterceptor() {
  const { earnSparks } = useSparks();
  const [state, setState] = useState<InterceptorState>('writing');
  const [text, setText] = useState("");
  const [earned, setEarned] = useState(false);

  const startShredding = () => {
    if (!text.trim()) return;
    setState('shredding');
    
    // Simulate shredding time
    setTimeout(() => {
      setState('breathing');
    }, 2500);
  };

  useEffect(() => {
    if (state === 'breathing') {
      // Breathing sequence lasts 12 seconds (3 breath cycles)
      const timer = setTimeout(async () => {
        const success = await earnSparks('urge_interceptor', 20);
        if (success) setEarned(true);
        setState('complete');
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [state, earnSparks]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 sm:p-6 max-w-2xl mx-auto">
      
      <AnimatePresence mode="wait">
        {state === 'writing' && (
          <motion.div 
            key="writing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full space-y-8"
          >
            <div className="text-center space-y-2">
              <ShieldAlert className="w-12 h-12 text-brand mx-auto mb-4" />
              <h2 className="font-heading text-3xl uppercase tracking-wider text-ink">Urge Intercepted</h2>
              <p className="font-sans text-sm text-ink/70">
                You want to text them. Okay. Type exactly what you want to send here instead. Don't hold back.
              </p>
            </div>

            <div className="border-2 border-ink bg-bg p-2 shadow-[6px_6px_0px_0px] shadow-ink/20 focus-within:shadow-[2px_2px_0px_0px] transition-all">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I miss you. Why did you do this to us?"
                rows={6}
                className="w-full bg-ink/5 p-4 resize-none outline-none font-voice text-lg text-ink placeholder:text-ink/30 italic"
                autoFocus
              />
            </div>

            <button
              onClick={startShredding}
              disabled={!text.trim()}
              className="w-full bg-ink text-bg border-2 border-ink py-4 font-mono text-sm font-bold uppercase shadow-[4px_4px_0px_0px] shadow-ink/30 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              <Scissors className="w-5 h-5" />
              Destroy the message
            </button>
          </motion.div>
        )}

        {state === 'shredding' && (
          <motion.div 
            key="shredding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-64 flex flex-col items-center justify-center space-y-6"
          >
            {/* Shredding animation container */}
            <div className="relative w-full max-w-sm h-32 overflow-hidden flex flex-col items-center">
              <motion.div 
                animate={{ y: [0, 150] }}
                transition={{ duration: 2, ease: "linear" }}
                className="w-3/4 bg-bg border-2 border-ink p-4 text-center font-voice text-ink/50 italic opacity-50"
              >
                {text.length > 30 ? text.substring(0, 30) + '...' : text}
              </motion.div>
              
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-ink flex justify-evenly items-center z-10 shadow-lg">
                 {/* Blades */}
                 {Array.from({length: 20}).map((_, i) => (
                   <div key={i} className="w-1 h-3 bg-bg opacity-30" />
                 ))}
              </div>
              
              {/* Confetti / shreds falling out */}
              <div className="absolute bottom-0 w-full h-1/2 flex justify-center overflow-hidden">
                <div className="w-full h-full border-x border-b border-ink/20 border-dashed animate-pulse" />
              </div>
            </div>
            
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60 animate-pulse">
              Shredding urge...
            </p>
          </motion.div>
        )}

        {state === 'breathing' && (
          <motion.div 
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-center space-y-12 py-12"
          >
            <div className="text-center space-y-2">
              <Wind className="w-8 h-8 text-blue mx-auto mb-4" />
              <h2 className="font-heading text-2xl uppercase tracking-wider text-ink">Breathe</h2>
              <p className="font-sans text-sm text-ink/70">The urge is passing. Just breathe with the circle.</p>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue/20" />
              
              {/* Breathing circle */}
              <style>{`
                @keyframes breathe {
                  0% { transform: scale(0.3); opacity: 0.5; }
                  50% { transform: scale(1); opacity: 1; }
                  100% { transform: scale(0.3); opacity: 0.5; }
                }
                .animate-breathe {
                  animation: breathe 4s ease-in-out infinite;
                }
              `}</style>
              <div className="w-full h-full rounded-full bg-blue/30 border-2 border-blue animate-breathe flex items-center justify-center">
                 <div className="w-1/2 h-1/2 rounded-full bg-blue/40" />
              </div>
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full text-center space-y-8"
          >
            <div className="w-24 h-24 bg-green-500/20 border-4 border-green-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)]">
              <Fingerprint className="w-12 h-12 text-green-700 dark:text-green-400" />
            </div>
            
            <div className="space-y-4">
              <h2 className="font-heading text-4xl uppercase tracking-wider text-ink">Urge Survived</h2>
              <p className="font-voice text-lg italic text-ink/80 max-w-md mx-auto">
                You wanted to break no-contact. You felt the panic. You wrote the message. And then you destroyed it instead. You are in control.
              </p>
            </div>

            {earned && (
              <div className="inline-flex items-center gap-3 bg-accent text-bg px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0px_0px] shadow-ink/20">
                <Sparkles className="w-5 h-5" />
                Massive +20 Sparks Earned
              </div>
            )}

            <div className="pt-8">
              <Link 
                href="/dashboard"
                className="border-2 border-ink bg-bg px-8 py-4 font-mono text-sm font-bold uppercase hover:bg-ink/5 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
