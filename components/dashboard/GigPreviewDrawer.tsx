"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Calendar,
  Layers,
  Calculator,
} from "lucide-react";
import { GigListing, GigMatchScore } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import { PaymentVerificationBadge, EligibilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { evaluateCountryEligibility } from "@/lib/eligibility";
import { matchesSkill } from "@/lib/matching";

interface GigPreviewDrawerProps {
  gig: GigListing | null;
  matchScore: GigMatchScore | null;
  userProfile?: UserProfile;
  isSaved: boolean;
  onToggleSave: (gig: GigListing) => void;
  onClose: () => void;
}

export const GigPreviewDrawer: React.FC<GigPreviewDrawerProps> = ({
  gig,
  matchScore,
  userProfile,
  isSaved,
  onToggleSave,
  onClose,
}) => {
  if (!gig || !matchScore) return null;

  // Sourced country eligibility engine
  const eligibility = evaluateCountryEligibility(
    gig.id,
    userProfile?.countryCode || "IN"
  );

  // Deterministic skills fit calculation breakdown
  const userSkills = userProfile?.skills || [];
  const requiredSkills = gig.skillsRequired || [];
  const skillsBreakdown = requiredSkills.map((reqSkill, idx) => {
    const weight = idx < 2 ? 2.0 : 1.0;
    const isMatched = userSkills.some((u) => matchesSkill(u, reqSkill));
    return {
      skill: reqSkill,
      weight,
      isCore: idx < 2,
      isMatched,
    };
  });

  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-5 sm:p-6 shadow-card sticky top-24 space-y-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Quick Detail View
          </span>
          <h3 className="text-lg font-bold text-black mt-0.5">{gig.title}</h3>
          <p className="text-xs text-neutral-600 font-medium">
            {gig.platformName} · {gig.category}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Match Score Banner */}
      <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-black block">Personal Match Fit</span>
          <span className="text-[11px] text-neutral-600">
            Deterministic Skill Fit ({matchScore.countryNote})
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-black font-mono">{matchScore.matchScore}%</span>
        </div>
      </div>

      {/* Phase 3 Deterministic Scoring Breakdown */}
      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-black flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-black" />
            Deterministic Skill Fit Breakdown
          </span>
          <span className="text-[10px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
            ∑(wᵢ·mᵢ) / ∑wᵢ
          </span>
        </div>

        <div className="space-y-1.5">
          {skillsBreakdown.map((item) => (
            <div
              key={item.skill}
              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                item.isMatched
                  ? "bg-black text-white border-black"
                  : "bg-white border-neutral-200 text-neutral-600"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.isMatched ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <span className="font-medium">{item.skill}</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${item.isMatched ? "text-neutral-300" : "text-neutral-500"}`}>
                weight: {item.weight.toFixed(1)} {item.isCore ? "(Core)" : "(Std)"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sourced Country Eligibility Evidence */}
      <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-black flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            Country Screening Evidence
          </span>
          <EligibilityBadge
            isEligible={eligibility.isEligible}
            status={eligibility.isStale ? "partial" : gig.eligibilityVerification}
            label={eligibility.label}
          />
        </div>

        {eligibility.evidenceNotes && (
          <p className="text-[11px] text-neutral-700 leading-relaxed bg-white p-2.5 rounded-lg border border-neutral-200">
            {eligibility.evidenceNotes}
          </p>
        )}

        <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400">
          <span>
            Reviewed:{" "}
            {eligibility.reviewedAt
              ? new Date(eligibility.reviewedAt).toLocaleDateString()
              : "Active Record"}
          </span>
          {eligibility.sourceUrl && (
            <a
              href={eligibility.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline flex items-center gap-1 font-semibold"
            >
              Source Proof <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Highlights */}
      {gig.overviewHighlights && gig.overviewHighlights.length > 0 && (
        <div className="space-y-1.5 text-xs text-neutral-700">
          <span className="font-semibold text-black uppercase tracking-wider text-[10px] block">
            Role Highlights
          </span>
          {gig.overviewHighlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description Snippet */}
      <div>
        <span className="font-semibold text-black uppercase tracking-wider text-[10px] block mb-1">
          Role Summary
        </span>
        <p className="text-xs text-neutral-600 leading-relaxed">{gig.description}</p>
      </div>

      {/* Onboarding Steps preview */}
      <div>
        <span className="font-semibold text-black uppercase tracking-wider text-[10px] block mb-1.5">
          Qualification Process ({gig.onboardingSteps.length} steps)
        </span>
        <ol className="space-y-1.5 text-xs text-neutral-700">
          {gig.onboardingSteps.slice(0, 3).map((st, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-neutral-100 text-black font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{st}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Pay and verification */}
      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 font-medium">Published Pay:</span>
          <span className="font-bold text-black font-mono">
            {gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : "Under review"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 font-medium">Verification:</span>
          <PaymentVerificationBadge status={gig.paymentVerification} />
        </div>
        {gig.payment?.termsNote && (
          <p className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 italic">
            {gig.payment.termsNote}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-neutral-100">
        <div className="flex gap-2">
          <Button
            variant={isSaved ? "secondary" : "subtle"}
            size="sm"
            onClick={() => onToggleSave(gig)}
            className="flex-1"
          >
            <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isSaved ? "fill-black text-black" : ""}`} />
            {isSaved ? "Saved" : "Save Gig"}
          </Button>

          <a
            href={gig.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg text-xs px-2.5 py-1.5 h-8 gap-1.5 w-full bg-black hover:bg-neutral-900 text-white shadow-xs"
          >
            Apply Official <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        <Button
          href={`/gigs/${gig.slug}`}
          variant="secondary"
          size="sm"
          className="w-full border-neutral-300 text-black hover:bg-neutral-100"
        >
          Open Full Gig Page <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
