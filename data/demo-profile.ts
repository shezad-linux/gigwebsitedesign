import { UserProfile } from "@/types/profile";

export const DEFAULT_PROFILE: UserProfile = {
  id: "user_prof_01",
  fullName: "Alex Chen",
  email: "alex.chen@example.com",
  country: "India",
  countryCode: "IN",
  workAuthorization: "Independent Contractor (W-8BEN compliant)",
  languages: [
    { name: "English", proficiency: "fluent" },
    { name: "Hindi", proficiency: "native" },
  ],
  skills: [
    "Python",
    "Java",
    "Code Review",
    "SQL",
    "Git",
    "Prompt Engineering",
    "Debugging",
    "Data Labeling",
  ],
  experienceLevel: "mid",
  yearsOfExperience: 3,
  portfolioUrl: "https://github.com/alexchen-dev",
  githubUrl: "https://github.com/alexchen-dev",
  linkedinUrl: "https://linkedin.com/in/alex-chen-dev",
  desiredCategories: ["AI Coding", "AI Evaluation", "Software & QA Testing"],
  remoteOnly: true,
  weeklyHoursAvailable: 20,
  preferredPayoutMethods: ["PayPal", "Wise", "Direct Deposit"],
  bio: "Full-stack engineer and AI code evaluator with 3+ years experience across Java, Python, and microservices. Active reviewer for frontier LLM code generation benchmarks.",
  resume: {
    fileName: "Alex_Chen_Software_Engineer_Resume.pdf",
    fileSize: 184500,
    uploadedAt: "2025-05-10T14:30:00Z",
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
    extractedSummary: "Software Developer experienced in Java Spring, Python automation, and software testing with focus on algorithmic verification and code evaluation.",
    simulatedScore: 92,
  },
  hasCompletedOnboarding: true,
  createdAt: "2025-05-10T14:00:00Z",
  updatedAt: "2025-05-10T14:35:00Z",
};

// Backwards compatibility alias
export const DEMO_PROFILE = DEFAULT_PROFILE;
