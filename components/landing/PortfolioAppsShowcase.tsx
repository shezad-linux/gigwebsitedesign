"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Smartphone, Code2, DollarSign } from "lucide-react";
import { PortfolioApp } from "@/types/portfolio";
import { AppCard } from "@/components/portfolio/AppCard";

interface PortfolioAppsShowcaseProps {
  apps: PortfolioApp[];
}

export const PortfolioAppsShowcase: React.FC<PortfolioAppsShowcaseProps> = ({ apps }) => {
  // Show 6 featured apps representing varied categories
  const featured = apps.slice(0, 6);

  return (
    <section className="py-16 md:py-20 bg-neutral-50/60 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 border border-neutral-200 mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Application Portfolio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Featured Apps &amp; Games
            </h2>
            <p className="mt-1 text-sm text-neutral-600 max-w-xl">
              Engineered with privacy-first on-device compute, native C++ NDK graphics, and modern Jetpack Compose.
            </p>
          </div>

          <Link
            href="/apps"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors self-start md:self-auto shadow-sm"
          >
            View All 14 Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Bottom Banner to Contribute or Acquire */}
        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-neutral-900">
              Have an idea to make these applications better?
            </h3>
            <p className="text-xs text-neutral-500">
              Propose new features, report bugs, improve UI/UX, or apply for contribution certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              Start Contributing
            </Link>
            <Link
              href="/acquisition"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Acquisition Inquiries
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

