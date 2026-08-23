"use client";

import React, { useState } from "react";
import { useVault } from "@/lib/useVault";
import { useSparks } from "@/lib/useSparks";
import { Lock, Unlock, Sparkles, SendToBack } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function TheVaultPage() {
  const { entries, lockMessage, isLoading } = useVault();
  const { earnSparks } = useSparks();

  const [message, setMessage] = useState("");
  const [days, setDays] = useState<30 | 60 | 90>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLock = async () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const success = await lockMessage(message, days);
    if (success) {
      await earnSparks('the_vault', 15);
      setMessage("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setIsSubmitting(false);
  };

  const getStatus = (unlocksAt: string) => {
    const unlockDate = new Date(unlocksAt);
    const now = new Date();
    if (now >= unlockDate) {
      return { locked: false, text: "Unlocked" };
    }
    
    const diffTime = Math.abs(unlockDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { locked: true, text: `Unlocks in ${diffDays} days` };
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <SendToBack className="w-10 h-10 text-brand mx-auto mb-4" />
        <h2 className="font-heading text-3xl uppercase tracking-wider text-ink">The Vault</h2>
        <p className="font-sans text-sm text-ink/70 max-w-md mx-auto">
          Write a message to your future self. Once locked, you cannot read it until the date arrives. Healing takes time; give yourself something to look forward to.
        </p>
      </div>

      {/* Composer */}
      <div className="border-2 border-ink bg-bg p-6 shadow-[4px_4px_0px_0px] shadow-ink/20">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dear future me, right now I'm feeling..."
          rows={5}
          disabled={isSubmitting}
          className="w-full bg-transparent resize-none outline-none font-voice text-lg text-ink placeholder:text-ink/30 italic"
        />
        
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t-2 border-ink/10 pt-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">Lock for:</span>
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d as any)}
                className={cn(
                  "border-2 font-mono text-xs font-bold px-3 py-1 transition-colors",
                  days === d ? "border-ink bg-ink text-bg" : "border-ink/20 text-ink/60 hover:border-ink/50"
                )}
              >
                {d} days
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="font-mono text-[10px] font-bold text-accent uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> +15 Sparks
            </div>
            <button
              onClick={handleLock}
              disabled={!message.trim() || isSubmitting}
              className="flex-1 sm:flex-none bg-brand text-ink border-2 border-ink px-6 py-2 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px] shadow-ink/20 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px] disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? "Locking..." : "Lock in Vault"}
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-accent/20 border-2 border-accent text-accent font-mono text-sm font-bold uppercase text-center flex justify-center items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Message locked. 15 Sparks earned.
        </div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg uppercase tracking-wider text-ink border-b-2 border-ink pb-2">Your Vault</h3>
        
        {isLoading ? (
          <p className="font-mono text-xs text-ink/50 uppercase">Loading vault...</p>
        ) : entries.length === 0 ? (
          <p className="font-voice text-sm italic text-ink/50">Your vault is empty. Lock a message to start.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => {
              const status = getStatus(entry.unlocksAt);
              
              return (
                <div key={entry.id} className="border-2 border-ink bg-ink/5 p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-ink/10">
                    <span className="font-mono text-[10px] uppercase text-ink/60">
                      Sealed: {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className={cn(
                      "font-mono text-[10px] font-bold uppercase flex items-center gap-1 px-2 py-0.5",
                      status.locked ? "bg-ink/10 text-ink" : "bg-green-500/20 text-green-700 dark:text-green-400"
                    )}>
                      {status.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {status.text}
                    </span>
                  </div>
                  
                  {status.locked ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 opacity-30">
                      <Lock className="w-8 h-8 mb-2" />
                      <p className="font-voice text-sm italic text-center">This message is sealed for your future self.</p>
                    </div>
                  ) : (
                    <p className="font-voice text-base text-ink italic leading-relaxed">
                      "{entry.content}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
