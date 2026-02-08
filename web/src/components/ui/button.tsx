import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-800 hover:shadow-md active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white",
        destructive:
          "bg-red-600 text-white shadow hover:bg-red-700 hover:shadow-md active:scale-[0.98]",
        outline:
          "border border-zinc-200/60 bg-white shadow-sm hover:bg-zinc-50 hover:border-zinc-300/80 hover:shadow-md active:scale-[0.98] dark:border-zinc-700/60 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:border-zinc-600",
        secondary:
          "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200 active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        ghost:
          "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
