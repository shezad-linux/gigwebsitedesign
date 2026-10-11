/* ==============================================================================
   Community Mutations
   Server-side write operations using Supabase client
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import { CommunityPost, CommunityReply, CommunityReport } from "./types";

/* ==============================================================================
   Post Mutations
   ============================================================================== */

export interface CreatePostInput {
  author_id: string;
  title: string;
  body: string;
  link_url?: string | null;
  affiliate_disclosure?: string | null;
  status?: "published" | "hidden" | "removed";
  risk_level?: "low" | "medium" | "high";
  flag_reason?: string | null;
  review_status?: "none" | "needs_review" | "urgent" | "resolved";
}

export async function createPost(
  supabase: SupabaseClient,
  input: CreatePostInput
): Promise<CommunityPost | null> {
  const payload: Record<string, any> = {
    author_id: input.author_id,
    title: input.title,
    body: input.body,
    link_url: input.link_url || null,
    affiliate_disclosure: input.affiliate_disclosure || null,
  };

  if (input.status) payload.status = input.status;
  if (input.risk_level) payload.risk_level = input.risk_level;
  if (input.flag_reason) payload.flag_reason = input.flag_reason;
  if (input.review_status) payload.review_status = input.review_status;

  let result = await supabase
    .from("community_posts")
    .insert(payload)
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  // If column doesn't exist yet in Supabase, retry with base columns
  if (result.error && (result.error.message?.includes("column") || result.error.code === "42703")) {
    const basePayload = {
      author_id: input.author_id,
      title: input.title,
      body: input.body,
      link_url: input.link_url || null,
      affiliate_disclosure: input.affiliate_disclosure || null,
    };
    result = await supabase
      .from("community_posts")
      .insert(basePayload)
      .select(
        `
        id,
        author_id,
        title,
        body,
        link_url,
        affiliate_disclosure,
        status,
        created_at,
        updated_at
      `
      )
      .single();
  }

  const { data, error } = result;

  if (error) {
    console.error("Error creating post:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      throw new Error(
        "Community tables not found in Supabase. Please run supabase/community_schema.sql in your Supabase SQL Editor."
      );
    }
    throw new Error(error.message || "Failed to create post");
  }

  return data;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  link_url?: string | null;
  affiliate_disclosure?: string | null;
}

export async function updatePost(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  input: UpdatePostInput
): Promise<CommunityPost | null> {
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.body !== undefined) updates.body = input.body;
  if (input.link_url !== undefined) updates.link_url = input.link_url;
  if (input.affiliate_disclosure !== undefined) updates.affiliate_disclosure = input.affiliate_disclosure;

  const { data, error } = await supabase
    .from("community_posts")
    .update(updates)
    .eq("id", postId)
    .eq("author_id", userId)
    .eq("status", "published") // Only allow editing published posts
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("Error updating post:", error);
    throw new Error("Failed to update post");
  }

  return data;
}

export async function deletePost(
  supabase: SupabaseClient,
  postId: string,
  userId: string,
  isAdmin = false
): Promise<boolean> {
  let query = supabase.from("community_posts").delete().eq("id", postId);
  if (!isAdmin) {
    query = query.eq("author_id", userId);
  }

  const { error } = await query;

  if (error) {
    console.error("Error deleting post:", error);
    throw new Error(error.message || "Failed to delete post");
  }

  return true;
}

export async function moderatePostStatus(
  supabase: SupabaseClient,
  postId: string,
  status: "hidden" | "restored" | "removed"
): Promise<CommunityPost | null> {
  const newStatus = status === "restored" ? "published" : status;

  const { data, error } = await supabase
    .from("community_posts")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("Error moderating post:", error);
    throw new Error("Failed to moderate post");
  }

  return data;
}

/* ==============================================================================
   Reply Mutations
   ============================================================================== */

export interface CreateReplyInput {
  post_id: string;
  author_id: string;
  body: string;
  status?: "published" | "hidden" | "removed";
  risk_level?: "low" | "medium" | "high";
  flag_reason?: string | null;
  review_status?: "none" | "needs_review" | "urgent" | "resolved";
}

