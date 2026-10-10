/* ==============================================================================
   Community Types
   TypeScript interfaces matching the database schema
   ============================================================================== */

import { z } from "zod";
import {
  createPostSchema,
  updatePostSchema,
  createReplySchema,
  reportSchema,
  moderatePostSchema,
  moderateReplySchema,
  resolveReportSchema,
  feedQuerySchema,
} from "./validation";

export type CommunityPostStatus = "published" | "hidden" | "removed";
export type CommunityReplyStatus = "published" | "hidden" | "removed";
export type CommunityReportReason = "spam" | "scam" | "misleading" | "abuse" | "other";
export type CommunityReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

// Inferred types from Zod schemas
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ModeratePostInput = z.infer<typeof moderatePostSchema>;
export type ModerateReplyInput = z.infer<typeof moderateReplySchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type FeedQueryInput = z.infer<typeof feedQuerySchema>;

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name?: string;
  author_country?: string;
  title: string;
  body: string;
  link_url: string | null;
  affiliate_disclosure: string | null;
  status: CommunityPostStatus;
  created_at: string;
  updated_at: string;
  reply_count?: number;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name?: string;
  author_country?: string;
  body: string;
  status: CommunityReplyStatus;
  created_at: string;
  updated_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  post_id: string | null;
  reply_id: string | null;
  reason: CommunityReportReason;
  details: string | null;
  status: CommunityReportStatus;
  created_at: string;
  post_title?: string;
  reply_body?: string;
}

export interface PostWithReplies {
  post: CommunityPost;
  replies: CommunityReply[];
}

export interface CommunityFeedParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface CommunityFeedResult {
  posts: CommunityPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ModerationAction {
  type: "hide_post" | "restore_post" | "hide_reply" | "restore_reply" | "resolve_report" | "dismiss_report";
  targetId: string;
  reason?: string;
}

export interface AuditEventInput {
  entityType: "community_post" | "community_reply" | "community_report";
  entityId: string;
  actorEmail: string;
  action: "create" | "update" | "hide" | "restore" | "delete" | "report" | "resolve_report" | "dismiss_report" | "remove";
  changes: Record<string, { before: any; after: any }>;
  justification?: string;
}