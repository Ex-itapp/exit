import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Book, Flag, Target, Home, Clock, Zap } from "lucide-react";

const navItems = [
  { icon: Home, path: "/" },
  { icon: Book, path: "/diary" },
  { icon: Flag, path: "/flags" },
  { icon: Clock, path: "/timeline" },
  { icon: Zap, path: "/streak" },
  { icon: Target, path: "/glow-up" },
];

export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center w-full px-4">
      <nav className="bg-bg border-4 border-ink brutalist-shadow rounded-full flex items-center justify-between px-1 py-2 pointer-events-auto w-full max-w-2xl overflow-x-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex-1 flex justify-center py-3 rounded-full transition-colors min-w-[3rem]",
                isActive ? "bg-ink text-bg" : "text-ink hover:bg-ink/10"
              )
            }
          >
            <item.icon className="w-5 h-5 md:w-6 md:h-6 shrink-0" strokeWidth={2.5} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
