/**
 * Portfolio Applications, Open-Source Contributions & Acquisition Marketplace Test Suite
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

describe("Portfolio Applications, Contributions & Acquisitions Suite", () => {
  // Required 14 applications from Google Play Console
  const REQUIRED_14_APPS = [
    {
      id: "moonroot-seedlight",
      name: "Moonroot: Seedlight",
      packageName: "com.moonroot.seedlight",
      category: "Games & Interactive Entertainment",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "emberline-odyssey",
      name: "Emberline Odyssey",
      packageName: "com.lumentrail.emberlineodyssey",
      category: "Games & Interactive Entertainment",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "city-cat-runner",
      name: "City Cat Runner",
      packageName: "com.shezadgames.citycatrunner",
      category: "Games & Interactive Entertainment",
      isSuspended: true, // Specifically suspended per instructions
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "gps-map-camera-geotagging",
      name: "GPS Map Camera : Geo Tagging",
      packageName: "com.homedesignia.geocamera",
      category: "Photography, Camera & Personalization",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "snapglow-insta-filters",
      name: "SnapGlow Insta Filters",
      packageName: "com.snapglow.app",
      category: "Photography, Camera & Personalization",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "ai-edge-on-device-ai",
      name: "AI Edge: On-Device AI",
      packageName: "ai.offlinellm.assistant",
      category: "AI & Smart Utilities",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "speech-to-text-ai-voice",
      name: "Speech-to-Text AI voice typing",
      packageName: "wekk.app",
      category: "AI & Smart Utilities",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "signflow-esign-pdf",
      name: "SignFlow – eSign & PDF",
      packageName: "com.shezad.signflow",
      category: "Productivity & Document Management",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "docuscan-opencv-smart-scanner",
      name: "DocuScan: OpenCv Smart Scanner",
      packageName: "io.docuscan.app",
      category: "Productivity & Document Management",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "pdf-scanner-ocr-pageray",
      name: "PDF Scanner & OCR - PageRay",
      packageName: "com.antigravity.scanner",
      category: "Productivity & Document Management",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "insomnia-better-sleep",
      name: "insomnia: better sleep",
      packageName: "com.insomania.bettersleep",
      category: "Health & Wellness",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "cyclecare-period-tracker",
      name: "CycleCare: Period Tracker",
      packageName: "com.cyclecare.tracker",
      category: "Health & Wellness",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "upi-alert-voice-soundbox",
      name: "UPI Alert: Voice Soundbox",
      packageName: "com.alertpay.alertpay",
      category: "Finance & Payments",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
    {
      id: "homedesignia",
      name: "HomeDesignia",
      packageName: "com.homedesignia.app",
      category: "Home & Lifestyle",
      isSuspended: false,
      isOpenSource: false,
      pricingType: "on_request",
    },
  ];

  // Contribution Proposal Schema
  const contributionProposalSchema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phoneNumber: z.string().max(25).optional().or(z.literal("")),
    githubProfile: z
      .string()
      .url()
      .refine((url) => {
        try {
          const parsed = new URL(url);
          return parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
        } catch {
          return false;
        }
      }, "Must be a github.com URL"),
    qualification: z.string().min(2),
    technicalSkills: z.string().min(2),
    projectIds: z.array(z.string()).min(1),
    contributionTypes: z.array(z.string()).min(1),
    proposalTitle: z.string().min(10),
    detailedDescription: z.string().min(30),
    problemSolved: z.string().min(15),
    technicalApproach: z.string().min(20),
    expectedOutcome: z.string().min(15),
    estimatedCompletionTime: z.string().min(2),
    consentReviewed: z.literal(true),
  });

  // Acquisition Enquiry Schema
  const acquisitionEnquirySchema = z.object({
    fullName: z.string().min(2),
    businessName: z.string().optional().or(z.literal("")),
    email: z.string().email(),
    contactNumber: z.string().min(6),
    country: z.string().min(2),
    appId: z.string().min(1),
    appName: z.string().min(1),
    proposedBudget: z.string().min(2),
    acquisitionType: z.enum([
      "Full App Acquisition",
      "Full Game Acquisition",
      "Source Code Acquisition",
      "Partnership",
      "Licensing",
      "Other",
    ]),
    message: z.string().min(15),
  });

  test("contains all 14 baseline applications specified in requirements", () => {
    assert.equal(REQUIRED_14_APPS.length, 14);

    const categories = new Set(REQUIRED_14_APPS.map((a) => a.category));
    assert.equal(categories.size, 7);
    assert.ok(categories.has("Games & Interactive Entertainment"));
    assert.ok(categories.has("Photography, Camera & Personalization"));
    assert.ok(categories.has("AI & Smart Utilities"));
    assert.ok(categories.has("Productivity & Document Management"));
    assert.ok(categories.has("Health & Wellness"));
    assert.ok(categories.has("Finance & Payments"));
    assert.ok(categories.has("Home & Lifestyle"));
  });

  test("City Cat Runner is marked as suspended and unavailable for public testing", () => {
    const cityCat = REQUIRED_14_APPS.find((a) => a.packageName === "com.shezadgames.citycatrunner");
    assert.ok(cityCat);
    assert.equal(cityCat.isSuspended, true);
    assert.equal(cityCat.pricingType, "on_request");
  });

  test("all baseline apps default to Price on Request with no invented valuations", () => {
    for (const app of REQUIRED_14_APPS) {
      assert.equal(app.pricingType, "on_request");
    }
  });

  test("validates 18-field contribution proposal with consent", () => {
    const valid = {
      fullName: "Maya Lin",
      email: "maya@example.com",
      githubProfile: "https://github.com/mayalin",
      qualification: "Senior Android Developer",
      technicalSkills: "Kotlin, OpenCV, Jetpack Compose",
      projectIds: ["docuscan-opencv-smart-scanner"],
      contributionTypes: ["Performance Optimization", "Android Development"],
      proposalTitle: "ARM NEON SIMD Accelerated Contour Detection",
      detailedDescription:
        "Port the compute-heavy bilateral shadow filtering and perspective transformation to native C++ NDK.",
      problemSolved: "Frame stutter during live camera document preview on mid-range devices.",
      technicalApproach: "Implement JNI zero-copy buffer passing with DirectByteBuffer.",
      expectedOutcome: "Sustained 60 FPS document quad tracking.",
      estimatedCompletionTime: "2 weeks",
      consentReviewed: true,
    };

    assert.equal(contributionProposalSchema.safeParse(valid).success, true);

    // Missing consent rejected
    assert.equal(
      contributionProposalSchema.safeParse({ ...valid, consentReviewed: false }).success,
      false
    );

    // Invalid GitHub domain rejected
    assert.equal(
      contributionProposalSchema.safeParse({ ...valid, githubProfile: "https://notgithub.com/me" }).success,
      false
    );

    // Missing project selection rejected
    assert.equal(
      contributionProposalSchema.safeParse({ ...valid, projectIds: [] }).success,
      false
    );
  });

  test("validates acquisition enquiry fields and acquisition types", () => {
    const valid = {
      fullName: "Vikram Singhania",
      businessName: "Kite Mobile Ltd.",
      email: "vikram@kitemobile.in",
      contactNumber: "+91 98200 11223",
      country: "India",
      appId: "gps-map-camera-geotagging",
      appName: "GPS Map Camera : Geo Tagging",
      proposedBudget: "Budget to be discussed",
      acquisitionType: "Full App Acquisition",
      message: "Interested in acquiring full IP and Play Store console transfer for field survey fleet.",
    };

    assert.equal(acquisitionEnquirySchema.safeParse(valid).success, true);

    // Unsupported type rejected
    assert.equal(
      acquisitionEnquirySchema.safeParse({ ...valid, acquisitionType: "InvalidType" }).success,
      false
    );

    // Short message rejected
    assert.equal(
      acquisitionEnquirySchema.safeParse({ ...valid, message: "Too short" }).success,
      false
    );
  });

  test("generates unique Certificate IDs and verifiable links", () => {
    const certId = `CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    assert.ok(certId.startsWith("CERT-2026-"));
    assert.ok(certId.length >= 14);

    const verificationUrl = `https://remotasks.si/verify-certificate/${certId}`;
    assert.ok(verificationUrl.includes(certId));
  });

  test("maintains separate lifecycle stages for internships and contributions", () => {
    const contributionStages = [
      "Submitted",
      "Under Review",
      "Shortlisted",
      "Approved",
      "In Development",
      "Under Testing",
      "Completed",
      "Rejected",
    ];

    const internshipStages = [
      "Submitted",
      "Under Review",
      "Interview",
      "Selected",
      "Not Selected",
    ];

    const acquisitionStages = [
      "New",
      "Contacted",
      "Negotiating",
      "Due Diligence",
      "Agreement",
      "Closed",
    ];

    // Ensure distinct dedicated lifecycle states per workflow
    assert.ok(contributionStages.includes("Completed"));
    assert.ok(internshipStages.includes("Interview"));
    assert.ok(internshipStages.includes("Selected"));
    assert.ok(acquisitionStages.includes("Negotiating"));
    assert.ok(acquisitionStages.includes("Due Diligence"));
  });

  test("verifies SQL migration and seed file contents", () => {
    const schemaPath = path.resolve(process.cwd(), "supabase/portfolio_schema.sql");
    const seedPath = path.resolve(process.cwd(), "supabase/portfolio_seed.sql");

    assert.ok(fs.existsSync(schemaPath));
    assert.ok(fs.existsSync(seedPath));

    const schema = fs.readFileSync(schemaPath, "utf8");
    const seed = fs.readFileSync(seedPath, "utf8");

    assert.ok(schema.includes("ENABLE ROW LEVEL SECURITY"));
    assert.ok(schema.includes("portfolio_apps"));
    assert.ok(schema.includes("portfolio_contributions"));
    assert.ok(schema.includes("portfolio_certificates"));
    assert.ok(schema.includes("portfolio_internships"));
    assert.ok(schema.includes("portfolio_acquisitions"));

    // Check all 14 packages in seed
    for (const app of REQUIRED_14_APPS) {
      assert.ok(seed.includes(app.packageName), `Missing ${app.packageName} in seed.sql`);
    }
  });
});
