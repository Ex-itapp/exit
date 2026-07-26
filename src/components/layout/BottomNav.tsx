"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Flag, Target, Home, Clock, Zap, Award, User } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, path: "/", label: "Home" },
  { icon: Book, path: "/diary", label: "Diary" },
  { icon: Flag, path: "/flags", label: "Flags" },
  { icon: Clock, path: "/timeline", label: "Timeline" },
  { icon: Zap, path: "/streak", label: "Streak" },
  { icon: Award, path: "/rewards", label: "Rewards" },
  { icon: User, path: "/account", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { appMode } = useUser();

  if (pathname === '/onboarding') return null;

  const filteredNavItems = navItems.filter(item => {
    if (appMode === 'no_contact' && item.path === '/flags') return false;
    if (appMode === 'evaluating' && item.path === '/streak') return false;
    return true;
  });

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center w-full px-4">
      <nav className="bg-bg border-4 border-ink brutalist-shadow rounded-full flex items-center justify-between p-1.5 pointer-events-auto w-full max-w-2xl overflow-x-auto custom-scrollbar shadow-2xl">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative flex-1 flex justify-center items-center py-3 px-2 rounded-full transition-colors min-w-[3.2rem] group select-none cursor-pointer",
                isActive ? "text-bg" : "text-ink hover:text-ink/80"
              )}
            >
              {/* Smooth Sliding Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-0 bg-ink rounded-full z-0 border-2 border-ink"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30
                  }}
                />
              )}

              {/* Icon with Hover / Active Animation */}
              <motion.div 
                className="relative z-10 flex flex-col items-center justify-center"
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
