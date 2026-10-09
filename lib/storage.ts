import { GigListing, TrackedApplication, ApplicationStatus } from "@/types/gig";
import { UserProfile } from "@/types/profile";
import { DEMO_PROFILE } from "@/data/demo-profile";
import { MOCK_GIGS } from "@/data/gigs";

const STORAGE_KEYS = {
  PROFILE: "gigmatcher_user_profile_v2",
  GIGS: "gigmatcher_gigs_catalog_v1",
  APPLICATIONS: "gigmatcher_applications_v1",
};

export const INITIAL_APPLICATIONS: TrackedApplication[] = [
  {
    id: "app_init_01",
    gigId: "gig-outlier-01",
    gigSlug: "ai-coding-evaluation-outlier",
    platformName: "Outlier AI",
    roleTitle: "AI Coding Evaluation & Code Review",
    category: "AI Coding",
    status: "Shortlisted",
    appliedDate: "2025-05-09",
    lastUpdated: "2025-05-10",
    notes: "Top match (92%). Prepared LeetCode algorithms review and verified W-8BEN requirements.",
    paySummary: "$40 / hour",
    officialUrl: "https://outlier.ai",
  },
  {
    id: "app_init_02",
    gigId: "gig-mindrift-01",
    gigSlug: "llm-reasoning-evaluator-mindrift",
    platformName: "Mindrift",
    roleTitle: "LLM Reasoning & Factuality Evaluator",
    category: "AI Evaluation",
    status: "Applied",
    appliedDate: "2025-05-08",
    lastUpdated: "2025-05-08",
    notes: "Completed reasoning test; awaiting reviewer assessment response via email.",
    paySummary: "$22 / hour",
    officialUrl: "https://mindrift.ai",
  },
  {
    id: "app_init_03",
    gigId: "gig-testlio-01",
    gigSlug: "exploratory-mobile-ai-tester-testlio",
    platformName: "Testlio",
    roleTitle: "Exploratory Mobile App & AI Assistant Tester",
    category: "Software & QA Testing",
    status: "Onboarding",
    appliedDate: "2025-05-05",
    lastUpdated: "2025-05-07",
    notes: "Registered iPhone 15 & MacBook hardware specs. Scheduled sample bug report trial.",
    paySummary: "$28 / hour",
    officialUrl: "https://testlio.com",
  },
];

/* ==================== Profile Storage ==================== */

export function getStoredProfile(): UserProfile {
  if (typeof window === "undefined") {
    return DEMO_PROFILE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_PROFILE));
      return DEMO_PROFILE;
    }
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.error("Failed to parse stored profile", e);
    return DEMO_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    window.dispatchEvent(new Event("gigmatcher_profile_updated"));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export function resetStoredProfile(): UserProfile {
  if (typeof window === "undefined") return DEMO_PROFILE;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEMO_PROFILE));
    window.dispatchEvent(new Event("gigmatcher_profile_updated"));
    return DEMO_PROFILE;
  } catch (e) {
    console.error("Failed to reset profile", e);
    return DEMO_PROFILE;
  }
}

export function removeResumeFromProfile(): UserProfile {
  const current = getStoredProfile();
  const updated: UserProfile = {
    ...current,
    resume: undefined,
    updatedAt: new Date().toISOString(),
  };
  saveStoredProfile(updated);
  return updated;
}

/* ==================== Gigs Catalog Storage ==================== */

export function getStoredGigs(): GigListing[] {
  if (typeof window === "undefined") {
    return MOCK_GIGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GIGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(MOCK_GIGS));
      return MOCK_GIGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(MOCK_GIGS));
      return MOCK_GIGS;
    }
    return parsed as GigListing[];
  } catch (e) {
    console.error("Failed to parse stored gigs", e);
    return MOCK_GIGS;
  }
}

export function saveStoredGig(gig: GigListing): GigListing[] {
  if (typeof window === "undefined") return MOCK_GIGS;
  try {
    const currentGigs = getStoredGigs();
    const existingIndex = currentGigs.findIndex((g) => g.id === gig.id);
    let updated: GigListing[];
    if (existingIndex >= 0) {
      updated = [...currentGigs];
      updated[existingIndex] = gig;
    } else {
      updated = [gig, ...currentGigs];
    }
    localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(updated));
    window.dispatchEvent(new Event("gigmatcher_gigs_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to save gig listing", e);
    return MOCK_GIGS;
  }
}

export function resetStoredGigs(): GigListing[] {
  if (typeof window === "undefined") return MOCK_GIGS;
  try {
    localStorage.setItem(STORAGE_KEYS.GIGS, JSON.stringify(MOCK_GIGS));
    window.dispatchEvent(new Event("gigmatcher_gigs_updated"));
    return MOCK_GIGS;
  } catch (e) {
    console.error("Failed to reset gigs catalog", e);
    return MOCK_GIGS;
  }
}

/* ==================== Applications & Tracker Storage ==================== */

export function getTrackedApplications(): TrackedApplication[] {
  if (typeof window === "undefined") {
    return INITIAL_APPLICATIONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw) as TrackedApplication[];
  } catch (e) {
    console.error("Failed to parse stored applications", e);
    return INITIAL_APPLICATIONS;
  }
}

export function saveTrackedApplication(app: TrackedApplication): TrackedApplication[] {
  if (typeof window === "undefined") return INITIAL_APPLICATIONS;
  try {
    const current = getTrackedApplications();
    const idx = current.findIndex((a) => a.id === app.id || a.gigId === app.gigId);
    let updated: TrackedApplication[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = {
        ...app,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
    } else {
      updated = [
        {
          ...app,
          lastUpdated: new Date().toISOString().split("T")[0],
        },
        ...current,
      ];
    }
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("gigmatcher_applications_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to save tracked application", e);
    return INITIAL_APPLICATIONS;
  }
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): TrackedApplication[] {
  if (typeof window === "undefined") return INITIAL_APPLICATIONS;
  try {
    const current = getTrackedApplications();
    const updated = current.map((app) => {
      if (app.id === id || app.gigId === id) {
        return {
          ...app,
          status,
          notes: notes !== undefined ? notes : app.notes,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return app;
    });
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("gigmatcher_applications_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to update application status", e);
    return INITIAL_APPLICATIONS;
  }
}

export function removeTrackedApplication(idOrGigId: string): TrackedApplication[] {
  if (typeof window === "undefined") return INITIAL_APPLICATIONS;
  try {
    const current = getTrackedApplications();
    const updated = current.filter((app) => app.id !== idOrGigId && app.gigId !== idOrGigId);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new Event("gigmatcher_applications_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to remove tracked application", e);
    return INITIAL_APPLICATIONS;
  }
}

export function isGigSaved(gigId: string): boolean {
  const current = getTrackedApplications();
  return current.some((a) => a.gigId === gigId);
}

export function toggleSaveGig(gig: GigListing): boolean {
  const current = getTrackedApplications();
  const existing = current.find((a) => a.gigId === gig.id);
  if (existing) {
    removeTrackedApplication(existing.id);
    return false;
  } else {
    const payStr = gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : "Variable";
    const newApp: TrackedApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gigId: gig.id,
      gigSlug: gig.slug,
      platformName: gig.platformName,
      roleTitle: gig.title,
      category: gig.category,
      status: "Shortlisted",
      appliedDate: undefined,
      lastUpdated: new Date().toISOString().split("T")[0],
      notes: "Saved from matching dashboard for review.",
      paySummary: payStr,
      officialUrl: gig.officialUrl,
    };
    saveTrackedApplication(newApp);
    return true;
  }
}
