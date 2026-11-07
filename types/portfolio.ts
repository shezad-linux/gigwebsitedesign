export type AppCategory =
  | "Games & Interactive Entertainment"
  | "Photography, Camera & Personalization"
  | "AI & Smart Utilities"
  | "Productivity & Document Management"
  | "Health & Wellness"
  | "Finance & Payments"
  | "Home & Lifestyle";

export type DevelopmentStatus =
  | "published"
  | "in_development"
  | "beta"
  | "suspended"
  | "archived";

export type PricingType = "fixed" | "negotiable" | "on_request";

export interface PortfolioApp {
  id: string;
  name: string;
  packageName: string;
  category: AppCategory;
  shortDescription: string;
  keyFeatures: string[];
  developmentStatus: DevelopmentStatus;
  isPublished: boolean;
  isSuspended: boolean;
  googlePlayUrl: string;
  iconUrl: string;
  screenshots?: string[];
  isOpenSource: boolean;
  openSourceRepoUrl?: string;
  techStack: string[];
  acquisitionAvailable: boolean;
  askingPrice: number | null; // e.g. 500000 (INR)
  currency: string; // default "INR"
  pricingType: PricingType;
  privateNegotiationNotes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ContributionType =
  | "Suggest a New Feature"
  | "Improve an Existing Feature"
  | "Fix a Bug"
  | "UI/UX Improvements"
  | "Performance Optimization"
  | "Android Development"
  | "Backend Development"
  | "API Integration"
  | "AI/ML Integration"
  | "Testing & Quality Assurance"
  | "Documentation"
  | "Accessibility Improvements"
  | "Security Improvements";

export type ContributionWorkflowStage =
  | "Submitted"
  | "Under Review"
  | "Shortlisted"
  | "Approved"
  | "In Development"
  | "Under Testing"
  | "Completed"
  | "Merged / Released"
  | "Rejected";

export interface ContributionProposal {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  githubProfile: string;
  linkedinProfile?: string;
  portfolioUrl?: string;
  qualification: string;
  technicalSkills: string;
  projectIds: string[]; // App IDs selected
  projectNames?: string[];
  contributionTypes: ContributionType[];
  proposalTitle: string;
  detailedDescription: string;
  problemSolved: string;
  technicalApproach: string;
  expectedOutcome: string;
  repoReferenceUrl?: string;
  estimatedCompletionTime: string;
  additionalComments?: string;
  consentReviewed: boolean;
  status: ContributionWorkflowStage;
  adminFeedback?: string;
  internshipConsideration?: boolean;
  certificateId?: string;
  createdAt: string;
  updatedAt: string;
}

export type InternshipStatus =
  | "Submitted"
  | "Under Review"
  | "Interview"
  | "Selected"
  | "Not Selected"
  | "Candidate"
  | "Shortlisted"
  | "Declined";

export interface InternshipRecord {
  id: string;
  contributionId?: string;
  candidateName: string;
  candidateEmail: string;
  githubProfile?: string;
  associatedProject: string;
  status: InternshipStatus;
  roleTitle: string;
  durationMonths: number;
  responsibilities: string;
  interviewNotes?: string;
  formalOfferIssued: boolean;
  documentationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionCertificate {
  id: string; // e.g. "CERT-2026-MR8X92K"
  contributionId?: string;
  contributorName: string;
  contributorEmail: string;
  projectName: string;
  contributionType: string;
  completionDate: string; // YYYY-MM-DD
  issuerName: string;
  issuerTitle: string;
  organizationName: string;
  verificationUrl: string;
  status: "Issued" | "Revoked";
  summary: string;
  createdAt: string;
}

export type AcquisitionType =
  | "Full App Acquisition"
  | "Full Game Acquisition"
  | "Source Code Acquisition"
  | "Partnership"
  | "Licensing"
  | "Other";

export type AcquisitionEnquiryStatus =
  | "New"
  | "Contacted"
  | "Negotiating"
  | "Due Diligence"
  | "Agreement"
  | "Closed"
  | "Under Review"
  | "Declined";

export interface AcquisitionEnquiry {
  id: string;
  fullName: string;
  businessName?: string;
  email: string;
  contactNumber: string;
  country: string;
  appId: string;
  appName: string;
  proposedBudget: string;
  acquisitionType: AcquisitionType;
  message: string;
  status: AcquisitionEnquiryStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralContactMessage {
  id: string;
  fullName: string;
  email: string;
  subjectCategory:
  | "Business partnerships"
  | "Technical collaboration"
  | "App development"
  | "Game development"
  | "Acquisition discussions"
  | "Other enquiries";
  message: string;
  createdAt: string;
}

