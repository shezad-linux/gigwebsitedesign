"use server";

/* ==============================================================================
   Hire Talent Server Actions
   Handles project request creation, talent profiles, matching, proposals, and AI scope analysis
   ============================================================================== */

import {
  createClient,
  getAdminClient,
  verifyCommunityAuth,
  verifyModeratorSession,
  getServerUserRole,
} from "@/lib/supabase/server";
import {
  createHireRequestSchema,
  talentProfileSchema,
  hireProposalSchema,
  adminMatchTalentSchema,
  updateRequestStatusSchema,
} from "@/lib/hire-talent/validation";
import {
  createHireRequest,
  updateHireRequestStatus,
  upsertTalentProfile,
  adminRecommendTalentMatch,
  respondToMatch,
  submitHireProposal,
  updateHireProposalStatus,
  recordHireActivityLog,
} from "@/lib/hire-talent/mutations";
import {
  fetchHireRequestById,
  fetchTalentProfileById,
  fetchTalentProfiles,
  fetchAllHireRequestsForAdmin,
} from "@/lib/hire-talent/queries";
import { analyzeProjectScope } from "@/lib/hire-talent/ai-scope";
import { evaluateTalentMatch } from "@/lib/hire-talent/matching";
import { HireRequestStatus, ProposalStatus } from "@/lib/hire-talent/types";

/* ==============================================================================
   Helper: Extract JSON or FormData
   ============================================================================== */

function parseInputData(data: FormData | Record<string, any>): Record<string, any> {
  if (data instanceof FormData) {
    const raw: Record<string, any> = {};
    data.forEach((value, key) => {
      if (value instanceof File) return;
      if (raw[key] !== undefined) {
        if (!Array.isArray(raw[key])) raw[key] = [raw[key]];
        raw[key].push(value);
      } else {
        raw[key] = value;
      }
    });
    return raw;
  }
  return data;
}

/* ==============================================================================
   1. Client Project Request Actions
   ============================================================================== */

