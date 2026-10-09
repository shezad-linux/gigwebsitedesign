import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { GigListing, TrackedApplication, ApplicationStatus } from "@/types/gig";
import { UserProfile } from "@/types/profile";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes("your-project-id")
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
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
  const redirectUrl = typeof window !== "undefined" ? window.location.origin : undefined;
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
