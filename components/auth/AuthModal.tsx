"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset errors when modal reopens
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setGoogleLoading(false);
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      if (isSupabaseConfigured()) {
        await signInWithGoogleOAuth();
      } else {
        // Fallback for local development if Supabase env vars are not yet populated
        const existing = getStoredProfile();
        const updated = {
          ...existing,
          email: "candidate@gmail.com",
          fullName: existing.fullName || "Verified Candidate",
        };
        saveStoredProfile(updated);
        localStorage.setItem("remotasks_user_session", JSON.stringify(updated));
        window.dispatchEvent(new Event("gigmatcher_profile_updated"));
        setSuccessMsg("Signed in successfully with Google.");
        if (onSuccess) onSuccess({ email: updated.email, user_metadata: { full_name: updated.fullName } });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err?.message || "Google sign-in could not be initiated. Please check your connection.");
      setGoogleLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div className="w-full max-w-md mx-auto space-y-6 py-2">
        {/* Modal Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Remotasks.si Verified Access</span>
          </div>

          <h2 className="text-2xl font-extrabold text-black tracking-tight">
            Continue with Google
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            One-click sign in for verified AI evaluation, coding benchmarks, and data annotation freelance gigs.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-black text-xs flex items-center gap-2.5 animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-black" />
            <div className="font-medium">{successMsg}</div>
          </div>
        )}

        {/* Google Authentication CTA */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3.5 h-12 px-5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-black text-sm font-bold transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google G Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 ml-auto text-neutral-400" />
              </>
            )}
          </button>
        </div>

        {/* Benefits Checklist */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <span>Instant candidate setup • Zero password hassle</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <span>Personalized AI gig matching & eligibility clearance</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-neutral-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <span>Access tracked applications & verified hourly pay rates</span>
          </div>
        </div>

        {/* Security & Integrity Footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
          <span>Google OAuth 2.0 • Encrypted tokens • Zero spam</span>
        </div>
      </div>
    </Dialog>
  );
};
