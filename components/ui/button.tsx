import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-14 font-medium ring-offset-neutral-very-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-neutral-light hover:bg-primary/90",
        destructive:
          "bg-danger text-danger-very-light hover:bg-danger/90",
        outline:
          "border border-input bg-neutral-very-light hover:bg-safe hover:text-safe-very-light",
        secondary:
          "bg-neutral text-neutral-very-light hover:bg-neutral/80",
        confirm: "bg-primary-dark text-neutral-light hover:bg-primary-dark/90",
        ghost: "hover:bg-safe hover:text-safe-very-light",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-4 py-4",
        sm: "h-8 rounded-md px-4",
        lg: "h-14 rounded-md px-12 py-4",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
