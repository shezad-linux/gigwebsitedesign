/* ==============================================================================
   Hire Talent Database Queries
   Server-side reads for talent profiles, client requests, matches, and proposals
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  TalentProfile,
  HireRequest,
  HireMatch,
  HireProposal,
  HireActivityLog,
  HireServiceCategory,
  HireProject,
  HireMilestone,
  HireTimeEntry,
} from "./types";

// Curated fallback talent profiles for instant render when database tables are empty
export const SAMPLE_FALLBACK_TALENTS: TalentProfile[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    user_id: "00000000-0000-0000-0000-000000000101",
    headline: "Senior Full-Stack Engineer & Cloud Architect",
    bio: "Specializing in high-performance web applications using Next.js, TypeScript, PostgreSQL, and scalable microservices. Over 8 years of experience leading technical delivery for venture-backed startups.",
    skills: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "GraphQL", "Tailwind CSS"],
    experience_years: 8.5,
    hourly_rate: 85,
    min_project_budget: 2500,
    availability_status: "available_now",
    availability_hours_per_week: 40,
    preferred_categories: ["software-web"],
    timezone: "America/New_York",
    languages: ["English"],
    verification_status: "verified",
    full_name: "Alex Turner",
    country: "United States",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    user_id: "00000000-0000-0000-0000-000000000102",
    headline: "Lead Mobile Developer (React Native & Flutter)",
    bio: "Building fluid, native-grade iOS and Android applications with offline-first persistence, push notification architecture, and biometrics. Shipped 12+ apps to the App Store and Google Play.",
    skills: ["React Native", "Flutter", "iOS", "Android", "TypeScript", "Firebase", "Mobile UI", "REST APIs"],
    experience_years: 6,
    hourly_rate: 75,
    min_project_budget: 2000,
    availability_status: "available_now",
    availability_hours_per_week: 35,
    preferred_categories: ["mobile-apps"],
    timezone: "Europe/Tallinn",
    languages: ["English", "Russian"],
    verification_status: "verified",
    full_name: "Elena Rostova",
    country: "Estonia",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    user_id: "00000000-0000-0000-0000-000000000103",
    headline: "Principal Product & Design System Designer",
    bio: "Obsessed with craft, typographic hierarchy, and intuitive user experiences. Expert in Figma component architecture, multi-brand design tokens, user testing, and developer handoffs.",
    skills: ["Figma", "UI/UX Design", "Design Systems", "User Research", "Prototyping", "Wireframing", "Tailwind CSS"],
    experience_years: 7,
    hourly_rate: 70,
    min_project_budget: 1500,
    availability_status: "available_part_time",
    availability_hours_per_week: 20,
    preferred_categories: ["ui-ux-design"],
    timezone: "Europe/London",
    languages: ["English"],
    verification_status: "verified",
    full_name: "Marcus Vance",
    country: "United Kingdom",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000104",
    user_id: "00000000-0000-0000-0000-000000000104",
    headline: "Senior AI Application Engineer & LLM Specialist",
    bio: "Hands-on expertise developing production RAG systems, autonomous agent workflows, model evaluation harnesses, and enterprise workflow integrations using Python, LangChain, and OpenAI.",
    skills: ["Python", "OpenAI API", "LangChain", "RAG Pipelines", "Agents", "Vector Databases", "PyTorch", "FastAPI"],
    experience_years: 5.5,
    hourly_rate: 95,
    min_project_budget: 3000,
    availability_status: "available_now",
    availability_hours_per_week: 40,
    preferred_categories: ["ai-automation"],
    timezone: "Asia/Kolkata",
    languages: ["English", "Hindi"],
    verification_status: "verified",
    full_name: "Priya Sharma",
    country: "India",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000105",
    user_id: "00000000-0000-0000-0000-000000000105",
    headline: "Technical Growth Marketer & Performance Strategist",
    bio: "Driving profitable customer acquisition across Google, Meta, and programmatic search. Proven track record managing $500K+ monthly ad spend with focus on ROAS and conversion rate optimization.",
    skills: ["Google Ads", "Meta Ads", "SEO", "Conversion Rate Optimization", "Google Analytics 4", "Copywriting"],
    experience_years: 6,
    hourly_rate: 65,
    min_project_budget: 1200,
    availability_status: "available_now",
    availability_hours_per_week: 30,
    preferred_categories: ["digital-marketing"],
    timezone: "America/Toronto",
    languages: ["English"],
    verification_status: "verified",
    full_name: "David Kim",
    country: "Canada",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000106",
    user_id: "00000000-0000-0000-0000-000000000106",
    headline: "QA Automation Architect & Security Auditor",
    bio: "End-to-end browser and API automation test suites using Playwright and Cypress. Security vulnerability assessments, OWASP compliance audits, and performance stress testing.",
    skills: ["Playwright", "Cypress", "Security Audit", "API Testing", "Load Testing", "CI/CD Pipelines", "TypeScript"],
    experience_years: 7.5,
    hourly_rate: 65,
    min_project_budget: 1000,
    availability_status: "available_now",
    availability_hours_per_week: 40,
    preferred_categories: ["qa-testing-consulting"],
    timezone: "Europe/Stockholm",
    languages: ["English", "Swedish"],
    verification_status: "verified",
    full_name: "Sophia Lindqvist",
    country: "Sweden",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Curated fallback hire requests for instant admin/client render
export const SAMPLE_FALLBACK_REQUESTS: (HireRequest & { match_count: number; proposal_count: number })[] = [
  {
    id: "00000000-0000-0000-0000-000000000201",
    client_id: "00000000-0000-0000-0000-000000000001",
    client_email: "client.demo@example.com",
    client_name: "FinTech Innovations LLC",
    title: "Next.js 15 Platform Redesign & Supabase Integration",
    description: "Looking for an experienced Next.js and TypeScript developer to rebuild our customer portal with Server Actions, Tailwind CSS, and Supabase Row Level Security.",
    category: "software-web",
    hiring_model: "hourly",
    required_skills: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    experience_level: "expert",
    budget_min: 75,
    budget_max: 95,
    currency: "USD",
    hourly_hours_per_week: 30,
    estimated_duration_weeks: 6,
    communication_pref: "slack",
    status: "submitted",
    internal_notes: "High priority client request. Looking for immediate start.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    match_count: 0,
    proposal_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    client_id: "00000000-0000-0000-0000-000000000002",
    client_email: "founder@telehealth.io",
    client_name: "TeleHealth Cloud",
    title: "HIPAA-Compliant Patient Consultation App (React Native)",
    description: "Develop cross-platform iOS and Android mobile app with WebRTC video consultation, offline sync, and encrypted health records.",
    category: "mobile-apps",
    hiring_model: "fixed",
    required_skills: ["React Native", "TypeScript", "Mobile UI", "REST APIs"],
    experience_level: "expert",
    budget_min: 8000,
    budget_max: 12000,
    currency: "USD",
    fixed_deliverables: [
      "iOS & Android cross-platform mobile client",
      "WebRTC video consultation interface",
      "Encrypted patient records sync",
      "Comprehensive automated test suite",
    ],
    fixed_milestones_count: 3,
    revision_rounds: 2,
    estimated_duration_weeks: 8,
    communication_pref: "video_calls",
    status: "matching",
    internal_notes: "Reviewing mobile developers with WebRTC background.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    match_count: 1,
    proposal_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    client_id: "00000000-0000-0000-0000-000000000003",
    client_email: "vp@autonomousai.tech",
    client_name: "Autonomous AI Labs",
    title: "Enterprise RAG Pipeline & Multi-Agent Evaluation Framework",
    description: "Engineer production-grade LangChain / OpenAI RAG evaluation pipelines with automated benchmark tracking and vector database querying.",
    category: "ai-automation",
    hiring_model: "hourly",
    required_skills: ["Python", "OpenAI API", "LangChain", "RAG Pipelines", "Agents"],
    experience_level: "expert",
    budget_min: 85,
    budget_max: 110,
    currency: "USD",
    hourly_hours_per_week: 40,
    estimated_duration_weeks: 10,
    communication_pref: "flexible",
    status: "talent_proposed",
    internal_notes: "Talent submitted preliminary proposals; client evaluating.",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    match_count: 2,
    proposal_count: 1,
  },
];

/* ==============================================================================
   Talent Profile Queries
   ============================================================================== */