export async function createHireRequestAction(inputData: FormData | Record<string, any>) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Please sign in to submit a project request" };
    }

    const raw = parseInputData(inputData);

    // Parse array fields if passed as comma-separated strings or JSON
    if (typeof raw.required_skills === "string") {
      try {
        raw.required_skills = JSON.parse(raw.required_skills);
      } catch {
        raw.required_skills = raw.required_skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (typeof raw.fixed_deliverables === "string") {
      try {
        raw.fixed_deliverables = JSON.parse(raw.fixed_deliverables);
      } catch {
        raw.fixed_deliverables = raw.fixed_deliverables.split("\n").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (raw.budget_min !== undefined && raw.budget_min !== null && raw.budget_min !== "") {
      raw.budget_min = Number(raw.budget_min);
    }
    if (raw.budget_max !== undefined && raw.budget_max !== null && raw.budget_max !== "") {
      raw.budget_max = Number(raw.budget_max);
    }
    if (raw.estimated_duration_weeks) {
      raw.estimated_duration_weeks = Number(raw.estimated_duration_weeks);
    }
    if (raw.hourly_hours_per_week) {
      raw.hourly_hours_per_week = Number(raw.hourly_hours_per_week);
    }
    if (raw.revision_rounds !== undefined) {
      raw.revision_rounds = Number(raw.revision_rounds);
    }

    const validated = createHireRequestSchema.safeParse(raw);
    if (!validated.success) {
      const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError || "Invalid project details" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const isDraft = raw.is_draft === true || raw.is_draft === "true";
    const request = await createHireRequest(effectiveClient, auth.user.id, validated.data, isDraft);

    if (request) {
      await recordHireActivityLog(effectiveClient, {
        requestId: request.id,
        actorId: auth.user.id,
        actorRole: "client",
        action: isDraft ? "client_saved_draft" : "client_submitted_request",
        notes: `Submitted request "${request.title}" (${request.hiring_model.toUpperCase()})`,
      });
    }

    return { success: true, data: request };
  } catch (err: any) {
    console.error("createHireRequestAction error:", err);
    return { success: false, error: err.message || "Failed to submit project request" };
  }
}

/* ==============================================================================
   2. Professional Talent Profile Actions
   ============================================================================== */

export async function saveTalentProfileAction(inputData: FormData | Record<string, any>) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Please sign in to manage your talent profile" };
    }

    const raw = parseInputData(inputData);

    if (typeof raw.skills === "string") {
      try {
        raw.skills = JSON.parse(raw.skills);
      } catch {
        raw.skills = raw.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (typeof raw.languages === "string") {
      try {
        raw.languages = JSON.parse(raw.languages);
      } catch {
        raw.languages = raw.languages.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (typeof raw.preferred_categories === "string") {
      try {
        raw.preferred_categories = JSON.parse(raw.preferred_categories);
      } catch {
        raw.preferred_categories = [raw.preferred_categories];
      }
    }
    if (raw.experience_years !== undefined) raw.experience_years = Number(raw.experience_years);
    if (raw.hourly_rate !== undefined) raw.hourly_rate = Number(raw.hourly_rate);
    if (raw.min_project_budget) raw.min_project_budget = Number(raw.min_project_budget);
    if (raw.availability_hours_per_week) {
      raw.availability_hours_per_week = Number(raw.availability_hours_per_week);
    }

    const validated = talentProfileSchema.safeParse(raw);
    if (!validated.success) {
      const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError || "Invalid talent profile information" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const profile = await upsertTalentProfile(effectiveClient, auth.user.id, validated.data);

    return { success: true, data: profile };
  } catch (err: any) {
    console.error("saveTalentProfileAction error:", err);
    return { success: false, error: err.message || "Failed to save talent profile" };
  }
}

/* ==============================================================================
   3. Matching & Proposal Actions
   ============================================================================== */

export async function adminRecommendTalentAction(inputData: {
  requestId: string;
  talentId: string;
  matchScore?: number;
  matchRationale?: string;
  sendInvite?: boolean;
}) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Administrator permissions required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    // Evaluate match score if rationale not provided
    let score = inputData.matchScore || 85;
    let rationale = inputData.matchRationale;

    if (!rationale) {
      const { request } = await fetchHireRequestById(effectiveClient, inputData.requestId);
      const talent = await fetchTalentProfileById(effectiveClient, inputData.talentId);
      if (request && talent) {
        const evalResult = evaluateTalentMatch(request, talent);
        score = evalResult.score;
        rationale = evalResult.rationale;
      } else {
        rationale = "Recommended by Remotasks.si talent coordinator";
      }
    }

    const match = await adminRecommendTalentMatch(
      effectiveClient,
      inputData.requestId,
      inputData.talentId,
      score,
      rationale || "Direct talent match recommendation",
      inputData.sendInvite !== false
    );

    await recordHireActivityLog(effectiveClient, {
      requestId: inputData.requestId,
      actorId: auth.user.id,
      actorRole: "admin",
      action: "admin_recommended_talent",
      notes: `Matched talent #${inputData.talentId.slice(0, 8)} (Score: ${score}%)`,
      metadata: { talentId: inputData.talentId, score },
    });

    return { success: true, data: match };
  } catch (err: any) {
    console.error("adminRecommendTalentAction error:", err);
    return { success: false, error: err.message || "Failed to recommend talent" };
  }
}

export async function respondToMatchAction(matchId: string, response: "accepted" | "declined") {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const match = await respondToMatch(effectiveClient, matchId, auth.user.id, response);

    if (match) {
      await recordHireActivityLog(effectiveClient, {
        requestId: match.request_id,
        actorId: auth.user.id,
        actorRole: "talent",
        action: response === "accepted" ? "talent_accepted_invitation" : "talent_declined_invitation",
        notes: `Talent ${response} project invitation`,
      });
    }

    return { success: true, data: match };
  } catch (err: any) {
    console.error("respondToMatchAction error:", err);
    return { success: false, error: err.message || "Failed to update match response" };
  }
}

export async function submitHireProposalAction(inputData: FormData | Record<string, any>) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const raw = parseInputData(inputData);
    if (raw.proposed_rate !== undefined) raw.proposed_rate = Number(raw.proposed_rate);
    if (raw.estimated_hours) raw.estimated_hours = Number(raw.estimated_hours);
    if (typeof raw.deliverables === "string") {
      try {
        raw.deliverables = JSON.parse(raw.deliverables);
      } catch {
        raw.deliverables = raw.deliverables.split("\n").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const validated = hireProposalSchema.safeParse(raw);
    if (!validated.success) {
      const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, error: firstError || "Invalid proposal details" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const proposal = await submitHireProposal(effectiveClient, auth.user.id, validated.data);

    if (proposal) {
      await recordHireActivityLog(effectiveClient, {
        requestId: proposal.request_id,
        actorId: auth.user.id,
        actorRole: "talent",
        action: "talent_submitted_proposal",
        notes: `Proposal submitted: $${proposal.proposed_rate}`,
      });
    }

    return { success: true, data: proposal };
  } catch (err: any) {
    console.error("submitHireProposalAction error:", err);
    return { success: false, error: err.message || "Failed to submit proposal" };
  }
}

export async function updateProposalDecisionAction(
  proposalId: string,
  decision: "accepted" | "declined" | "shortlisted"
) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    // Role check: must be admin or client who owns the request
    const role = await getServerUserRole(auth.user.id);
    const isAdmin = role === "admin" || role === "reviewer";

    const { data: proposal } = await effectiveClient
      .from("hire_proposals")
      .select("id, request_id, talent_id")
      .eq("id", proposalId)
      .single();

    if (!proposal) {
      return { success: false, error: "Proposal not found" };
    }

    if (!isAdmin) {
      const { data: req } = await effectiveClient
        .from("hire_requests")
        .select("client_id")
        .eq("id", proposal.request_id)
        .single();

      if (!req || req.client_id !== auth.user.id) {
        return { success: false, error: "Unauthorized: Only the project owner can accept or decline proposals" };
      }
    }

    const updated = await updateHireProposalStatus(effectiveClient, proposalId, decision);

    await recordHireActivityLog(effectiveClient, {
      requestId: proposal.request_id,
      actorId: auth.user.id,
      actorRole: isAdmin ? "admin" : "client",
      action: `client_${decision}_proposal`,
      notes: `Proposal marked as ${decision}`,
    });

    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateProposalDecisionAction error:", err);
    return { success: false, error: err.message || "Failed to update proposal" };
  }
}

export async function adminUpdateRequestStatusAction(
  requestId: string,
  status: HireRequestStatus,
  internalNotes?: string
) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Administrator permissions required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const updated = await updateHireRequestStatus(effectiveClient, requestId, status, internalNotes);

    await recordHireActivityLog(effectiveClient, {
      requestId,
      actorId: auth.user.id,
      actorRole: "admin",
      action: `admin_updated_status_${status}`,
      notes: internalNotes || `Status updated to ${status}`,
    });

    return { success: true, data: updated };
  } catch (err: any) {
    console.error("adminUpdateRequestStatusAction error:", err);
    return { success: false, error: err.message || "Failed to update request status" };
  }
}

