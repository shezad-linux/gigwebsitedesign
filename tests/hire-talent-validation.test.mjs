import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

/* ==============================================================================
   Hire Talent Input Validation & Boundary Security Test Suite
   Tests Zod validation rules for client requests, talent profiles, proposals, and admin matches
   ============================================================================== */

describe("Hire Talent Validation & Boundaries Suite", () => {
  // Service categories allowed in system
  const ALLOWED_CATEGORIES = [
    "software-web",
    "mobile-apps",
    "ui-ux-design",
    "digital-marketing",
    "ai-automation",
    "qa-testing-consulting",
  ];

  // Schema matching lib/hire-talent/validation.ts
  const createHireRequestSchema = z
    .object({
      title: z
        .string()
        .min(10, "Title must be at least 10 characters")
        .max(150, "Title must not exceed 150 characters")
        .trim(),
      description: z
        .string()
        .min(30, "Description must be at least 30 characters")
        .max(5000, "Description must not exceed 5000 characters")
        .trim(),
      category: z.enum([
        "software-web",
        "mobile-apps",
        "ui-ux-design",
        "digital-marketing",
        "ai-automation",
        "qa-testing-consulting",
      ]),
      hiring_model: z.enum(["hourly", "fixed"]),
      required_skills: z
        .array(z.string().min(1).max(50))
        .min(1, "Please specify at least 1 key skill")
        .max(20, "Maximum 20 skills allowed"),
      experience_level: z.enum(["entry", "intermediate", "expert"]).default("intermediate"),
      budget_min: z.number().positive("Minimum budget must be positive").optional().nullable(),
      budget_max: z.number().positive("Maximum budget must be positive").optional().nullable(),
      currency: z.string().default("USD"),
      expected_start_date: z.string().optional().nullable(),
      deadline: z.string().optional().nullable(),
      estimated_duration_weeks: z
        .number()
        .int()
        .min(1, "Duration must be at least 1 week")
        .max(52, "Duration cannot exceed 52 weeks")
        .optional()
        .nullable(),
      communication_pref: z.enum(["slack", "email", "video_calls", "flexible"]).default("flexible"),
      hourly_hours_per_week: z
        .number()
        .min(1)
        .max(80)
        .optional()
        .nullable(),
      hourly_overlap_timezone: z.string().max(100).optional().nullable(),
      fixed_deliverables: z
        .array(z.string().min(3).max(300))
        .max(20)
        .optional()
        .nullable(),
      fixed_milestones_count: z.number().int().min(1).max(10).optional().nullable(),
      revision_rounds: z.number().int().min(0).max(10).optional().nullable(),
      client_name: z.string().max(120).optional().nullable(),
      client_email: z.string().email("Valid email required").optional().nullable(),
      is_draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.is_draft) return;

      if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum budget cannot exceed maximum budget",
          path: ["budget_min"],
        });
      }

      if (data.hiring_model === "hourly") {
        if (!data.budget_min && !data.budget_max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Hourly projects require an hourly rate budget range",
            path: ["budget_min"],
          });
        }
      }

      if (data.hiring_model === "fixed") {
        if (!data.fixed_deliverables || data.fixed_deliverables.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fixed price projects require at least 1 clear deliverable",
            path: ["fixed_deliverables"],
          });
        }
        if (!data.budget_min && !data.budget_max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fixed price projects require an estimated budget",
            path: ["budget_max"],
          });
        }
      }
    });

  const talentProfileSchema = z.object({
    headline: z.string().min(10).max(140).trim(),
    bio: z.string().min(50).max(3000).trim(),
    skills: z.array(z.string().min(1).max(50)).min(1).max(25),
    experience_years: z.number().min(0).max(40),
    hourly_rate: z.number().positive().max(500),
    min_project_budget: z.number().positive().max(100000).optional().nullable(),
    availability_status: z.enum(["available_now", "available_part_time", "busy", "not_available"]),
    availability_hours_per_week: z.number().int().min(0).max(80),
    preferred_categories: z
      .array(z.enum([
        "software-web",
        "mobile-apps",
        "ui-ux-design",
        "digital-marketing",
        "ai-automation",
        "qa-testing-consulting",
      ]))
      .min(1),
    timezone: z.string().min(2).max(100),
    languages: z.array(z.string().min(2).max(50)).min(1),
    full_name: z.string().min(2).max(120).optional().nullable(),
    country: z.string().min(2).max(100).optional().nullable(),
  });

  const hireProposalSchema = z.object({
    request_id: z.string().uuid("Valid request UUID required"),
    proposed_rate: z.number().positive("Proposed rate must be greater than zero"),
    estimated_hours: z.number().positive().optional().nullable(),
    cover_letter: z
      .string()
      .min(30, "Cover letter must be at least 30 characters")
      .max(5000, "Cover letter cannot exceed 5000 characters")
      .trim(),
    deliverables: z.array(z.string().min(3).max(300)).max(20).optional().nullable(),
  });

  const adminMatchTalentSchema = z.object({
    request_id: z.string().uuid("Valid request ID required"),
    talent_id: z.string().uuid("Valid talent ID required"),
    match_score: z.number().min(0).max(100),
    match_rationale: z.string().min(10).max(1000),
    send_invite: z.boolean().default(true),
  });

  /* -------------------------------------------------------------------------- */
  /* Project Request Tests                                                      */
  /* -------------------------------------------------------------------------- */

  test("accepts fully compliant hourly project request", () => {
    const valid = createHireRequestSchema.safeParse({
      title: "Senior Next.js 15 Architect for Core Platform",
      description: "We are seeking a senior full-stack Next.js developer to refactor our SaaS application using App Router, TypeScript, and Supabase RLS.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      experience_level: "expert",
      budget_min: 75,
      budget_max: 95,
      hourly_hours_per_week: 30,
      estimated_duration_weeks: 8,
      communication_pref: "slack",
    });

    assert.equal(valid.success, true);
  });

  test("accepts fully compliant fixed-price project request with deliverables", () => {
    const valid = createHireRequestSchema.safeParse({
      title: "Cross-Platform Flutter Telehealth Prototype",
      description: "Build an MVP mobile application for patient check-ins and video consultations with secure local storage and clean architecture.",
      category: "mobile-apps",
      hiring_model: "fixed",
      required_skills: ["Flutter", "Dart", "REST APIs", "Mobile UI"],
      experience_level: "intermediate",
      budget_min: 4000,
      budget_max: 6000,
      fixed_deliverables: [
        "Patient login & auth screen",
        "Appointment booking calendar",
        "Video consultation room",
      ],
      fixed_milestones_count: 3,
      revision_rounds: 2,
      estimated_duration_weeks: 6,
    });

    assert.equal(valid.success, true);
  });

  test("rejects project title that is too short (<10 chars) or too long (>150 chars)", () => {
    const shortTitle = createHireRequestSchema.safeParse({
      title: "Build app",
      description: "We need someone to build an application for our startup with TypeScript.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: 50,
      budget_max: 70,
    });
    assert.equal(shortTitle.success, false);

    const longTitle = createHireRequestSchema.safeParse({
      title: "A".repeat(151),
      description: "We need someone to build an application for our startup with TypeScript.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: 50,
      budget_max: 70,
    });
    assert.equal(longTitle.success, false);
  });

  test("rejects project description that is too short (<30 chars)", () => {
    const shortDesc = createHireRequestSchema.safeParse({
      title: "Senior Full Stack Next.js Dev",
      description: "Build website fast.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: 50,
      budget_max: 70,
    });
    assert.equal(shortDesc.success, false);
  });

  test("rejects unknown or unauthorized service category", () => {
    const badCat = createHireRequestSchema.safeParse({
      title: "Senior Full Stack Next.js Dev",
      description: "Looking for an expert to engineer our core web platform with best practices.",
      category: "cryptocurrency-pump-and-dump",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: 50,
      budget_max: 70,
    });
    assert.equal(badCat.success, false);
  });

  test("enforces budget_min <= budget_max constraint", () => {
    const invertedBudget = createHireRequestSchema.safeParse({
      title: "Senior Full Stack Next.js Dev",
      description: "Looking for an expert to engineer our core web platform with best practices.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: 100,
      budget_max: 50, // Inverted!
    });
    assert.equal(invertedBudget.success, false);
  });

  test("rejects fixed-price request without deliverables", () => {
    const missingDeliverables = createHireRequestSchema.safeParse({
      title: "Fixed Scope E-Commerce Storefront",
      description: "Looking for an expert to engineer our core store platform with best practices.",
      category: "software-web",
      hiring_model: "fixed",
      required_skills: ["Shopify", "Liquid"],
      budget_min: 3000,
      budget_max: 5000,
      fixed_deliverables: [], // Empty!
    });
    assert.equal(missingDeliverables.success, false);
  });

  test("rejects negative or zero budget amounts", () => {
    const negativeBudget = createHireRequestSchema.safeParse({
      title: "Senior Full Stack Next.js Dev",
      description: "Looking for an expert to engineer our core web platform with best practices.",
      category: "software-web",
      hiring_model: "hourly",
      required_skills: ["React"],
      budget_min: -20,
      budget_max: 50,
    });
    assert.equal(negativeBudget.success, false);
  });

  /* -------------------------------------------------------------------------- */
  /* Talent Profile Tests                                                       */
  /* -------------------------------------------------------------------------- */

  test("accepts compliant talent profile", () => {
    const profile = talentProfileSchema.safeParse({
      headline: "Staff Software Engineer & Distributed Systems Architect",
      bio: "Over 9 years building fault-tolerant backend services, high-throughput streaming pipelines, and microservices in Go, TypeScript, and PostgreSQL.",
      skills: ["Go", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "AWS"],
      experience_years: 9,
      hourly_rate: 95,
      min_project_budget: 3000,
      availability_status: "available_now",
      availability_hours_per_week: 40,
      preferred_categories: ["software-web"],
      timezone: "America/Chicago",
      languages: ["English", "Spanish"],
      full_name: "Marcus Aurelius Vance",
      country: "United States",
    });

    assert.equal(profile.success, true);
  });

  test("rejects excessive hourly rate (> $500/hr) or negative rate", () => {
    const crazyRate = talentProfileSchema.safeParse({
      headline: "Freelance Consultant",
      bio: "Detailed bio exceeding fifty characters describing relevant technical background.",
      skills: ["React"],
      experience_years: 5,
      hourly_rate: 1500, // Excessive
      availability_status: "available_now",
      availability_hours_per_week: 20,
      preferred_categories: ["software-web"],
      timezone: "UTC",
      languages: ["English"],
    });
    assert.equal(crazyRate.success, false);

    const negativeRate = talentProfileSchema.safeParse({
      headline: "Freelance Consultant",
      bio: "Detailed bio exceeding fifty characters describing relevant technical background.",
      skills: ["React"],
      experience_years: 5,
      hourly_rate: -10, // Negative
      availability_status: "available_now",
      availability_hours_per_week: 20,
      preferred_categories: ["software-web"],
      timezone: "UTC",
      languages: ["English"],
    });
    assert.equal(negativeRate.success, false);
  });

  test("rejects talent profile with empty skills or empty preferred categories", () => {
    const noSkills = talentProfileSchema.safeParse({
      headline: "Freelance Consultant",
      bio: "Detailed bio exceeding fifty characters describing relevant technical background.",
      skills: [], // Empty
      experience_years: 5,
      hourly_rate: 65,
      availability_status: "available_now",
      availability_hours_per_week: 20,
      preferred_categories: ["software-web"],
      timezone: "UTC",
      languages: ["English"],
    });
    assert.equal(noSkills.success, false);

    const noCategories = talentProfileSchema.safeParse({
      headline: "Freelance Consultant",
      bio: "Detailed bio exceeding fifty characters describing relevant technical background.",
      skills: ["React"],
      experience_years: 5,
      hourly_rate: 65,
      availability_status: "available_now",
      availability_hours_per_week: 20,
      preferred_categories: [], // Empty
      timezone: "UTC",
      languages: ["English"],
    });
    assert.equal(noCategories.success, false);
  });

  /* -------------------------------------------------------------------------- */
  /* Proposals & Admin Matches Tests                                            */
  /* -------------------------------------------------------------------------- */

  test("accepts valid proposal and rejects short cover letter", () => {
    const valid = hireProposalSchema.safeParse({
      request_id: "00000000-0000-0000-0000-000000000001",
      proposed_rate: 80,
      estimated_hours: 40,
      cover_letter: "I have 7 years of production Next.js experience and have built similar high-performance dashboards.",
      deliverables: ["Initial audit", "Migration to Next 15", "Performance testing"],
    });
    assert.equal(valid.success, true);

    const shortCover = hireProposalSchema.safeParse({
      request_id: "00000000-0000-0000-0000-000000000001",
      proposed_rate: 80,
      cover_letter: "Hire me please.",
    });
    assert.equal(shortCover.success, false);
  });

  test("validates admin match recommendation score bounds (0 to 100)", () => {
    const validMatch = adminMatchTalentSchema.safeParse({
      request_id: "00000000-0000-0000-0000-000000000001",
      talent_id: "00000000-0000-0000-0000-000000000002",
      match_score: 92,
      match_rationale: "Exceptional skill match in React Native, available immediately within budget.",
      send_invite: true,
    });
    assert.equal(validMatch.success, true);

    const outOfBounds = adminMatchTalentSchema.safeParse({
      request_id: "00000000-0000-0000-0000-000000000001",
      talent_id: "00000000-0000-0000-0000-000000000002",
      match_score: 120, // Invalid!
      match_rationale: "Great fit.",
    });
    assert.equal(outOfBounds.success, false);
  });
});
