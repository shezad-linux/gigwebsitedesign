import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioHeroSection } from "@/components/landing/PortfolioHeroSection";
import { PortfolioAppsShowcase } from "@/components/landing/PortfolioAppsShowcase";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturedPlatforms } from "@/components/landing/FeaturedPlatforms";
import { TrustSection } from "@/components/landing/TrustSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { getPortfolioApps } from "@/lib/portfolio/storage";

export default function LandingPage() {
  const apps = getPortfolioApps();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Main Landing Section: Discover. Contribute. Build Something Better. */}
      <PortfolioHeroSection />

      {/* 2. Featured Apps & Games Portfolio Directory Showcase */}
      <PortfolioAppsShowcase apps={apps} />

      {/* 3. Existing Platform Sections (Preserved) */}
      {/* Featured Gig Platforms */}
      <FeaturedPlatforms />

      {/* Categories Bento Grid */}
      <CategoriesSection />

      {/* How it Works Workflow */}
      <HowItWorksSection />

      {/* Trust & Verification Section */}
      <TrustSection />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Bottom CTA Banner */}
      <section className="py-16 md:py-20 bg-black text-white relative overflow-hidden border-t border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to explore our Android applications or collaborate?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Build, Contribute, or Acquire Today.
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
            Test published applications, collaborate on open-source codebases, or submit an acquisition enquiry directly to the development team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/apps"
              className="inline-flex items-center justify-center rounded-xl bg-white text-black hover:bg-neutral-200 font-bold shadow-lg text-sm px-8 h-12 transition-all"
            >
              Browse 14 Applications <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center rounded-xl text-white border border-neutral-700 hover:bg-neutral-900 text-sm font-semibold h-12 px-6 transition-all"
            >
              Start Contributing
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-900 text-xs px-4 h-12 transition-all"
            >
              AI Gig Marketplace
            </Link>
          </div>

          <p className="text-xs text-neutral-500 pt-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verified Google Play Applications · Open-Source Collaboration · Verifiable Certificates
          </p>
        </div>
      </section>
    </div>
  );
}
