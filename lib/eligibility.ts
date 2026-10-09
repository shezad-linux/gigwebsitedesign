export type EligibilityStatus = "confirmed" | "excluded" | "unknown" | "needs_review";

export interface EligibilityEvidenceRecord {
  gigId: string;
  countryCode: string; // e.g. 'IN', 'US', 'UK', 'CA', 'GLOBAL'
  eligibilityStatus: EligibilityStatus;
  scope: "platform_wide" | "project_specific";
  sourceUrl?: string;
  evidenceNotes?: string;
  reviewedAt: string;
  nextReviewAt: string;
}

export interface EligibilityDecision {
  status: EligibilityStatus;
  isEligible: boolean;
  label: string;
  sourceUrl?: string;
  evidenceNotes?: string;
  reviewedAt?: string;
  nextReviewAt?: string;
  isStale: boolean;
}

// Maintained evidence cache from verified records
export const VERIFIED_ELIGIBILITY_RECORDS: EligibilityEvidenceRecord[] = [
  // Outlier AI
  {
    gigId: "gig-outlier-01",
    countryCode: "IN",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://outlier.ai/careers",
    evidenceNotes: "Active contractor queues for India developers verified via PayPal and Airwallex payouts.",
    reviewedAt: "2025-05-01T10:00:00Z",
    nextReviewAt: "2025-07-01T10:00:00Z",
  },
  {
    gigId: "gig-outlier-01",
    countryCode: "US",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://outlier.ai/careers",
    evidenceNotes: "Direct 1099 contracts verified for US residents across coding and STEM queues.",
    reviewedAt: "2025-05-01T10:00:00Z",
    nextReviewAt: "2025-07-01T10:00:00Z",
  },
  {
    gigId: "gig-outlier-01",
    countryCode: "GLOBAL",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://outlier.ai/careers",
    evidenceNotes: "Open to international developers meeting language and ID clearance.",
    reviewedAt: "2025-05-01T10:00:00Z",
    nextReviewAt: "2025-07-01T10:00:00Z",
  },

  // DataAnnotation Tech
  {
    gigId: "gig-dataannotation-01",
    countryCode: "US",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://www.dataannotation.tech/faq",
    evidenceNotes: "Primary operating country with verified PayPal instant disbursements.",
    reviewedAt: "2025-05-08T15:00:00Z",
    nextReviewAt: "2025-07-08T15:00:00Z",
  },
  {
    gigId: "gig-dataannotation-01",
    countryCode: "IN",
    eligibilityStatus: "excluded",
    scope: "platform_wide",
    sourceUrl: "https://www.dataannotation.tech/faq",
    evidenceNotes: "Direct signups from India are currently excluded by strict platform IP gatekeeper rules.",
    reviewedAt: "2025-05-08T15:00:00Z",
    nextReviewAt: "2025-07-08T15:00:00Z",
  },

  // Alignerr
  {
    gigId: "gig-alignerr-01",
    countryCode: "GLOBAL",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://www.alignerr.com",
    evidenceNotes: "Global recruitment active via Deel contractor compliance in 100+ countries.",
    reviewedAt: "2025-05-05T12:00:00Z",
    nextReviewAt: "2025-07-05T12:00:00Z",
  },
  {
    gigId: "gig-alignerr-01",
    countryCode: "IN",
    eligibilityStatus: "confirmed",
    scope: "platform_wide",
    sourceUrl: "https://www.alignerr.com",
    evidenceNotes: "Contractors in India accepted upon passing 80th percentile technical exam.",
    reviewedAt: "2025-05-05T12:00:00Z",
    nextReviewAt: "2025-07-05T12:00:00Z",
  },
];

/**
 * Assesses country eligibility deterministically using maintained reviewable evidence.
 * If data is missing or stale, returns 'unknown' or 'needs_review'.
 */
export function evaluateCountryEligibility(
  gigId: string,
  userCountryCode: string = "IN"
): EligibilityDecision {
  const normalizedCountry = userCountryCode.toUpperCase();
  const now = new Date().getTime();

  // 1. Direct country record match
  let record = VERIFIED_ELIGIBILITY_RECORDS.find(
    (r) => r.gigId === gigId && r.countryCode.toUpperCase() === normalizedCountry
  );

  // 2. Global fallback match
  if (!record) {
    record = VERIFIED_ELIGIBILITY_RECORDS.find(
      (r) => r.gigId === gigId && r.countryCode.toUpperCase() === "GLOBAL"
    );
  }

  // 3. If no verified evidence exists
  if (!record) {
    return {
      status: "unknown",
      isEligible: false,
      label: "Unknown — needs verification",
      isStale: false,
    };
  }

  // 4. Check evidence staleness
  const nextReviewTime = new Date(record.nextReviewAt).getTime();
  const isStale = now > nextReviewTime;

  if (isStale) {
    return {
      status: "needs_review",
      isEligible: false,
      label: "Needs current verification (review due)",
      sourceUrl: record.sourceUrl,
      evidenceNotes: record.evidenceNotes,
      reviewedAt: record.reviewedAt,
      nextReviewAt: record.nextReviewAt,
      isStale: true,
    };
  }

  // 5. Excluded status
  if (record.eligibilityStatus === "excluded") {
    return {
      status: "excluded",
      isEligible: false,
      label: `Excluded in ${normalizedCountry}`,
      sourceUrl: record.sourceUrl,
      evidenceNotes: record.evidenceNotes,
      reviewedAt: record.reviewedAt,
      nextReviewAt: record.nextReviewAt,
      isStale: false,
    };
  }

  // 6. Confirmed status
  return {
    status: "confirmed",
    isEligible: true,
    label: `${normalizedCountry} Eligible`,
    sourceUrl: record.sourceUrl,
    evidenceNotes: record.evidenceNotes,
    reviewedAt: record.reviewedAt,
    nextReviewAt: record.nextReviewAt,
    isStale: false,
  };
}
