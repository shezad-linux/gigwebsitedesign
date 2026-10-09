import { GigListing, GigMatchScore, PaymentVerification } from "@/types/gig";
import { UserProfile } from "@/types/profile";

export interface FilterState {
  search: string;
  category: string;
  countryScope: "all" | "eligible-only" | "global-only";
  remoteOnly: boolean;
  experienceLevel: "all" | "entry" | "mid" | "expert";
  paymentVerification: "all" | PaymentVerification;
  platform: string;
  minMatchScore: number;
  sortBy: "best-match" | "newest-reviewed" | "pay-high-to-low" | "rating";
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  countryScope: "all",
  remoteOnly: false,
  experienceLevel: "all",
  paymentVerification: "all",
  platform: "all",
  minMatchScore: 0,
  sortBy: "best-match",
};

export function filterAndSortGigs(
  gigs: GigListing[],
  matches: Record<string, GigMatchScore>,
  filters: FilterState,
  profile?: UserProfile
): GigListing[] {
  let filtered = gigs.filter((gig) => {
    const match = matches[gig.id];

    // 1. Text search across title, platformName, skillsRequired, and description
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const inTitle = gig.title.toLowerCase().includes(q);
      const inPlatform = gig.platformName.toLowerCase().includes(q);
      const inSkills = gig.skillsRequired.some((s) => s.toLowerCase().includes(q));
      const inDesc = gig.description.toLowerCase().includes(q);
      if (!inTitle && !inPlatform && !inSkills && !inDesc) {
        return false;
      }
    }

    // 2. Category
    if (filters.category !== "all") {
      if (gig.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // 3. Country scope
    if (filters.countryScope === "eligible-only") {
      if (match && !match.isCountryEligible) {
        return false;
      }
    } else if (filters.countryScope === "global-only") {
      const isGlobal = gig.eligibleCountries.some(
        (c) => c.toLowerCase() === "global" || c.toLowerCase() === "all"
      );
      if (!isGlobal) return false;
    }

    // 4. Remote only
    if (filters.remoteOnly && !gig.remote) {
      return false;
    }

    // 5. Experience level
    if (filters.experienceLevel !== "all") {
      if (gig.experienceLevel && gig.experienceLevel !== filters.experienceLevel) {
        return false;
      }
    }

    // 6. Payment verification
    if (filters.paymentVerification !== "all") {
      if (gig.paymentVerification !== filters.paymentVerification) {
        return false;
      }
    }

    // 7. Platform
    if (filters.platform !== "all") {
      if (gig.platformName.toLowerCase() !== filters.platform.toLowerCase()) {
        return false;
      }
    }

    // 8. Min match score
    if (filters.minMatchScore > 0) {
      if (!match || match.matchScore < filters.minMatchScore) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (filters.sortBy === "best-match") {
      const scoreA = matches[a.id]?.matchScore ?? 0;
      const scoreB = matches[b.id]?.matchScore ?? 0;
      return scoreB - scoreA;
    }
    if (filters.sortBy === "newest-reviewed") {
      const dateA = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
      const dateB = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
      return dateB - dateA;
    }
    if (filters.sortBy === "pay-high-to-low") {
      const payA = a.payment?.amount ?? 0;
      const payB = b.payment?.amount ?? 0;
      return payB - payA;
    }
    if (filters.sortBy === "rating") {
      const ratA = a.rating ?? 0;
      const ratB = b.rating ?? 0;
      return ratB - ratA;
    }
    return 0;
  });

  return filtered;
}
