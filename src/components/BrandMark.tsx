import React from 'react';
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-none opacity-20 z-10", className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M16 26.6667C16 26.6667 4 19.3333 4 10.6667C4 8.89856 4.70238 7.20286 5.95262 5.95262C7.20286 4.70238 8.89856 4 10.6667 4C12.7867 4 14.7333 5.02667 16 6.62667C17.2667 5.02667 19.2133 4 21.3333 4C23.1014 4 24.7971 4.70238 26.0474 5.95262C27.2976 7.20286 28 8.89856 28 10.6667C28 19.3333 16 26.6667 16 26.6667Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
        />
        {/* Flatline effect */}
        <path 
          d="M0 14H8L11 8L16 22L19 14H32" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
          fill="none"
        />
      </svg>
    </div>
  );
}
