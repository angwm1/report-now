"use client"

import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[color:var(--color-primary-500)] text-white hover:bg-[color:var(--color-primary-hover)]",
        outline: "border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-primary-50)]",
        ghost: "bg-transparent text-[color:var(--color-muted)] hover:bg-[color:var(--color-primary-50)] hover:text-[color:var(--color-foreground)]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

const Button = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
