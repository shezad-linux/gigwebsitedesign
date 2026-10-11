/* ==============================================================================
   Hire Talent Zod Validation Schemas
   Server-side validation for requests, profiles, proposals, and matching
   ============================================================================== */

import { z } from "zod";

export const hireServiceCategoryEnum = z.enum([
  "software-web",
  "mobile-apps",
  "ui-ux-design",
  "digital-marketing",
  "ai-automation",
  "qa-testing-consulting",
]);

export const hiringModelEnum = z.enum(["hourly", "fixed"]);
export const experienceLevelEnum = z.enum(["entry", "intermediate", "expert"]);
export const communicationPrefEnum = z.enum(["slack", "email", "video_calls", "flexible"]);
export const availabilityStatusEnum = z.enum([
  "available_now",
  "available_part_time",
  "busy",
  "not_available",
]);

/* ==============================================================================
   Project Request Validation
   ============================================================================== */

export const createHireRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Project title must be at least 5 characters")
      .max(160, "Project title cannot exceed 160 characters"),
    category: hireServiceCategoryEnum,
    description: z
      .string()
      .trim()
      .min(20, "Project description must be at least 20 characters")
      .max(10000, "Project description cannot exceed 10,000 characters"),
    hiring_model: hiringModelEnum,
    required_skills: z
      .array(z.string().trim().min(1).max(50))
      .min(1, "Please specify at least one required skill")
      .max(25, "Maximum 25 skills allowed"),
    experience_level: experienceLevelEnum.default("intermediate"),
    budget_min: z
      .number()
      .positive("Budget minimum must be greater than 0")
      .optional()
      .nullable(),
    budget_max: z
      .number()
      .positive("Budget maximum must be greater than 0")
      .optional()
      .nullable(),
    currency: z.string().default("USD"),
    expected_start_date: z.string().optional().nullable(),
    deadline: z.string().optional().nullable(),
    estimated_duration_weeks: z
      .number()
      .int()
      .min(1, "Duration must be at least 1 week")
      .max(104, "Duration cannot exceed 2 years")
      .optional()
      .nullable(),
    communication_pref: communicationPrefEnum.default("flexible"),
    // Hourly specifics
    hourly_hours_per_week: z
      .number()
      .min(1, "Minimum 1 hour per week")
      .max(80, "Maximum 80 hours per week")
      .optional()
      .nullable(),
    hourly_overlap_timezone: z.string().trim().max(100).optional().nullable(),
    // Fixed specifics
    fixed_deliverables: z
      .array(z.string().trim().min(1).max(500))
      .max(20)
      .optional()
      .nullable(),
    revision_rounds: z
      .number()
      .int()
      .min(0, "Revision rounds cannot be negative")
      .max(20, "Maximum 20 revision rounds")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.budget_min && data.budget_max) {
        return data.budget_max >= data.budget_min;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budget_max"],
    }
  );

export type CreateHireRequestInput = z.infer<typeof createHireRequestSchema>;

/* ==============================================================================
   Talent Profile Validation
   ============================================================================== */

export const talentProfileSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(5, "Headline must be at least 5 characters")
    .max(160, "Headline cannot exceed 160 characters"),
  bio: z
    .string()
    .trim()
    .min(20, "Biography must be at least 20 characters")
    .max(5000, "Biography cannot exceed 5,000 characters"),
  skills: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Please add at least one skill")
    .max(30, "Maximum 30 skills allowed"),
  experience_years: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50"),
  hourly_rate: z
    .number()
    .min(5, "Hourly rate must be at least $5/hr")
    .max(500, "Hourly rate cannot exceed $500/hr"),
  min_project_budget: z
    .number()
    .min(50, "Minimum project budget must be at least $50")
    .optional()
    .nullable(),
  availability_status: availabilityStatusEnum.default("available_now"),
  availability_hours_per_week: z
    .number()
    .min(0)
    .max(80)
    .default(40),
  preferred_categories: z
    .array(hireServiceCategoryEnum)
    .min(1, "Select at least one preferred category"),
  timezone: z.string().trim().min(1, "Timezone is required").max(60),
  languages: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "Please specify at least one language"),
  full_name: z.string().trim().min(2).max(100).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
});

export type TalentProfileInput = z.infer<typeof talentProfileSchema>;

/* ==============================================================================
   Proposal Validation
   ============================================================================== */

export const hireProposalSchema = z.object({
  request_id: z.string().uuid("Invalid request identifier"),
  proposed_rate: z
    .number()
    .positive("Proposed rate must be greater than 0"),
  estimated_hours: z
    .number()
    .positive("Estimated hours must be greater than 0")
    .optional()
    .nullable(),
  cover_letter: z
    .string()
    .trim()
    .min(20, "Cover letter must be at least 20 characters")
    .max(5000, "Cover letter cannot exceed 5,000 characters"),
  approach: z
    .string()
    .trim()
    .min(20, "Approach details must be at least 20 characters")
    .max(5000, "Approach cannot exceed 5,000 characters"),
  deliverables: z
    .array(z.string().trim().min(1).max(500))
    .max(20)
    .optional()
    .nullable(),
});

export type HireProposalInput = z.infer<typeof hireProposalSchema>;

/* ==============================================================================
   Admin Matching & Status Actions Validation
   ============================================================================== */

export const adminMatchTalentSchema = z.object({
  request_id: z.string().uuid("Invalid request identifier"),
  talent_id: z.string().uuid("Invalid talent identifier"),
  match_score: z.number().min(0).max(100).default(85),
  match_rationale: z
    .string()
    .trim()
    .min(5, "Match rationale is required")
    .max(1000, "Match rationale cannot exceed 1,000 characters"),
});

export type AdminMatchTalentInput = z.infer<typeof adminMatchTalentSchema>;

export const updateRequestStatusSchema = z.object({
  request_id: z.string().uuid("Invalid request identifier"),
  status: z.enum([
    "draft",
    "submitted",
    "under_review",
    "matching",
    "talent_proposed",
    "client_deciding",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  internal_notes: z.string().trim().max(2000).optional().nullable(),
});
