import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, ExternalLink, Code2 } from "lucide-react";
import { AppsDirectory } from "@/components/portfolio/AppsDirectory";
import { getPortfolioApps } from "@/lib/portfolio/storage";

export const metadata: Metadata = {
  title: "Android Apps & Games Directory | Remotasks Portfolio",
  description:
    "Explore our complete catalogue of 14 published Android applications and games across AI, productivity, imaging, wellness, and mobile utilities.",
};

export default function AppsPage() {
  const apps = getPortfolioApps();

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Portfolio Catalogue (14 Applications)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Apps &amp; Games Directory
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Browse, test, and contribute to our published Android applications and games. Filter by category, test active Play Store builds, review open-source repositories, or submit an acquisition enquiry.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/contribute"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Start Contributing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/acquisition"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                Acquisition Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Apps Directory with Search & Filtering */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AppsDirectory initialApps={apps} />
      </section>
    </div>
  );
}