/* ==============================================================================
   4. AI Scope Assistant Action
   ============================================================================== */

export async function analyzeProjectScopeAction(
  title: string,
  description: string,
  category?: string
) {
  try {
    const analysis = analyzeProjectScope(title, description, category);
    return { success: true, data: analysis };
  } catch (err: any) {
    console.error("analyzeProjectScopeAction error:", err);
    return { success: false, error: "Failed to analyze project scope" };
  }
}

/* ==============================================================================
   5. Admin Managed Matching Overview Actions
   ============================================================================== */

export async function getAdminHireRequestsOverviewAction(filter?: {
  status?: string;
  category?: string;
}) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Administrator permissions required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const overview = await fetchAllHireRequestsForAdmin(effectiveClient, filter);
    return { success: true, data: overview };
  } catch (err: any) {
    console.error("getAdminHireRequestsOverviewAction error:", err);
    return { success: false, error: err.message || "Failed to load hire requests overview" };
  }
}

export async function getAdminTalentPoolAction(options?: {
  category?: any;
  verifiedOnly?: boolean;
}) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Administrator permissions required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    const talents = await fetchTalentProfiles(effectiveClient, options);
    return { success: true, data: talents };
  } catch (err: any) {
    console.error("getAdminTalentPoolAction error:", err);
    return { success: false, error: err.message || "Failed to load talent pool" };
  }
}

export async function getAdminHireRequestDetailsAction(requestId: string) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Administrator permissions required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const details = await fetchHireRequestById(effectiveClient, requestId);
    return { success: true, data: details };
  } catch (err: any) {
    console.error("getAdminHireRequestDetailsAction error:", err);
    return { success: false, error: err.message || "Failed to load request details" };
  }
}
