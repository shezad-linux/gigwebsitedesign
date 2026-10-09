import {
  PaymentEvidence,
  ListingReview,
  ListingReport,
  AuditEvent,
  PlatformInfo,
  GigListing,
  ReportStatus,
  PublicationStatus,
} from "@/types/gig";

const STORAGE_KEYS = {
  PAYMENT_EVIDENCE: "gigmatcher_payment_evidence_v1",
  REPORTS: "gigmatcher_listing_reports_v1",
  AUDIT_EVENTS: "gigmatcher_audit_events_v1",
  PLATFORMS: "gigmatcher_platforms_v1",
};

export const INITIAL_PLATFORMS: PlatformInfo[] = [
  {
    id: "outlier",
    name: "Outlier AI",
    websiteUrl: "https://outlier.ai",
    careersUrl: "https://outlier.ai/careers",
    description: "Generative AI training platform specializing in STEM and coding alignment.",
    headquarters: "San Francisco, CA",
    verified: true,
  },
  {
    id: "dataannotation",
    name: "DataAnnotation Tech",
    websiteUrl: "https://www.dataannotation.tech",
    careersUrl: "https://www.dataannotation.tech/faq",
    description: "Premier flexible work platform for chatbot training, coding tasks, and evaluation.",
    headquarters: "New York, NY",
    verified: true,
  },
  {
    id: "alignerr",
    name: "Alignerr",
    websiteUrl: "https://www.alignerr.com",
    careersUrl: "https://www.alignerr.com",
    description: "Labelbox ecosystem platform hiring specialized domain experts for AI model evaluation.",
    headquarters: "San Francisco, CA",
    verified: true,
  },
  {
    id: "mindrift",
    name: "Mindrift",
    websiteUrl: "https://mindrift.ai",
    careersUrl: "https://mindrift.ai/careers",
    description: "Global AI freelancing platform focused on writing, editing, and prompt evaluation.",
    headquarters: "London, UK",
    verified: true,
  },
  {
    id: "testlio",
    name: "Testlio",
    websiteUrl: "https://testlio.com",
    careersUrl: "https://testlio.com",
    description: "Distributed testing platform executing networked mobile, web, and AI functionality runs.",
    headquarters: "Austin, TX / Tallinn, Estonia",
    verified: true,
  },
];

export const INITIAL_PAYMENT_EVIDENCE: PaymentEvidence[] = [
  {
    id: "pe_outlier_01",
    gigId: "gig-outlier-01",
    advertisedRate: 40,
    currency: "USD",
    unit: "hour",
    rateType: "official_advertised",
    payoutMethods: ["PayPal", "Airwallex", "Direct Deposit"],
    sourceUrl: "https://outlier.ai/careers",
    evidenceNotes: "Advertised starting rates verified for tier-3 software developers. Weekly disbursements on Tuesdays.",
    verificationStatus: "verified",
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pe_dataannotation_01",
    gigId: "gig-dataannotation-01",
    advertisedRate: 38,
    currency: "USD",
    unit: "hour",
    rateType: "official_advertised",
    payoutMethods: ["PayPal"],
    sourceUrl: "https://www.dataannotation.tech/faq",
    evidenceNotes: "Direct coding prompt projects pay $35-$42/hr; funds disbursed via instant PayPal transfer.",
    verificationStatus: "verified",
    reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pe_alignerr_01",
    gigId: "gig-alignerr-01",
    advertisedRate: 36,
    currency: "USD",
    unit: "hour",
    rateType: "official_advertised",
    payoutMethods: ["Deel"],
    sourceUrl: "https://www.alignerr.com",
    evidenceNotes: "Contractor agreement sets baseline pay at $36/hr for approved technical evaluators.",
    verificationStatus: "verified",
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pe_mindrift_01",
    gigId: "gig-mindrift-01",
    advertisedRate: 22,
    currency: "USD",
    unit: "hour",
    rateType: "worker_reported",
    payoutMethods: ["Wise", "PayPal"],
    sourceUrl: "https://mindrift.ai",
    evidenceNotes: "Rate based on verified community paystubs for bilingual reasoning evaluations.",
    verificationStatus: "partial",
    reviewedAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Expired / Stale
  },
  {
    id: "pe_testlio_01",
    gigId: "gig-testlio-01",
    advertisedRate: 28,
    currency: "USD",
    unit: "hour",
    rateType: "official_advertised",
    payoutMethods: ["PayPal", "Payoneer"],
    sourceUrl: "https://testlio.com",
    evidenceNotes: "Exploratory testing runs compensate $25-$32/hr depending on device and run scope.",
    verificationStatus: "verified",
    reviewedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "pe_remotasks_01",
    gigId: "gig-remotasks-01",
    advertisedRate: 18,
    currency: "USD",
    unit: "hour",
    rateType: "unverified",
    payoutMethods: ["PayPal"],
    sourceUrl: "https://www.remotasks.com",
    evidenceNotes: "Community report indicates migration to Outlier portal; pay structure undergoing restructuring.",
    verificationStatus: "unverified",
    reviewedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // Expired / Stale
  },
];

