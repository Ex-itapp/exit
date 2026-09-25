"use client";

import { useUser, DEFAULT_AVATAR } from "@/lib/useUser";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PatternReportPage() {
  const { userAvatar, userName } = useUser();

  return (
    <div className="min-h-screen bg-bg text-ink p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-8 text-ink/60 hover:text-ink font-mono text-xs uppercase tracking-wider font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <header className="mb-12 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full border-4 border-ink shadow-[4px_4px_0px_0px] shadow-ink/10 bg-brand flex items-center justify-center shrink-0 overflow-hidden">
            <Avatar config={typeof userAvatar === 'object' ? userAvatar : DEFAULT_AVATAR} size="100%" />
          </div>
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl font-black uppercase tracking-tight">{userName}'s Pattern Report</h1>
            <p className="font-sans text-lg mt-2 text-ink/70">A brutally honest look at your healing journey.</p>
          </div>
        </header>

        <div className="space-y-6">
          {/* We would fetch and display the pattern report here. For now it's a placeholder. */}
          <div className="bg-white border-2 border-ink p-6 shadow-[4px_4px_0px_0px] shadow-ink/10">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink/50 mb-4">Latest Insights</h2>
            <div className="space-y-4 font-sans text-lg">
              <p>Your pattern report is being generated based on your recent diary entries, red flags, and check-ins.</p>
              <div className="h-2 w-full bg-ink/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand w-1/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
