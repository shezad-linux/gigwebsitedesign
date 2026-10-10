export interface UserLanguage {
  name: string;
  proficiency: "native" | "fluent" | "professional" | "conversational" | "basic";
}

export interface UserResume {
  fileName: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  extractedSkills: string[];
  extractedSummary?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country: string; // e.g. "India", "United States", "United Kingdom", "Germany", etc.
  countryCode: string; // e.g. "IN", "US", "GB", "DE"
  workAuthorization?: string; // e.g. "Resident / Citizen", "Contractor (W-8BEN / Self-employed)"
  languages: UserLanguage[];
  skills: string[]; // e.g. ["Python", "Java", "Code Review", "Prompt Engineering", "SQL"]
  experienceLevel: "entry" | "mid" | "expert";
  yearsOfExperience: number;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  desiredCategories: string[]; // ["AI coding", "AI evaluation", "Data annotation", "Writing", "Language", "Software testing"]
  remoteOnly: boolean;
  weeklyHoursAvailable: number; // e.g. 10, 20, 40
  preferredPayoutMethods: string[]; // ["PayPal", "Direct Deposit", "Wise", "Payoneer"]
  bio: string;
  resume?: UserResume;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}
