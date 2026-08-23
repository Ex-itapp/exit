import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-bg text-ink flex flex-col font-sans transition-colors duration-300">
      <header className="h-16 shrink-0 flex items-center px-4 sticky top-0 bg-bg z-10 border-b-2 border-ink">
        <Link 
          href="/dashboard"
          className="w-10 h-10 border-2 border-ink/20 flex items-center justify-center hover:bg-ink/5 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading text-lg uppercase tracking-wider">Play & Heal</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
