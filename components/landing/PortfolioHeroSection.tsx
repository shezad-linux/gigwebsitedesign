"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GitPullRequest,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const PortfolioHeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-200 pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background ambient radial gradients - Obsidian styling */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-neutral-50/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Android Applications · Open-Source Collaboration · App Acquisition Portal</span>
        </div>

        {/* Mandatory Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.08]">
          Discover. Contribute. <br className="hidden sm:inline" />
          <span className="text-neutral-900">Build Something Better.</span>
        </h1>

        {/* Mandatory Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Explore our growing collection of Android applications and games. Help us improve existing products, propose new ideas, collaborate on open-source projects, and become part of our development journey.
        </p>

        {/* Mandatory Primary Buttons:
            - Explore Apps
            - Start Contributing
            - Explore Acquisition Opportunities */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          <Link
            href="/apps"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:translate-y-[0.5px] transition-all"
          >
            <Smartphone className="w-4 h-4" />
            Explore Apps
          </Link>

          <Link
            href="/contribute"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 active:translate-y-[0.5px] transition-all"
          >
            <GitPullRequest className="w-4 h-4 text-neutral-700" />
            Start Contributing
          </Link>

          <Link
            href="/acquisition"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-6 py-3.5 text-sm font-semibold text-neutral-800 shadow-sm hover:bg-neutral-100 hover:border-neutral-400 active:translate-y-[0.5px] transition-all"
          >
            <DollarSign className="w-4 h-4 text-neutral-700" />
            Explore Acquisition Opportunities
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>14 Catalogued Android Apps &amp; Games</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <Code2 className="w-4 h-4 text-black" />
            <span>Open Source Peer Review</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>Verified Google Play Console Listings</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-neutral-700">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Verifiable Certificates of Contribution</span>
          </div>
        </div>
      </div>
    </section>
  );
};