export const INITIAL_LISTING_REPORTS: ListingReport[] = [
  {
    id: "rep_001",
    gigId: "gig-outlier-01",
    gigTitle: "AI Coding Evaluation & Code Review",
    platformName: "Outlier AI",
    reporterEmail: "contributor_dev@gmail.com",
    reportType: "changed_country_restriction",
    description: "Outlier has halted onboarding for Indian tax residents in specific tier-1 coding projects until next cohort.",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep_002",
    gigId: "gig-dataannotation-01",
    gigTitle: "Full-Stack AI Code Generation Evaluator",
    platformName: "DataAnnotation Tech",
    reporterEmail: "alex_tester@outlook.com",
    reportType: "closed_application",
    description: "The initial starter assessment queue shows 'No tasks currently available for this qualification test'.",
    status: "open",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep_003",
    gigId: "gig-mindrift-01",
    gigTitle: "LLM Reasoning & Factuality Evaluator",
    platformName: "Mindrift",
    reporterEmail: "samantha_ling@gmail.com",
    reportType: "incorrect_payment",
    description: "New starter contracts offer $18/hr rather than the listed $22/hr for French & Spanish language pairs.",
    status: "open",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep_004",
    gigId: "gig-alignerr-01",
    gigTitle: "Technical AI Tutor & Logic Reviewer",
    platformName: "Alignerr",
    reporterEmail: "dan_code@gmail.com",
    reportType: "broken_link",
    description: "The direct application slug was returning 404 last weekend; redirect now leads to primary careers page.",
    status: "resolved",
    resolutionNotes: "Updated official application URL to valid root onboarding portal. Verified and confirmed.",
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud_001",
    entityType: "gig_listing",
    entityId: "gig-outlier-01",
    actorEmail: "operations_lead@gigmatcher.io",
    action: "update",
    changes: {
      pay_amount: { before: 35, after: 40 },
      payment_verification: { before: "partial", after: "verified" },
    },
    justification: "Verified with live candidate pay stub and official career posting update.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aud_002",
    entityType: "payment_evidence",
    entityId: "pe_mindrift_01",
    actorEmail: "verification_bot@gigmatcher.io",
    action: "verify_evidence",
    changes: {
      rate_type: { before: "unverified", after: "worker_reported" },
    },
    justification: "Corroborated by three independent applicant submissions in community discord.",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "aud_003",
    entityType: "listing_report",
    entityId: "rep_004",
    actorEmail: "admin_reviewer@gigmatcher.io",
    action: "resolve_report",
    changes: {
      status: { before: "open", after: "resolved" },
    },
    justification: "Fixed broken application link pointing to new domain subdomain.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/* ==================== Storage Getters / Setters ==================== */

export function getStoredPlatforms(): PlatformInfo[] {
  if (typeof window === "undefined") return INITIAL_PLATFORMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(INITIAL_PLATFORMS));
      return INITIAL_PLATFORMS;
    }
    return JSON.parse(raw) as PlatformInfo[];
  } catch (err) {
    console.error("Failed to read stored platforms:", err);
    return INITIAL_PLATFORMS;
  }
}

export function saveStoredPlatforms(platforms: PlatformInfo[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
  } catch (err) {
    console.error("Failed to save platforms:", err);
  }
}

export function getStoredPaymentEvidence(): PaymentEvidence[] {
  if (typeof window === "undefined") return INITIAL_PAYMENT_EVIDENCE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_EVIDENCE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_EVIDENCE, JSON.stringify(INITIAL_PAYMENT_EVIDENCE));
      return INITIAL_PAYMENT_EVIDENCE;
    }
    return JSON.parse(raw) as PaymentEvidence[];
  } catch (err) {
    console.error("Failed to read stored payment evidence:", err);
    return INITIAL_PAYMENT_EVIDENCE;
  }
}

