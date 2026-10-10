import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Use & Commercial Disclosures | GigMatcher",
  description:
    "Review GigMatcher Terms of Service, independent directory disclaimers, affiliate referral disclosures, and earning notice policies.",
  alternates: {
    canonical: "https://gigmatcher.io/terms",
  },
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-canvas-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Legal & Terms
            </Badge>
            <Badge variant="outline" size="sm" className="bg-neutral-100 text-black border-neutral-300">
              Commercial & FTC Disclosures
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Terms of Use & Disclosures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: May 1, 2025 · Last Updated: May 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">1. Platform Nature & Independence</h2>
            <p className="text-slate-600">
              GigMatcher is an independent informational discovery platform and matching directory. GigMatcher is not an employer, staffing agency, labor broker, or legal representative of any listing provider (including Outlier AI, DataAnnotation Tech, Alignerr, Mindrift, or Testlio).
            </p>
            <p className="text-slate-600">
              All contract relationships, screening trials, work evaluations, project assignments, and payment disbursements occur exclusively between you and the respective third-party platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">2. Earning & Project Availability Notice</h2>
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-xs sm:text-sm text-black space-y-1.5">
              <div className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-black" /> Earning Disclaimer
              </div>
              <p className="leading-relaxed">
                Published rates (e.g. &ldquo;$40 / hour&rdquo;) reflect community-reported or platform-advertised maximum compensation tiers for qualifying tasks. Rates do not constitute a guarantee of income, minimum wage, or ongoing task volume.
              </p>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm">
              Freelance AI projects are inherently variable. A platform accepting registrations does not guarantee that task queues will be open in your specific country or language domain at any given moment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">3. Commercial Affiliate Disclosures (FTC 16 CFR Part 255)</h2>
            <p className="text-slate-600">
              In accordance with FTC guidelines on commercial endorsements and affiliate partnerships:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                Certain outbound links on GigMatcher contain approved affiliate referral tracking codes.
              </li>
              <li>
                If you register for an external platform through an affiliate link and complete a qualifying milestone, GigMatcher may receive a referral fee or commission.
              </li>
              <li>
                <strong>No Extra Cost:</strong> Using an affiliate link incurs zero cost to you; compensation rates and platform terms remain identical to direct organic application.
              </li>
              <li>
                <strong>Organic Scoring Integrity:</strong> Affiliate relationships never alter our deterministic skill-matching formulas or artificial skill scores.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">4. Sponsored Placement Policy</h2>
            <p className="text-slate-600">
              Platforms may occasionally pay for promotional exposure. We adhere strictly to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                Every paid promotional placement is prominently labelled with a <strong>&ldquo;Sponsored&rdquo;</strong> badge.
              </li>
              <li>
                Sponsored listings are kept completely separate from organic skill-match rankings. Paid placement never inflates organic skill-fit percentages.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">5. User Conduct & Acceptable Use</h2>
            <p className="text-slate-600">
              You agree not to submit fraudulent profile information, upload malicious files, attempt to reverse-engineer our matching algorithms, or use automated scrapers without written authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">6. Contact Information</h2>
            <p className="text-slate-600">
              For questions regarding these Terms or commercial disclosures, please contact:
            </p>
            <p className="font-semibold text-brand-600 text-sm">
              legal@gigmatcher.io
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
