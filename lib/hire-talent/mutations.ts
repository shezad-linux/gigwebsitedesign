/* ==============================================================================
   Hire Talent Database Mutations
   Write operations for requests, profiles, matches, proposals, and audit logs
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  HireRequest,
  TalentProfile,
  HireMatch,
  HireProposal,
  HireRequestStatus,
  MatchStatus,
  ProposalStatus,
} from "./types";
import { CreateHireRequestInput, TalentProfileInput, HireProposalInput } from "./validation";

/* ==============================================================================
   Hire Request Mutations
   ============================================================================== */

export async function createHireRequest(
  supabase: SupabaseClient,
  clientId: string,
  input: CreateHireRequestInput,
  isDraft = false
): Promise<HireRequest | null> {
  const payload: Record<string, any> = {
    client_id: clientId,
    title: input.title,
    description: input.description,
    category: input.category,
    hiring_model: input.hiring_model,
    required_skills: input.required_skills,
    experience_level: input.experience_level,
    budget_min: input.budget_min || null,
    budget_max: input.budget_max || null,
    currency: input.currency || "USD",
    expected_start_date: input.expected_start_date || null,
    deadline: input.deadline || null,
    estimated_duration_weeks: input.estimated_duration_weeks || null,
    communication_pref: input.communication_pref || "flexible",
    hourly_hours_per_week: input.hourly_hours_per_week || null,
    hourly_overlap_timezone: input.hourly_overlap_timezone || null,
    fixed_deliverables: input.fixed_deliverables || [],
    revision_rounds: input.revision_rounds !== undefined ? input.revision_rounds : 2,
    status: isDraft ? "draft" : "submitted",
  };

  const { data, error } = await supabase
    .from("hire_requests")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating hire request:", error);
    throw new Error(error.message || "Failed to create hire request");
  }

  return data as HireRequest;
}

export async function updateHireRequestStatus(
  supabase: SupabaseClient,
  requestId: string,
  newStatus: HireRequestStatus,
  internalNotes?: string | null
): Promise<HireRequest | null> {
  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (internalNotes !== undefined) {
    updates.internal_notes = internalNotes;
  }

  const { data, error } = await supabase
    .from("hire_requests")
    .update(updates)
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    console.error("Error updating hire request status:", error);
    throw new Error(error.message || "Failed to update request status");
  }

  return data as HireRequest;
}

/* ==============================================================================
   Talent Profile Mutations
   ============================================================================== */

export async function upsertTalentProfile(
  supabase: SupabaseClient,
  userId: string,
  input: TalentProfileInput
): Promise<TalentProfile | null> {
  const payload = {
    id: userId,
    user_id: userId,
    headline: input.headline,
    bio: input.bio,
    skills: input.skills,
    experience_years: input.experience_years,
    hourly_rate: input.hourly_rate,
    min_project_budget: input.min_project_budget || null,
    availability_status: input.availability_status || "available_now",
    availability_hours_per_week: input.availability_hours_per_week || 40,
    preferred_categories: input.preferred_categories,
    timezone: input.timezone,
    languages: input.languages,
    full_name: input.full_name || null,
    country: input.country || null,
    verification_status: "pending_review", // New submissions await verification
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("talent_profiles")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error upserting talent profile:", error);
    throw new Error(error.message || "Failed to update talent profile");
  }

  return data as TalentProfile;
}

export async function setTalentVerificationStatus(
  supabase: SupabaseClient,
  talentId: string,
  verificationStatus: "unverified" | "pending_review" | "verified" | "suspended"
): Promise<TalentProfile | null> {
  const { data, error } = await supabase
    .from("talent_profiles")
    .update({
      verification_status: verificationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", talentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating talent verification status:", error);
    throw new Error(error.message || "Failed to update talent verification status");
  }

  return data as TalentProfile;
}

/* ==============================================================================
   Admin Matching Mutations
   ============================================================================== */

export async function adminRecommendTalentMatch(
  supabase: SupabaseClient,
  requestId: string,
  talentId: string,
  matchScore: number,
  matchRationale: string,
  sendInvite = true
): Promise<HireMatch | null> {
  const payload = {
    request_id: requestId,
    talent_id: talentId,
    match_score: matchScore,
    match_rationale: matchRationale,
    status: sendInvite ? "invited" : "suggested",
    invited_at: sendInvite ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hire_matches")
    .upsert(payload, { onConflict: "request_id,talent_id" })
    .select()
    .single();

  if (error) {
    console.error("Error creating talent match:", error);
    throw new Error(error.message || "Failed to recommend talent match");
  }

  // When first match is invited, update request status to 'matching' if still under_review
  if (sendInvite) {
    await supabase
      .from("hire_requests")
      .update({ status: "matching", updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .in("status", ["submitted", "under_review"]);
  }

  return data as HireMatch;
}

export async function respondToMatch(
  supabase: SupabaseClient,
  matchId: string,
  talentId: string,
  response: "accepted" | "declined"
): Promise<HireMatch | null> {
  const { data, error } = await supabase
    .from("hire_matches")
    .update({
      status: response,
      responded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .eq("talent_id", talentId)
    .select()
    .single();

  if (error) {
    console.error("Error responding to match:", error);
    throw new Error(error.message || "Failed to respond to match invitation");
  }

  return data as HireMatch;
}

/* ==============================================================================
   Proposal Mutations
   ============================================================================== */

export async function submitHireProposal(
  supabase: SupabaseClient,
  talentId: string,
  input: HireProposalInput
): Promise<HireProposal | null> {
  const payload = {
    request_id: input.request_id,
    talent_id: talentId,
    proposed_rate: input.proposed_rate,
    estimated_hours: input.estimated_hours || null,
    cover_letter: input.cover_letter,
    approach: input.approach,
    deliverables: input.deliverables || [],
    status: "submitted",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hire_proposals")
    .upsert(payload, { onConflict: "request_id,talent_id" })
    .select()
    .single();

  if (error) {
    console.error("Error submitting hire proposal:", error);
    throw new Error(error.message || "Failed to submit proposal");
  }

  // Update request status to 'talent_proposed'
  await supabase
    .from("hire_requests")
    .update({ status: "talent_proposed", updated_at: new Date().toISOString() })
    .eq("id", input.request_id);

  return data as HireProposal;
}

export async function updateHireProposalStatus(
  supabase: SupabaseClient,
  proposalId: string,
  newStatus: ProposalStatus
): Promise<HireProposal | null> {
  const { data, error } = await supabase
    .from("hire_proposals")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposalId)
    .select()
    .single();

  if (error) {
    console.error("Error updating hire proposal status:", error);
    throw new Error(error.message || "Failed to update proposal status");
  }

  // If accepted, update the request status to 'in_progress' or 'client_deciding'
  if (data && newStatus === "accepted") {
    await supabase
      .from("hire_requests")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", data.request_id);
  }

  return data as HireProposal;
}

/* ==============================================================================
   Activity & Audit Log Mutations
   ============================================================================== */

export async function recordHireActivityLog(
  supabase: SupabaseClient,
  event: {
    requestId: string;
    actorId: string;
    actorRole: "client" | "talent" | "admin" | "system";
    action: string;
    notes?: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase.from("hire_activity_log").insert({
      request_id: event.requestId,
      actor_id: event.actorId,
      actor_role: event.actorRole,
      action: event.action,
      notes: event.notes || null,
      metadata: event.metadata || {},
    });

    if (error) {
      console.warn("Could not record hire activity log:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Exception recording hire activity log:", err);
    return false;
  }
}