export async function createReply(
  supabase: SupabaseClient,
  input: CreateReplyInput
): Promise<CommunityReply | null> {
  const payload: Record<string, any> = {
    post_id: input.post_id,
    author_id: input.author_id,
    body: input.body,
  };

  if (input.status) payload.status = input.status;
  if (input.risk_level) payload.risk_level = input.risk_level;
  if (input.flag_reason) payload.flag_reason = input.flag_reason;
  if (input.review_status) payload.review_status = input.review_status;

  let result = await supabase
    .from("community_replies")
    .insert(payload)
    .select(
      `
      id,
      post_id,
      author_id,
      body,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  // Retry with basic columns if migration columns not yet applied
  if (result.error && (result.error.message?.includes("column") || result.error.code === "42703")) {
    result = await supabase
      .from("community_replies")
      .insert({
        post_id: input.post_id,
        author_id: input.author_id,
        body: input.body,
      })
      .select(
        `
        id,
        post_id,
        author_id,
        body,
        status,
        created_at,
        updated_at
      `
      )
      .single();
  }

  const { data, error } = result;

  if (error) {
    console.error("Error creating reply:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      throw new Error(
        "Community tables not found in Supabase. Please run supabase/community_schema.sql in your Supabase SQL Editor."
      );
    }
    throw new Error(error.message || "Failed to create reply");
  }

  return data;
}

export async function deleteReply(
  supabase: SupabaseClient,
  replyId: string,
  userId: string,
  isAdmin = false
): Promise<boolean> {
  let query = supabase.from("community_replies").delete().eq("id", replyId);
  if (!isAdmin) {
    query = query.eq("author_id", userId);
  }

  const { error } = await query;

  if (error) {
    console.error("Error deleting reply:", error);
    throw new Error(error.message || "Failed to delete reply");
  }

  return true;
}

export async function moderateReplyStatus(
  supabase: SupabaseClient,
  replyId: string,
  status: "hidden" | "restored" | "removed"
): Promise<CommunityReply | null> {
  const newStatus = status === "restored" ? "published" : status;

  const { data, error } = await supabase
    .from("community_replies")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", replyId)
    .select(
      `
      id,
      post_id,
      author_id,
      body,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("Error moderating reply:", error);
    throw new Error("Failed to moderate reply");
  }

  return data;
}

/* ==============================================================================
   Report Mutations
   ============================================================================== */

export interface SubmitReportInput {
  reporter_id: string;
  post_id?: string;
  reply_id?: string;
  reason: CommunityReport["reason"];
  details?: string | null;
}

export async function submitReport(
  supabase: SupabaseClient,
  input: SubmitReportInput
): Promise<CommunityReport | null> {
  const { data, error } = await supabase
    .from("community_reports")
    .insert({
      reporter_id: input.reporter_id,
      post_id: input.post_id || null,
      reply_id: input.reply_id || null,
      reason: input.reason,
      details: input.details || null,
    })
    .select(
      `
      id,
      reporter_id,
      post_id,
      reply_id,
      reason,
      details,
      status,
      created_at
    `
    )
    .single();

  if (error) {
    // Check for unique constraint violation (duplicate report)
    if (error.code === "23505") {
      throw new Error("You have already reported this content");
    }
    console.error("Error submitting report:", error);
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      throw new Error(
        "Community tables not found in Supabase. Please run supabase/community_schema.sql in your Supabase SQL Editor."
      );
    }
    throw new Error(error.message || "Failed to submit report");
  }

  return data;
}

export async function updateReportStatus(
  supabase: SupabaseClient,
  reportId: string,
  status: "reviewing" | "resolved" | "dismissed",
  resolutionNotes?: string
): Promise<CommunityReport | null> {
  const updates: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "resolved" || status === "dismissed") {
    updates.resolved_at = new Date().toISOString();
  }
  if (resolutionNotes) {
    updates.resolution_notes = resolutionNotes;
  }

  const { data, error } = await supabase
    .from("community_reports")
    .update(updates)
    .eq("id", reportId)
    .select(
      `
      id,
      reporter_id,
      post_id,
      reply_id,
      reason,
      details,
      status,
      created_at
    `
    )
    .single();

  if (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status");
  }

  return data;
}

/* ==============================================================================
   Batch Moderation (for admin console)
   ============================================================================== */

export interface BatchModerationInput {
  postIds?: string[];
  replyIds?: string[];
  action: "hide" | "restore";
}

