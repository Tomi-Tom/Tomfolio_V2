"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "gold" | "ghost-gold" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "gold", className, children, type, disabled, onClick, ...rest }, ref) => {
    const baseClasses = variant === "gold"
      ? "btn-gold"
      : variant === "ghost-gold"
      ? "btn-ghost-gold"
      : "border border-[var(--border)] text-[var(--text-primary)] font-display text-[0.7rem] font-semibold tracking-[0.18em] uppercase px-6 py-[10px] bg-transparent hover:border-[var(--border-active)] transition-colors cursor-pointer";

    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, className)}
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
