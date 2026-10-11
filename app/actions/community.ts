"use server";

/* ==============================================================================
   Community Server Actions
   UI mutation handlers with automated screening, 3-tier risk moderation,
   progressive rate limiting, user restrictions, and audit logging
   ============================================================================== */

import { headers } from "next/headers";
import {
  createClient,
  getAdminClient,
  verifyCommunityAuth,
  verifyModeratorSession,
} from "@/lib/supabase/server";
import {
  createPostSchema,
  updatePostSchema,
  createReplySchema,
  reportSchema,
  moderatePostSchema,
  moderateReplySchema,
  resolveReportSchema,
} from "@/lib/community/validation";
import {
  createPost,
  updatePost,
  deletePost,
  moderatePostStatus,
  createReply,
  deleteReply,
  moderateReplyStatus,
  submitReport,
  updateReportStatus,
  updatePostModerationMetadata,
  updateReplyModerationMetadata,
  setUserRestriction,
  recordModerationAuditLog,
} from "@/lib/community/mutations";
import {
  auditPostCreate,
  auditPostUpdate,
  auditPostModeration,
  auditReplyCreate,
  auditReplyModeration,
  auditReportSubmit,
  auditReportResolution,
} from "@/lib/community/audit";
import { screenContent } from "@/lib/community/screening";
import {
  calculateReportPriority,
  checkUserProgressiveLimit,
  checkUserRestriction,
} from "@/lib/community/prioritization";
import {
  fetchAuthorPostHistory,
  fetchCommunityModerationOverview,
} from "@/lib/community/queries";
import {
  sendModerationUrgentAlert,
  sendDailyModerationSummary,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

/* ==============================================================================
   Standard Rate Limit Configurations (Fallback)
   ============================================================================== */

const RATE_LIMITS = {
  moderate: { interval: 60_000, uniqueTokenPerInterval: 30 }, // 30 moderation actions per minute
};

function getClientIpFromHeaders(headersList: Awaited<ReturnType<typeof headers>>): string {
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfIp = headersList.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }
  return "anonymous-client";
}

