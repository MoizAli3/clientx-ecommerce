"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-40 rounded-full";

    const variants = {
      primary:   "bg-[#1d1d1f] text-white hover:bg-[#3d3d3f] active:scale-[0.98]",
      secondary: "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] active:scale-[0.98]",
      ghost:     "text-[#1d1d1f] hover:bg-[#f5f5f7] active:scale-[0.98]",
      outline:   "border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7] active:scale-[0.98]",
      destructive: "bg-[#ff3b30] text-white hover:bg-[#ff6159] active:scale-[0.98]",
    };

    const sizes = {
      sm:   "px-4 py-2 text-sm",
      md:   "px-6 py-3 text-[15px]",
      lg:   "px-8 py-4 text-[17px]",
      icon: "p-2.5",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Thoda wait karein...
          </>
        ) : children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