export async function fetchTalentProfiles(
  supabase: SupabaseClient | null,
  options?: {
    category?: HireServiceCategory;
    verifiedOnly?: boolean;
    limit?: number;
  }
): Promise<TalentProfile[]> {
  if (!supabase) {
    let list = [...SAMPLE_FALLBACK_TALENTS];
    if (options?.category) {
      list = list.filter((t) => t.preferred_categories.includes(options.category!));
    }
    return list.slice(0, options?.limit || 20);
  }

  try {
    let query = supabase.from("talent_profiles").select("*");

    if (options?.verifiedOnly !== false) {
      query = query.eq("verification_status", "verified");
    }

    if (options?.category) {
      query = query.contains("preferred_categories", [options.category]);
    }

    query = query.order("experience_years", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Graceful fallback to seeded profiles
      let fallback = [...SAMPLE_FALLBACK_TALENTS];
      if (options?.category) {
        fallback = fallback.filter((t) => t.preferred_categories.includes(options.category!));
      }
      return fallback.slice(0, options?.limit || 20);
    }

    return data as TalentProfile[];
  } catch (err) {
    console.warn("fetchTalentProfiles error, using fallback:", err);
    return SAMPLE_FALLBACK_TALENTS;
  }
}

export async function fetchTalentProfileById(
  supabase: SupabaseClient | null,
  talentId: string
): Promise<TalentProfile | null> {
  if (!supabase) {
    return SAMPLE_FALLBACK_TALENTS.find((t) => t.id === talentId || t.user_id === talentId) || null;
  }

  try {
    const { data, error } = await supabase
      .from("talent_profiles")
      .select("*")
      .or(`id.eq.${talentId},user_id.eq.${talentId}`)
      .maybeSingle();

    if (error || !data) {
      return SAMPLE_FALLBACK_TALENTS.find((t) => t.id === talentId || t.user_id === talentId) || null;
    }

    return data as TalentProfile;
  } catch (err) {
    console.warn("fetchTalentProfileById error:", err);
    return null;
  }
}

