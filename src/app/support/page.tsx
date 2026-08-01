"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-brand selection:text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 h-10 bg-white border-2 border-ink brutalist-shadow-sm hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="border-4 border-ink bg-white p-6 sm:p-10 brutalist-shadow space-y-8 text-center">
          <div className="border-b-4 border-ink pb-6 space-y-2">
            <span className="bg-brand text-ink font-mono text-xs font-bold uppercase px-3 py-1 border-2 border-ink">
              Support
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading tracking-tighter uppercase font-black">
              Get in Touch
            </h1>
            <p className="font-sans text-base sm:text-lg text-ink/80 font-medium">
              Please contact us if you have any technical issues.
            </p>
          </div>

          <div className="inline-flex items-center gap-4 border-4 border-ink p-6 sm:p-8 bg-bg brutalist-shadow">
            <div className="w-14 h-14 bg-brand border-3 border-ink flex items-center justify-center shrink-0">
              <Mail className="w-7 h-7 text-ink" />
            </div>
            <div className="text-left">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">Email</p>
              <a
                href="mailto:support@ex-it.app"
                className="font-heading text-2xl sm:text-3xl tracking-tight uppercase font-black hover:text-brand transition-colors"
              >
                support@ex-it.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
