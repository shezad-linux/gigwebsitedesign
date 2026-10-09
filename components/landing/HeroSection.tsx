"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Compass,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Call-to-Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Personalized AI Gig Discovery Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              <span className="text-brand-600 font-medium">Phase 1 Live Prototype</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.12]">
              Find the Right <span className="text-brand-600">AI Gigs</span> for Your Skills.
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl">
              Stop guessing which platforms accept your country or actually pay out. Upload your resume or enter your skills to instantly get matched with verified AI coding, evaluation, and annotation opportunities.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto font-semibold shadow-md">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find My Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Compass className="w-4 h-4 mr-2 text-ink-muted" />
                  Explore Opportunities
                </Button>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-ink">Payment Proof</p>
                  <p className="text-ink-muted hidden sm:block">Community verified</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-brand-50 text-brand-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-ink">Geo Eligibility</p>
                  <p className="text-ink-muted hidden sm:block">Filter by your country</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-ink">Zero Spam</p>
                  <p className="text-ink-muted hidden sm:block">Direct official links</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview of a Matching Score and Gig Cards */}
          <div className="lg:col-span-5 relative">
            {/* Background decorative card */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-brand-100/60 rounded-2xl transform rotate-1 border border-brand-200/50 -z-10" />

            {/* Illustrative preview card matching the prompt's exact mock layout */}
            <div className="rounded-[16px] bg-white border border-border p-6 shadow-xl relative space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                    OA
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink">Outlier AI · Freelance</h3>
                    <p className="text-[11px] text-ink-muted">Reviewed 2 days ago</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-brand-600 text-brand-600" />
                  Top Match
                </span>
              </div>

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-ink hover:text-brand-600 transition-colors">
                      AI Coding Evaluation
                    </h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Example platform · Freelance · Remote
                    </p>
                  </div>
                  {/* Matching score badge */}
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-extrabold text-brand-600 tracking-tight">
                      92%
                    </div>
                    <span className="text-[10px] text-ink-muted font-medium">
                      Example skill match
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills badges */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-ink-muted">Matched Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Java
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Python
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Code review
                  </span>
                </div>
              </div>

              {/* Eligibility & Payment badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Eligibility
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> India eligible
                  </span>
                  <span className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> Needs current verification
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Payment information
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> $40 / hour
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                    Weekly payouts via PayPal
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-ink-muted">
                <span className="text-[11px] italic text-slate-400">
                  All listing details & scores here are illustrative mock data.
                </span>
                <Link
                  href="/gigs/ai-coding-evaluation-outlier"
                  className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Inspect Role <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Secondary floating pill */}
            <div className="mt-4 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-slate-600">Simulate resume extract or manual entry</span>
              </div>
              <Link href="/onboarding" className="text-brand-600 font-semibold hover:underline">
                Start Demo Flow →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
