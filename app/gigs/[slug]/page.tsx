"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Clock,
  Globe2,
  DollarSign,
  Briefcase,
  Flag,
  Share2,
  Sparkles,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PaymentVerificationBadge,
  EligibilityBadge,
  Badge,
} from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { GigListing, GigMatchScore } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import {
  getStoredGigs,
  getStoredProfile,
  toggleSaveGig,
  isGigSaved,
} from "@/lib/storage";
import { calculateGigMatch } from "@/lib/matching";
import { evaluateCountryEligibility } from "@/lib/eligibility";

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [gig, setGig] = useState<GigListing | null>(null);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [matchScore, setMatchScore] = useState<GigMatchScore | null>(null);
  const [saved, setSaved] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("Rate changed");
  const [reportNotes, setReportNotes] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const allGigs = getStoredGigs();
    const found = allGigs.find((g) => g.slug === slug);
    if (found) {
      setGig(found);
      const user = getStoredProfile();
      setProfile(user);
      const score = calculateGigMatch(user, found);
      setMatchScore(score);
      setSaved(isGigSaved(found.id));
    }
  }, [slug]);

  if (!gig || !matchScore) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-canvas-bg">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-border shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h2 className="text-lg font-bold text-ink">Gig Listing Not Found</h2>
          <p className="text-xs text-ink-muted">
            The role requested might have been updated or removed from the catalog.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Return to Matching Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleSave = () => {
    const isNowSaved = toggleSaveGig(gig);
    setSaved(isNowSaved);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportModalOpen(false);
      setReportNotes("");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back navigation & Share / Save toolbar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1 transition-colors"
              title="Copy link to this opportunity"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <Button
              variant={saved ? "secondary" : "subtle"}
              size="sm"
              onClick={handleToggleSave}
              className="text-xs font-semibold"
            >
              <Bookmark className={`w-3.5 h-3.5 mr-1 ${saved ? "fill-brand-600 text-brand-600" : ""}`} />
              {saved ? "Saved in Tracker" : "Save Listing"}
            </Button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-lg border border-border bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Report outdated information"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECTION 1: ROLE OVERVIEW & PLATFORM HEADER */}
        <div className="rounded-[16px] bg-white border border-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                {gig.platformName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
                    {gig.category}
                  </span>
                  {gig.remote && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      100% Remote
                    </span>
                  )}
                  {gig.experienceLevel && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                      {gig.experienceLevel} Level
                    </span>
                  )}
                  {gig.sponsored && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Sponsored
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {gig.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Platform: <span className="text-ink">{gig.platformName}</span>
                </p>
              </div>
            </div>

            {/* Official CTA Box */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <a
                href={gig.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" className="w-full sm:w-auto font-bold shadow-md">
                  Apply on Official Site <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified direct destination
              </span>
            </div>
          </div>

          {/* Highlights */}
          {gig.overviewHighlights && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {gig.overviewHighlights.map((hl, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{hl}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Role Description & Mission
            </h2>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {gig.description}
            </p>
          </div>
        </div>

        {/* SECTION 2 & 3: WHY THIS ROLE MATCHES & SKILL BREAKDOWN */}
        <div className="rounded-[16px] bg-white border border-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-ink">
                  Why This Matches {profile.fullName}
                </h2>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Transparent match evaluation against your active skills, experience tier, and country.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-black text-brand-600 tracking-tight">
                  {matchScore.matchScore}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Overall Match Score</span>
              </div>
            </div>
          </div>

          {/* Score breakdown pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Skill Fit</span>
              <span className="text-base font-bold text-ink">
                {matchScore.scoreBreakdown.skillScore} / 55
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-full"
                  style={{ width: `${(matchScore.scoreBreakdown.skillScore / 55) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Experience</span>
              <span className="text-base font-bold text-ink">
                {matchScore.scoreBreakdown.experienceScore} / 15
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${(matchScore.scoreBreakdown.experienceScore / 15) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Category Interest</span>
              <span className="text-base font-bold text-ink">
                {matchScore.scoreBreakdown.categoryScore} / 15
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-full"
                  style={{ width: `${(matchScore.scoreBreakdown.categoryScore / 15) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Geo Fit</span>
              <span className="text-base font-bold text-ink">
                {matchScore.scoreBreakdown.countryFitScore} / 15
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${(matchScore.scoreBreakdown.countryFitScore / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Matched */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Skills ({matchScore.matchedSkills.length})
                </span>
                <span className="text-[11px] text-emerald-700">Present in your profile</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchScore.matchedSkills.length > 0 ? (
                  matchScore.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs rounded-md bg-emerald-100 text-emerald-800 font-semibold"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No overlapping skills detected yet.</span>
                )}
              </div>
            </div>

            {/* Missing */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing Requirements ({matchScore.missingSkills.length})
                </span>
                <span className="text-[11px] text-slate-500">Not in your active profile</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchScore.missingSkills.length > 0 ? (
                  matchScore.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-300 text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-700 font-medium">
                    100% of required skills matched!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 & 5: COUNTRY ELIGIBILITY & PAYMENT TERMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Eligibility Card (Phase 3 Maintained Evidence Engine) */}
          {(() => {
            const eligibility = evaluateCountryEligibility(gig.id, profile.countryCode || "IN");
            return (
              <div className="rounded-[16px] bg-white border border-border p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-ink">Country Eligibility</h3>
                  </div>
                  <EligibilityBadge
                    isEligible={eligibility.isEligible}
                    status={eligibility.status === "confirmed" ? "verified" : eligibility.status === "needs_review" ? "partial" : "unverified"}
                    label={eligibility.label}
                  />
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-slate-500 block font-semibold uppercase text-[10px]">
                      Accepted Territories:
                    </span>
                    <p className="font-semibold text-ink mt-0.5">
                      {gig.eligibleCountries.join(", ")}
                    </p>
                  </div>

                  {eligibility.evidenceNotes && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">Maintained Evidence:</span>
                        {eligibility.sourceUrl && (
                          <a
                            href={eligibility.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline flex items-center gap-1 font-medium text-[11px]"
                          >
                            Source Proof <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p>{eligibility.evidenceNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>
                      Reviewed:{" "}
                      {eligibility.reviewedAt
                        ? new Date(eligibility.reviewedAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                    <span>
                      Next Review Due:{" "}
                      {eligibility.nextReviewAt
                        ? new Date(eligibility.nextReviewAt).toLocaleDateString()
                        : "30 days"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Payment Terms & Evidence */}
          <div className="rounded-[16px] bg-white border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-ink">Payment Evidence & Terms</h3>
              </div>
              <PaymentVerificationBadge status={gig.paymentVerification} />
            </div>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-slate-500 block font-semibold uppercase text-[10px]">
                  Published Rate:
                </span>
                <p className="text-xl font-extrabold text-ink mt-0.5">
                  {gig.payment
                    ? `$${gig.payment.amount} ${gig.payment.currency} / ${gig.payment.unit}`
                    : "Variable Rate"}
                </p>
              </div>

              {gig.payment?.paymentMethod && (
                <div>
                  <span className="text-slate-500 block font-semibold uppercase text-[10px] mb-1">
                    Payout Rails:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {gig.payment.paymentMethod.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gig.payment?.termsNote && (
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  {gig.payment.termsNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6 & 7: ONBOARDING STEPS & EFFORT */}
        <div className="rounded-[16px] bg-white border border-border p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-ink">
                Qualification & Onboarding Roadmap
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Estimated qualification effort:{" "}
                <strong className="text-ink">{gig.estimatedEffort || "1 - 2 hours"}</strong>
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Status: {gig.availabilityStatus || "Open"}
            </span>
          </div>

          <ol className="space-y-3">
            {gig.onboardingSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs sm:text-sm text-slate-700"
              >
                <div className="h-6 w-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {idx + 1}
                </div>
                <div className="leading-relaxed font-medium">{step}</div>
              </li>
            ))}
          </ol>
        </div>

        {/* SECTION 8, 9 & 10: MANDATORY EARNINGS NOTICE, AFFILIATE DISCLOSURE & REPORT */}
        <div className="space-y-4">
          {/* Earnings notice callout (Mandatory per spec) */}
          <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Earning & Queue Disclosure</h4>
              <p className="mt-0.5 leading-relaxed">
                A published rate must not be presented as guaranteed earnings. A platform accepting registrations does not prove that projects are currently available. Workloads, task volumes, and project allocations depend on client budgets and platform test benchmarks.
              </p>
            </div>
          </div>

          {/* Affiliate Disclosure Placeholder */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>
                {gig.affiliateDisclosure ||
                  "Direct informational link. GigMatcher receives no bounty or affiliate payment for this direct listing."}
              </span>
            </div>
            <button
              onClick={() => setReportModalOpen(true)}
              className="text-brand-600 hover:underline font-semibold shrink-0 ml-3"
            >
              Report outdated info
            </button>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-ink">Ready to begin qualification?</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Review platform requirements and complete the official application.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant={saved ? "secondary" : "subtle"}
              onClick={handleToggleSave}
              className="flex-1 sm:flex-none"
            >
              <Bookmark className={`w-4 h-4 mr-1.5 ${saved ? "fill-brand-600 text-brand-600" : ""}`} />
              {saved ? "Saved in Tracker" : "Save for Later"}
            </Button>
            <a
              href={gig.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button size="md" className="w-full font-bold">
                Apply on Official Platform <ExternalLink className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* REPORT OUTDATED INFO MODAL */}
      <Dialog
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        title="Report Outdated or Incorrect Information"
        description="Help the community maintain high listing accuracy."
      >
        {reportSubmitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-ink">Thank you for reporting!</h3>
            <p className="text-xs text-slate-500">
              Our review queue has received your note for {gig.platformName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Type of Issue
              </label>
              <select
                value={reportIssueType}
                onChange={(e) => setReportIssueType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
              >
                <option value="Rate changed">Rate changed or inaccurate</option>
                <option value="Country geo-blocked">Country is geo-blocked / not accepting</option>
                <option value="Queue closed">Project queue is paused / no tasks</option>
                <option value="Broken URL">Broken or relocated registration link</option>
                <option value="Other">Other inconsistency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Details & Evidence (optional)
              </label>
              <textarea
                rows={3}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="e.g. Rate dropped to $20/hr, or registration halted for Indian IP addresses..."
                className="w-full p-2.5 rounded-lg border border-border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
