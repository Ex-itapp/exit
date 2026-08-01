"use client";

import { Crown, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProGateModalProps {
  feature: string;
  onClose: () => void;
}

export function ProGateModal({ feature, onClose }: ProGateModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-ink brutalist-shadow max-w-md w-full p-6 sm:p-8 space-y-6 text-ink relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-ink hover:bg-ink hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b-4 border-ink pb-4">
          <div className="p-3 bg-brand border-3 border-ink">
            <Crown className="w-6 h-6 text-ink" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-ink/50 tracking-widest">
              Pro Feature
            </span>
            <h3 className="font-heading text-2xl uppercase tracking-tight">
              Unlock {feature}
            </h3>
          </div>
        </div>

        <p className="font-sans text-sm sm:text-base text-ink/80 leading-relaxed font-medium">
          {feature} is available exclusively for EX-it. Pro users. Upgrade to unlock unlimited access to all AI features, memory tools, and more.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              router.push("/pricing");
            }}
            className="w-full h-14 bg-brand hover:bg-brand/90 text-ink border-3 border-ink brutalist-shadow font-heading text-lg uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
          >
            Start 3-Day Free Trial <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="w-full h-10 border-2 border-ink font-mono text-[11px] uppercase hover:bg-ink hover:text-bg transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
