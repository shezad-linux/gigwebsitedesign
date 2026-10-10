import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/landing/HeroSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturedPlatforms } from "@/components/landing/FeaturedPlatforms";
import { TrustSection } from "@/components/landing/TrustSection";
import { FaqSection } from "@/components/landing/FaqSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Platforms Overview */}
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
            <span>Ready to uncover your best-fit AI opportunities?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Stop Searching Stale Job Boards.
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
            Take 2 minutes to create your profile or test a mock resume upload. Match with 15+ verified, paying platforms with zero spam.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              href="/onboarding"
              size="lg"
              className="bg-white text-black hover:bg-neutral-200 border-none font-bold shadow-lg text-base px-8 h-12"
            >
              Find My Matches Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              href="/dashboard"
              variant="outline"
              size="lg"
              className="text-white border-neutral-700 hover:bg-neutral-900 text-base h-12"
            >
              Browse All 15 Gigs
            </Button>
          </div>

          <p className="text-xs text-neutral-500 pt-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            100% Client-Side Prototype · No Login Required · Instant Match Results
          </p>
        </div>
      </section>
    </div>
  );
}
