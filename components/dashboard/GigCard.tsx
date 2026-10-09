"use client";

import React from "react";
import Link from "next/link";
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { GigListing, GigMatchScore } from "@/types/gig";
import {
  PaymentVerificationBadge,
  EligibilityBadge,
  Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GigCardProps {
  gig: GigListing;
  matchScore: GigMatchScore;
  isSaved: boolean;
  onToggleSave: (gig: GigListing) => void;
  isSelected?: boolean;
  onSelect?: (gig: GigListing) => void;
}

export const GigCard: React.FC<GigCardProps> = ({
  gig,
  matchScore,
  isSaved,
  onToggleSave,
  isSelected,
  onSelect,
}) => {
  const isHighMatch = matchScore.matchScore >= 80;

  return (
    <div
      onClick={() => onSelect?.(gig)}
      className={`rounded-[14px] border transition-all cursor-pointer p-5 sm:p-6 bg-white relative ${
        isSelected
          ? "border-brand-600 ring-2 ring-brand-100 shadow-md"
          : "border-border hover:border-brand-300 hover:shadow-cardHover"
      }`}
    >
      {/* Top Bar: Platform, Category, Match Score, Save Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-brand-700 shrink-0">
            {gig.platformName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-ink">{gig.platformName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{gig.category}</span>
              {gig.remote && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] text-slate-500 font-medium">Remote</span>
                </>
              )}
            </div>
            {gig.sponsored && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Sponsored Listing
              </span>
            )}
          </div>
        </div>

        {/* Match Score & Bookmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span
                className={`text-lg sm:text-xl font-black tracking-tight ${
                  isHighMatch ? "text-brand-600" : "text-slate-700"
                }`}
              >
                {matchScore.matchScore}%
              </span>
              {isHighMatch && <Sparkles className="w-4 h-4 text-brand-600" />}
            </div>
            <span className="text-[10px] text-ink-muted block font-medium -mt-1">
              Skill match
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(gig);
            }}
            className={`p-2 rounded-lg border transition-colors ${
              isSaved
                ? "bg-brand-50 border-brand-200 text-brand-600"
                : "border-border text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title={isSaved ? "Saved to applications tracker" : "Save this gig"}
            aria-label={isSaved ? "Remove from saved gigs" : "Save gig"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-brand-600 text-brand-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Role Title & Description Snippet */}
      <div className="mt-3">
        <Link
          href={`/gigs/${gig.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-base sm:text-lg font-bold text-ink hover:text-brand-600 transition-colors inline-block"
        >
          {gig.title}
        </Link>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 line-clamp-2 leading-relaxed">
          {gig.description}
        </p>
      </div>

      {/* Skills Match Breakdown */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">
            Matched Skills ({matchScore.matchedSkills.length}/{gig.skillsRequired.length})
          </span>
          {matchScore.missingSkills.length > 0 && (
            <span className="text-slate-400">
              {matchScore.missingSkills.length} missing requirement(s)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {matchScore.matchedSkills.map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 text-xs rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              {sk}
            </span>
          ))}

          {matchScore.missingSkills.slice(0, 3).map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-600 font-normal border border-slate-200 flex items-center gap-1"
              title="Not found in your active profile skills"
            >
              <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Metadata Badges: Eligibility and Payment Proof */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Geographic Eligibility */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
            Eligibility
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <EligibilityBadge
              isEligible={matchScore.isCountryEligible}
              status={gig.eligibilityVerification}
              label={matchScore.countryNote}
            />
          </div>
        </div>

        {/* Payment Proof & Estimated Rate */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
            Payment information
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-ink">
              {gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : "Rate under review"}
            </span>
            <PaymentVerificationBadge status={gig.paymentVerification} />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Reviewed {gig.lastReviewedAt ? new Date(gig.lastReviewedAt).toLocaleDateString() : "recently"}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/gigs/${gig.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-brand-50 transition-colors"
          >
            Full Details <ArrowRight className="w-3 h-3" />
          </Link>
          <a
            href={gig.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Apply <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
