"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  KeyRound,
  RotateCw,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, signInWithGoogleOAuth } from "@/lib/supabase";
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
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"not_found" | "already_exists" | "general" | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend OTP countdown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Synchronize initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("credentials");
      setMode(initialMode);
      setOtp("");
      setChallengeToken(null);
      setError(null);
      setErrorType(null);
      setSuccessMsg(null);
      setResendCooldown(0);
    }
  }, [isOpen, initialMode]);

  // Countdown effect for OTP resend timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // Step 1: Send 6-Digit OTP with User Existence Check
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setErrorType(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      setErrorType("general");
      return;
    }

    if (mode === "signup" && (!fullName.trim() || fullName.trim().length < 2)) {
      setError("Please enter your full name (at least 2 characters).");
      setErrorType("general");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          mode,
          fullName: mode === "signup" ? fullName.trim() : undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (data.notFound) {
          setError(data.error || "No account found with this email. Please sign up first.");
          setErrorType("not_found");
        } else if (data.alreadyExists) {
          setError(data.error || "An account with this email already exists. Please sign in instead.");
          setErrorType("already_exists");
        } else {
          setError(data.error || "Could not dispatch verification code. Please check your connection.");
          setErrorType("general");
        }
        setLoading(false);
        return;
      }

      setChallengeToken(data.challengeToken);
      setStep("otp");
      setResendCooldown(60);
      setSuccessMsg(`We sent a 6-digit verification code to ${cleanEmail}.`);
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
      setErrorType("general");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Establish Authenticated Session
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!challengeToken) {
      setError("Session expired. Please request a new verification code.");
      setStep("credentials");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          challengeToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.error || "Verification failed. Please check the code and try again.");
        setLoading(false);
        return;
      }

      const verifiedUser = data.user;

      // Update local storage profile state
      const existingProfile = getStoredProfile();
      const updatedProfile = {
        ...existingProfile,
        id: verifiedUser.id || existingProfile.id,
        email: verifiedUser.email,
        fullName: verifiedUser.fullName || existingProfile.fullName,
      };
      saveStoredProfile(updatedProfile);

      // Persist active session in browser
      localStorage.setItem("remotasks_user_session", JSON.stringify(verifiedUser));
      window.dispatchEvent(new Event("gigmatcher_profile_updated"));

      setSuccessMsg(`Email verified! Welcome back, ${verifiedUser.fullName}.`);

      if (onSuccess) {
        onSuccess(verifiedUser);
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setError(null);
    setErrorType(null);
    setGoogleLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await signInWithGoogleOAuth();
      } else {
        setError("Google authentication service is currently initializing. Please sign in with Email OTP verification.");
        setGoogleLoading(false);
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
            <span>Remotasks.si Verified Access</span>
          </div>

          {step === "credentials" ? (
            <>
              <h2 className="text-2xl font-bold text-black tracking-tight">
                {mode === "signin" ? "Sign In to Your Account" : "Create Candidate Account"}
              </h2>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                {mode === "signin"
                  ? "Enter your registered email. We'll verify your account exists and send a secure 6-digit code."
                  : "Register with your legal name and email to access verified, high-paying AI gigs."}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black tracking-tight flex items-center justify-center gap-2">
                <KeyRound className="w-5 h-5 text-black" />
                <span>Verify Your Email</span>
              </h2>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Enter the 6-digit security code sent to{" "}
                <span className="font-semibold text-black">{email}</span>
              </p>
            </>
          )}
        </div>

        {/* Step 1: Mode Switcher (Sign In vs Create Account) */}
        {step === "credentials" && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setErrorType(null);
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
                setErrorType(null);
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
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>

            {/* Smart Recovery Buttons for User Existence Checks */}
            {errorType === "not_found" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setErrorType(null);
                }}
                className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Switch to Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {errorType === "already_exists" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setErrorType(null);
                }}
                className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Switch to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
            <div className="font-medium">{successMsg}</div>
          </div>
        )}

        {/* STEP 1: CREDENTIALS INPUT FORM */}
        {step === "credentials" && (
          <>
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Full Legal / Professional Name
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

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold shadow-sm mt-2 bg-black hover:bg-neutral-900 text-white"
                isLoading={loading}
              >
                <span>
                  {mode === "signin"
                    ? "Verify Account & Send OTP"
                    : "Create Account & Send OTP"}
                </span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Styled Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-neutral-200"></div>
              <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                or use Google
              </span>
            </div>

            {/* Google Authentication CTA */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-black text-xs font-semibold transition-all shadow-xs disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>
          </>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-800">
                  Enter 6-Digit One-Time Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError(null);
                    setErrorType(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-black hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change email</span>
                </button>
              </div>

              <input
                ref={otpInputRef}
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full h-12 text-center text-xl font-mono font-bold tracking-[0.4em] rounded-xl border border-neutral-300 bg-neutral-50 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
              <p className="text-[11px] text-neutral-500 mt-1.5 text-center">
                Check your inbox and spam folder. Code expires in 10 minutes.
              </p>
            </div>

            <Button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-sm bg-black hover:bg-neutral-900 text-white disabled:opacity-50"
              isLoading={loading}
            >
              <span>Verify Code & Complete Sign In</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            {/* Resend OTP Link with Cooldown */}
            <div className="text-center pt-1">
              {resendCooldown > 0 ? (
                <span className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Resend code in {resendCooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading}
                  className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                >
                  <span>Did not receive code? Resend</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Security & Integrity Footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
          <span>Cryptographic OTP verification • 100% spam-free • Encrypted candidate tokens</span>
        </div>
      </div>
    </Dialog>
  );
};