export function saveStoredPaymentEvidence(evidenceList: PaymentEvidence[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_EVIDENCE, JSON.stringify(evidenceList));
  } catch (err) {
    console.error("Failed to save payment evidence list:", err);
  }
}

export function upsertPaymentEvidence(item: PaymentEvidence): PaymentEvidence[] {
  const current = getStoredPaymentEvidence();
  const index = current.findIndex((p) => p.gigId === item.gigId || p.id === item.id);
  let updated: PaymentEvidence[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  saveStoredPaymentEvidence(updated);
  return updated;
}

export function getStoredListingReports(): ListingReport[] {
  if (typeof window === "undefined") return INITIAL_LISTING_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_LISTING_REPORTS));
      return INITIAL_LISTING_REPORTS;
    }
    return JSON.parse(raw) as ListingReport[];
  } catch (err) {
    console.error("Failed to read stored listing reports:", err);
    return INITIAL_LISTING_REPORTS;
  }
}

export function saveStoredListingReports(reports: ListingReport[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    window.dispatchEvent(new Event("gigmatcher_reports_updated"));
  } catch (err) {
    console.error("Failed to save listing reports:", err);
  }
}

export function submitReport(report: {
  gigId: string;
  gigTitle?: string;
  platformName?: string;
  reporterEmail?: string;
  reportType: ListingReport["reportType"];
  description: string;
}): ListingReport {
  const newReport: ListingReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gigId: report.gigId,
    gigTitle: report.gigTitle,
    platformName: report.platformName,
    reporterEmail: report.reporterEmail || "anonymous_contributor@gigmatcher.io",
    reportType: report.reportType,
    description: report.description,
    status: "open",
    createdAt: new Date().toISOString(),
  };

  const current = getStoredListingReports();
  const updated = [newReport, ...current];
  saveStoredListingReports(updated);

  // Also record in audit log
  recordAuditEvent({
    entityType: "listing_report",
    entityId: newReport.id,
    actorEmail: newReport.reporterEmail || "anonymous",
    action: "create",
    changes: {
      type: { before: null, after: newReport.reportType },
      status: { before: null, after: "open" },
    },
    justification: `User submitted report: "${newReport.description.slice(0, 80)}..."`,
  });

  return newReport;
}

export function updateListingReportStatus(
  reportId: string,
  status: ReportStatus,
  resolutionNotes?: string,
  actorEmail = "admin@gigmatcher.io"
): ListingReport[] {
  const current = getStoredListingReports();
  const target = current.find((r) => r.id === reportId);
  const updated = current.map((r) => {
    if (r.id === reportId) {
      return {
        ...r,
        status,
        resolutionNotes: resolutionNotes || r.resolutionNotes,
        resolvedAt: status === "resolved" || status === "dismissed" ? new Date().toISOString() : undefined,
      };
    }
    return r;
  });

  saveStoredListingReports(updated);

  if (target) {
    recordAuditEvent({
      entityType: "listing_report",
      entityId: reportId,
      actorEmail,
      action: "resolve_report",
      changes: {
        status: { before: target.status, after: status },
      },
      justification: resolutionNotes || `Report status updated to ${status}`,
    });
  }

  return updated;
}

export function getStoredAuditEvents(): AuditEvent[] {
  if (typeof window === "undefined") return INITIAL_AUDIT_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(INITIAL_AUDIT_EVENTS));
      return INITIAL_AUDIT_EVENTS;
    }
    return JSON.parse(raw) as AuditEvent[];
  } catch (err) {
    console.error("Failed to read stored audit events:", err);
    return INITIAL_AUDIT_EVENTS;
  }
}

export function recordAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">): AuditEvent {
  const newEvent: AuditEvent = {
    ...event,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getStoredAuditEvents();
      const updated = [newEvent, ...current];
      localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(updated));
      window.dispatchEvent(new Event("gigmatcher_audit_updated"));
    } catch (err) {
      console.error("Failed to record audit event:", err);
    }
  }

  return newEvent;
}

/* ==================== Review Queue & Stale Detection ==================== */

