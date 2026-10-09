import { GigListing, GigMatchScore, TrackedApplication, ApplicationStatus } from "@/types/gig";
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
import { calculateAllMatches } from "@/lib/matching";

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

/* ==================== Hybrid API with Fallback ==================== */

export const apiClient = {
  /**
   * Health check to detect if Spring Boot server is online
   */
  async isServerOnline(): Promise<boolean> {
    try {
      const res = await fetch(`http://localhost:8080/actuator/health`, {
        method: "GET",
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch gigs catalog
   */
  async getGigs(params?: { category?: string; search?: string; remoteOnly?: boolean }): Promise<GigListing[]> {
    try {
      const isOnline = await this.isServerOnline();
      if (isOnline) {
        const query = new URLSearchParams();
        if (params?.category && params.category !== "all") query.set("category", params.category);
        if (params?.search) query.set("search", params.search);
        if (params?.remoteOnly) query.set("remoteOnly", "true");
        return await request<GigListing[]>(`/gigs?${query.toString()}`);
      }
    } catch (e) {
      console.warn("Backend offline, using local catalog", e);
    }
    return getStoredGigs();
  },

  /**
   * Fetch single gig by slug
   */
  async getGigBySlug(slug: string): Promise<GigListing | null> {
    try {
      const isOnline = await this.isServerOnline();
      if (isOnline) {
        return await request<GigListing>(`/gigs/${slug}`);
      }
    } catch (e) {
      console.warn("Backend offline, using local gig data", e);
    }
    const all = getStoredGigs();
    return all.find((g) => g.slug === slug) || null;
  },

  /**
   * Fetch current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const isOnline = await this.isServerOnline();
      if (isOnline && getAuthToken()) {
        const dto = await request<any>(`/me/profile`);
        // Map DTO to UserProfile
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
      console.warn("Backend offline, using stored local profile", e);
    }
    return getStoredProfile();
  },

  /**
   * Update profile
   */
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const isOnline = await this.isServerOnline();
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
        await request<any>(`/me/profile`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.warn("Backend offline, saving locally", e);
    }
    saveStoredProfile(profile);
    return profile;
  },

  /**
   * Tracked applications
   */
  async getApplications(): Promise<TrackedApplication[]> {
    try {
      const isOnline = await this.isServerOnline();
      if (isOnline && getAuthToken()) {
        const raw = await request<any[]>(`/me/applications`);
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
      console.warn("Backend offline, using local tracker", e);
    }
    return getTrackedApplications();
  },
};
