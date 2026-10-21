import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-none opacity-20 z-10 select-none", className)}>
      <img src="/logo.png" alt="exit" className="w-16 h-auto object-contain block" />
    </div>
  );
}
