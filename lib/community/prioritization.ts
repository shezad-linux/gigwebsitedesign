/* ==============================================================================
   Community Moderation Prioritization & Progressive Rate Limiting
   - Computes weighted report priority scores without duplicate inflation
   - Escalates items to "urgent" when report score or volume crosses threshold
   - Enforces progressive rate limits for new vs established accounts
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import { CommunityReportReason } from "./types";
import { checkRateLimit, RateLimitResult } from "@/lib/rate-limit";

// Weighting model for community reports
export const REPORT_REASON_WEIGHTS: Record<CommunityReportReason, number> = {
  scam: 3.0,
  abuse: 3.0,
  misleading: 2.0,
  spam: 1.5,
  other: 1.0,
};

// Thresholds for exception queue prioritization
export const REPORT_THRESHOLDS = {
  NEEDS_REVIEW_COUNT: 1, // 1 report -> needs review
  URGENT_REPORT_COUNT: 3, // 3 distinct reports -> escalated to urgent queue
  URGENT_SCORE_THRESHOLD: 5.0, // Cumulative weighted score >= 5.0 -> urgent
  AUTO_HIDE_SCORE_THRESHOLD: 8.0, // High severity (e.g. multiple scam reports) -> temporary auto-hide
};

export interface ReportScoreResult {
  reportCount: number;
  reportScore: number;
  isUrgent: boolean;
  shouldAutoHide: boolean;
  topReasons: string[];
}

/**
 * Calculates cumulative priority score and urgency for a set of unique reports
 */
export function calculateReportPriority(reports: Array<{ reason: CommunityReportReason }>): ReportScoreResult {
  const reportCount = reports.length;
  let reportScore = 0;
  const reasonCounts: Record<string, number> = {};

  for (const r of reports) {
    const weight = REPORT_REASON_WEIGHTS[r.reason] ?? 1.0;
    reportScore += weight;
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  }

  const isUrgent =
    reportCount >= REPORT_THRESHOLDS.URGENT_REPORT_COUNT ||
    reportScore >= REPORT_THRESHOLDS.URGENT_SCORE_THRESHOLD;

  const shouldAutoHide = reportScore >= REPORT_THRESHOLDS.AUTO_HIDE_SCORE_THRESHOLD;

  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => `${reason} (${count})`);

  return {
    reportCount,
    reportScore: Math.round(reportScore * 10) / 10,
    isUrgent,
    shouldAutoHide,
    topReasons,
  };
}

/**
 * Progressive rate limit configurations:
 * Stricter limits for new accounts (< 24 hours old); higher limits for established users.
 */
export function getProgressiveRateLimits(accountAgeHours: number, postCount: number) {
  const isNewAccount = accountAgeHours < 24 || postCount < 2;

  if (isNewAccount) {
    return {
      isNewAccount: true,
      createPost: { interval: 300_000, uniqueTokenPerInterval: 1 }, // 1 post per 5 minutes
      createReply: { interval: 60_000, uniqueTokenPerInterval: 2 },  // 2 replies per minute
      submitReport: { interval: 60_000, uniqueTokenPerInterval: 3 }, // 3 reports per minute
    };
  }

  return {
    isNewAccount: false,
    createPost: { interval: 60_000, uniqueTokenPerInterval: 3 },   // 3 posts per minute
    createReply: { interval: 60_000, uniqueTokenPerInterval: 10 }, // 10 replies per minute
    submitReport: { interval: 60_000, uniqueTokenPerInterval: 5 }, // 5 reports per minute
  };
}

/**
 * Checks progressive rate limit for a user
 */
export function checkUserProgressiveLimit(
  userId: string,
  action: "createPost" | "createReply" | "submitReport",
  accountAgeHours: number,
  postCount: number
): RateLimitResult {
  const limits = getProgressiveRateLimits(accountAgeHours, postCount);
  const config = limits[action];
  const identifier = `community:prog:${action}:${userId}`;
  return checkRateLimit(identifier, config);
}

/**
 * Checks if a user has an active restriction or suspension
 */
export async function checkUserRestriction(
  supabase: SupabaseClient,
  userId: string
): Promise<{ isRestricted: boolean; status?: string; reason?: string }> {
  try {
    const { data, error } = await supabase
      .from("community_user_restrictions")
      .select("status, reason, restricted_until")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return { isRestricted: false };
    }

    if (data.status === "suspended" || data.status === "restricted") {
      // Check if temporary restriction has expired
      if (data.restricted_until) {
        const expiresAt = new Date(data.restricted_until).getTime();
        if (Date.now() > expiresAt) {
          return { isRestricted: false };
        }
      }

      return {
        isRestricted: true,
        status: data.status,
        reason: data.reason || "Account restricted due to community policy violations.",
      };
    }

    return { isRestricted: false };
  } catch (err) {
    console.warn("Exception checking user restriction:", err);
    return { isRestricted: false };
  }
}
