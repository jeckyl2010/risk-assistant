import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline: "text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
        success: "border-transparent bg-gradient-to-br from-emerald-200 to-teal-200 text-emerald-900 dark:from-emerald-700 dark:to-teal-700 dark:text-emerald-100",
        warning: "border-transparent bg-gradient-to-br from-amber-200 to-orange-200 text-amber-900 dark:from-amber-700 dark:to-orange-700 dark:text-amber-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
