"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CalendarDays, User } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { icon: Home, path: "/dashboard", label: "Home" },
  { icon: CalendarDays, path: "/timeline", label: "Timeline" },
  { icon: User, path: "/account", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/onboarding' || pathname.startsWith('/closure') || pathname.startsWith('/therapist') || pathname.startsWith('/onboarding') || pathname.includes('/new') || pathname.includes('/edit')) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center w-full px-2 sm:px-4">
      <nav className="bg-bg border-3 sm:border-4 border-ink brutalist-shadow rounded-full flex items-center justify-between p-1 sm:p-1.5 pointer-events-auto w-full max-w-2xl shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "relative flex-1 flex justify-center items-center py-2 sm:py-3 px-1 sm:px-2 rounded-full transition-colors min-w-[2.3rem] sm:min-w-[3.2rem] group select-none cursor-pointer",
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
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
