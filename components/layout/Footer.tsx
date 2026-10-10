import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-white text-ink-muted mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-black">Remotasks</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Transparent, verified discovery platform for AI evaluation, coding benchmarks, and data annotation freelance gigs.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-black bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Phase 1 Prototype · Local-First Security</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">
              Gig Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard?category=AI+Coding" className="hover:text-black transition-colors">
                  AI Coding & Code Review
                </Link>
              </li>
              <li>
                <Link href="/dashboard?category=AI+Evaluation" className="hover:text-black transition-colors">
                  Reasoning & Factuality Rating
                </Link>
              </li>
              <li>
                <Link href="/dashboard?category=Data+Annotation" className="hover:text-black transition-colors">
                  Computer Vision & NER Tagging
                </Link>
              </li>
              <li>
                <Link href="/dashboard?category=Writing+%26+Content" className="hover:text-black transition-colors">
                  Technical & Creative Writing
                </Link>
              </li>
              <li>
                <Link href="/dashboard?category=Language+%26+Translation" className="hover:text-black transition-colors">
                  Bilingual & Localization
                </Link>
              </li>
              <li>
                <Link href="/dashboard?category=Software+%26+QA+Testing" className="hover:text-black transition-colors">
                  Exploratory QA & App Testing
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links & Prototype navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">
              Prototype Journey
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/onboarding" className="hover:text-black transition-colors">
                  Candidate Onboarding Flow
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-black transition-colors">
                  Best-Fit Matching Dashboard
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-black transition-colors">
                  Application & Status Tracker
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-black transition-colors font-medium text-black">
                  Services & Pricing (Coupons)
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-black transition-colors">
                  Profile & Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency statement */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
              Trust & Verification Policy
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every listing displays payment verification status, country eligibility, and last-reviewed timestamps to protect freelancers from phantom queues.
            </p>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-800 leading-normal">
              <strong>Earning Notice:</strong> Published rates reflect community-reported or platform-advertised maximums, not guaranteed wages. Project availability varies by client cycle.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Remotasks.si. Verified AI Freelance Matcher. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">
              Terms & Disclosures
            </Link>
            <Link href="/guides" className="hover:text-slate-600 transition-colors">
              Qualification Guides
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
