"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Database,
  Key,
  Server,
  ArrowLeft,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { adminLoginAction, getAdminSessionStatusAction } from "@/lib/supabase/auth-actions";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [currentSession, setCurrentSession] = useState<{
    authenticated: boolean;
    authorized: boolean;
    role: string | null;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());

    // Check if user already has an active session
    getAdminSessionStatusAction().then((status) => {
      setCurrentSession(status);
      if (status.authenticated && status.authorized) {
        setSuccessMessage(`Authenticated as ${status.role} (${status.email}). Redirecting...`);
        setTimeout(() => {
          router.push(nextUrl);
        }, 1000);
      }
    });
  }, [nextUrl, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const result = await adminLoginAction(null, formData);

      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      setSuccessMessage(
        result.isDemo
          ? "Local demo administrator session initialized. Redirecting..."
          : `Signed in as ${result.role} (${result.email}). Redirecting to Admin Dashboard...`
      );

      setTimeout(() => {
        router.push(nextUrl);
        router.refresh();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during sign-in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background ambient lighting - Obsidian Monochrome */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Header section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-6 group border border-neutral-800 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-neutral-400" />
          <span>Return to Candidate Directory</span>
        </Link>

        {/* Shield Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-xl mb-4 border border-neutral-700">
          <ShieldCheck className="w-8 h-8 text-white stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Admin Portal Access
        </h1>
        <p className="mt-2 text-xs font-mono text-neutral-500 tracking-wider uppercase">
          [ Server-Enforced RBAC Protected ]
        </p>
      </div>

      {/* Main card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Card className="bg-[#0c0c0c]/95 border-neutral-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 border-b border-neutral-900">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-neutral-900 text-neutral-300 border border-neutral-700">
                <Server className="w-3.5 h-3.5 text-neutral-300" />
                Root Console
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Supabase Auth
              </span>
            </div>
            <CardTitle className="text-lg text-white mt-3 font-semibold">
              Administrator Authentication
            </CardTitle>
            <CardDescription className="text-neutral-400 text-xs">
              Credentials are authenticated with Supabase Auth, followed by a strict server-side role check against <code className="text-white font-mono bg-neutral-900 px-1 py-0.5 rounded">public.user_roles</code>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* Status alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Access Denied</p>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-600 text-white text-xs flex items-start gap-2.5 animate-fadeIn shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white font-mono">Verification Succeeded</p>
                  <p className="leading-relaxed">{successMessage}</p>
                </div>
              </div>
            )}

            {!isConfigured && (
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Local Mockup Mode Active</p>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Supabase credentials are not set in .env.local. Sign in with any credentials to simulate admin dashboard access.
                  </p>
                </div>
              </div>
            )}

            {currentSession?.authenticated && !currentSession?.authorized && (
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Logged in as standard user ({currentSession.email})</p>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    This account has role &quot;{currentSession.role || "user"}&quot; which cannot access administrative tools. Sign in with an account that has the &quot;admin&quot; role.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gigmatcher.io"
                    className="block w-full rounded-lg border border-neutral-800 bg-[#141414] pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-lg border border-neutral-800 bg-[#141414] pl-9 pr-10 py-2 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* High-Impact Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-bold py-2.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 mt-2 border border-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono">Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Bootstrap & Security Documentation Toggle */}
            <div className="pt-3 border-t border-neutral-900">
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-white transition-colors py-1 font-mono"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                  First-time admin setup guide
                </span>
                <span className="text-[11px] text-neutral-600">
                  {showSetupGuide ? "[ Hide ]" : "[ Show ]"}
                </span>
              </button>

              {showSetupGuide && (
                <div className="mt-3 p-3.5 rounded-lg bg-black border border-neutral-800 text-[11px] text-neutral-300 space-y-2.5 animate-fadeIn">
                  <p className="font-semibold text-white flex items-center gap-1.5 font-mono">
                    <Key className="w-3.5 h-3.5 text-neutral-300" />
                    Admin Bootstrap Protocol
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-neutral-400">
                    <li>
                      <span className="text-white">Create user in Supabase:</span> Go to Supabase Dashboard &rarr; <span className="text-neutral-200 font-medium">Authentication</span> &rarr; <span className="text-neutral-200 font-medium">Users</span> &rarr; Add User.
                    </li>
                    <li>
                      <span className="text-white">Complete password setup:</span> Ensure the account has its email verified and password established.
                    </li>
                    <li>
                      <span className="text-white">Apply RBAC migration:</span> In the Supabase SQL Editor, run <code className="text-white font-mono bg-neutral-900 px-1 py-0.5 rounded">supabase/setup_admin.sql</code>.
                    </li>
                    <li>
                      <span className="text-white">Promote to admin role:</span> Run the SQL command with your email:
                      <pre className="mt-1 p-2 bg-[#121212] border border-neutral-800 rounded font-mono text-[10px] text-neutral-200 overflow-x-auto">
                        SELECT public.assign_admin_role_by_email(&apos;shezad@remotasks.si&apos;, &apos;admin&apos;);
                      </pre>
                    </li>
                    <li>
                      <span className="text-white">Sign in:</span> Enter those credentials above. The server confirms the <code className="text-white font-mono bg-neutral-900 px-1 py-0.5 rounded">user_roles</code> entry before opening the dashboard.
                    </li>
                  </ol>
                  <p className="text-neutral-500 text-[10px] italic">
                    Note: Email matching in frontend code is never trusted; only server-verified rows in public.user_roles are accepted.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security architecture highlights */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-[#0c0c0c] border border-neutral-900 text-neutral-400">
            <span className="block font-semibold text-white">Postgres RLS</span>
            Role Security
          </div>
          <div className="p-2 rounded-lg bg-[#0c0c0c] border border-neutral-900 text-neutral-400">
            <span className="block font-semibold text-white">HttpOnly</span>
            Server Cookies
          </div>
          <div className="p-2 rounded-lg bg-[#0c0c0c] border border-neutral-900 text-neutral-400">
            <span className="block font-semibold text-white">RBAC</span>
            Zero Leakage
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading authentication portal...
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
