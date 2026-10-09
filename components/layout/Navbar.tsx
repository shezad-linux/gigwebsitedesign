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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { getStoredProfile } from "@/lib/storage";
import { UserProfile } from "@/types/profile";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getStoredProfile());
    const handleUpdate = () => {
      setProfile(getStoredProfile());
    };
    window.addEventListener("gigmatcher_profile_updated", handleUpdate);
    return () => window.removeEventListener("gigmatcher_profile_updated", handleUpdate);
  }, []);

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
                Sign In
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
                Sign In (Demo Account)
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

      {/* Demo Sign-In Dialog */}
      <Dialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title="Prototype Sign In"
        description="Phase 1 frontend prototype uses simulated persistent local sessions."
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                  AS
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Aarav Sharma (Default Demo)</p>
                  <p className="text-xs text-ink-muted">aarav.sharma@example.com · India (IN)</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Session
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-ink">Extracted Skills:</span> Python, Java, Code Review, SQL, Git, Prompt Engineering.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted px-1">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-4 h-4" /> No external auth or password needed in Phase 1
            </span>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSignInOpen(false);
              }}
            >
              Close
            </Button>
            <Link href="/dashboard" onClick={() => setSignInOpen(false)}>
              <Button variant="primary">
                Open Matching Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Dialog>
    </>
  );
};
