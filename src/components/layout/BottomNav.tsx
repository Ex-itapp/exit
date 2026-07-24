"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Flag, Target, Home, Clock, Zap } from "lucide-react";
import { useUser } from "@/lib/useUser";

const navItems = [
  { icon: Home, path: "/" },
  { icon: Book, path: "/diary" },
  { icon: Flag, path: "/flags" },
  { icon: Clock, path: "/timeline" },
  { icon: Zap, path: "/streak" },
  { icon: Target, path: "/glow-up" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { appMode } = useUser();

  const filteredNavItems = navItems.filter(item => {
    if (appMode === 'no_contact' && item.path === '/flags') return false;
    if (appMode === 'evaluating' && item.path === '/streak') return false;
    return true;
  });

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center w-full px-4">
      <nav className="bg-bg border-4 border-ink brutalist-shadow rounded-full flex items-center justify-between px-1 py-2 pointer-events-auto w-full max-w-2xl overflow-x-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex-1 flex justify-center py-3 rounded-full transition-colors min-w-[3rem]",
                isActive ? "bg-ink text-bg" : "text-ink hover:bg-ink/10"
              )}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
