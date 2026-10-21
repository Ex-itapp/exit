"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book, Home, MessageCircle, CalendarDays, User } from "lucide-react";
import { motion } from "motion/react";
import { useUser, DEFAULT_AVATAR } from "@/lib/useUser";
import { Avatar } from "@/components/ui/Avatar";

const navItems = [
  { icon: Home, path: "/dashboard", label: "Home" },
  { icon: Book, path: "/diary", label: "Logs" },
  { icon: MessageCircle, path: "/talk", label: "Talk" },
  { icon: CalendarDays, path: "/timeline", label: "Timeline" },
  { icon: User, path: "/account", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { userAvatar } = useUser();

  if (pathname === '/onboarding' || pathname.startsWith('/closure') || pathname.startsWith('/therapist') || pathname.startsWith('/onboarding') || pathname.includes('/new') || pathname.includes('/edit')) return null;

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center w-full px-2 sm:px-4">
      <div className="flex items-center gap-3 w-full max-w-2xl pointer-events-auto">
        <nav className="flex-1 bg-bg border-2 border-ink shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.85),inset_0_-2px_0_0_rgba(0,0,0,0.08),0_4px_0_0_var(--color-ink),0_8px_16px_-2px_rgba(0,0,0,0.15)] rounded-full flex items-center justify-between p-1 sm:p-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative flex-1 flex justify-center items-center py-3 sm:py-3.5 px-2 rounded-full transition-colors group select-none cursor-pointer",
                  isActive ? "text-bg" : "text-ink hover:text-ink/80"
                )}
              >
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

                <motion.div 
                  className="relative z-10 flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 shrink-0" strokeWidth={2.5} />
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Profile Avatar Weekly Reality Check Link */}
        <Link 
          href="/pattern-report"
          title="Weekly Reality Check"
          aria-label="Weekly Reality Check"
          className="shrink-0 aspect-square h-[56px] sm:h-[64px] rounded-full border-2 border-ink shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.85),inset_0_-2px_0_0_rgba(0,0,0,0.08),0_4px_0_0_var(--color-ink),0_8px_16px_-2px_rgba(0,0,0,0.15)] bg-bg flex items-center justify-center hover:opacity-90 active:translate-y-[2px] active:shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.85),inset_0_-2px_0_0_rgba(0,0,0,0.08),0_2px_0_0_var(--color-ink),0_4px_8px_-2px_rgba(0,0,0,0.12)] transition-all relative overflow-hidden group"
        >
          <div className="w-[80%] h-[80%] flex items-center justify-center transition-transform group-hover:scale-110">
            <Avatar config={typeof userAvatar === 'object' ? userAvatar : DEFAULT_AVATAR} size="100%" />
          </div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full z-20 pointer-events-none" />
        </Link>
      </div>
    </div>
  );
}
