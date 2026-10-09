import {
  GigListing,
  GigMatchScore,
  TrackedApplication,
  ApplicationStatus,
  PaymentEvidence,
  ListingReport,
  AuditEvent,
  PlatformInfo,
  ReportStatus,
  AffiliatePartner,
  AffiliateClick,
  SponsoredCampaign,
  AnalyticsSummary,
  LaunchChecklistItem,
} from "@/types/gig";
import { UserProfile } from "@/types/profile";
import {
  getStoredGigs,
  getStoredProfile,
  saveStoredProfile,
  getTrackedApplications,
  saveTrackedApplication,
  updateApplicationStatus,
  removeTrackedApplication,
  isGigSaved,
  toggleSaveGig,
} from "@/lib/storage";
import {
  isSupabaseConfigured,
  fetchSupabaseGigs,
  fetchSupabaseProfile,
  upsertSupabaseProfile,
  fetchSupabaseApplications,
  upsertSupabaseApplication,
  updateSupabaseApplication,
  deleteSupabaseApplication,
  upsertSupabaseGig,
  toggleSupabaseSavedGig,
  fetchSupabaseSavedGigs,
  getSupabaseUser,
  fetchSupabasePlatforms,
  fetchSupabasePaymentEvidence,
  upsertSupabasePaymentEvidence,
  fetchSupabaseReports,
  insertSupabaseReport,
  updateSupabaseReportStatus as updateSbReportStatus,
  fetchSupabaseAuditEvents,
  insertSupabaseAuditEvent,
} from "@/lib/supabase";
import {
  getStoredPaymentEvidence,
  upsertPaymentEvidence,
  getStoredListingReports,
  submitReport as submitStoredReport,
  updateListingReportStatus as updateStoredReportStatus,
  getStoredAuditEvents,
  recordAuditEvent as recordStoredAuditEvent,
  getStoredPlatforms,
} from "@/lib/operations";
import {
  getStoredAffiliatePartners,
  upsertAffiliatePartner,
  getStoredSponsoredCampaigns,
  upsertSponsoredCampaign,
  recordStoredAffiliateClick,
  getAnalyticsSummary,
  getStoredLaunchChecklist,
  toggleStoredChecklistItem,
  updateStoredChecklistNotes,
  resolveOutboundUrl,
} from "@/lib/monetization";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const TOKEN_KEY = "gigmatcher_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function springRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.data as T;
}

/* ==================== Unified API Client (Supabase > Spring Boot > Local Prototype) ==================== */

