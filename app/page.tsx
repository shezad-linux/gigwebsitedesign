import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Compass, Smartphone } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedPlatforms } from "@/components/landing/FeaturedPlatforms";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StudioShowcaseSections } from "@/components/landing/StudioShowcaseSections";
import { TrustSection } from "@/components/landing/TrustSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { getPortfolioApps } from "@/lib/portfolio/storage";

export default function LandingPage() {
  const apps = getPortfolioApps();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Primary Gig Marketplace Experience (Hero, Instant Match, Skill Discovery) */}
      <HeroSection />

      {/* 2. Featured Gig Platforms (Remotasks, Outlier, Alignerr, DataAnnotation, etc.) */}
      <FeaturedPlatforms />

      {/* 3. Categories Bento Grid (AI Coding, RLHF, Annotation, Localization) */}
      <CategoriesSection />

      {/* 4. How It Works Dynamic Walkthrough */}
      <HowItWorksSection />

      {/* 5. Apps & Product Studio: Explore Our Apps & Games + Build With Us */}
      <StudioShowcaseSections featuredApps={apps} />

      {/* 6. Trust & Verification Metrics */}
      <TrustSection />

      {/* 7. Frequently Asked Questions */}
      <FaqSection />

      {/* 8. Bottom Action Callout Banner */}
      <section className="py-16 md:py-20 bg-black text-white relative overflow-hidden border-t border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to find paying gigs or build something better?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Find AI Gigs or Collaborate With Our Studio.
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
            Take 2 minutes to customize your profile and match with 15+ verified paying platforms, or explore our Android applications to propose new features and collaborate on open-source codebases.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-white text-black hover:bg-neutral-200 font-bold shadow-lg text-sm px-8 h-12 transition-all"
            >
              Find My Gig Matches <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/apps"
              className="inline-flex items-center justify-center rounded-xl text-white border border-neutral-700 hover:bg-neutral-900 text-sm font-semibold h-12 px-6 transition-all"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Explore Apps &amp; Studio
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-900 text-xs px-4 h-12 transition-all"
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              Browse All Gigs
            </Link>
          </div>

          <p className="text-xs text-neutral-500 pt-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verified Opportunities · Zero Middlemen · Free Open-Source Collaboration
          </p>
        </div>
      </section>
    </div>
  );
}
