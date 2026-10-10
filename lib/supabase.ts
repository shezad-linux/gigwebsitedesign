import { createClient as createJsClient, SupabaseClient, User } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import {
  GigListing,
  TrackedApplication,
  ApplicationStatus,
  PaymentEvidence,
  ListingReport,
  AuditEvent,
  PlatformInfo,
  ReportStatus,
  PublicationStatus,
} from "@/types/gig";
import { UserProfile } from "@/types/profile";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createJsClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
  : null;

/* ==================== Supabase Auth Operations ==================== */

export async function getSupabaseUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error("Error fetching Supabase user:", err);
    return null;
  }
}

export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithSupabase(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogleOAuth() {
  if (!supabase) throw new Error("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  const redirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : undefined;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutFromSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/* ==================== Supabase Profile Operations ==================== */

export async function fetchSupabaseProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name || "Candidate",
      email: data.email || "",
      country: data.country || "India",
      countryCode: data.country_code || "IN",
      workAuthorization: data.work_authorization,
      experienceLevel: data.experience_level || "mid",
      yearsOfExperience: data.years_of_experience || 0,
      portfolioUrl: data.portfolio_url,
      githubUrl: data.github_url,
      linkedinUrl: data.linkedin_url,
      remoteOnly: data.remote_only ?? true,
      weeklyHoursAvailable: data.weekly_hours_available ?? 20,
      bio: data.bio || "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      languages: Array.isArray(data.languages) ? data.languages : [],
      desiredCategories: Array.isArray(data.desired_categories) ? data.desired_categories : [],
      preferredPayoutMethods: Array.isArray(data.preferred_payout_methods) ? data.preferred_payout_methods : [],
      hasCompletedOnboarding: data.has_completed_onboarding ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error("Error fetching profile from Supabase:", err);
    return null;
  }
}

export async function upsertSupabaseProfile(profile: UserProfile): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      country: profile.country,
      country_code: profile.countryCode,
      work_authorization: profile.workAuthorization,
      experience_level: profile.experienceLevel,
      years_of_experience: profile.yearsOfExperience,
      portfolio_url: profile.portfolioUrl,
      github_url: profile.githubUrl,
      linkedin_url: profile.linkedinUrl,
      remote_only: profile.remoteOnly,
      weekly_hours_available: profile.weeklyHoursAvailable,
      bio: profile.bio,
      skills: profile.skills,
      languages: profile.languages,
      desired_categories: profile.desiredCategories,
      preferred_payout_methods: profile.preferredPayoutMethods,
      has_completed_onboarding: profile.hasCompletedOnboarding,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload);

    if (error) {
      console.error("Error saving profile to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception saving profile to Supabase:", err);
    return false;
  }
}

/* ==================== Supabase Gig Catalog Operations ==================== */

export async function fetchSupabaseGigs(): Promise<GigListing[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("gig_listings")
      .select("*")
      .order("sponsored", { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any): GigListing => ({
      id: row.id,
      slug: row.slug,
      platformName: row.platform_name,
      platformLogo: row.platform_logo,
      title: row.title,
      category: row.category,
      description: row.description,
      remote: row.remote,
      payment: row.pay_amount ? {
        amount: Number(row.pay_amount),
        currency: row.pay_currency || "USD",
        unit: row.pay_unit || "hour",
        termsNote: row.pay_terms_note,
      } : undefined,
      paymentVerification: row.payment_verification,
      eligibilityVerification: row.eligibility_verification,
      officialUrl: row.official_url,
      sponsored: row.sponsored,
      availabilityStatus: row.availability_status,
      estimatedEffort: row.estimated_effort,
      experienceLevel: row.experience_level,
      eligibilitySourceNote: row.eligibility_source_note,
      affiliateDisclosure: row.affiliate_disclosure,
      rating: row.rating ? Number(row.rating) : undefined,
      activeProjectsCount: row.active_projects_count,
      skillsRequired: row.skills_required || [],
      eligibleCountries: row.eligible_countries || [],
      onboardingSteps: row.onboarding_steps || [],
      overviewHighlights: row.overview_highlights || [],
      lastReviewedAt: row.last_reviewed_at,
      publicationStatus: (row.publication_status as PublicationStatus) || "published",
    }));
  } catch (err) {
    console.error("Error fetching gigs from Supabase:", err);
    return null;
  }
}

/* ==================== Supabase Saved Gigs Operations ==================== */

export async function fetchSupabaseSavedGigs(userId: string): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("saved_gigs")
      .select("gig_id")
      .eq("user_id", userId);

    if (error || !data) return [];
    return data.map((d: any) => d.gig_id);
  } catch (err) {
    console.error("Error fetching saved gigs from Supabase:", err);
    return [];
  }
}

export async function toggleSupabaseSavedGig(userId: string, gigId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data } = await supabase
      .from("saved_gigs")
      .select("id")
      .eq("user_id", userId)
      .eq("gig_id", gigId)
      .maybeSingle();

    if (data) {
      // Remove
      await supabase
        .from("saved_gigs")
        .delete()
        .eq("user_id", userId)
        .eq("gig_id", gigId);
      return false; // unsaved
    } else {
      // Add
      await supabase
        .from("saved_gigs")
        .insert({ user_id: userId, gig_id: gigId });
      return true; // saved
    }
  } catch (err) {
    console.error("Error toggling saved gig in Supabase:", err);
    return false;
  }
}

