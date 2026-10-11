/* ==============================================================================
   Hire Talent Domain Types & Interfaces
   Remotasks.si — Managed Talent Hiring Architecture
   ============================================================================== */

export type HireServiceCategory =
  | "software-web"
  | "mobile-apps"
  | "ui-ux-design"
  | "digital-marketing"
  | "ai-automation"
  | "qa-testing-consulting";

export interface CategoryMetadata {
  id: HireServiceCategory;
  title: string;
  shortTitle: string;
  description: string;
  popularSkills: string[];
  typicalHourlyRange: string;
  typicalFixedRange: string;
  iconName: string;
}

export const HIRE_CATEGORIES: Record<HireServiceCategory, CategoryMetadata> = {
  "software-web": {
    id: "software-web",
    title: "Software Engineering & Web Development",
    shortTitle: "Software & Web",
    description: "Full-stack engineers, backend architects, and frontend specialists building scalable web applications.",
    popularSkills: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Go", "PostgreSQL", "Docker", "AWS"],
    typicalHourlyRange: "$40 - $120/hr",
    typicalFixedRange: "$1,500 - $15,000",
    iconName: "Code2",
  },
  "mobile-apps": {
    id: "mobile-apps",
    title: "Mobile Applications",
    shortTitle: "Mobile Apps",
    description: "Native and cross-platform mobile developers for iOS, Android, Flutter, and React Native.",
    popularSkills: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Firebase"],
    typicalHourlyRange: "$45 - $110/hr",
    typicalFixedRange: "$2,000 - $20,000",
    iconName: "Smartphone",
  },
  "ui-ux-design": {
    id: "ui-ux-design",
    title: "UI/UX & Graphic Design",
    shortTitle: "UI/UX Design",
    description: "Product designers, design system architects, and brand specialists focused on high-conversion UI.",
    popularSkills: ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing", "Tailwind CSS"],
    typicalHourlyRange: "$35 - $95/hr",
    typicalFixedRange: "$1,000 - $8,000",
    iconName: "Palette",
  },
  "digital-marketing": {
    id: "digital-marketing",
    title: "Digital Marketing & Advertising",
    shortTitle: "Marketing & Growth",
    description: "Growth marketers, performance advertising specialists, SEO strategists, and conversion optimizers.",
    popularSkills: ["SEO", "Google Ads", "Meta Ads", "Content Strategy", "Analytics", "Copywriting", "CRO"],
    typicalHourlyRange: "$30 - $85/hr",
    typicalFixedRange: "$800 - $6,000",
    iconName: "TrendingUp",
  },
  "ai-automation": {
    id: "ai-automation",
    title: "AI Engineering & Automation",
    shortTitle: "AI & Automation",
    description: "LLM application builders, computer vision engineers, fine-tuning specialists, and workflow automation experts.",
    popularSkills: ["PyTorch", "LangChain", "OpenAI API", "HuggingFace", "Python", "RAG Pipelines", "Agents", "n8n"],
    typicalHourlyRange: "$55 - $150/hr",
    typicalFixedRange: "$2,500 - $25,000",
    iconName: "Cpu",
  },
  "qa-testing-consulting": {
    id: "qa-testing-consulting",
    title: "QA, Testing & Technical Consulting",
    shortTitle: "QA & Consulting",
    description: "Automated QA engineers, penetration testers, security auditors, and system architecture consultants.",
    popularSkills: ["Playwright", "Cypress", "Security Audit", "Load Testing", "Architecture Review", "CI/CD"],
    typicalHourlyRange: "$35 - $100/hr",
    typicalFixedRange: "$1,000 - $10,000",
    iconName: "CheckCircle",
  },
};

export const HIRE_SERVICE_CATEGORIES = HIRE_CATEGORIES;

export type HiringModel = "hourly" | "fixed";

export type ExperienceLevel = "entry" | "intermediate" | "expert";

export type HireRequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "matching"
  | "talent_proposed"
  | "client_deciding"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TalentVerificationStatus =
  | "unverified"
  | "pending_review"
  | "verified"
  | "suspended";

