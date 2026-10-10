import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonVariantProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className = "",
}: ButtonVariantProps = {}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-black text-white hover:bg-neutral-800 shadow-sm active:translate-y-[0.5px] focus-visible:ring-black border border-black",
    secondary:
      "bg-white text-black hover:bg-neutral-100 border border-neutral-300 shadow-sm active:translate-y-[0.5px] focus-visible:ring-black",
    outline:
      "bg-transparent text-black border border-black hover:bg-neutral-100 focus-visible:ring-black",
    ghost:
      "bg-transparent text-neutral-600 hover:text-black hover:bg-neutral-100 focus-visible:ring-neutral-400",
    destructive:
      "bg-black text-white hover:bg-neutral-900 border border-neutral-800 shadow-sm focus-visible:ring-black",
    subtle:
      "bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200 focus-visible:ring-black",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 h-8 gap-1.5",
    md: "text-sm px-4 py-2 h-10 gap-2",
    lg: "text-base px-5 py-2.5 h-12 gap-2.5 font-semibold",
    icon: "h-9 w-9 p-0",
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, href, children, disabled, ...props }, ref) => {
    const computedClass = buttonVariants({ variant, size, className });

    const spinner = isLoading ? (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : null;

    if (href) {
      return (
        <Link href={href} className={computedClass}>
          {spinner}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={computedClass}
        {...props}
      >
        {spinner}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
