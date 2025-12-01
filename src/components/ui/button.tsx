"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90":
              variant === "primary",
            "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80":
              variant === "secondary",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--secondary)]":
              variant === "outline",
            "hover:bg-[var(--secondary)]": variant === "ghost",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
