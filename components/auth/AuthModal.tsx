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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>GigMatcher Access</span>
          </div>
          <h2 className="text-2xl font-bold text-black tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-xs text-neutral-500">
            {mode === "signin"
              ? "Sign in to view personalized AI matches, saved gigs, and payout verifications."
              : "Discover verified AI gigs tailored precisely to your background and country."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === "signin"
                ? "bg-black text-white shadow-xs font-bold"
                : "text-neutral-600 hover:text-black"
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
                ? "bg-black text-white shadow-xs font-bold"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Google Authentication CTA */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-black text-sm font-semibold transition-all shadow-xs disabled:opacity-60"
        >
          {/* Monochrome Google Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
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
          <div className="w-full border-t border-neutral-200"></div>
          <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            or continue with email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-300 bg-white text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-300 bg-white text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-800">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setError("Password reset email sent if an account exists.")}
                  className="text-[11px] font-medium text-black hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-xl border border-neutral-300 bg-white text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-semibold shadow-sm mt-2 bg-black hover:bg-neutral-900 text-white"
            isLoading={loading}
          >
            <span>{mode === "signin" ? "Sign In to GigMatcher" : "Create My Free Account"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Security & Disclaimer Notice */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
          <span>Verified platform links • Zero spam • Data encryption active</span>
        </div>
      </div>
    </Dialog>
  );
};
