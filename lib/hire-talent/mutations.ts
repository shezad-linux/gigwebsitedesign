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
  HireProject,
  HireMilestone,
  HireTimeEntry,
  HireProjectStatus,
  MilestoneStatus,
  TimeEntryStatus,
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
  // Preserve existing verification_status so tamper-proof triggers don't block legitimate profile updates
  const { data: existing } = await supabase
    .from("talent_profiles")
    .select("verification_status")
    .eq("id", userId)
    .maybeSingle();

  const payload: Record<string, any> = {
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
    verification_status: existing?.verification_status || "pending_review",
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
    proposed_hourly_rate: input.proposed_hourly_rate ?? null,
    fixed_price_quote: input.fixed_price_quote ?? null,
    currency: input.currency || "USD",
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

/* ==============================================================================
   Confirmed Projects, Milestones & Time Entries Mutations (Contracts)
   ============================================================================== */

export async function createHireProject(
  supabase: SupabaseClient,
  input: {
    request_id: string;
    proposal_id: string;
    client_id: string;
    talent_id: string;
    title: string;
    hiring_model: "hourly" | "fixed";
    currency?: string;
    agreed_rate?: number | null;
    agreed_budget?: number | null;
    status?: HireProjectStatus;
  }
): Promise<HireProject | null> {
  const payload = {
    request_id: input.request_id,
    proposal_id: input.proposal_id,
    client_id: input.client_id,
    talent_id: input.talent_id,
    title: input.title,
    hiring_model: input.hiring_model,
    currency: input.currency || "USD",
    agreed_rate: input.agreed_rate ?? null,
    agreed_budget: input.agreed_budget ?? null,
    status: input.status || "active",
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hire_projects")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating hire project:", error);
    throw new Error(error.message || "Failed to create hire project");
  }

  return data as HireProject;
}

export async function updateHireProjectStatus(
  supabase: SupabaseClient,
  projectId: string,
  newStatus: HireProjectStatus
): Promise<HireProject | null> {
  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "completed" || newStatus === "cancelled") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("hire_projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Error updating hire project status:", error);
    throw new Error(error.message || "Failed to update project status");
  }

  return data as HireProject;
}

export async function createHireMilestone(
  supabase: SupabaseClient,
  input: {
    project_id: string;
    title: string;
    description?: string | null;
    amount: number;
    currency?: string;
    due_date?: string | null;
    status?: MilestoneStatus;
  }
): Promise<HireMilestone | null> {
  const payload = {
    project_id: input.project_id,
    title: input.title,
    description: input.description || null,
    amount: input.amount,
    currency: input.currency || "USD",
    due_date: input.due_date || null,
    status: input.status || "pending",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("hire_milestones")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error creating milestone:", error);
    throw new Error(error.message || "Failed to create milestone");
  }

  return data as HireMilestone;
}

export async function updateHireMilestoneStatus(
  supabase: SupabaseClient,
  milestoneId: string,
  newStatus: MilestoneStatus
): Promise<HireMilestone | null> {
  const updates: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "approved") {
    updates.approved_at = new Date().toISOString();
  } else if (newStatus === "paid") {
    updates.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("hire_milestones")
    .update(updates)
    .eq("id", milestoneId)
    .select()
    .single();

  if (error) {
    console.error("Error updating milestone status:", error);
    throw new Error(error.message || "Failed to update milestone status");
  }

  return data as HireMilestone;
}

export async function logHireTimeEntry(
  supabase: SupabaseClient,
  talentId: string,
  input: {
    project_id: string;
    hours: number;
    entry_date?: string;
    description: string;
  }
): Promise<HireTimeEntry | null> {
  const payload = {
    project_id: input.project_id,
    talent_id: talentId,
    hours: input.hours,
    entry_date: input.entry_date || new Date().toISOString().slice(0, 10),
    description: input.description,
    status: "logged",
  };

  const { data, error } = await supabase
    .from("hire_time_entries")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error logging time entry:", error);
    throw new Error(error.message || "Failed to log time entry");
  }

  return data as HireTimeEntry;
}

export async function updateHireTimeEntryStatus(
  supabase: SupabaseClient,
  timeEntryId: string,
  newStatus: TimeEntryStatus
): Promise<HireTimeEntry | null> {
  const { data, error } = await supabase
    .from("hire_time_entries")
    .update({ status: newStatus })
    .eq("id", timeEntryId)
    .select()
    .single();

  if (error) {
    console.error("Error updating time entry status:", error);
    throw new Error(error.message || "Failed to update time entry status");
  }

  return data as HireTimeEntry;
}

export async function acceptProposalAndCreateProject(
  supabase: SupabaseClient,
  proposalId: string,
  clientId: string
): Promise<{ project: HireProject; proposal: HireProposal }> {
  // 1. Fetch proposal
  const { data: proposal, error: propErr } = await supabase
    .from("hire_proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (propErr || !proposal) {
    throw new Error("Proposal not found");
  }

  // 2. Fetch request to verify client ownership
  const { data: request, error: reqErr } = await supabase
    .from("hire_requests")
    .select("*")
    .eq("id", proposal.request_id)
    .single();

  if (reqErr || !request) {
    throw new Error("Associated hire request not found");
  }

  if (request.client_id !== clientId) {
    throw new Error("Unauthorized: Only the project owner can accept proposals");
  }

  // 3. Mark accepted proposal
  const { data: updatedProposal, error: updatePropErr } = await supabase
    .from("hire_proposals")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", proposalId)
    .select()
    .single();

  if (updatePropErr) {
    throw new Error("Failed to accept proposal: " + updatePropErr.message);
  }

  // 4. Mark competing proposals as declined
  await supabase
    .from("hire_proposals")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("request_id", request.id)
    .neq("id", proposalId);

  // 5. Update request status to 'in_progress'
  await supabase
    .from("hire_requests")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", request.id);

  // 6. Instantiate confirmed hire project
  const isHourly = request.hiring_model === "hourly";
  const agreedRate = isHourly
    ? (proposal.proposed_hourly_rate ?? proposal.proposed_rate)
    : null;
  const agreedBudget = !isHourly
    ? (proposal.fixed_price_quote ?? proposal.proposed_rate)
    : null;

  const project = await createHireProject(supabase, {
    request_id: request.id,
    proposal_id: proposal.id,
    client_id: clientId,
    talent_id: proposal.talent_id,
    title: request.title,
    hiring_model: request.hiring_model,
    currency: proposal.currency || request.currency || "USD",
    agreed_rate: agreedRate,
    agreed_budget: agreedBudget,
    status: "active",
  });

  if (!project) {
    throw new Error("Failed to instantiate confirmed hire project");
  }

  // 7. Auto-seed milestones if fixed price with deliverables
  const deliverables = (proposal.deliverables && proposal.deliverables.length > 0)
    ? proposal.deliverables
    : (request.fixed_deliverables || []);

  if (!isHourly && deliverables.length > 0 && agreedBudget) {
    const amountPerMilestone = Math.round((agreedBudget / deliverables.length) * 100) / 100;
    for (let i = 0; i < deliverables.length; i++) {
      try {
        await createHireMilestone(supabase, {
          project_id: project.id,
          title: `Milestone ${i + 1}: ${deliverables[i].slice(0, 100)}`,
          description: deliverables[i],
          amount: i === deliverables.length - 1
            ? agreedBudget - (amountPerMilestone * (deliverables.length - 1))
            : amountPerMilestone,
          currency: project.currency,
          status: "pending",
        });
      } catch (mErr) {
        console.warn("Could not seed default milestone:", mErr);
      }
    }
  }

  return { project, proposal: updatedProposal as HireProposal };
}

