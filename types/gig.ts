export type PaymentVerification = "verified" | "partial" | "unverified";
export type EligibilityVerification = "verified" | "partial" | "unverified";
export type AvailabilityStatus = "open" | "waitlist" | "selective" | "paused";
export type ExperienceLevel = "entry" | "mid" | "expert";
export type PublicationStatus = "draft" | "published" | "paused" | "archived";

export interface GigPayment {
  amount: number;
  currency: string; // e.g., "USD"
  unit: string; // e.g., "hour", "task", "milestone"
  paymentMethod?: string[]; // e.g. ["PayPal", "Direct Deposit", "Wise", "Payoneer"]
  termsNote?: string;
}

export interface PlatformInfo {
  id: string;
  name: string;
  websiteUrl: string;
  careersUrl?: string;
  logoUrl?: string;
  description?: string;
  headquarters?: string;
  verified: boolean;
}

export interface GigListing {
  id: string;
  slug: string;
  platformName: string;
  platformLogo?: string;
  title: string;
  category: string;
  description: string;
  skillsRequired: string[];
  eligibleCountries: string[]; // e.g. ["All", "US", "IN", "GB", ...] or specific ISO codes / names
  remote: boolean;
  payment?: GigPayment;
  paymentVerification: PaymentVerification;
  eligibilityVerification: EligibilityVerification;
  officialUrl: string;
  onboardingSteps: string[];
  lastReviewedAt?: string;
  sponsored: boolean;
  publicationStatus?: PublicationStatus; // Phase 4 lifecycle: draft, published, paused, archived
  // Extended fields for rich gig detail view
  availabilityStatus?: AvailabilityStatus;
  estimatedEffort?: string;
  experienceLevel?: ExperienceLevel;
  eligibilitySourceNote?: string;
  affiliateDisclosure?: string;
  overviewHighlights?: string[];
  rating?: number;
  activeProjectsCount?: number;
}

export interface GigMatchScore {
  gigId: string;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  isCountryEligible: boolean;
  countryNote: string;
  scoreBreakdown: {
    skillScore: number;
    experienceScore: number;
    categoryScore: number;
    countryFitScore: number;
  };
}

export type ApplicationStatus =
  | "Shortlisted"
  | "Applied"
  | "Onboarding"
  | "Qualified"
  | "Active"
  | "Rejected"
  | "Withdrawn";

export interface TrackedApplication {
  id: string;
  gigId: string;
  gigSlug: string;
  platformName: string;
  roleTitle: string;
  category: string;
  status: ApplicationStatus;
  appliedDate?: string;
  lastUpdated: string;
  notes: string;
  paySummary?: string;
  officialUrl: string;
}

/* ==================== Phase 4: Operations & Verification Models ==================== */

export type PaymentEvidenceRateType = "official_advertised" | "worker_reported" | "unverified";

export interface PaymentEvidence {
  id: string;
  gigId: string;
  advertisedRate: number;
  currency: string;
  unit: string;
  rateType: PaymentEvidenceRateType;
  payoutMethods: string[];
  sourceUrl?: string;
  evidenceNotes?: string;
  verificationStatus: PaymentVerification;
  reviewedAt: string;
  nextReviewAt: string;
}

export type ReviewDecision = "approved" | "changes_requested" | "stale_flagged" | "archived";

export interface ListingReview {
  id: string;
  gigId: string;
  reviewerEmail: string;
  decision: ReviewDecision;
  notes: string;
  previousStatus: PublicationStatus;
  newStatus: PublicationStatus;
  reviewedAt: string;
  nextReviewAt: string;
}

export type ReportType =
  | "closed_application"
  | "changed_country_restriction"
  | "incorrect_payment"
  | "broken_link"
  | "other";

export type ReportStatus = "open" | "triaged" | "resolved" | "dismissed";

export interface ListingReport {
  id: string;
  gigId: string;
  gigTitle?: string;
  platformName?: string;
  reporterEmail?: string;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AuditEntityType =
  | "gig_listing"
  | "eligibility_evidence"
  | "payment_evidence"
  | "listing_report"
  | "platform";

export type AuditAction =
  | "create"
  | "update"
  | "publish"
  | "pause"
  | "archive"
  | "restore"
  | "resolve_report"
  | "verify_evidence";

export interface AuditEvent {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  actorEmail: string;
  action: AuditAction;
  changes: Record<string, { before: any; after: any }>;
  justification?: string;
  createdAt: string;
}

/* ==================== Phase 5: Monetization, Campaigns & Launch ==================== */

export type CommissionModel = "cpa" | "cpc" | "revshare" | "fixed";
export type PartnerStatus = "active" | "pending" | "paused";

export interface AffiliatePartner {
  id: string;
  platformId: string;
  platformName: string;
  programName: string;
  affiliateUrlTemplate: string; // e.g. "https://outlier.ai/?utm_source=gigmatcher&ref={referralCode}"
  referralCode?: string;
  commissionModel: CommissionModel;
  commissionRate: string; // e.g. "$25 / approved qualification"
  status: PartnerStatus;
  termsUrl?: string;
  notes?: string;
  totalClicks?: number;
  totalConversions?: number;
  updatedAt?: string;
}

export interface AffiliateClick {
  id: string;
  gigId: string;
  gigTitle: string;
  platformName: string;
  partnerId?: string;
  destinationUrl: string;
  isAffiliate: boolean;
  userId?: string;
  referrer?: string;
  timestamp: string;
}

export type CampaignPlacementRule = "top_of_category" | "featured_badge" | "homepage_hero";
export type CampaignStatus = "active" | "paused" | "completed";

export interface SponsoredCampaign {
  id: string;
  sponsorName: string;
  gigId: string;
  gigTitle: string;
  platformName: string;
  budget: number;
  dailyBudget: number;
  spent: number;
  startDate: string;
  endDate: string;
  targetCategory?: string;
  status: CampaignStatus;
  placementRule: CampaignPlacementRule;
  impressionsCount: number;
  clicksCount: number;
  costPerClick?: number;
}

export interface CampaignEvent {
  id: string;
  campaignId: string;
  eventType: "impression" | "click";
  timestamp: string;
}

export interface AnalyticsSummary {
  pageViews: number;
  uniqueVisitors: number;
  searchesCount: number;
  profilesCompleted: number;
  gigViewsCount: number;
  outboundApplications: number;
  affiliateClicks: number;
  estimatedAffiliateRevenue: number;
  sponsoredRevenue: number;
}

export type ChecklistCategory = "security" | "legal" | "infra" | "qa";

export interface LaunchChecklistItem {
  id: string;
  order: number;
  title: string;
  category: ChecklistCategory;
  description: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