async function applyRateLimit(action: keyof typeof RATE_LIMITS): Promise<void> {
  const headersList = await headers();
  const ip = getClientIpFromHeaders(headersList);
  const result = checkRateLimit(`community:${action}:${ip}`, RATE_LIMITS[action]);
  if (!result.success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.reset * 1000 - Date.now()) / 1000)} seconds.`);
  }
}

function validateFormData<T extends z.ZodSchema>(schema: T, formData: FormData): z.infer<T> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (value instanceof File) return;
    if (rawData[key] !== undefined) {
      if (!Array.isArray(rawData[key])) {
        rawData[key] = [rawData[key]];
      }
      rawData[key].push(value);
    } else {
      rawData[key] = value;
    }
  });

  for (const key of Object.keys(rawData)) {
    if (rawData[key] === "") {
      rawData[key] = undefined;
    }
  }

  const result = schema.safeParse(rawData);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
    throw new Error(firstError);
  }

  return result.data;
}

/* ==============================================================================
   Post Actions
   ============================================================================== */

export async function createPostAction(formData: FormData) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(createPostSchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // 1. Check user restriction (suspension / warning)
    const restriction = await checkUserRestriction(supabase, auth.user.id);
    if (restriction.isRestricted) {
      return {
        success: false,
        error: `Your account is currently ${restriction.status}: ${restriction.reason || "Community policy violation."}`,
      };
    }

    // 2. Fetch author reputation & post history for progressive rate limits & duplicate checks
    const authorHistory = await fetchAuthorPostHistory(supabase, auth.user.id);

    // 3. Enforce progressive rate limits (stricter for accounts < 24h old)
    const limitCheck = checkUserProgressiveLimit(
      auth.user.id,
      "createPost",
      authorHistory.accountAgeHours,
      authorHistory.totalPublishedPosts
    );
    if (!limitCheck.success) {
      const remainingSeconds = Math.max(1, Math.ceil((limitCheck.reset * 1000 - Date.now()) / 1000));
      return {
        success: false,
        error: `Posting rate limit reached. Please wait ${remainingSeconds} seconds before publishing another post.`,
      };
    }

    // 4. Run automated content screening across 3 risk levels
    const screen = screenContent({
      title: input.title,
      body: input.body,
      link_url: input.link_url || null,
      affiliate_disclosure: input.affiliate_disclosure || null,
      authorPostHistory: authorHistory,
    });

    // Determine initial publication status:
    // High risk -> auto-hide immediately
    // Medium / Low risk -> publish immediately without pre-approval
    const targetStatus = screen.autoHide ? "hidden" : "published";

    let post = null;
    const effectiveClient = getAdminClient() || supabase;

    try {
      post = await createPost(effectiveClient, {
        author_id: auth.user.id,
        title: input.title,
        body: input.body,
        link_url: input.link_url || null,
        affiliate_disclosure: input.affiliate_disclosure || null,
        status: targetStatus,
        risk_level: screen.riskLevel,
        flag_reason: screen.reasons.length > 0 ? screen.reasons.join("; ") : null,
        review_status: screen.reviewStatus,
      });
    } catch (err: any) {
      console.error("Failed to insert post via primary client, attempting fallback:", err);
      throw err;
    }

    if (post) {
      // Record audit event
      await auditPostCreate(effectiveClient, post.id, auth.user.email || "unknown", {
        title: post.title,
        hasLink: !!post.link_url,
        hasDisclosure: !!post.affiliate_disclosure,
      });

      // Record system moderation audit if flagged or auto-hidden
      if (screen.riskLevel === "high") {
        await recordModerationAuditLog(effectiveClient, {
          targetType: "post",
          targetId: post.id,
          actorType: "system",
          actorId: "automated-screening",
          action: "auto_hide_threat",
          riskLevel: "high",
          reason: screen.reasons.join("; "),
          metadata: { matchedRules: screen.matchedRules },
        });

        // Trigger urgent email alert to administrator via Resend
        await sendModerationUrgentAlert({
          incidentType: "high_risk_auto_hidden",
          targetType: "post",
          targetId: post.id,
          targetTitle: post.title,
          authorId: auth.user.id,
          authorEmail: auth.user.email,
          riskLevel: "high",
          reasons: screen.reasons,
        }).catch((e) => console.warn("Failed sending urgent alert email:", e));
      } else if (screen.riskLevel === "medium") {
        await recordModerationAuditLog(effectiveClient, {
          targetType: "post",
          targetId: post.id,
          actorType: "system",
          actorId: "automated-screening",
          action: "auto_flag_review",
          riskLevel: "medium",
          reason: screen.reasons.join("; "),
          metadata: { matchedRules: screen.matchedRules },
        });
      }
    }

    if (screen.autoHide) {
      return {
        success: true,
        data: post,
        warning:
          "Your post was received but has been temporarily isolated for security review due to automated filter flags.",
      };
    }

    return { success: true, data: post };
  } catch (error: any) {
    console.error("createPostAction error:", error);
    return { success: false, error: error.message || "Failed to create post" };
  }
}

export async function updatePostAction(postId: string, formData: FormData) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(updatePostSchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Check user restriction
    const restriction = await checkUserRestriction(supabase, auth.user.id);
    if (restriction.isRestricted) {
      return { success: false, error: "Account is restricted from modifying content" };
    }

    const post = await updatePost(supabase, postId, auth.user.id, input);

    if (post) {
      await auditPostUpdate(supabase, postId, auth.user.email || "unknown", {
        title: input.title,
        body: input.body,
        link_url: input.link_url,
        affiliate_disclosure: input.affiliate_disclosure,
      });

      // Re-screen edited content
      const screen = screenContent({
        title: post.title,
        body: post.body,
        link_url: post.link_url,
        affiliate_disclosure: post.affiliate_disclosure,
      });

      if (screen.riskLevel === "high") {
        const effectiveClient = getAdminClient() || supabase;
        await updatePostModerationMetadata(effectiveClient, postId, {
          status: "hidden",
          risk_level: "high",
          flag_reason: screen.reasons.join("; "),
          review_status: "urgent",
        });
      }
    }

    return { success: true, data: post };
  } catch (error: any) {
    console.error("updatePostAction error:", error);
    return { success: false, error: error.message || "Failed to update post" };
  }
}

export async function deletePostAction(postId: string) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    await deletePost(supabase, postId, auth.user.id);

    return { success: true };
  } catch (error: any) {
    console.error("deletePostAction error:", error);
    return { success: false, error: error.message || "Failed to delete post" };
  }
}

/* ==============================================================================
   Reply Actions
   ============================================================================== */

export async function createReplyAction(postId: string, formData: FormData) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(createReplySchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Check user restriction
    const restriction = await checkUserRestriction(supabase, auth.user.id);
    if (restriction.isRestricted) {
      return {
        success: false,
        error: `Your account is currently ${restriction.status}: ${restriction.reason || "Posting restricted."}`,
      };
    }

    // Progressive rate limit for replies
    const authorHistory = await fetchAuthorPostHistory(supabase, auth.user.id);
    const limitCheck = checkUserProgressiveLimit(
      auth.user.id,
      "createReply",
      authorHistory.accountAgeHours,
      authorHistory.totalPublishedPosts
    );
    if (!limitCheck.success) {
      return { success: false, error: "Reply rate limit reached. Please wait a moment." };
    }

    // Verify post exists and is published
    const { data: parentPost, error: postError } = await supabase
      .from("community_posts")
      .select("id, status")
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !parentPost) {
      return { success: false, error: "Post not found or not published" };
    }

    // Screen reply text
    const screen = screenContent({
      title: "Reply",
      body: input.body,
    });

    const targetStatus = screen.autoHide ? "hidden" : "published";
    const effectiveClient = getAdminClient() || supabase;

    let reply = null;
    try {
      reply = await createReply(effectiveClient, {
        post_id: postId,
        author_id: auth.user.id,
        body: input.body,
        status: targetStatus,
        risk_level: screen.riskLevel,
        flag_reason: screen.reasons.length > 0 ? screen.reasons.join("; ") : null,
        review_status: screen.reviewStatus,
      });
    } catch (err: any) {
      throw err;
    }

    if (reply) {
      await auditReplyCreate(effectiveClient, reply.id, auth.user.email || "unknown", postId);

      if (screen.riskLevel === "high") {
        await recordModerationAuditLog(effectiveClient, {
          targetType: "reply",
          targetId: reply.id,
          actorType: "system",
          actorId: "automated-screening",
          action: "auto_hide_threat",
          riskLevel: "high",
          reason: screen.reasons.join("; "),
        });
      }
    }

    return { success: true, data: reply };
  } catch (error: any) {
    console.error("createReplyAction error:", error);
    return { success: false, error: error.message || "Failed to create reply" };
  }
}

export async function deleteReplyAction(replyId: string) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    await deleteReply(supabase, replyId, auth.user.id);

    return { success: true };
  } catch (error: any) {
    console.error("deleteReplyAction error:", error);
    return { success: false, error: error.message || "Failed to delete reply" };
  }
}

/* ==============================================================================
   Report Actions & Duplicate Prevention
   ============================================================================== */

export async function submitReportAction(formData: FormData) {
  try {
    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(reportSchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Progressive rate limit for reports
    const authorHistory = await fetchAuthorPostHistory(supabase, auth.user.id);
    const limitCheck = checkUserProgressiveLimit(
      auth.user.id,
      "submitReport",
      authorHistory.accountAgeHours,
      authorHistory.totalPublishedPosts
    );
    if (!limitCheck.success) {
      return { success: false, error: "Too many reports submitted. Please wait before submitting another report." };
    }

    const effectiveClient = getAdminClient() || supabase;

    let report = null;
    try {
      report = await submitReport(effectiveClient, {
        reporter_id: auth.user.id,
        post_id: input.post_id,
        reply_id: input.reply_id,
        reason: input.reason,
        details: input.details || null,
      });
    } catch (err: any) {
      if (err.message?.includes("already reported") || err.code === "23505") {
        return { success: false, error: "You have already reported this content" };
      }
      throw err;
    }

    if (report && input.post_id) {
      await auditReportSubmit(effectiveClient, report.id, auth.user.email || "unknown", "post", input.post_id, input.reason);

      // Re-evaluate cumulative report priority score for this post
      const { data: allReports } = await effectiveClient
        .from("community_reports")
        .select("reason")
        .eq("post_id", input.post_id);

      const priorityResult = calculateReportPriority(allReports || []);

      // If report score or volume triggers urgency, escalate in exception queue
      if (priorityResult.isUrgent) {
        await updatePostModerationMetadata(effectiveClient, input.post_id, {
          review_status: "urgent",
          report_count: priorityResult.reportCount,
          report_score: priorityResult.reportScore,
          status: priorityResult.shouldAutoHide ? "hidden" : undefined,
        });

        await recordModerationAuditLog(effectiveClient, {
          targetType: "post",
          targetId: input.post_id,
          actorType: "system",
          actorId: "report-prioritizer",
          action: "auto_escalate_report",
          reason: `Escalated to Urgent Queue: ${priorityResult.reportCount} reports (Score: ${priorityResult.reportScore})`,
        });

        // Trigger urgent alert to admin
        await sendModerationUrgentAlert({
          incidentType: "report_threshold_exceeded",
          targetType: "post",
          targetId: input.post_id,
          targetTitle: "Community Post with Multiple Reports",
          authorId: "multiple_reporters",
          riskLevel: "urgent",
          reasons: priorityResult.topReasons,
          reportCount: priorityResult.reportCount,
          reportScore: priorityResult.reportScore,
        }).catch((e) => console.warn("Failed sending report threshold alert:", e));
      }
    }

    return { success: true, data: report };
  } catch (error: any) {
    console.error("submitReportAction error:", error);
    if (error.message?.includes("already reported")) {
      return { success: false, error: "You have already reported this content" };
    }
    return { success: false, error: error.message || "Failed to submit report" };
  }
}

/* ==============================================================================
   Admin / Moderator Exception Dashboard Actions
   ============================================================================== */

export async function getCommunityModerationOverviewAction() {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const overview = await fetchCommunityModerationOverview(effectiveClient);
    return { success: true, data: overview };
  } catch (error: any) {
    console.error("getCommunityModerationOverviewAction error:", error);
    return { success: false, error: error.message || "Failed to fetch moderation overview" };
  }
}

export async function moderateCommunityPostAction(
  postId: string,
  action: "hide" | "restore" | "approve",
  reason?: string
) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    let updatedPost = null;
    if (action === "hide") {
      updatedPost = await updatePostModerationMetadata(effectiveClient, postId, {
        status: "hidden",
        review_status: "resolved",
        flag_reason: reason || "Hidden by moderator",
      });
      await recordModerationAuditLog(effectiveClient, {
        targetType: "post",
        targetId: postId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: "admin_hide",
        reason: reason || "Content hidden by administrator",
      });
    } else if (action === "restore" || action === "approve") {
      updatedPost = await updatePostModerationMetadata(effectiveClient, postId, {
        status: "published",
        review_status: "resolved",
        risk_level: "low",
        flag_reason: null,
      });
      await recordModerationAuditLog(effectiveClient, {
        targetType: "post",
        targetId: postId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: action === "restore" ? "admin_restore" : "admin_approve",
        reason: reason || "Approved / restored by administrator",
      });
    }

    return { success: true, data: updatedPost };
  } catch (error: any) {
    console.error("moderateCommunityPostAction error:", error);
    return { success: false, error: error.message || "Failed to moderate post" };
  }
}

export async function moderateCommunityReplyAction(
  replyId: string,
  action: "hide" | "restore" | "approve",
  reason?: string
) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    let updatedReply = null;
    if (action === "hide") {
      updatedReply = await updateReplyModerationMetadata(effectiveClient, replyId, {
        status: "hidden",
        review_status: "resolved",
        flag_reason: reason || "Hidden by moderator",
      });
      await recordModerationAuditLog(effectiveClient, {
        targetType: "reply",
        targetId: replyId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: "admin_hide_reply",
        reason,
      });
    } else {
      updatedReply = await updateReplyModerationMetadata(effectiveClient, replyId, {
        status: "published",
        review_status: "resolved",
        risk_level: "low",
      });
      await recordModerationAuditLog(effectiveClient, {
        targetType: "reply",
        targetId: replyId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: "admin_restore_reply",
        reason,
      });
    }

    return { success: true, data: updatedReply };
  } catch (error: any) {
    console.error("moderateCommunityReplyAction error:", error);
    return { success: false, error: error.message || "Failed to moderate reply" };
  }
}

export async function resolveCommunityReportAction(
  reportId: string,
  status: "resolved" | "dismissed",
  resolutionNotes?: string
) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const report = await updateReportStatus(effectiveClient, reportId, status, resolutionNotes);

    if (report) {
      await auditReportResolution(effectiveClient, reportId, auth.user.email || "unknown", status, resolutionNotes);
      await recordModerationAuditLog(effectiveClient, {
        targetType: "report",
        targetId: reportId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: status === "resolved" ? "admin_resolve_report" : "admin_dismiss_report",
        reason: resolutionNotes,
      });
    }

    return { success: true, data: report };
  } catch (error: any) {
    console.error("resolveCommunityReportAction error:", error);
    return { success: false, error: error.message || "Failed to resolve report" };
  }
}

export async function restrictCommunityUserAction(
  userId: string,
  status: "active" | "warned" | "restricted" | "suspended",
  reason?: string,
  durationHours?: number
) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const restrictedUntil = durationHours
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      : null;

    const ok = await setUserRestriction(effectiveClient, userId, status, reason, restrictedUntil);

    if (ok) {
      await recordModerationAuditLog(effectiveClient, {
        targetType: "user",
        targetId: userId,
        actorType: "admin",
        actorId: auth.user.email || auth.user.id,
        action: `admin_user_${status}`,
        reason,
        metadata: { durationHours, restrictedUntil },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("restrictCommunityUserAction error:", error);
    return { success: false, error: error.message || "Failed to update user restriction" };
  }
}

export async function sendDailySummaryEmailAction() {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const effectiveClient = getAdminClient() || createClient();
    if (!effectiveClient) {
      return { success: false, error: "Database not configured" };
    }

    const overview = await fetchCommunityModerationOverview(effectiveClient);
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const emailResult = await sendDailyModerationSummary({
      summaryDate: dateStr,
      totalPosts: overview.dailyMetrics.totalPostsToday,
      autoHiddenCount: overview.dailyMetrics.autoHiddenThreats,
      flaggedCount: overview.dailyMetrics.needsReviewCount,
      openReports: overview.dailyMetrics.openReportsCount,
      resolvedReports: overview.dailyMetrics.resolvedReportsCount,
      activeSuspensions: overview.dailyMetrics.activeSuspensionsCount,
      falsePositiveCount: overview.dailyMetrics.falsePositivesCount,
      averageTurnaroundMinutes: overview.dailyMetrics.averageTurnaroundMinutes,
      recipient: auth.user.email || undefined,
    });

    return { success: true, emailResult };
  } catch (error: any) {
    console.error("sendDailySummaryEmailAction error:", error);
    return { success: false, error: error.message || "Failed to send summary email" };
  }
}

// Backward compatibility exports for component handlers
export const moderatePostAction = moderateCommunityPostAction;
export const moderateReplyAction = moderateCommunityReplyAction;
export const resolveReportAction = resolveCommunityReportAction;