"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const widthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        className={cn(
          "relative z-10 w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 transition-all duration-200 ease-out animate-in zoom-in-95",
          widthStyles[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            {title && (
              <h2 id="dialog-title" className="text-lg font-semibold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-ink-muted">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