/* ==================== Supabase Application Tracker Operations ==================== */

export async function fetchSupabaseApplications(userId: string): Promise<TrackedApplication[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("application_tracker_entries")
      .select(`
        id,
        gig_id,
        status,
        applied_date,
        last_updated,
        notes,
        gig:gig_listings (
          id,
          slug,
          platform_name,
          title,
          category,
          pay_amount,
          pay_unit,
          official_url
        )
      `)
      .eq("user_id", userId)
      .order("last_updated", { ascending: false });

    if (error || !data) return null;

    return data.map((entry: any): TrackedApplication => ({
      id: entry.id,
      gigId: entry.gig_id,
      gigSlug: entry.gig?.slug || entry.gig_id,
      platformName: entry.gig?.platform_name || "Platform",
      roleTitle: entry.gig?.title || "Role",
      category: entry.gig?.category || "General",
      status: entry.status as ApplicationStatus,
      appliedDate: entry.applied_date,
      lastUpdated: entry.last_updated,
      notes: entry.notes || "",
      paySummary: entry.gig?.pay_amount ? `$${entry.gig.pay_amount} / ${entry.gig.pay_unit}` : undefined,
      officialUrl: entry.gig?.official_url || "https://example.com",
    }));
  } catch (err) {
    console.error("Error fetching applications from Supabase:", err);
    return null;
  }
}

export async function upsertSupabaseApplication(
  userId: string,
  app: {
    gigId: string;
    status: ApplicationStatus;
    notes?: string;
    appliedDate?: string;
  }
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const today = new Date().toISOString().split("T")[0];
    const payload = {
      user_id: userId,
      gig_id: app.gigId,
      status: app.status,
      notes: app.notes || "",
      applied_date: app.appliedDate || today,
      last_updated: today,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("application_tracker_entries")
      .upsert(payload, { onConflict: "user_id,gig_id" });

    if (error) {
      console.error("Error upserting application in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception upserting application in Supabase:", err);
    return false;
  }
}

export async function updateSupabaseApplication(
  userId: string,
  appId: string,
  status: ApplicationStatus,
  notes?: string,
  appliedDate?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const today = new Date().toISOString().split("T")[0];
    const updates: any = {
      status,
      last_updated: today,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) updates.notes = notes;
    if (appliedDate !== undefined) updates.applied_date = appliedDate;

    const { error } = await supabase
      .from("application_tracker_entries")
      .update(updates)
      .eq("user_id", userId)
      .eq("id", appId);

    if (error) {
      console.error("Error updating application in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating application in Supabase:", err);
    return false;
  }
}

export async function deleteSupabaseApplication(userId: string, appId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("application_tracker_entries")
      .delete()
      .eq("user_id", userId)
      .eq("id", appId);

    if (error) {
      console.error("Error deleting application in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception deleting application in Supabase:", err);
    return false;
  }
}

/* ==================== Supabase Admin Operations ==================== */

export async function upsertSupabaseGig(gig: GigListing): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: gig.id,
      slug: gig.slug,
      platform_name: gig.platformName,
      platform_logo: gig.platformLogo,
      title: gig.title,
      category: gig.category,
      description: gig.description,
      remote: gig.remote,
      pay_amount: gig.payment?.amount,
      pay_currency: gig.payment?.currency || "USD",
      pay_unit: gig.payment?.unit || "hour",
      pay_terms_note: gig.payment?.termsNote,
      payment_verification: gig.paymentVerification,
      eligibility_verification: gig.eligibilityVerification,
      official_url: gig.officialUrl,
      sponsored: gig.sponsored,
      availability_status: gig.availabilityStatus,
      estimated_effort: gig.estimatedEffort,
      experience_level: gig.experienceLevel,
      eligibility_source_note: gig.eligibilitySourceNote,
      affiliate_disclosure: gig.affiliateDisclosure,
      rating: gig.rating,
      active_projects_count: gig.activeProjectsCount,
      skills_required: gig.skillsRequired,
      eligible_countries: gig.eligibleCountries,
      onboarding_steps: gig.onboardingSteps,
      overview_highlights: gig.overviewHighlights,
      last_reviewed_at: gig.lastReviewedAt || new Date().toISOString(),
      publication_status: gig.publicationStatus || "published",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("gig_listings").upsert(payload);
    if (error) {
      console.error("Error upserting gig in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception upserting gig in Supabase:", err);
    return false;
  }
}

/* ==================== Phase 4: Platforms, Evidence, Reports & Audit ==================== */

export async function fetchSupabasePlatforms(): Promise<PlatformInfo[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("platforms")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) return null;

    return data.map((p: any): PlatformInfo => ({
      id: p.id,
      name: p.name,
      websiteUrl: p.website_url,
      careersUrl: p.careers_url,
      logoUrl: p.logo_url,
      description: p.description,
      headquarters: p.headquarters,
      verified: p.verified ?? true,
    }));
  } catch (err) {
    console.error("Error fetching platforms from Supabase:", err);
    return null;
  }
}

