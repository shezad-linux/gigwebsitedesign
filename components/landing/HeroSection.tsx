"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Compass,
  Star,
  ExternalLink,
  DollarSign,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Interactive3DOrb } from "@/components/ui/Interactive3DOrb";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 md:pt-14 md:pb-24">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline and Call-to-Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Verified AI Opportunities</span>
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
              <span className="text-neutral-700 font-medium">Real-Time Match Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-black leading-[1.12]">
              Find the Right <span className="underline decoration-black decoration-4 underline-offset-4">AI Gigs</span> for Your Skills.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
              Stop guessing which platforms accept your country or actually pay out. Match your engineering and evaluation skills with verified AI coding, RLHF, and annotation contracts worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto font-semibold shadow-md bg-black hover:bg-neutral-900 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find My Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto border-neutral-300 hover:bg-neutral-100 text-black">
                  <Compass className="w-4 h-4 mr-2 text-neutral-700" />
                  Explore All Opportunities
                </Button>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-4 grid grid-cols-3 gap-3 sm:gap-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-100 text-black shrink-0 border border-neutral-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-black">Payment Verified</p>
                  <p className="text-neutral-500 hidden sm:block">Proven contractor rates</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-100 text-black shrink-0 border border-neutral-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-black">Geo Eligibility</p>
                  <p className="text-neutral-500 hidden sm:block">Filtered by country</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-100 text-black shrink-0 border border-neutral-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-black">Direct Links</p>
                  <p className="text-neutral-500 hidden sm:block">Zero middlemen</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Model & Live Telemetry */}
          <div className="lg:col-span-6 space-y-4">
            {/* Interactive 3D Neural Core Canvas */}
            <Interactive3DOrb />

            {/* Live Featured Opportunity Telemetry Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    OA
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-black">Outlier AI</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black text-white border border-black">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">AI Coding Evaluation & Code Review</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-black">$40 / hr</div>
                  <span className="text-[10px] text-neutral-500 font-medium">Weekly PayPal Payout</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-medium text-[11px] border border-neutral-200">
                    Python
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-medium text-[11px] border border-neutral-200">
                    Java
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-medium text-[11px] border border-neutral-200">
                    Code Review
                  </span>
                  <span className="text-neutral-700 font-semibold flex items-center gap-1 text-[11px] ml-1">
                    <Globe className="w-3 h-3" /> Global & India
                  </span>
                </div>

                <Link
                  href="/gigs/ai-coding-evaluation-outlier"
                  className="font-semibold text-black hover:underline flex items-center gap-1 text-xs"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