export type MatchStatus =
  | "suggested"
  | "invited"
  | "declined"
  | "accepted";

export type ProposalStatus =
  | "submitted"
  | "shortlisted"
  | "accepted"
  | "declined";

/* ==============================================================================
   Talent Profile
   ============================================================================== */

export interface TalentProfile {
  id: string; // auth.users id
  user_id: string;
  headline: string;
  bio: string;
  skills: string[];
  experience_years: number;
  hourly_rate: number; // USD
  min_project_budget?: number; // USD
  availability_status: "available_now" | "available_part_time" | "busy" | "not_available";
  availability_hours_per_week: number;
  preferred_categories: HireServiceCategory[];
  timezone: string;
  languages: string[];
  verification_status: TalentVerificationStatus;
  full_name?: string;
  avatar_url?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface TalentPortfolioItem {
  id: string;
  talent_id: string;
  title: string;
  description: string;
  project_url?: string;
  tags?: string[];
  created_at: string;
}

/* ==============================================================================
   Hire Request (Client Submission)
   ============================================================================== */

export interface HireRequest {
  id: string;
  client_id: string;
  client_email?: string;
  client_name?: string;
  title: string;
  description: string;
  category: HireServiceCategory;
  hiring_model: HiringModel;
  required_skills: string[];
  experience_level: ExperienceLevel;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  expected_start_date?: string;
  deadline?: string;
  estimated_duration_weeks?: number;
  communication_pref: "slack" | "email" | "video_calls" | "flexible";
  // Hourly specifics
  hourly_hours_per_week?: number;
  hourly_overlap_timezone?: string;
  // Fixed specifics
  fixed_deliverables?: string[];
  fixed_milestones_count?: number;
  revision_rounds?: number;
  // Lifecycle
  status: HireRequestStatus;
  internal_notes?: string;
  assigned_admin_id?: string;
  created_at: string;
  updated_at: string;
}

/* ==============================================================================
   Match & Proposal Entities
   ============================================================================== */

export interface HireMatch {
  id: string;
  request_id: string;
  talent_id: string;
  match_score: number; // 0 - 100
  match_rationale: string;
  status: MatchStatus;
  invited_at?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Populated relations
  talent?: TalentProfile;
  request?: HireRequest;
}

export interface HireProposal {
  id: string;
  request_id: string;
  talent_id: string;
  proposed_rate: number; // General rate figure for legacy/compat
  proposed_hourly_rate?: number; // Specific to hourly projects
  fixed_price_quote?: number; // Specific to fixed projects
  currency?: string;
  estimated_hours?: number;
  cover_letter: string;
  approach: string;
  deliverables?: string[];
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  // Populated relations
  talent?: TalentProfile;
  request?: HireRequest;
}

/* ==============================================================================
   Confirmed Project & Engagement Lifecycle (Separate from Request)
   ============================================================================== */

export type HireProjectStatus =
  | "active"
  | "paused"
  | "completed"
  | "disputed"
  | "cancelled";

export interface HireProject {
  id: string;
  request_id: string;
  client_id: string;
  talent_id: string;
  proposal_id: string;
  title: string;
  hiring_model: HiringModel;
  currency: string;
  agreed_rate?: number; // Agreed hourly rate (USD)
  agreed_budget?: number; // Agreed fixed budget (USD)
  status: HireProjectStatus;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Populated relations
  talent?: TalentProfile;
  request?: HireRequest;
  milestones?: HireMilestone[];
  time_entries?: HireTimeEntry[];
}

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "approved"
  | "paid";

export interface HireMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  due_date?: string;
  status: MilestoneStatus;
  approved_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export type TimeEntryStatus =
  | "logged"
  | "submitted"
  | "approved"
  | "invoiced";

export interface HireTimeEntry {
  id: string;
  project_id: string;
  talent_id: string;
  hours: number;
  entry_date: string;
  description: string;
  status: TimeEntryStatus;
  created_at: string;
}

export interface HireActivityLog {
  id: string;
  request_id: string;
  actor_id: string;
  actor_role: "client" | "talent" | "admin" | "system";
  action: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
