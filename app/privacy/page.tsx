import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Lock, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection | Remotasks.si",
  description:
    "Learn how Remotasks.si protects your privacy, safely processes resume uploads, enforces local-first data isolation, and guarantees instant data deletion.",
  alternates: {
    canonical: "https://remotasks.si/privacy",
  },
};

export default function PrivacyPolicyPage() {
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
              Legal & Trust
            </Badge>
            <Badge variant="outline" size="sm" className="bg-neutral-100 text-black border-neutral-300">
              GDPR & CCPA Compliant
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Privacy Policy & Data Safeguards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: May 1, 2025 · Last Updated: May 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">1. Our Privacy Commitment</h2>
            <p className="text-slate-600">
              GigMatcher (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;) is built on the principle of
              transparent, respectful technology. We collect only the minimal data necessary to provide personalized skill
              fit scores, verify country eligibility, and connect you with legitimate AI gig platforms.
            </p>
            <p className="text-slate-600 font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs sm:text-sm">
              We never sell your personal information, resume content, or contact details to third-party data brokers or marketing networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
              <li>
                <strong>Profile & Skill Data:</strong> Skills you select or extract, declared country of residence, languages, years of experience, and payout preferences.
              </li>
              <li>
                <strong>Resume Files:</strong> If you choose to upload a PDF or DOCX resume, it is parsed strictly in-memory on secured servers to extract candidate skills, work history spans, and location metadata. Files are not stored in public buckets.
              </li>
              <li>
                <strong>Application Tracker Records:</strong> Saved opportunities, application statuses (Shortlisted, Applied, Onboarding), and private personal notes stored in your browser or authenticated account.
              </li>
              <li>
                <strong>Anonymized Usage Telemetry:</strong> Aggregated page views, search terms, and outbound click counts to monitor platform health and referral attribution. We do not track individual cross-site browsing.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">3. AI Resume Processing Architecture</h2>
            <p className="text-slate-600">
              When you upload a resume, our parser extracts factual skills and experience to compute deterministic match scores against opportunity requirements.
            </p>
            <p className="text-slate-600">
              You retain 100% control over the extracted profile. You can review, correct, or discard extracted skills before they are saved to your profile.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">4. Your Right to Delete (Zero-Retention Guarantee)</h2>
            <p className="text-slate-600">
              You have the right under GDPR, CCPA, and our platform charter to permanently delete your data at any time:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink uppercase">
                  <Trash2 className="w-4 h-4 text-black" /> Resume Deletion
                </div>
                <p className="text-xs text-slate-600">
                  Click &ldquo;Remove Attached Resume&rdquo; on your Profile page to purge the cached resume file, extracted summary, and document references.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink uppercase">
                  <Lock className="w-4 h-4 text-brand-600" /> Complete Account Wipe
                </div>
                <p className="text-xs text-slate-600">
                  Use the &ldquo;Wipe Profile & Local Data&rdquo; button in your Profile settings to clear all local storage keys, application entries, and server profile records.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">5. Outbound Links & Third-Party Platforms</h2>
            <p className="text-slate-600">
              GigMatcher contains links to external gig providers (e.g. Outlier AI, DataAnnotation, Alignerr, Mindrift, Testlio). When you click &ldquo;Apply on Official Platform&rdquo;, you leave GigMatcher and are subject to the respective platform&rsquo;s terms and privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink">6. Contact Our Data Protection Officer</h2>
            <p className="text-slate-600">
              For inquiries regarding data protection, CCPA disclosures, or manual deletion requests, contact our privacy team at:
            </p>
            <p className="font-semibold text-brand-600 text-sm">
              privacy@remotasks.si
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
