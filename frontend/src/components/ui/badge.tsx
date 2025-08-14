import * as React from "react"
import { cn } from"../../lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'accent'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === 'default',
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200": variant === 'secondary',
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === 'destructive',
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80": variant === 'accent',
          "text-foreground border-border": variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
