export type PaymentVerification = "verified" | "partial" | "unverified";
export type EligibilityVerification = "verified" | "partial" | "unverified";
export type AvailabilityStatus = "open" | "waitlist" | "selective" | "paused";
export type ExperienceLevel = "entry" | "mid" | "expert";

export interface GigPayment {
  amount: number;
  currency: string; // e.g., "USD"
  unit: string; // e.g., "hour", "task", "milestone"
  paymentMethod?: string[]; // e.g. ["PayPal", "Direct Deposit", "Wise", "Payoneer"]
  termsNote?: string;
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
