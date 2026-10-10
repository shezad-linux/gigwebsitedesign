/* ==============================================================================
   Community Validation Schemas
   Zod schemas matching database constraints and business rules
   ============================================================================== */

import { z } from "zod";

/* ==============================================================================
   URL Validation
   Only allow HTTP/HTTPS URLs, no localhost or private IPs in production
   ============================================================================== */

const urlSchema = z
  .string()
  .url("Must be a valid HTTP/HTTPS URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Only HTTP/HTTPS URLs are allowed" }
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        // Block localhost and private IPs in production
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
          return false;
        }
        // Block private IP ranges
        const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
        if (privateIpRegex.test(hostname)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: "Localhost and private network URLs are not allowed" }
  );

/* ==============================================================================
   Post Schemas
   ============================================================================== */

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(160, "Title must be at most 160 characters")
    .trim(),
  body: z
    .string()
    .min(1, "Body cannot be empty")
    .max(10000, "Body must be at most 10,000 characters")
    .trim(),
  link_url: urlSchema.optional().or(z.literal("")),
  affiliate_disclosure: z
    .string()
    .max(500, "Disclosure must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updatePostSchema = createPostSchema.partial().extend({
  // Status changes only allowed via moderation actions
  status: z.enum(["published", "hidden", "removed"]).optional(),
});

/* ==============================================================================
   Reply Schemas
   ============================================================================== */

export const createReplySchema = z.object({
  body: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(5000, "Reply must be at most 5,000 characters")
    .trim(),
});

/* ==============================================================================
   Report Schemas
   ============================================================================== */

export const reportSchema = z.object({
  post_id: z.string().uuid("Invalid post ID").optional(),
  reply_id: z.string().uuid("Invalid reply ID").optional(),
  reason: z.enum(["spam", "scam", "misleading", "abuse", "other"]),
  details: z
    .string()
    .max(2000, "Details must be at most 2,000 characters")
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => (data.post_id !== undefined) !== (data.reply_id !== undefined),
  {
    message: "Must provide exactly one of post_id or reply_id",
    path: ["post_id"],
  }
);

/* ==============================================================================
   Moderation Schemas
   ============================================================================== */

export const moderatePostSchema = z.object({
  action: z.enum(["hide", "restore"]),
  reason: z.string().max(500).optional(),
});

export const moderateReplySchema = z.object({
  action: z.enum(["hide", "restore"]),
  reason: z.string().max(500).optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  resolution_notes: z.string().max(2000).optional(),
});

/* ==============================================================================
   Feed Query Schemas
   ============================================================================== */

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().max(100).optional(),
});