/* ==============================================================================
   Client Request Queries
   ============================================================================== */

export async function fetchHireRequestsByClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<HireRequest[]> {
  try {
    const { data, error } = await supabase
      .from("hire_requests")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchHireRequestsByClient error:", error);
      return [];
    }

    return (data || []) as HireRequest[];
  } catch (err) {
    console.error("fetchHireRequestsByClient exception:", err);
    return [];
  }
}

export async function fetchHireRequestById(
  supabase: SupabaseClient,
  requestId: string
): Promise<{
  request: HireRequest | null;
  matches: HireMatch[];
  proposals: HireProposal[];
  activity: HireActivityLog[];
}> {
  try {
    const { data: request, error: reqErr } = await supabase
      .from("hire_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();

    if (reqErr || !request) {
      const fallbackReq = SAMPLE_FALLBACK_REQUESTS.find((r) => r.id === requestId);
      if (fallbackReq) {
        return {
          request: fallbackReq,
          matches: [],
          proposals: [],
          activity: [],
        };
      }
      return { request: null, matches: [], proposals: [], activity: [] };
    }

    // Fetch associated matches with talent profile
    const { data: matches } = await supabase
      .from("hire_matches")
      .select(`
        *,
        talent:talent_profiles(*)
      `)
      .eq("request_id", requestId)
      .order("match_score", { ascending: false });

    // Fetch proposals
    const { data: proposals } = await supabase
      .from("hire_proposals")
      .select(`
        *,
        talent:talent_profiles(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    // Fetch activity
    const { data: activity } = await supabase
      .from("hire_activity_log")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    return {
      request: request as HireRequest,
      matches: (matches || []) as HireMatch[],
      proposals: (proposals || []) as HireProposal[],
      activity: (activity || []) as HireActivityLog[],
    };
  } catch (err) {
    console.error("fetchHireRequestById exception:", err);
    return { request: null, matches: [], proposals: [], activity: [] };
  }
}

/* ==============================================================================
   Admin Managed Matching Overview Queries
   ============================================================================== */

export async function fetchAllHireRequestsForAdmin(
  supabase: SupabaseClient,
  filter?: {
    status?: string;
    category?: string;
  }
): Promise<{
  requests: (HireRequest & { match_count: number; proposal_count: number })[];
  countsByStatus: Record<string, number>;
}> {
  try {
    let query = supabase.from("hire_requests").select(`
      *,
      matches:hire_matches(count),
      proposals:hire_proposals(count)
    `);

    if (filter?.status && filter.status !== "all") {
      query = query.eq("status", filter.status);
    }
    if (filter?.category && filter.category !== "all") {
      query = query.eq("category", filter.category);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = [...SAMPLE_FALLBACK_REQUESTS];
      if (filter?.status && filter.status !== "all") {
        filtered = filtered.filter((r) => r.status === filter.status);
      }
      if (filter?.category && filter.category !== "all") {
        filtered = filtered.filter((r) => r.category === filter.category);
      }
      const countsByStatus: Record<string, number> = {};
      SAMPLE_FALLBACK_REQUESTS.forEach((r) => {
        countsByStatus[r.status] = (countsByStatus[r.status] || 0) + 1;
      });
      return { requests: filtered, countsByStatus };
    }

    const countsByStatus: Record<string, number> = {};
    const requests = (data || []).map((row: any) => {
      countsByStatus[row.status] = (countsByStatus[row.status] || 0) + 1;
      return {
        ...row,
        match_count: row.matches?.[0]?.count || 0,
        proposal_count: row.proposals?.[0]?.count || 0,
      };
    });

    return { requests, countsByStatus };
  } catch (err) {
    console.error("fetchAllHireRequestsForAdmin exception:", err);
    let filtered = [...SAMPLE_FALLBACK_REQUESTS];
    if (filter?.status && filter.status !== "all") {
      filtered = filtered.filter((r) => r.status === filter.status);
    }
    if (filter?.category && filter.category !== "all") {
      filtered = filtered.filter((r) => r.category === filter.category);
    }
    const countsByStatus: Record<string, number> = {};
    SAMPLE_FALLBACK_REQUESTS.forEach((r) => {
      countsByStatus[r.status] = (countsByStatus[r.status] || 0) + 1;
    });
    return { requests: filtered, countsByStatus };
  }
}

export async function fetchTalentInvitations(
  supabase: SupabaseClient,
  talentId: string
): Promise<HireMatch[]> {
  try {
    const { data, error } = await supabase
      .from("hire_matches")
      .select(`
        *,
        request:hire_requests(*)
      `)
      .eq("talent_id", talentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchTalentInvitations error:", error);
      return [];
    }

    return (data || []) as HireMatch[];
  } catch (err) {
    console.error("fetchTalentInvitations exception:", err);
    return [];
  }
}

/* ==============================================================================
   Confirmed Projects Queries
   ============================================================================== */

export async function fetchHireProjectById(
  supabase: SupabaseClient,
  projectId: string
): Promise<HireProject | null> {
  try {
    const { data, error } = await supabase
      .from("hire_projects")
      .select(`
        *,
        request:hire_requests(*),
        talent:talent_profiles(*),
        milestones:hire_milestones(*),
        time_entries:hire_time_entries(*)
      `)
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as HireProject;
  } catch (err) {
    console.error("fetchHireProjectById exception:", err);
    return null;
  }
}

export async function fetchHireProjectsForUser(
  supabase: SupabaseClient,
  userId: string,
  role?: "client" | "talent"
): Promise<HireProject[]> {
  try {
    let query = supabase.from("hire_projects").select(`
      *,
      request:hire_requests(title, hiring_model, category),
      talent:talent_profiles(full_name, headline, avatar_url),
      milestones:hire_milestones(id, title, amount, status)
    `);

    if (role === "client") {
      query = query.eq("client_id", userId);
    } else if (role === "talent") {
      query = query.eq("talent_id", userId);
    } else {
      query = query.or(`client_id.eq.${userId},talent_id.eq.${userId}`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data as HireProject[];
  } catch (err) {
    console.error("fetchHireProjectsForUser exception:", err);
    return [];
  }
}

