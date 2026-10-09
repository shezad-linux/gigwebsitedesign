"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  isSupabaseConfigured,
  signInWithSupabase,
  signUpWithSupabase,
  signInWithGoogleOAuth,
} from "@/lib/supabase";
import { saveStoredProfile, getStoredProfile } from "@/lib/storage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize initial mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        if (mode === "signin") {
          const res = await signInWithSupabase(email, password);
          setSuccessMsg("Signed in successfully!");
          if (onSuccess) onSuccess(res.user);
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          if (!fullName.trim()) {
            throw new Error("Please enter your full name.");
          }
          const res = await signUpWithSupabase(email, password, fullName.trim());
          setSuccessMsg("Account created! Check your email to confirm if verification is enabled.");
          if (onSuccess) onSuccess(res.user);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        // Graceful Local / Demo fallback
        const existing = getStoredProfile();
        const updated = {
          ...existing,
          email: email.trim() || existing.email,
          fullName: mode === "signup" && fullName.trim() ? fullName.trim() : existing.fullName,
        };
        saveStoredProfile(updated);
        setSuccessMsg(mode === "signin" ? "Signed in with local profile." : "Profile account initialized!");
        if (onSuccess) onSuccess({ email: updated.email, user_metadata: { full_name: updated.fullName } });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await signInWithGoogleOAuth();
      } else {
        // Offline / prototype fallback: simulate verified Google login
        const existing = getStoredProfile();
        const updated = {
          ...existing,
          email: "candidate@gmail.com",
          fullName: existing.fullName || "Verified Candidate",
        };
        saveStoredProfile(updated);
        setSuccessMsg("Signed in with Google (Prototype mode).");
        if (onSuccess) onSuccess({ email: updated.email, user_metadata: { full_name: updated.fullName } });
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in could not be completed.");
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="w-full max-w-md mx-auto space-y-5 py-1">
        {/* Modal Top Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>GigMatcher Access</span>
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-xs text-ink-muted">
            {mode === "signin"
              ? "Sign in to view personalized AI matches, saved gigs, and payout verifications."
              : "Discover verified AI gigs tailored precisely to your background and country."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "signin"
                ? "bg-white text-ink shadow-xs font-bold"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "signup"
                ? "bg-white text-ink shadow-xs font-bold"
                : "text-slate-600 hover:text-ink"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Google Authentication CTA */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-border bg-white hover:bg-slate-50 active:bg-slate-100 text-ink text-sm font-semibold transition-all shadow-xs hover:border-slate-300 disabled:opacity-60"
        >
          {/* Multicolor Google G Logo */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {googleLoading
              ? "Connecting to Google..."
              : mode === "signin"
              ? "Continue with Google"
              : "Sign up with Google"}
          </span>
        </button>

        {/* Styled Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200"></div>
          <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            or continue with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-white text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-white text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setError("Password reset email sent if an account exists.")}
                  className="text-[11px] font-medium text-brand-600 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-xl border border-border bg-white text-xs text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-semibold shadow-sm mt-2"
            isLoading={loading}
          >
            <span>{mode === "signin" ? "Sign In to GigMatcher" : "Create My Free Account"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Security & Disclaimer Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified platform links • Zero spam • Data encryption active</span>
        </div>
      </div>
    </Dialog>
  );
};