export async function fetchSupabasePaymentEvidence(): Promise<PaymentEvidence[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("payment_evidence")
      .select("*")
      .order("reviewed_at", { ascending: false });

    if (error || !data) return null;

    return data.map((e: any): PaymentEvidence => ({
      id: e.id,
      gigId: e.gig_id,
      advertisedRate: Number(e.advertised_rate),
      currency: e.currency,
      unit: e.unit,
      rateType: e.rate_type,
      payoutMethods: e.payout_methods || [],
      sourceUrl: e.source_url,
      evidenceNotes: e.evidence_notes,
      verificationStatus: e.verification_status,
      reviewedAt: e.reviewed_at,
      nextReviewAt: e.next_review_at,
    }));
  } catch (err) {
    console.error("Error fetching payment evidence from Supabase:", err);
    return null;
  }
}

export async function upsertSupabasePaymentEvidence(evidence: PaymentEvidence): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: evidence.id,
      gig_id: evidence.gigId,
      advertised_rate: evidence.advertisedRate,
      currency: evidence.currency,
      unit: evidence.unit,
      rate_type: evidence.rateType,
      payout_methods: evidence.payoutMethods,
      source_url: evidence.sourceUrl,
      evidence_notes: evidence.evidenceNotes,
      verification_status: evidence.verificationStatus,
      reviewed_at: evidence.reviewedAt || new Date().toISOString(),
      next_review_at: evidence.nextReviewAt,
    };

    const { error } = await supabase.from("payment_evidence").upsert(payload);
    if (error) {
      console.error("Error upserting payment evidence in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception upserting payment evidence in Supabase:", err);
    return false;
  }
}

export async function fetchSupabaseReports(): Promise<ListingReport[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("listing_reports")
      .select(`
        id,
        gig_id,
        reporter_email,
        report_type,
        description,
        status,
        resolution_notes,
        resolved_at,
        created_at,
        gig:gig_listings (
          title,
          platform_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return null;

    return data.map((r: any): ListingReport => ({
      id: r.id,
      gigId: r.gig_id,
      gigTitle: r.gig?.title,
      platformName: r.gig?.platform_name,
      reporterEmail: r.reporter_email,
      reportType: r.report_type,
      description: r.description,
      status: r.status,
      resolutionNotes: r.resolution_notes,
      resolvedAt: r.resolved_at,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("Error fetching listing reports from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseReport(report: {
  gigId: string;
  reporterEmail?: string;
  reportType: ListingReport["reportType"];
  description: string;
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      gig_id: report.gigId,
      reporter_email: report.reporterEmail || null,
      report_type: report.reportType,
      description: report.description,
      status: "open",
    };

    const { error } = await supabase.from("listing_reports").insert(payload);
    if (error) {
      console.error("Error inserting report in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception inserting report in Supabase:", err);
    return false;
  }
}

export async function updateSupabaseReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (resolutionNotes !== undefined) updates.resolution_notes = resolutionNotes;
    if (status === "resolved" || status === "dismissed") {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("listing_reports")
      .update(updates)
      .eq("id", reportId);

    if (error) {
      console.error("Error updating report status in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating report status in Supabase:", err);
    return false;
  }
}

export async function fetchSupabaseAuditEvents(): Promise<AuditEvent[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return null;

    return data.map((a: any): AuditEvent => ({
      id: a.id,
      entityType: a.entity_type,
      entityId: a.entity_id,
      actorEmail: a.actor_email,
      action: a.action,
      changes: a.changes || {},
      justification: a.justification,
      createdAt: a.created_at,
    }));
  } catch (err) {
    console.error("Error fetching audit events from Supabase:", err);
    return null;
  }
}

export async function insertSupabaseAuditEvent(event: {
  entityType: AuditEvent["entityType"];
  entityId: string;
  actorEmail: string;
  action: AuditEvent["action"];
  changes: Record<string, { before: any; after: any }>;
  justification?: string;
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      entity_type: event.entityType,
      entity_id: event.entityId,
      actor_email: event.actorEmail,
      action: event.action,
      changes: event.changes,
      justification: event.justification,
    };

    const { error } = await supabase.from("audit_events").insert(payload);
    if (error) {
      console.error("Error inserting audit event in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception inserting audit event in Supabase:", err);
    return false;
  }
}

/* ==================== Phase 4: Server-Enforced RBAC Helpers ==================== */

export async function fetchSupabaseUserRole(
  userId: string
): Promise<"admin" | "reviewer" | "user" | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data.role as "admin" | "reviewer" | "user";
  } catch (err) {
    console.error("Error fetching user role from Supabase:", err);
    return null;
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const user = await getSupabaseUser();
    if (!user) return false;
    const role = await fetchSupabaseUserRole(user.id);
    return role === "admin";
  } catch (err) {
    console.error("Error checking current admin status:", err);
    return false;
  }
}

