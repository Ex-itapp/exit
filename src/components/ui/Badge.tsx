import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'accent' | 'positive';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-none border-2 border-ink px-2.5 py-0.5 text-xs font-mono uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-brand text-ink border-ink": variant === "default",
          "bg-transparent text-ink border-ink": variant === "outline",
          "bg-accent text-bg border-ink": variant === "accent",
          "bg-positive text-ink border-ink": variant === "positive",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
