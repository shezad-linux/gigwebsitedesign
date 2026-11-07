import { z } from "zod";

export const contributionProposalSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phoneNumber: z.string().max(25).optional().or(z.literal("")),
  githubProfile: z
    .string()
    .url("Please provide a valid GitHub profile URL")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
      } catch {
        return false;
      }
    }, "Must be a github.com URL"),
  linkedinProfile: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
  qualification: z.string().min(2, "Please enter your current qualification or background").max(150),
  technicalSkills: z.string().min(2, "Please enter your technical skills").max(300),
  projectIds: z.array(z.string()).min(1, "Please select at least one application or project"),
  contributionTypes: z.array(z.string()).min(1, "Please select at least one contribution type"),
  proposalTitle: z.string().min(10, "Title must be at least 10 characters").max(180),
  detailedDescription: z.string().min(30, "Detailed description must be at least 30 characters"),
  problemSolved: z.string().min(15, "Problem being solved must be at least 15 characters"),
  technicalApproach: z.string().min(20, "Technical approach must be at least 20 characters"),
  expectedOutcome: z.string().min(15, "Expected outcome must be at least 15 characters"),
  repoReferenceUrl: z.string().url("Please provide a valid reference URL").optional().or(z.literal("")),
  estimatedCompletionTime: z.string().min(2, "Please provide an estimated completion timeline").max(60),
  additionalComments: z.string().max(1000).optional().or(z.literal("")),
  consentReviewed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the review consent" }),
  }),
});

export const acquisitionEnquirySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  businessName: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Please provide a valid email address"),
  contactNumber: z.string().min(6, "Contact number is required").max(30),
  country: z.string().min(2, "Country is required").max(80),
  appId: z.string().min(1, "Please select an application or game"),
  appName: z.string().min(1, "Application name is required"),
  proposedBudget: z.string().min(2, "Proposed acquisition budget is required").max(100),
  acquisitionType: z.enum([
    "Full App Acquisition",
    "Full Game Acquisition",
    "Source Code Acquisition",
    "Partnership",
    "Licensing",
    "Other",
  ]),
  message: z.string().min(15, "Message must be at least 15 characters").max(2000),
});

export const generalContactSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email required"),
  subjectCategory: z.enum([
    "Business partnerships",
    "Technical collaboration",
    "App development",
    "Game development",
    "Acquisition discussions",
    "Other enquiries",
  ]),
  message: z.string().min(15, "Message must be at least 15 characters").max(2000),
});

export const certificateIssueSchema = z.object({
  contributionId: z.string().optional(),
  contributorName: z.string().min(2),
  contributorEmail: z.string().email(),
  projectName: z.string().min(2),
  contributionType: z.string().min(2),
  completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  issuerName: z.string().min(2),
  issuerTitle: z.string().min(2),
  organizationName: z.string().default("Remotasks App Portfolio"),
  summary: z.string().min(10),
});
