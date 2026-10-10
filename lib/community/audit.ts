/* ==============================================================================
   Community Audit
   Helper functions for recording audit events for moderation actions
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import { AuditEventInput } from "./types";

/* ==============================================================================
   Sanitize sensitive data from audit changes
   ============================================================================== */

function sanitizeAuditChanges(
  changes: Record<string, { before: any; after: any }>
): Record<string, { before: any; after: any }> {
  const sanitized: Record<string, { before: any; after: any }> = {};
  for (const [key, val] of Object.entries(changes)) {
    if (/password|token|secret|key|authorization|cookie|session|email/i.test(key)) {
      sanitized[key] = { before: "[REDACTED]", after: "[REDACTED]" };
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/* ==============================================================================
   Record Community Audit Event
   Uses the existing audit_events table from Phase 4
   ============================================================================== */

export async function recordCommunityAuditEvent(
  supabase: SupabaseClient,
  event: AuditEventInput
): Promise<boolean> {
  try {
    const payload = {
      entity_type: event.entityType,
      entity_id: event.entityId,
      actor_email: event.actorEmail,
      action: event.action,
      changes: sanitizeAuditChanges(event.changes || {}),
      justification: event.justification,
    };

    const { error } = await supabase.from("audit_events").insert(payload);

    if (error) {
      console.error("Error recording community audit event:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception recording community audit event:", err);
    return false;
  }
}

/* ==============================================================================
   Convenience helpers for common audit actions
   ============================================================================== */

export async function auditPostCreate(
  supabase: SupabaseClient,
  postId: string,
  actorEmail: string,
  postData: { title: string; hasLink: boolean; hasDisclosure: boolean }
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_post",
    entityId: postId,
    actorEmail,
    action: "create",
    changes: {
      title: { before: null, after: postData.title },
      has_link: { before: null, after: postData.hasLink },
      has_disclosure: { before: null, after: postData.hasDisclosure },
    },
    justification: "User created community post",
  });
}

export async function auditPostUpdate(
  supabase: SupabaseClient,
  postId: string,
  actorEmail: string,
  changes: { title?: string; body?: string; link_url?: string | null; affiliate_disclosure?: string | null },
  justification?: string
): Promise<void> {
  const changeEntries: Record<string, { before: any; after: any }> = {};

  for (const [key, newValue] of Object.entries(changes)) {
    if (newValue !== undefined) {
      changeEntries[key] = { before: "previous_value", after: newValue };
    }
  }

  if (Object.keys(changeEntries).length > 0) {
    await recordCommunityAuditEvent(supabase, {
      entityType: "community_post",
      entityId: postId,
      actorEmail,
      action: "update",
      changes: changeEntries,
      justification: justification || "User updated their post",
    });
  }
}

export async function auditPostModeration(
  supabase: SupabaseClient,
  postId: string,
  actorEmail: string,
  action: "hide" | "restore" | "remove",
  reason?: string
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_post",
    entityId: postId,
    actorEmail,
    action: action === "restore" ? "restore" : action,
    changes: {
      status: {
        before: action === "restore" ? "hidden" : "published",
        after: action === "restore" ? "published" : action,
      },
    },
    justification: reason || `Moderator ${action}d post`,
  });
}

export async function auditReplyCreate(
  supabase: SupabaseClient,
  replyId: string,
  actorEmail: string,
  postId: string
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_reply",
    entityId: replyId,
    actorEmail,
    action: "create",
    changes: {
      post_id: { before: null, after: postId },
    },
    justification: "User replied to community post",
  });
}

export async function auditReplyModeration(
  supabase: SupabaseClient,
  replyId: string,
  actorEmail: string,
  action: "hide" | "restore" | "remove",
  reason?: string
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_reply",
    entityId: replyId,
    actorEmail,
    action: action === "restore" ? "restore" : action,
    changes: {
      status: {
        before: action === "restore" ? "hidden" : "published",
        after: action === "restore" ? "published" : action,
      },
    },
    justification: reason || `Moderator ${action}d reply`,
  });
}

export async function auditReportSubmit(
  supabase: SupabaseClient,
  reportId: string,
  actorEmail: string,
  targetType: "post" | "reply",
  targetId: string,
  reason: string
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_report",
    entityId: reportId,
    actorEmail,
    action: "report",
    changes: {
      target_type: { before: null, after: targetType },
      target_id: { before: null, after: targetId },
      reason: { before: null, after: reason },
    },
    justification: `User reported ${targetType} for ${reason}`,
  });
}

export async function auditReportResolution(
  supabase: SupabaseClient,
  reportId: string,
  actorEmail: string,
  status: "resolved" | "dismissed",
  resolutionNotes?: string
): Promise<void> {
  await recordCommunityAuditEvent(supabase, {
    entityType: "community_report",
    entityId: reportId,
    actorEmail,
    action: status === "resolved" ? "resolve_report" : "dismiss_report",
    changes: {
      status: { before: "open", after: status },
      resolution_notes: { before: null, after: resolutionNotes || "" },
    },
    justification: resolutionNotes || `Moderator ${status} report`,
  });
}