export async function batchModeratePosts(
  supabase: SupabaseClient,
  postIds: string[],
  action: "hide" | "restore"
): Promise<number> {
  const status = action === "hide" ? "hidden" : "published";

  const { error, count } = await supabase
    .from("community_posts")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", postIds);

  if (error) {
    console.error("Error batch moderating posts:", error);
    throw new Error("Failed to batch moderate posts");
  }

  return count || 0;
}

export async function batchModerateReplies(
  supabase: SupabaseClient,
  replyIds: string[],
  action: "hide" | "restore"
): Promise<number> {
  const status = action === "hide" ? "hidden" : "published";

  const { error, count } = await supabase
    .from("community_replies")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", replyIds);

  if (error) {
    console.error("Error batch moderating replies:", error);
    throw new Error("Failed to batch moderate replies");
  }

  return count || 0;
}

/* ==============================================================================
   Moderation Metadata & Exception State Mutations
   ============================================================================== */

export async function updatePostModerationMetadata(
  supabase: SupabaseClient,
  postId: string,
  updates: {
    status?: "published" | "hidden" | "removed";
    risk_level?: "low" | "medium" | "high";
    flag_reason?: string | null;
    review_status?: "none" | "needs_review" | "urgent" | "resolved";
    report_count?: number;
    report_score?: number;
  }
): Promise<CommunityPost | null> {
  const payload: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("community_posts")
    .update(payload)
    .eq("id", postId)
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("Error updating post moderation metadata:", error);
    // Graceful fallback if specific migration columns don't exist
    if (updates.status) {
      const fallback = await supabase
        .from("community_posts")
        .update({ status: updates.status, updated_at: new Date().toISOString() })
        .eq("id", postId)
        .select()
        .single();
      return fallback.data;
    }
    return null;
  }

  return data;
}

export async function updateReplyModerationMetadata(
  supabase: SupabaseClient,
  replyId: string,
  updates: {
    status?: "published" | "hidden" | "removed";
    risk_level?: "low" | "medium" | "high";
    flag_reason?: string | null;
    review_status?: "none" | "needs_review" | "urgent" | "resolved";
    report_count?: number;
    report_score?: number;
  }
): Promise<CommunityReply | null> {
  const payload: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("community_replies")
    .update(payload)
    .eq("id", replyId)
    .select(
      `
      id,
      post_id,
      author_id,
      body,
      status,
      created_at,
      updated_at
    `
    )
    .single();

  if (error) {
    console.error("Error updating reply moderation metadata:", error);
    if (updates.status) {
      const fallback = await supabase
        .from("community_replies")
        .update({ status: updates.status, updated_at: new Date().toISOString() })
        .eq("id", replyId)
        .select()
        .single();
      return fallback.data;
    }
    return null;
  }

  return data;
}

/* ==============================================================================
   User Restriction Mutations (Suspensions, Warnings, Restorations)
   ============================================================================== */

export async function setUserRestriction(
  supabase: SupabaseClient,
  userId: string,
  status: "active" | "warned" | "restricted" | "suspended",
  reason?: string,
  restrictedUntil?: string | null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("community_user_restrictions")
      .upsert({
        user_id: userId,
        status,
        reason: reason || null,
        restricted_until: restrictedUntil || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("Could not upsert into community_user_restrictions table:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Exception updating user restriction:", err);
    return false;
  }
}

/* ==============================================================================
   Moderation Audit Logging
   ============================================================================== */

export async function recordModerationAuditLog(
  supabase: SupabaseClient,
  event: {
    targetType: "post" | "reply" | "user" | "report";
    targetId: string;
    actorType: "system" | "admin" | "moderator";
    actorId: string;
    action: string;
    riskLevel?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase.from("community_moderation_audit").insert({
      target_type: event.targetType,
      target_id: event.targetId,
      actor_type: event.actorType,
      actor_id: event.actorId,
      action: event.action,
      risk_level: event.riskLevel || null,
      reason: event.reason || null,
      metadata: event.metadata || {},
    });

    if (error) {
      // Fallback: also log to console
      console.info("Moderation audit recorded to fallback log:", event);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Exception recording moderation audit:", err);
    return false;
  }
}