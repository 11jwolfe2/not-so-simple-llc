import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Only the variant/size actually used in this project (variant="ghost"
// size="icon", for the mobile menu trigger) are defined here. The original
// shadcn scaffold referenced tokens (bg-primary, bg-secondary, bg-accent,
// ring-ring, ring-offset-background, etc.) that don't exist in
// tailwind.config.ts, so those classes compiled to nothing and left
// focus-visible:outline-none with no visible replacement — keyboard focus
// was invisible. Trimmed to real tokens with a genuinely visible ring.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ring-offset-paper disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost: "text-ink hover:bg-paper-sunk",
      },
      size: {
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "icon",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
