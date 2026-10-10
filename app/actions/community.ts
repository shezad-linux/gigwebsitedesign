"use server";

/* ==============================================================================
   Community Server Actions
   UI mutation handlers with authentication, validation, rate limiting, and audit logging
   ============================================================================== */

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
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
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

/* ==============================================================================
   Rate Limit Configurations
   ============================================================================== */

const RATE_LIMITS = {
  createPost: { interval: 60_000, uniqueTokenPerInterval: 3 }, // 3 posts per minute
  createReply: { interval: 60_000, uniqueTokenPerInterval: 10 }, // 10 replies per minute
  submitReport: { interval: 60_000, uniqueTokenPerInterval: 5 }, // 5 reports per minute
  moderate: { interval: 60_000, uniqueTokenPerInterval: 30 }, // 30 moderation actions per minute
};

/* ==============================================================================
   Helper: Get Client IP from Headers
   ============================================================================== */

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

/* ==============================================================================
   Helper: Apply Rate Limit
   ============================================================================== */

async function applyRateLimit(action: keyof typeof RATE_LIMITS): Promise<void> {
  const headersList = await headers();
  const ip = getClientIpFromHeaders(headersList);
  const result = checkRateLimit(`community:${action}:${ip}`, RATE_LIMITS[action]);
  if (!result.success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.reset * 1000 - Date.now()) / 1000)} seconds.`);
  }
}

/* ==============================================================================
   Helper: Validate FormData with Zod
   ============================================================================== */

function validateFormData<T extends z.ZodSchema>(schema: T, formData: FormData): z.infer<T> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    if (value instanceof File) {
      // Handle file uploads if needed
      return;
    }
    // Handle repeated keys (arrays)
    if (rawData[key] !== undefined) {
      if (!Array.isArray(rawData[key])) {
        rawData[key] = [rawData[key]];
      }
      rawData[key].push(value);
    } else {
      rawData[key] = value;
    }
  });

  // Convert empty strings to undefined for optional fields
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
    await applyRateLimit("createPost");

    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(createPostSchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    const post = await createPost(supabase, {
      author_id: auth.user.id,
      title: input.title,
      body: input.body,
      link_url: input.link_url || null,
      affiliate_disclosure: input.affiliate_disclosure || null,
    });

    if (post) {
      await auditPostCreate(supabase, post.id, auth.user.email || "unknown", {
        title: post.title,
        hasLink: !!post.link_url,
        hasDisclosure: !!post.affiliate_disclosure,
      });
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

    const post = await updatePost(supabase, postId, auth.user.id, input);

    if (post) {
      await auditPostUpdate(supabase, postId, auth.user.email || "unknown", {
        title: input.title,
        body: input.body,
        link_url: input.link_url,
        affiliate_disclosure: input.affiliate_disclosure,
      });
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
    await applyRateLimit("createReply");

    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(createReplySchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Verify post exists and is published
    const { data: post, error: postError } = await supabase
      .from("community_posts")
      .select("id, status")
      .eq("id", postId)
      .eq("status", "published")
      .single();

    if (postError || !post) {
      return { success: false, error: "Post not found or not published" };
    }

    const reply = await createReply(supabase, {
      post_id: postId,
      author_id: auth.user.id,
      body: input.body,
    });

    if (reply) {
      await auditReplyCreate(supabase, reply.id, auth.user.email || "unknown", postId);
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
   Report Actions
   ============================================================================== */

export async function submitReportAction(formData: FormData) {
  try {
    await applyRateLimit("submitReport");

    const auth = await verifyCommunityAuth();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Authentication required" };
    }

    const input = validateFormData(reportSchema, formData);

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    // Verify target exists
    if (input.post_id) {
      const { error } = await supabase
        .from("community_posts")
        .select("id")
        .eq("id", input.post_id)
        .eq("status", "published")
        .single();
      if (error) {
        return { success: false, error: "Post not found" };
      }
    }
    if (input.reply_id) {
      const { error } = await supabase
        .from("community_replies")
        .select("id")
        .eq("id", input.reply_id)
        .eq("status", "published")
        .single();
      if (error) {
        return { success: false, error: "Reply not found" };
      }
    }

    const report = await submitReport(supabase, {
      reporter_id: auth.user.id,
      post_id: input.post_id,
      reply_id: input.reply_id,
      reason: input.reason,
      details: input.details || null,
    });

    if (report) {
      await auditReportSubmit(supabase, report.id, auth.user.email || "unknown", input.post_id ? "post" : "reply", input.post_id || input.reply_id!, input.reason);
    }

    return { success: true, data: report };
  } catch (error: any) {
    console.error("submitReportAction error:", error);
    // Check for duplicate report error
    if (error.message.includes("already reported")) {
      return { success: false, error: "You have already reported this content" };
    }
    return { success: false, error: error.message || "Failed to submit report" };
  }
}

/* ==============================================================================
   Moderation Actions (require moderator role)
   ============================================================================== */

export async function moderatePostAction(postId: string, action: "hide" | "restore", reason?: string) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const input = validateFormData(moderatePostSchema, new FormData());
    // Manually construct since we're passing action directly
    const moderationAction = action;

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    const post = await moderatePostStatus(supabase, postId, moderationAction === "hide" ? "hidden" : "restored");

    if (post) {
      await auditPostModeration(supabase, postId, auth.user.email || "unknown", moderationAction, reason);
    }

    return { success: true, data: post };
  } catch (error: any) {
    console.error("moderatePostAction error:", error);
    return { success: false, error: error.message || "Failed to moderate post" };
  }
}

export async function moderateReplyAction(replyId: string, action: "hide" | "restore", reason?: string) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    const reply = await moderateReplyStatus(supabase, replyId, action === "hide" ? "hidden" : "restored");

    if (reply) {
      await auditReplyModeration(supabase, replyId, auth.user.email || "unknown", action, reason);
    }

    return { success: true, data: reply };
  } catch (error: any) {
    console.error("moderateReplyAction error:", error);
    return { success: false, error: error.message || "Failed to moderate reply" };
  }
}

export async function resolveReportAction(reportId: string, status: "resolved" | "dismissed", resolutionNotes?: string) {
  try {
    await applyRateLimit("moderate");

    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.reason || "Moderator access required" };
    }

    const input = validateFormData(resolveReportSchema, new FormData());

    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: "Database not configured" };
    }

    const report = await updateReportStatus(supabase, reportId, status, resolutionNotes);

    if (report) {
      await auditReportResolution(supabase, reportId, auth.user.email || "unknown", status, resolutionNotes);
    }

    return { success: true, data: report };
  } catch (error: any) {
    console.error("resolveReportAction error:", error);
    return { success: false, error: error.message || "Failed to resolve report" };
  }
}