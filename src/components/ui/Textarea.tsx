import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full border-4 border-ink bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-ink/50 focus-visible:outline-none focus-visible:ring-0 focus-visible:brutalist-shadow disabled:cursor-not-allowed disabled:opacity-50 snappy-transition rounded-none resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
