"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Flag, Target, Award, Home, Clock, Zap, User } from "lucide-react";
import { useUser } from "@/lib/useUser";

const navItems = [
  { icon: Home, label: "Today", path: "/" },
  { icon: Book, label: "Diary", path: "/diary" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
  { icon: Flag, label: "Red Flags", path: "/flags" },
  { icon: Target, label: "Glow-Up", path: "/glow-up" },
  { icon: Zap, label: "Streak", path: "/streak" },
  { icon: Award, label: "Rewards", path: "/rewards" },
  { icon: User, label: "Account", path: "/account" },
];

export function Sidebar() {
  const { userName, streakDays, appMode } = useUser();
  const pathname = usePathname();

  if (pathname === '/onboarding') return null;

  const filteredNavItems = navItems.filter(item => {
    if (appMode === 'no_contact' && item.path === '/flags') return false;
    if (appMode === 'evaluating' && item.path === '/streak') return false;
    return true;
  });

  return (
    <aside className="w-64 border-r-4 border-ink bg-bg h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b-4 border-ink">
        <h1 className="text-3xl font-heading tracking-tighter">UNSENT</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="w-3 h-3 bg-positive rounded-none border-2 border-ink block animate-pulse"></span>
          <span className="font-mono text-xs font-bold uppercase">System Active</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-4 font-mono font-bold text-sm snappy-transition group",
                isActive
                  ? "border-ink bg-brand text-ink brutalist-shadow-sm"
                  : "border-transparent text-ink hover:border-ink hover:brutalist-shadow-sm hover:bg-white"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={2.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t-4 border-ink">
        <div className="font-mono text-xs font-bold text-ink/70">
          {appMode === 'no_contact' && <p>STREAK: {streakDays} DAYS</p>}
          <p className="uppercase">HEALING: {userName}</p>
        </div>
      </div>
    </aside>
  );
}
