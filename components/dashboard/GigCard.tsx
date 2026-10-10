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
          ? "border-black ring-2 ring-neutral-200 shadow-md"
          : "border-neutral-200 hover:border-black hover:shadow-cardHover"
      }`}
    >
      {/* Top Bar: Platform, Category, Match Score, Save Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-black shrink-0">
            {gig.platformName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-black">{gig.platformName}</span>
              <span className="text-neutral-300">·</span>
              <span className="text-xs text-neutral-500">{gig.category}</span>
              {gig.remote && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Remote</span>
                </>
              )}
            </div>
            {gig.sponsored && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-black bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-300">
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
                className={`text-lg sm:text-xl font-black tracking-tight font-mono ${
                  isHighMatch ? "text-black" : "text-neutral-700"
                }`}
              >
                {matchScore.matchScore}%
              </span>
              {isHighMatch && <Sparkles className="w-4 h-4 text-black" />}
            </div>
            <span className="text-[10px] text-neutral-500 block font-medium -mt-1">
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
                ? "bg-black border-black text-white"
                : "border-neutral-200 text-neutral-400 hover:text-black hover:bg-neutral-50"
            }`}
            title={isSaved ? "Saved to applications tracker" : "Save this gig"}
            aria-label={isSaved ? "Remove from saved gigs" : "Save gig"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
          </button>
        </div>
      </div>

      {/* Role Title & Description Snippet */}
      <div className="mt-3">
        <Link
          href={`/gigs/${gig.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-base sm:text-lg font-bold text-black hover:underline transition-colors inline-block"
        >
          {gig.title}
        </Link>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
          {gig.description}
        </p>
      </div>

      {/* Skills Match Breakdown */}
      <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-neutral-500 uppercase tracking-wider">
            Matched Skills ({matchScore.matchedSkills.length}/{gig.skillsRequired.length})
          </span>
          {matchScore.missingSkills.length > 0 && (
            <span className="text-neutral-400">
              {matchScore.missingSkills.length} missing requirement(s)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {matchScore.matchedSkills.map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 text-xs rounded-md bg-black text-white font-medium border border-black flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
              {sk}
            </span>
          ))}

          {matchScore.missingSkills.slice(0, 3).map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 text-xs rounded-md bg-neutral-100 text-neutral-600 font-normal border border-neutral-200 flex items-center gap-1"
              title="Not found in your active profile skills"
            >
              <AlertCircle className="w-3 h-3 text-neutral-400 shrink-0" />
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Metadata Badges: Eligibility and Payment Proof */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Geographic Eligibility */}
        <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
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
        <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
            Payment information
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-black font-mono">
              {gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : "Rate under review"}
            </span>
            <PaymentVerificationBadge status={gig.paymentVerification} />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-neutral-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Reviewed {gig.lastReviewedAt ? new Date(gig.lastReviewedAt).toLocaleDateString() : "recently"}
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/gigs/${gig.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-semibold text-black hover:underline flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Full Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href={gig.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-900 text-xs font-medium transition-colors"
          >
            Apply <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