export interface ReviewQueueItem {
  gig: GigListing;
  reason: string;
  nextReviewAt: string;
  urgency: "critical" | "warning" | "normal";
  evidenceNotes?: string;
}

export function getReviewQueue(
  gigs: GigListing[],
  evidenceList: PaymentEvidence[],
  reports: ListingReport[] = []
): ReviewQueueItem[] {
  const now = Date.now();
  const queue: ReviewQueueItem[] = [];

  for (const gig of gigs) {
    const evidence = evidenceList.find((e) => e.gigId === gig.id);
    const openReportsForGig = reports.filter((r) => r.gigId === gig.id && r.status === "open");

    let isStale = false;
    let urgency: "critical" | "warning" | "normal" = "normal";
    const reasons: string[] = [];

    // Condition 1: Has open reports from community
    if (openReportsForGig.length > 0) {
      reasons.push(`${openReportsForGig.length} open community report(s)`);
      urgency = "critical";
    }

    // Condition 2: Payment or eligibility unverified
    if (gig.paymentVerification === "unverified" || gig.eligibilityVerification === "unverified") {
      reasons.push("Unverified claims present");
      if (urgency !== "critical") urgency = "warning";
    }

    // Condition 3: Evidence expiration date passed
    let nextReviewStr = gig.lastReviewedAt || new Date().toISOString();
    if (evidence?.nextReviewAt) {
      nextReviewStr = evidence.nextReviewAt;
      const nextReviewTime = new Date(evidence.nextReviewAt).getTime();
      if (nextReviewTime < now) {
        const daysOverdue = Math.round((now - nextReviewTime) / (1000 * 60 * 60 * 24));
        reasons.push(`Review overdue by ${daysOverdue} day(s)`);
        isStale = true;
        if (daysOverdue > 14) urgency = "critical";
        else if (urgency !== "critical") urgency = "warning";
      }
    } else if (gig.lastReviewedAt) {
      const lastReviewTime = new Date(gig.lastReviewedAt).getTime();
      const ageDays = Math.round((now - lastReviewTime) / (1000 * 60 * 60 * 24));
      if (ageDays > 60) {
        reasons.push(`No verification review for ${ageDays} days`);
        isStale = true;
        if (urgency !== "critical") urgency = "warning";
      }
    }

    // Condition 4: Draft or paused status
    if (gig.publicationStatus === "paused") {
      reasons.push("Listing paused (temporarily inactive)");
    } else if (gig.publicationStatus === "draft") {
      reasons.push("Draft pending publication verification");
    }

    if (reasons.length > 0) {
      queue.push({
        gig,
        reason: reasons.join(" • "),
        nextReviewAt: nextReviewStr,
        urgency,
        evidenceNotes: evidence?.evidenceNotes || gig.eligibilitySourceNote,
      });
    }
  }

  // Sort: critical first, then warning, then normal
  const urgencyWeight = { critical: 3, warning: 2, normal: 1 };
  queue.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

  return queue;
}

/* ==================== Operations Metrics (Phase 4 KPIs) ==================== */

export interface OperationsMetrics {
  publishedCount: number;
  needsReviewCount: number;
  openReportsCount: number;
  unverifiedClaimsCount: number;
  totalListingsCount: number;
  pausedCount: number;
  draftCount: number;
}

export function getOperationsMetrics(
  gigs: GigListing[],
  reports: ListingReport[],
  evidenceList: PaymentEvidence[]
): OperationsMetrics {
  const publishedCount = gigs.filter(
    (g) => g.publicationStatus === "published" || !g.publicationStatus
  ).length;

  const pausedCount = gigs.filter((g) => g.publicationStatus === "paused").length;
  const draftCount = gigs.filter((g) => g.publicationStatus === "draft").length;

  const openReportsCount = reports.filter((r) => r.status === "open").length;

  const reviewQueue = getReviewQueue(gigs, evidenceList, reports);
  const needsReviewCount = reviewQueue.length;

  const unverifiedClaimsCount = gigs.filter(
    (g) =>
      g.paymentVerification === "unverified" ||
      g.eligibilityVerification === "unverified" ||
      g.paymentVerification === "partial" ||
      g.eligibilityVerification === "partial"
  ).length;

  return {
    publishedCount,
    needsReviewCount,
    openReportsCount,
    unverifiedClaimsCount,
    totalListingsCount: gigs.length,
    pausedCount,
    draftCount,
  };
}
