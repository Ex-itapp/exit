import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-heading uppercase text-sm cursor-pointer snappy-transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          {
            // Primary: Vibrant Yellow background, black text. Hover: Black background, Yellow text
            'bg-brand text-ink border-4 border-ink hover:bg-ink hover:text-brand brutalist-shadow-hover': variant === 'primary',
            // Secondary: Cyan Blue background, black text. Hover: Black background, cyan text
            'bg-blue text-ink border-4 border-ink hover:bg-ink hover:text-blue brutalist-shadow-hover': variant === 'secondary',
            // Danger: Bright Red background, white text. Hover: White background, Red text
            'bg-accent text-bg border-4 border-ink hover:bg-bg hover:text-accent brutalist-shadow-hover': variant === 'danger',
            // Ghost: No background, no shadow, just text swap
            'bg-transparent text-ink hover:bg-ink hover:text-brand border-4 border-transparent hover:border-ink': variant === 'ghost',
            
            // Sizes
            'h-12 px-6 py-3': size === 'default',
            'h-10 px-4': size === 'sm',
            'h-16 px-8 text-lg': size === 'lg',
            'h-12 w-12': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
