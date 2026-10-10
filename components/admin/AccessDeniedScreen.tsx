"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Lock,
  UserX,
  AlertTriangle,
  ExternalLink,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { adminSignOutAction } from "@/lib/supabase/auth-actions";

interface AccessDeniedScreenProps {
  email?: string | null;
  role?: string | null;
  reason?: string;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  email,
  role = "user",
  reason,
}) => {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await adminSignOutAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background ambient lighting - Monochrome Obsidian */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="max-w-md w-full mx-auto relative z-10">
        <Card className="bg-[#0c0c0c]/95 border border-neutral-800 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-4 border-b border-neutral-900">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-black border border-neutral-700 flex items-center justify-center shadow-lg mb-3">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl text-white font-bold tracking-tight font-mono">
              Access Denied [403]
            </CardTitle>
            <CardDescription className="text-neutral-400 text-xs mt-1">
              Server-Enforced Role Verification Rejection
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="p-3.5 rounded-lg bg-black border border-neutral-800 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Account:</span>
                <span className="text-white font-medium">{email || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Database Role:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-900 text-neutral-300 border border-neutral-700">
                  {role || "user"}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Required Roles:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-900 text-white border border-neutral-600">
                  admin, reviewer
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-black border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-mono">
              <p className="font-semibold text-white flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                Administrative Privilege Required
              </p>
              {reason || "Your credentials are valid, but your account lacks administrative permissions in public.user_roles."}
              <p className="mt-2 text-[10px] text-neutral-500">
                Database row level security prevents all privileged queries unless elevated roles are confirmed by server-managed tokens.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg text-xs transition-all disabled:opacity-50 font-mono uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                {signingOut ? "Signing out..." : "Sign Out & Switch Account"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full text-xs border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-white font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    Candidate Portal
                  </Button>
                </Link>

                <Link href="/admin/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full text-xs border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-white font-mono"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