export const apiClient = {
  /**
   * Health check to detect if Spring Boot server is online
   */
  async isSpringServerOnline(): Promise<boolean> {
    try {
      const res = await fetch(`http://localhost:8080/actuator/health`, {
        method: "GET",
        signal: AbortSignal.timeout(1200),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Identifies current active backend provider
   */
  async getActiveBackend(): Promise<"supabase" | "springboot" | "local"> {
    if (isSupabaseConfigured()) {
      return "supabase";
    }
    const springOnline = await this.isSpringServerOnline();
    if (springOnline) {
      return "springboot";
    }
    return "local";
  },

  /**
   * Fetch gigs catalog
   */
  async getGigs(params?: { category?: string; search?: string; remoteOnly?: boolean }): Promise<GigListing[]> {
    // 1. Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const supabaseGigs = await fetchSupabaseGigs();
        if (supabaseGigs && supabaseGigs.length > 0) {
          let filtered = supabaseGigs;
          if (params?.category && params.category !== "all") {
            filtered = filtered.filter((g) => g.category.toLowerCase() === params.category?.toLowerCase());
          }
          if (params?.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
              (g) =>
                g.title.toLowerCase().includes(q) ||
                g.platformName.toLowerCase().includes(q) ||
                g.skillsRequired.some((s) => s.toLowerCase().includes(q))
            );
          }
          if (params?.remoteOnly) {
            filtered = filtered.filter((g) => g.remote);
          }
          return filtered;
        }
      } catch (e) {
        console.warn("Supabase fetch failed, trying fallback:", e);
      }
    }

    // 2. Try Spring Boot if online
    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline) {
        const query = new URLSearchParams();
        if (params?.category && params.category !== "all") query.set("category", params.category);
        if (params?.search) query.set("search", params.search);
        if (params?.remoteOnly) query.set("remoteOnly", "true");
        return await springRequest<GigListing[]>(`/gigs?${query.toString()}`);
      }
    } catch (e) {
      console.warn("Spring Boot offline, falling back to local storage:", e);
    }

    // 3. Graceful Local Fallback
    return getStoredGigs();
  },

  /**
   * Fetch single gig by slug
   */
  async getGigBySlug(slug: string): Promise<GigListing | null> {
    if (isSupabaseConfigured()) {
      try {
        const all = await fetchSupabaseGigs();
        if (all) {
          const found = all.find((g) => g.slug === slug);
          if (found) return found;
        }
      } catch (e) {
        console.warn("Supabase fetch failed for slug:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline) {
        return await springRequest<GigListing>(`/gigs/${slug}`);
      }
    } catch (e) {
      console.warn("Spring Boot offline, reading local:", e);
    }

    const all = getStoredGigs();
    return all.find((g) => g.slug === slug) || null;
  },

  /**
   * Fetch current user profile
   */
  async getProfile(): Promise<UserProfile> {
    // 1. Check Supabase
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          const profile = await fetchSupabaseProfile(user.id);
          if (profile) return profile;
        }
      } catch (e) {
        console.warn("Supabase profile read failed:", e);
      }
    }

    // 2. Check Spring Boot
    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        const dto = await springRequest<any>(`/me/profile`);
        return {
          id: dto.id,
          fullName: dto.fullName,
          email: "user@example.com",
          country: dto.country,
          countryCode: dto.countryCode,
          workAuthorization: dto.workAuthorization,
          experienceLevel: dto.experienceLevel || "mid",
          yearsOfExperience: dto.yearsOfExperience || 0,
          portfolioUrl: dto.portfolioUrl,
          githubUrl: dto.githubUrl,
          linkedinUrl: dto.linkedinUrl,
          remoteOnly: dto.remoteOnly ?? true,
          weeklyHoursAvailable: dto.weeklyHoursAvailable ?? 20,
          bio: dto.bio || "",
          skills: dto.skillsJson ? JSON.parse(dto.skillsJson) : [],
          languages: dto.languagesJson ? JSON.parse(dto.languagesJson) : [],
          desiredCategories: dto.desiredCategoriesJson ? JSON.parse(dto.desiredCategoriesJson) : [],
          preferredPayoutMethods: dto.preferredPayoutMethodsJson ? JSON.parse(dto.preferredPayoutMethodsJson) : [],
          hasCompletedOnboarding: dto.hasCompletedOnboarding ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("Spring Boot profile read failed:", e);
    }

    // 3. Fallback to Local Prototype Profile
    return getStoredProfile();
  },

  /**
   * Update profile
   */
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      try {
        await upsertSupabaseProfile(profile);
      } catch (e) {
        console.warn("Supabase profile update failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        const payload = {
          fullName: profile.fullName,
          country: profile.country,
          countryCode: profile.countryCode,
          workAuthorization: profile.workAuthorization,
          experienceLevel: profile.experienceLevel,
          yearsOfExperience: profile.yearsOfExperience,
          portfolioUrl: profile.portfolioUrl,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          remoteOnly: profile.remoteOnly,
          weeklyHoursAvailable: profile.weeklyHoursAvailable,
          bio: profile.bio,
          skillsJson: JSON.stringify(profile.skills || []),
          languagesJson: JSON.stringify(profile.languages || []),
          desiredCategoriesJson: JSON.stringify(profile.desiredCategories || []),
          preferredPayoutMethodsJson: JSON.stringify(profile.preferredPayoutMethods || []),
          hasCompletedOnboarding: profile.hasCompletedOnboarding,
        };
        await springRequest<any>(`/me/profile`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.warn("Spring Boot profile update failed:", e);
    }

    saveStoredProfile(profile);
    return profile;
  },

  /**
   * Tracked applications
   */
  async getApplications(): Promise<TrackedApplication[]> {
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          const apps = await fetchSupabaseApplications(user.id);
          if (apps) return apps;
        }
      } catch (e) {
        console.warn("Supabase applications fetch failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        const raw = await springRequest<any[]>(`/me/applications`);
        return raw.map((entry) => ({
          id: entry.id,
          gigId: entry.gig.id,
          gigSlug: entry.gig.slug,
          platformName: entry.gig.platformName,
          roleTitle: entry.gig.title,
          category: entry.gig.category,
          status: entry.status,
          appliedDate: entry.appliedDate,
          lastUpdated: entry.lastUpdated,
          notes: entry.notes || "",
          paySummary: entry.gig.payAmount ? `$${entry.gig.payAmount} / ${entry.gig.payUnit}` : undefined,
          officialUrl: entry.gig.officialUrl,
        }));
      }
    } catch (e) {
      console.warn("Spring Boot applications fetch failed:", e);
    }

    return getTrackedApplications();
  },

  /**
   * Save or update an application tracker entry
   */
  async trackApplication(gig: GigListing, status: ApplicationStatus = "Shortlisted", notes: string = ""): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          await upsertSupabaseApplication(user.id, {
            gigId: gig.id,
            status,
            notes,
          });
        }
      } catch (e) {
        console.warn("Supabase trackApplication failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        await springRequest<any>(`/me/applications`, {
          method: "POST",
          body: JSON.stringify({
            gigId: gig.id,
            status,
            notes,
          }),
        });
      }
    } catch (e) {
      console.warn("Spring Boot trackApplication failed:", e);
    }

    // Always keep local storage synchronized for instant UI reactivity
    const appEntry: TrackedApplication = {
      id: `app-${gig.id}`,
      gigId: gig.id,
      gigSlug: gig.slug,
      platformName: gig.platformName,
      roleTitle: gig.title,
      category: gig.category,
      status,
      appliedDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      notes,
      paySummary: gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : undefined,
      officialUrl: gig.officialUrl,
    };
    saveTrackedApplication(appEntry);
  },

  /**
   * Update existing application status and notes
   */
  async updateApplication(id: string, status: ApplicationStatus, notes?: string, appliedDate?: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          await updateSupabaseApplication(user.id, id, status, notes, appliedDate);
        }
      } catch (e) {
        console.warn("Supabase updateApplication failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        await springRequest<any>(`/me/applications/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            status,
            notes,
          }),
        });
      }
    } catch (e) {
      console.warn("Spring Boot updateApplication failed:", e);
    }

    updateApplicationStatus(id, status, notes);
  },

  /**
   * Delete application from tracker
   */
  async deleteApplication(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          await deleteSupabaseApplication(user.id, id);
        }
      } catch (e) {
        console.warn("Supabase deleteApplication failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        await springRequest<any>(`/me/applications/${id}`, {
          method: "DELETE",
        });
      }
    } catch (e) {
      console.warn("Spring Boot deleteApplication failed:", e);
    }

    removeTrackedApplication(id);
  },

  /**
   * Toggle saved gig
   */
  async toggleSavedGig(gig: GigListing): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const user = await getSupabaseUser();
        if (user) {
          await toggleSupabaseSavedGig(user.id, gig.id);
        }
      } catch (e) {
        console.warn("Supabase toggleSavedGig failed:", e);
      }
    }

    return toggleSaveGig(gig);
  },

  /**
   * Admin: create or update gig listing
   */
  async adminSaveGig(gig: GigListing): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await upsertSupabaseGig(gig);
      } catch (e) {
        console.warn("Supabase adminSaveGig failed:", e);
      }
    }

    try {
      const isOnline = await this.isSpringServerOnline();
      if (isOnline && getAuthToken()) {
        await springRequest<any>(`/gigs`, {
          method: "POST",
          body: JSON.stringify(gig),
        });
      }
    } catch (e) {
      console.warn("Spring Boot adminSaveGig failed:", e);
    }
  },

  /* ==================== Phase 4: Operations & Verification Methods ==================== */

  /**
   * Get platforms directory
   */
  async getPlatforms(): Promise<PlatformInfo[]> {
    if (isSupabaseConfigured()) {
      try {
        const platforms = await fetchSupabasePlatforms();
        if (platforms && platforms.length > 0) return platforms;
      } catch (e) {
        console.warn("Supabase fetchPlatforms failed:", e);
      }
    }
    return getStoredPlatforms();
  },

  /**
   * Get all payment evidence
   */
  async getPaymentEvidence(): Promise<PaymentEvidence[]> {
    if (isSupabaseConfigured()) {
      try {
        const evidence = await fetchSupabasePaymentEvidence();
        if (evidence && evidence.length > 0) return evidence;
      } catch (e) {
        console.warn("Supabase fetchPaymentEvidence failed:", e);
      }
    }
    return getStoredPaymentEvidence();
  },

  /**
   * Save or verify payment evidence
   */
  async savePaymentEvidence(evidence: PaymentEvidence): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await upsertSupabasePaymentEvidence(evidence);
      } catch (e) {
        console.warn("Supabase savePaymentEvidence failed:", e);
      }
    }
    upsertPaymentEvidence(evidence);
  },

  /**
   * Get community listing reports
   */
  async getListingReports(): Promise<ListingReport[]> {
    if (isSupabaseConfigured()) {
      try {
        const reports = await fetchSupabaseReports();
        if (reports && reports.length > 0) return reports;
      } catch (e) {
        console.warn("Supabase fetchReports failed:", e);
      }
    }
    return getStoredListingReports();
  },

  /**
   * Submit an issue report from community or detail page
   */
  async submitListingReport(report: {
    gigId: string;
    gigTitle?: string;
    platformName?: string;
    reporterEmail?: string;
    reportType: ListingReport["reportType"];
    description: string;
  }): Promise<ListingReport> {
    if (isSupabaseConfigured()) {
      try {
        await insertSupabaseReport(report);
      } catch (e) {
        console.warn("Supabase insertReport failed:", e);
      }
    }
    return submitStoredReport(report);
  },

  /**
   * Resolve or update status of a listing report
   */
  async updateListingReportStatus(
    reportId: string,
    status: ReportStatus,
    resolutionNotes?: string,
    actorEmail = "admin@gigmatcher.io"
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await updateSbReportStatus(reportId, status, resolutionNotes);
      } catch (e) {
        console.warn("Supabase updateReportStatus failed:", e);
      }
    }
    updateStoredReportStatus(reportId, status, resolutionNotes, actorEmail);
  },

  /**
   * Get audit log history
   */
  async getAuditEvents(): Promise<AuditEvent[]> {
    if (isSupabaseConfigured()) {
      try {
        const logs = await fetchSupabaseAuditEvents();
        if (logs && logs.length > 0) return logs;
      } catch (e) {
        console.warn("Supabase fetchAuditEvents failed:", e);
      }
    }
    return getStoredAuditEvents();
  },

  /**
   * Record an action in the audit trail
   */
  async recordAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent> {
    if (isSupabaseConfigured()) {
      try {
        await insertSupabaseAuditEvent(event);
      } catch (e) {
        console.warn("Supabase insertAuditEvent failed:", e);
      }
    }
    return recordStoredAuditEvent(event);
  },

  /* ==================== Phase 5: Monetization, Analytics & Launch ==================== */

  /**
   * Get affiliate partners
   */
  async getAffiliatePartners(): Promise<AffiliatePartner[]> {
    return getStoredAffiliatePartners();
  },

  /**
   * Save or update affiliate partner configuration
   */
  async saveAffiliatePartner(partner: AffiliatePartner): Promise<void> {
    upsertAffiliatePartner(partner);
  },

  /**
   * Get sponsored advertising campaigns
   */
  async getSponsoredCampaigns(): Promise<SponsoredCampaign[]> {
    return getStoredSponsoredCampaigns();
  },

  /**
   * Save or update sponsored advertising campaign
   */
  async saveSponsoredCampaign(campaign: SponsoredCampaign): Promise<void> {
    upsertSponsoredCampaign(campaign);
  },

  /**
   * Track outbound referral or application click
   */
  async trackOutboundClick(click: Omit<AffiliateClick, "id" | "timestamp">): Promise<AffiliateClick> {
    try {
      await fetch("/api/outbound/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(click),
      });
    } catch (e) {
      console.warn("Outbound API call failed, persisting locally:", e);
    }
    return recordStoredAffiliateClick(click);
  },

  /**
   * Get aggregated product analytics summary
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return getAnalyticsSummary();
  },

  /**
   * Get launch checklist items
   */
  async getLaunchChecklist(): Promise<LaunchChecklistItem[]> {
    return getStoredLaunchChecklist();
  },

  /**
   * Toggle launch checklist item status
   */
  async toggleChecklistItem(id: string): Promise<LaunchChecklistItem[]> {
    return toggleStoredChecklistItem(id);
  },

  /**
   * Update launch checklist item notes
   */
  async updateChecklistNotes(id: string, notes: string): Promise<LaunchChecklistItem[]> {
    return updateStoredChecklistNotes(id, notes);
  },

  /**
   * Resolve outbound URL with partner parameters and disclosure
   */
  resolveOutbound(gig: GigListing) {
    return resolveOutboundUrl(gig);
  },
};


