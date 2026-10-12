"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  UserCheck,
  FileCheck,
  Award,
} from "lucide-react";
import { RegionFilter } from "@/components/pricing/RegionFilter";
import { PricingCards } from "@/components/pricing/PricingCards";
import { CouponSimulator } from "@/components/pricing/CouponSimulator";
import { LaunchCouponsTable } from "@/components/pricing/LaunchCouponsTable";
import { CheckoutModal } from "@/components/pricing/CheckoutModal";
import {
  EXPERT_SERVICES,
  getServicesForRegion,
  getServiceForRegion,
  PricingRegionCode,
} from "@/lib/services-pricing";
import { ExpertService } from "@/types/services";

export default function PricingPage() {
  const [currentRegion, setCurrentRegion] = useState<PricingRegionCode>("US");
  const [selectedService, setSelectedService] = useState<ExpertService | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("LAUNCH15");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Restore saved region preference on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("remotasks_pricing_region") as PricingRegionCode | null;
      if (saved && ["US", "EU", "GB", "CA", "AU", "IN"].includes(saved)) {
        setCurrentRegion(saved);
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, []);

  const handleSelectRegion = (region: PricingRegionCode) => {
    setCurrentRegion(region);
    try {
      localStorage.setItem("remotasks_pricing_region", region);
    } catch {
      // Ignore
    }
    // If a service is currently selected, refresh its pricing for the selected region
    if (selectedService) {
      const refreshed = getServiceForRegion(selectedService.id, region);
      if (refreshed) {
        setSelectedService(refreshed);
      }
    }
  };

  const handleSelectService = (service: ExpertService) => {
    setSelectedService(service);
    setIsCheckoutOpen(true);
  };

  const handleApplyToCheckout = (service: ExpertService, couponCode: string) => {
    setSelectedService(service);
    setAppliedCouponCode(couponCode);
    setIsCheckoutOpen(true);
  };

  const handleSelectCouponFromTable = (code: string) => {
    setAppliedCouponCode(code);
    const services = getServicesForRegion(currentRegion);
    setSelectedService(services[0]);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-neutral-900 selection:text-white">
      {/* Hero Section */}
        <section className="relative border-b border-neutral-100 bg-neutral-50/50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Affordable Expert Support for High-Value AI Gigs</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight max-w-3xl mx-auto leading-tight">
              Real Industry Expert Review. <br className="hidden sm:inline" />
              Fair, Transparent Pricing.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Designed for students, early-career engineers, and domain specialists aiming to qualify
              for high-paying AI annotation, code evaluation, and reasoning benchmarks.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-600 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                100% Manual Human Review
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                ATS & Benchmark Alignment
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                No Recurring Subscriptions
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-16 md:py-20 border-b border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Choose Your Support Package
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2">
                Every package includes dedicated guidance tailored to platforms like Outlier AI,
                DataAnnotation Tech, Alignerr, and Mindrift.
              </p>
            </div>

            {/* Region & Currency Filter */}
            <RegionFilter
              currentRegion={currentRegion}
              onSelectRegion={handleSelectRegion}
            />

            <PricingCards
              currentRegion={currentRegion}
              onSelectService={handleSelectService}
            />
          </div>
        </section>

        {/* Interactive Coupon Simulator Section */}
        <section className="py-16 md:py-20 bg-neutral-50/40 border-b border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-extrabold text-black tracking-tight">
                Coupon & Discount Simulator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1.5">
                Calculate discounts on your desired package before checkout. All promotions are
                validated authoritatively on the server.
              </p>
            </div>

            <CouponSimulator
              currentRegion={currentRegion}
              initialCode={appliedCouponCode}
              onApplyToCheckout={handleApplyToCheckout}
            />
          </div>
        </section>

        {/* Suggested Launch Coupons Section */}
        <section className="py-16 md:py-20 border-b border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-extrabold text-black tracking-tight">
                Active Promotional Campaigns
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1.5">
                Use these launch coupon codes at checkout or load them directly into the discount preview.
              </p>
            </div>

            <LaunchCouponsTable
              currentRegion={currentRegion}
              onSelectCoupon={handleSelectCouponFromTable}
            />
          </div>
        </section>

        {/* Why Human Review Matters Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
                Why Human Expert Guidance Matters
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2">
                Automated ATS scanners filter out over 70% of capable candidates. Our manual review
                guarantees that your real skills and experience stand out clearly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black mb-2">Real AI Practitioners</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your resume and application are reviewed by working contributors who have passed
                  rigorous Tier-3 screenings and coding assessments on top global gig platforms.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black mb-2">Platform-Specific Optimization</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Every platform has distinct evaluation rubrics. We highlight the exact keywords,
                  programming benchmarks, and language proficiencies their hiring systems look for.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black mb-2">Actionable Career Roadmap</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Get personalized project ideas, targeted learning resources, and interview tips
                  that bridge the gap between your current resume and senior $35+/hr roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20 border-t border-neutral-100 bg-neutral-50/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-black tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Common questions regarding our manual review packages and coupon redemption.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-neutral-200 bg-white">
                <h3 className="text-sm font-bold text-black">
                  How does the resume review process work?
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  After placing your order, an expert reviewer receives your resume and target role.
                  Within 24–48 hours, you will receive an in-depth annotated document covering structural
                  edits, ATS keyword recommendations, and a one-on-one follow-up review for your revisions.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-neutral-200 bg-white">
                <h3 className="text-sm font-bold text-black">
                  How do I apply launch and student coupons?
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  Enter any active promotional code (such as <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">LAUNCH15</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">STUDENT10</code> or <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">STUDENT200</code>) in the checkout modal.
                  Our server verifies coupon validity and recalculates the final payable amount instantly in your selected currency.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-neutral-200 bg-white">
                <h3 className="text-sm font-bold text-black">
                  Do you guarantee acceptance or earnings?
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  No. We provide genuine expert coaching, formatting, and platform alignment to maximize
                  your qualification chances. However, platform admission and task availability remain
                  solely at the discretion of the partner platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        service={selectedService}
        initialCouponCode={appliedCouponCode}
        currentRegion={currentRegion}
      />
    </div>
  );
}
