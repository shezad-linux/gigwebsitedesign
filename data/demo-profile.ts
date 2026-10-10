import { UserProfile, UserResume } from "@/types/profile";

export const DEMO_RESUME: UserResume = {
  fileName: "Alex_Chen_Software_Engineer_Resume.pdf",
  fileSize: 184500,
  uploadedAt: new Date().toISOString(),
  extractedSkills: [
    "Python",
    "Java",
    "Code Review",
    "Git",
    "SQL",
    "REST APIs",
    "Debugging",
    "Unit Testing",
    "Prompt Engineering",
  ],
  extractedSummary:
    "Software Developer experienced in Java Spring, Python automation, and software testing with focus on algorithmic verification and code evaluation.",
};

export const DEFAULT_PROFILE: UserProfile = {
  id: "user_initial_01",
  fullName: "",
  email: "",
  country: "",
  countryCode: "",
  workAuthorization: "Independent Contractor (W-8BEN compliant)",
  languages: [],
  skills: [],
  experienceLevel: "entry",
  yearsOfExperience: 0,
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  desiredCategories: [],
  remoteOnly: true,
  weeklyHoursAvailable: 20,
  preferredPayoutMethods: [],
  bio: "",
  resume: undefined,
  hasCompletedOnboarding: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

// Backwards compatibility alias
export const DEMO_PROFILE = DEFAULT_PROFILE;
