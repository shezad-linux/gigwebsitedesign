import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertCircle, HelpCircle, Sparkles, Globe, DollarSign } from "lucide-react";
import { PaymentVerification, EligibilityVerification, ApplicationStatus } from "@/types/gig";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "neutral"
    | "primary"
    | "score";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variants = {
    default: "bg-slate-100 text-slate-800 border border-slate-200/80",
    secondary: "bg-slate-200/60 text-slate-700",
    outline: "bg-transparent text-slate-700 border border-border",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    warning: "bg-amber-50 text-amber-800 border border-amber-200/80",
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border border-indigo-200/80",
    score: "bg-brand-600 text-white font-semibold shadow-xs",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const PaymentVerificationBadge: React.FC<{
  status: PaymentVerification;
  className?: string;
}> = ({ status, className }) => {
  if (status === "verified") {
    return (
      <Badge variant="success" className={cn("font-medium", className)}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Payment verified</span>
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge variant="warning" className={cn("font-medium", className)}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Payment partially verified</span>
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" className={cn("font-medium", className)}>
      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
      <span>Payment unverified</span>
    </Badge>
  );
};

export const EligibilityBadge: React.FC<{
  isEligible: boolean;
  status: EligibilityVerification;
  label: string;
  className?: string;
}> = ({ isEligible, status, label, className }) => {
  if (isEligible) {
    if (status === "verified") {
      return (
        <Badge variant="success" className={cn("font-medium", className)}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{label}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className={cn("font-medium", className)}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Needs current verification</span>
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" className={cn("font-medium text-slate-600", className)}>
      <Globe className="w-3.5 h-3.5 text-slate-400" />
      <span>{label}</span>
    </Badge>
  );
};

export const ApplicationStatusBadge: React.FC<{
  status: ApplicationStatus;
  className?: string;
}> = ({ status, className }) => {
  const map: Record<ApplicationStatus, { variant: "success" | "warning" | "primary" | "neutral" | "default"; label: string }> = {
    Shortlisted: { variant: "primary", label: "Shortlisted" },
    Applied: { variant: "warning", label: "Applied" },
    Onboarding: { variant: "warning", label: "Onboarding" },
    Qualified: { variant: "success", label: "Qualified" },
    Active: { variant: "success", label: "Active Project" },
    Rejected: { variant: "neutral", label: "Not Selected" },
    Withdrawn: { variant: "default", label: "Withdrawn" },
  };

  const item = map[status] || { variant: "default", label: status };

  return (
    <Badge variant={item.variant} className={cn("font-semibold text-xs capitalize", className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-0.5"></span>
      {item.label}
    </Badge>
  );
};
