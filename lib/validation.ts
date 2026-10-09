import { z } from "zod";

export const onboardingStep2Schema = z.object({
  country: z.string().min(2, "Country name is required"),
  countryCode: z.string().min(2, "Country code is required"),
  workAuthorization: z.string().optional(),
  languages: z
    .array(
      z.object({
        name: z.string().min(1, "Language name is required"),
        proficiency: z.enum(["native", "fluent", "professional", "basic"]),
      })
    )
    .min(1, "At least one language is required"),
});

export const onboardingStep3Schema = z.object({
  skills: z.array(z.string()).min(1, "Please select or add at least one skill"),
  experienceLevel: z.enum(["entry", "mid", "expert"]),
  yearsOfExperience: z.number().min(0).max(40),
  portfolioUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export const onboardingStep4Schema = z.object({
  desiredCategories: z.array(z.string()).min(1, "Select at least one desired category"),
  remoteOnly: z.boolean(),
  weeklyHoursAvailable: z.number().min(1, "Available hours must be at least 1").max(80),
  preferredPayoutMethods: z.array(z.string()).min(1, "Select at least one payout method"),
  bio: z.string().min(10, "Summary should be at least 10 characters"),
});

export const adminGigFormSchema = z.object({
  platformName: z.string().min(2, "Platform name is required"),
  title: z.string().min(3, "Role title is required"),
  category: z.string().min(2, "Category is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  skillsRequired: z.string().min(2, "At least one comma-separated skill required"),
  eligibleCountries: z.string().min(2, "Comma-separated eligible countries (e.g. Global, India, US)"),
  remote: z.boolean(),
  payAmount: z.number().min(0, "Pay amount must be >= 0"),
  payCurrency: z.string().min(1, "Currency required"),
  payUnit: z.string().min(1, "Unit required (e.g. hour, task)"),
  paymentVerification: z.enum(["verified", "partial", "unverified"]),
  eligibilityVerification: z.enum(["verified", "partial", "unverified"]),
  officialUrl: z.string().url("Must be a valid official platform URL"),
  onboardingStepsText: z.string().min(5, "Add at least one onboarding step (one per line)"),
  sponsored: z.boolean(),
  experienceLevel: z.enum(["entry", "mid", "expert"]),
  availabilityStatus: z.enum(["open", "waitlist", "selective", "paused"]),
});

export type AdminGigFormValues = z.infer<typeof adminGigFormSchema>;
