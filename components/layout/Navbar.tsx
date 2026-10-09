"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  User,
  Briefcase,
  Compass,
  Layers,
  Settings,
  ShieldCheck,
  CheckCircle,
  Database,
  Cloud,
  LogOut,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { getStoredProfile } from "@/lib/storage";
import { UserProfile } from "@/types/profile";
import {
  isSupabaseConfigured,
  signInWithSupabase,
  signUpWithSupabase,
  signOutFromSupabase,
  getSupabaseUser,
} from "@/lib/supabase";
import { apiClient } from "@/lib/api";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [backendType, setBackendType] = useState<"supabase" | "springboot" | "local">("local");

  // Supabase Auth Form State
  const [authMode, setAuthMode] = useState<"demo" | "supabase_login" | "supabase_signup">("demo");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  useEffect(() => {
    setProfile(getStoredProfile());

    apiClient.getActiveBackend().then((type) => {
      setBackendType(type);
    });

    if (isSupabaseConfigured()) {
      getSupabaseUser().then((user) => {
        setSupabaseUser(user);
        if (user) {
          setAuthMode("supabase_login");
        }
      });
    }

    const handleUpdate = () => {
      setProfile(getStoredProfile());
    };
    window.addEventListener("gigmatcher_profile_updated", handleUpdate);
    return () => window.removeEventListener("gigmatcher_profile_updated", handleUpdate);
  }, []);

  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await signInWithSupabase(authEmail, authPassword);
      setSupabaseUser(data.user);
      setSignInOpen(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in via Supabase");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSupabaseSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await signUpWithSupabase(authEmail, authPassword, authFullName);
      setSupabaseUser(data.user);
      setSignInOpen(false);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up via Supabase");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFromSupabase();
    setSupabaseUser(null);
  };

  const navLinks = [
    { label: "Find Gigs", href: "/dashboard", icon: Compass },
    { label: "Categories", href: "/#categories", icon: Layers },
    { label: "How It Works", href: "/#how-it-works", icon: Sparkles },
    { label: "Applications", href: "/applications", icon: Briefcase },
    { label: "Admin Demo", href: "/admin", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-ink tracking-tight">GigMatcher</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60 px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                    {backendType === "supabase" && (
                      <span className="text-[9px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Cloud className="w-2.5 h-2.5" /> Supabase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-ink-muted -mt-1 hidden sm:inline">
                    Verified AI Gig Platform
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-ink-muted hover:text-ink hover:bg-slate-100/70"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setSignInOpen(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-slate-100 transition-colors"
              >
                {supabaseUser ? "Account" : "Sign In"}
              </button>

              {profile && (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-ink"
                  title="View your profile"
                >
                  <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-xs">
                    {profile.fullName.charAt(0)}
                  </div>
                  <span className="font-medium max-w-[100px] truncate">{profile.fullName}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                    {profile.countryCode}
                  </span>
                </Link>
              )}

              <Link href="/onboarding">
                <Button size="sm" className="font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Get Matched
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link href="/onboarding">
                <Button size="sm" className="text-xs px-2.5 py-1">
                  Get Matched
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-ink hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-ink-muted" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-ink-muted" />
                Profile & Resume ({profile?.fullName || "User"})
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSignInOpen(true);
                }}
                className="w-full justify-center"
              >
                Sign In / Account
              </Button>
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Matched
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Unified Sign-In Dialog (Supabase + Demo) */}
      <Dialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="GigMatcher Authentication"
        description={
          isSupabaseConfigured()
            ? "Connect with Supabase cloud backend or test with the local demo account."
            : "Sign in with demo session or connect your Supabase project in .env.local."
        }
      >
        <div className="space-y-4 pt-1">
          {/* Active Backend Indicator */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-brand-600" />
              Active Database:
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                backendType === "supabase"
                  ? "bg-emerald-100 text-emerald-800"
                  : backendType === "springboot"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {backendType === "supabase"
                ? "Supabase (PostgreSQL RLS)"
                : backendType === "springboot"
                ? "Spring Boot (Port 8080)"
                : "Local Prototype (Browser Demo)"}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg border border-border p-1 bg-slate-100 text-xs">
            <button
              onClick={() => setAuthMode("demo")}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                authMode === "demo" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Demo Profile
            </button>
            <button
              onClick={() => setAuthMode("supabase_login")}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                authMode === "supabase_login" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Supabase Login
            </button>
            <button
              onClick={() => setAuthMode("supabase_signup")}
              className={`flex-1 py-1.5 rounded-md font-semibold transition-colors ${
                authMode === "supabase_signup" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
              }`}
            >
              Supabase Sign Up
            </button>
          </div>

          {/* DEMO PROFILE MODE */}
          {authMode === "demo" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                      AS
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Aarav Sharma (Demo Profile)</p>
                      <p className="text-xs text-ink-muted">aarav.sharma@example.com · India (IN)</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-ink">Skills:</span> Python, Java, Code Review, SQL, Git, Prompt Engineering.
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" onClick={() => setSignInOpen(false)}>
                  Close
                </Button>
                <Link href="/dashboard" onClick={() => setSignInOpen(false)}>
                  <Button variant="primary">
                    Open Matching Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* SUPABASE LOGIN MODE */}
          {authMode === "supabase_login" && (
            <div className="space-y-3">
              {supabaseUser ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Logged into Supabase</p>
                      <p className="text-emerald-700">{supabaseUser.email}</p>
                    </div>
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleSignOut} className="w-full">
                    <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
                  </Button>
                </div>
              ) : isSupabaseConfigured() ? (
                <form onSubmit={handleSupabaseSignIn} className="space-y-3">
                  {authError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      {authError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setSignInOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={authLoading}>
                      Sign In with Supabase
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-ink">Supabase project not yet connected.</p>
                  <p>
                    Add <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
                    <code className="font-semibold">.env.local</code> to activate live Supabase authentication.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUPABASE SIGN UP MODE */}
          {authMode === "supabase_signup" && (
            <div className="space-y-3">
              {isSupabaseConfigured() ? (
                <form onSubmit={handleSupabaseSignUp} className="space-y-3">
                  {authError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      {authError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setSignInOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={authLoading}>
                      Create Supabase Account
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-ink">Supabase project not yet connected.</p>
                  <p>
                    Set your Supabase keys in <code className="font-semibold">.env.local</code> to enable real user registration.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};
