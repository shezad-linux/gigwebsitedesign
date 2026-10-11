"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  CheckCircle,
  Database,
  LogOut,
  ChevronDown,
  Tag,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { getStoredProfile } from "@/lib/storage";
import { UserProfile } from "@/types/profile";
import {
  isSupabaseConfigured,
  signOutFromSupabase,
  getSupabaseUser,
  supabase,
} from "@/lib/supabase";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Authenticated state
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setProfile(getStoredProfile());

    // 1. Check local session storage for active verified session
    try {
      const stored = localStorage.getItem("remotasks_user_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) setCurrentUser(parsed);
      }
    } catch {}

    // 2. Query /api/auth/me endpoint to verify active cookie session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // 3. Sync with Supabase Auth if configured
    if (isSupabaseConfigured() && supabase) {
      getSupabaseUser().then((user) => {
        if (user) setCurrentUser(user);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) setCurrentUser(session.user);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    const handleUpdate = () => {
      setProfile(getStoredProfile());
      try {
        const stored = localStorage.getItem("remotasks_user_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
        }
      } catch {}
    };
    window.addEventListener("gigmatcher_profile_updated", handleUpdate);
    return () => window.removeEventListener("gigmatcher_profile_updated", handleUpdate);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}
    try {
      localStorage.removeItem("remotasks_user_session");
    } catch {}
    if (isSupabaseConfigured()) {
      await signOutFromSupabase();
    }
    setCurrentUser(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("gigmatcher_profile_updated"));
  };

  const openSignIn = () => {
    setAuthModalMode("signin");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openSignUp = () => {
    setAuthModalMode("signup");
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Find Gigs", href: "/dashboard", icon: Compass },
    { label: "Hire Talent", href: "/hire-talent", icon: Users },
    { label: "Community", href: "/community", icon: MessageSquare },
    { label: "Pricing", href: "/pricing", icon: Tag },
    { label: "Categories", href: "/#categories", icon: Layers },
    { label: "How It Works", href: "/#how-it-works", icon: Sparkles },
    { label: "Tracker", href: "/applications", icon: Briefcase },
  ];

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email?.split("@")[0] ||
    profile?.fullName ||
    "Account";

  const displayEmail = currentUser?.email || profile?.email || "";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm group-hover:bg-neutral-900 transition-colors">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-lg text-black tracking-tight">Remotasks</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded-full">
                      .SI
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 -mt-1 hidden sm:inline">
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
                          ? "bg-black text-white font-semibold"
                          : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                /* Authenticated User Menu */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors text-xs text-neutral-900"
                  >
                    <div className="h-6 w-6 rounded-full bg-black text-white font-bold flex items-center justify-center text-[11px]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-neutral-200 shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                      <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                        <p className="text-xs font-bold text-black truncate">{displayName}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{displayEmail}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-black" />
                        Matching Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-black" />
                        My Profile & Skills
                      </Link>

                      <Link
                        href="/applications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-black" />
                        Tracked Applications
                      </Link>

                      <Link
                        href="/hire-talent/requests"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <Users className="w-4 h-4 text-black" />
                        Hire Talent Requests
                      </Link>

                      <Link
                        href="/hire-talent/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-black" />
                        Talent Profile & Rates
                      </Link>

                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-black hover:bg-neutral-100 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated Controls */
                <button
                  onClick={openSignIn}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                >
                  Sign In
                </button>
              )}

              <Link href="/onboarding">
                <Button size="sm" className="font-semibold shadow-xs bg-black hover:bg-neutral-900 text-white">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Get Matched
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger & Actions */}
            <div className="flex md:hidden items-center gap-2">
              <Link href="/onboarding">
                <Button size="sm" className="text-xs px-2.5 py-1 bg-black text-white hover:bg-neutral-900">
                  Get Matched
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-neutral-600 hover:text-black hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
            {currentUser && (
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black">{displayName}</p>
                    <p className="text-[10px] text-neutral-400 truncate max-w-[160px]">{displayEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-neutral-700 hover:text-black font-semibold p-1 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? "bg-black text-white font-semibold"
                        : "text-black hover:bg-neutral-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-neutral-500" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-black hover:bg-neutral-100"
              >
                <User className="w-4 h-4 text-neutral-500" />
                Profile & Resume
              </Link>
            </div>

            {!currentUser && (
              <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={openSignIn}
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={openSignUp}
                  className="w-full justify-center bg-black hover:bg-neutral-900 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Free Account
                </Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Modern High-Conversion Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </>
  );
};
