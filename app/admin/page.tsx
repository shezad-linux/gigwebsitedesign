"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Globe2,
  Clock,
  DollarSign,
  AlertCircle,
  Eye,
  Sliders,
  Filter,
  Search,
  Check,
  X,
  AlertTriangle,
  FileText,
  Activity,
  History,
  MessageSquare,
  Pause,
  Play,
  Archive,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, PaymentVerificationBadge, EligibilityBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  GigListing,
  PaymentVerification,
  EligibilityVerification,
  PublicationStatus,
  PaymentEvidence,
  ListingReport,
  AuditEvent,
  ReportStatus,
  ReportType,
  PaymentEvidenceRateType,
} from "@/types/gig";
import { getStoredGigs, saveStoredGig, resetStoredGigs } from "@/lib/storage";
import {
  getReviewQueue,
  getOperationsMetrics,
  ReviewQueueItem,
} from "@/lib/operations";
import { apiClient } from "@/lib/api";

type ActiveTab = "listings" | "queue" | "evidence" | "reports" | "audit";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("listings");
  const [gigs, setGigs] = useState<GigListing[]>([]);
  const [paymentEvidence, setPaymentEvidence] = useState<PaymentEvidence[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PublicationStatus>("all");
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | ReportStatus>("all");

  // Modals state
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<GigListing | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingQueueItem, setReviewingQueueItem] = useState<ReviewQueueItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "changes_requested" | "stale_flagged" | "archived">("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewExtendDays, setReviewExtendDays] = useState(60);

  const [isReportActionModalOpen, setIsReportActionModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ListingReport | null>(null);
  const [reportActionType, setReportActionType] = useState<"resolve" | "dismiss">("resolve");
  const [reportResolutionNotes, setReportResolutionNotes] = useState("");

  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<PaymentEvidence | null>(null);

  // Listing Form State
  const [formData, setFormData] = useState({
    id: "",
    slug: "",
    platformName: "",
    title: "",
    category: "AI Coding",
    description: "",
    skillsRequired: "Python, Java, Code Review",
    eligibleCountries: "Global, India, United States",
    remote: true,
    payAmount: 35,
    payCurrency: "USD",
    payUnit: "hour",
    payTermsNote: "Weekly payouts via PayPal",
    paymentVerification: "verified" as PaymentVerification,
    eligibilityVerification: "verified" as EligibilityVerification,
    publicationStatus: "published" as PublicationStatus,
    officialUrl: "https://example.com/careers",
    onboardingStepsText: "1. Resume submission\n2. Coding test\n3. Queue orientation",
    sponsored: false,
    experienceLevel: "mid" as "entry" | "mid" | "expert",
    availabilityStatus: "open" as "open" | "waitlist" | "selective" | "paused",
    eligibilitySourceNote: "Community verified via contributor onboarding threads.",
  });

  // Evidence Form State
  const [evidenceFormData, setEvidenceFormData] = useState({
    id: "",
    gigId: "",
    advertisedRate: 35,
    currency: "USD",
    unit: "hour",
    rateType: "official_advertised" as PaymentEvidenceRateType,
    payoutMethods: "PayPal, Airwallex",
    sourceUrl: "https://example.com/careers",
    evidenceNotes: "Official job specification published on career portal.",
    verificationStatus: "verified" as PaymentVerification,
    extendDays: 60,
  });

  const loadAllData = async () => {
    try {
      const [gigsData, evidenceData, reportsData, auditData] = await Promise.all([
        apiClient.getGigs(),
        apiClient.getPaymentEvidence(),
        apiClient.getListingReports(),
        apiClient.getAuditEvents(),
      ]);
      setGigs(gigsData);
      setPaymentEvidence(evidenceData);
      setReports(reportsData);
      setAuditEvents(auditData);
    } catch {
      setGigs(getStoredGigs());
      setPaymentEvidence(await apiClient.getPaymentEvidence());
      setReports(await apiClient.getListingReports());
      setAuditEvents(await apiClient.getAuditEvents());
    }
  };

  useEffect(() => {
    loadAllData();

    const handleGigsUpdate = () => loadAllData();
    const handleReportsUpdate = () => loadAllData();
    const handleAuditUpdate = () => loadAllData();

    window.addEventListener("gigmatcher_gigs_updated", handleGigsUpdate);
    window.addEventListener("gigmatcher_reports_updated", handleReportsUpdate);
    window.addEventListener("gigmatcher_audit_updated", handleAuditUpdate);

    return () => {
      window.removeEventListener("gigmatcher_gigs_updated", handleGigsUpdate);
      window.removeEventListener("gigmatcher_reports_updated", handleReportsUpdate);
      window.removeEventListener("gigmatcher_audit_updated", handleAuditUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Metrics
  const metrics = useMemo(() => {
    return getOperationsMetrics(gigs, reports, paymentEvidence);
  }, [gigs, reports, paymentEvidence]);

  const reviewQueue = useMemo(() => {
    return getReviewQueue(gigs, paymentEvidence, reports);
  }, [gigs, paymentEvidence, reports]);

  // Filtered Gigs
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      if (statusFilter !== "all") {
        const gigStatus = gig.publicationStatus || "published";
        if (gigStatus !== statusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          gig.title.toLowerCase().includes(q) ||
          gig.platformName.toLowerCase().includes(q) ||
          gig.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [gigs, statusFilter, searchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (reportStatusFilter !== "all" && r.status !== reportStatusFilter) {
        return false;
      }
      return true;
    });
  }, [reports, reportStatusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingGig(null);
    setFormData({
      id: `gig_custom_${Date.now()}`,
      slug: `custom-role-${Date.now().toString(36)}`,
      platformName: "New AI Platform",
      title: "Senior AI Model Reviewer",
      category: "AI Evaluation",
      description: "Perform high-precision evaluations on reasoning, coding, or safety outputs.",
      skillsRequired: "Prompt Engineering, Critical Thinking, Logic Evaluation",
      eligibleCountries: "Global, India, United States, Canada",
      remote: true,
      payAmount: 32,
      payCurrency: "USD",
      payUnit: "hour",
      payTermsNote: "Weekly disbursement via Deel or PayPal",
      paymentVerification: "verified",
      eligibilityVerification: "verified",
      publicationStatus: "published",
      officialUrl: "https://example.com/careers",
      onboardingStepsText: "1. Profile submission\n2. Baseline evaluation exam\n3. Queue invite",
      sponsored: false,
      experienceLevel: "mid",
      availabilityStatus: "open",
      eligibilitySourceNote: "Direct platform career portal posting verified.",
    });
    setIsListingModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (gig: GigListing) => {
    setEditingGig(gig);
    setFormData({
      id: gig.id,
      slug: gig.slug,
      platformName: gig.platformName,
      title: gig.title,
      category: gig.category,
      description: gig.description,
      skillsRequired: gig.skillsRequired.join(", "),
      eligibleCountries: gig.eligibleCountries.join(", "),
      remote: gig.remote,
      payAmount: gig.payment?.amount || 0,
      payCurrency: gig.payment?.currency || "USD",
      payUnit: gig.payment?.unit || "hour",
      payTermsNote: gig.payment?.termsNote || "",
      paymentVerification: gig.paymentVerification,
      eligibilityVerification: gig.eligibilityVerification,
      publicationStatus: gig.publicationStatus || "published",
      officialUrl: gig.officialUrl,
      onboardingStepsText: gig.onboardingSteps.join("\n"),
      sponsored: gig.sponsored,
      experienceLevel: gig.experienceLevel || "mid",
      availabilityStatus: gig.availabilityStatus || "open",
      eligibilitySourceNote: gig.eligibilitySourceNote || "",
    });
    setIsListingModalOpen(true);
  };

  // Save Listing
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();

    const skillsArr = formData.skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const countriesArr = formData.eligibleCountries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const onboardingArr = formData.onboardingStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const isNew = !editingGig;
    const previousGig = editingGig;

    const newGig: GigListing = {
      id: formData.id,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      platformName: formData.platformName,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      skillsRequired: skillsArr,
      eligibleCountries: countriesArr,
      remote: formData.remote,
      payment: {
        amount: Number(formData.payAmount),
        currency: formData.payCurrency,
        unit: formData.payUnit,
        termsNote: formData.payTermsNote,
        paymentMethod: ["PayPal", "Direct Deposit"],
      },
      paymentVerification: formData.paymentVerification,
      eligibilityVerification: formData.eligibilityVerification,
      publicationStatus: formData.publicationStatus,
      officialUrl: formData.officialUrl,
      onboardingSteps: onboardingArr,
      sponsored: formData.sponsored,
      experienceLevel: formData.experienceLevel,
      availabilityStatus: formData.availabilityStatus,
      eligibilitySourceNote: formData.eligibilitySourceNote,
      lastReviewedAt: new Date().toISOString(),
      overviewHighlights: editingGig?.overviewHighlights || [
        `Verified rate of $${formData.payAmount}/${formData.payUnit}`,
        "Flexible asynchronous scheduling",
        "Direct contract work with AI platform",
      ],
      rating: editingGig?.rating || 4.5,
      activeProjectsCount: editingGig?.activeProjectsCount || 12,
    };

    saveStoredGig(newGig);
    await apiClient.adminSaveGig(newGig);

    // Record audit event
    await apiClient.recordAuditEvent({
      entityType: "gig_listing",
      entityId: newGig.id,
      actorEmail: "operations_admin@gigmatcher.io",
      action: isNew ? "create" : "update",
      changes: {
        title: { before: previousGig?.title || null, after: newGig.title },
        publicationStatus: {
          before: previousGig?.publicationStatus || null,
          after: newGig.publicationStatus,
        },
        payAmount: {
          before: previousGig?.payment?.amount || null,
          after: newGig.payment?.amount,
        },
      },
      justification: isNew
        ? `Created new listing for ${newGig.platformName}`
        : `Updated listing attributes & verification status`,
    });

    setIsListingModalOpen(false);
    showToast(isNew ? "Listing created successfully!" : "Listing updated successfully!");
    loadAllData();
  };

  // Quick Status Change (Publish / Pause / Archive)
  const handleQuickStatusChange = async (gig: GigListing, newStatus: PublicationStatus) => {
    const oldStatus = gig.publicationStatus || "published";
    const updatedGig: GigListing = {
      ...gig,
      publicationStatus: newStatus,
      lastReviewedAt: new Date().toISOString(),
    };

    saveStoredGig(updatedGig);
    await apiClient.adminSaveGig(updatedGig);

    let actionName: AuditEvent["action"] = "update";
    if (newStatus === "published") actionName = "publish";
    else if (newStatus === "paused") actionName = "pause";
    else if (newStatus === "archived") actionName = "archive";

    await apiClient.recordAuditEvent({
      entityType: "gig_listing",
      entityId: gig.id,
      actorEmail: "operations_admin@gigmatcher.io",
      action: actionName,
      changes: {
        publicationStatus: { before: oldStatus, after: newStatus },
      },
      justification: `Reviewer set status to ${newStatus}`,
    });

    showToast(`Listing ${gig.title} is now ${newStatus}.`);
    loadAllData();
  };

  // Open Review Queue Modal
  const handleOpenReview = (item: ReviewQueueItem) => {
    setReviewingQueueItem(item);
    setReviewDecision("approved");
    setReviewNotes(`Verified requirements with latest platform documentation.`);
    setReviewExtendDays(60);
    setIsReviewModalOpen(true);
  };

  // Submit Review Queue Decision
  const handleSubmitReviewDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingQueueItem) return;

    const gig = reviewingQueueItem.gig;
    const now = new Date();
    const nextReview = new Date(now.getTime() + reviewExtendDays * 24 * 60 * 60 * 1000).toISOString();

    let newStatus: PublicationStatus = gig.publicationStatus || "published";
    let newPayVerif = gig.paymentVerification;
    let newEligVerif = gig.eligibilityVerification;

    if (reviewDecision === "approved") {
      newStatus = "published";
      newPayVerif = "verified";
      newEligVerif = "verified";
    } else if (reviewDecision === "changes_requested" || reviewDecision === "stale_flagged") {
      newStatus = "paused";
      newPayVerif = "partial";
    } else if (reviewDecision === "archived") {
      newStatus = "archived";
    }

    const updatedGig: GigListing = {
      ...gig,
      publicationStatus: newStatus,
      paymentVerification: newPayVerif,
      eligibilityVerification: newEligVerif,
      lastReviewedAt: now.toISOString(),
    };

    saveStoredGig(updatedGig);
    await apiClient.adminSaveGig(updatedGig);

    // Also update payment evidence nextReviewAt
    const existingEvidence = paymentEvidence.find((p) => p.gigId === gig.id);
    if (existingEvidence) {
      const updatedEvidence: PaymentEvidence = {
        ...existingEvidence,
        verificationStatus: newPayVerif,
        reviewedAt: now.toISOString(),
        nextReviewAt: nextReview,
        evidenceNotes: reviewNotes || existingEvidence.evidenceNotes,
      };
      await apiClient.savePaymentEvidence(updatedEvidence);
    }

    await apiClient.recordAuditEvent({
      entityType: "gig_listing",
      entityId: gig.id,
      actorEmail: "lead_reviewer@gigmatcher.io",
      action: "verify_evidence",
      changes: {
        reviewDecision: { before: null, after: reviewDecision },
        nextReviewAt: { before: gig.lastReviewedAt, after: nextReview },
        publicationStatus: { before: gig.publicationStatus || "published", after: newStatus },
      },
      justification: reviewNotes,
    });

    setIsReviewModalOpen(false);
    showToast(`Verification review recorded: ${reviewDecision.replace("_", " ")}`);
    loadAllData();
  };

  // Open Report Action Modal
  const handleOpenReportAction = (report: ListingReport, action: "resolve" | "dismiss") => {
    setSelectedReport(report);
    setReportActionType(action);
    setReportResolutionNotes(
      action === "resolve"
        ? "Verified report claims and corrected opportunity parameters."
        : "Investigated claim; verified listing remains accurate and open."
    );
    setIsReportActionModalOpen(true);
  };

  // Submit Report Action
  const handleSubmitReportAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const newStatus: ReportStatus = reportActionType === "resolve" ? "resolved" : "dismissed";
    await apiClient.updateListingReportStatus(
      selectedReport.id,
      newStatus,
      reportResolutionNotes,
      "ops_reviewer@gigmatcher.io"
    );

    setIsReportActionModalOpen(false);
    showToast(`Report ${selectedReport.id} marked as ${newStatus}.`);
    loadAllData();
  };

  // Quick Triage Report
  const handleQuickTriageReport = async (report: ListingReport) => {
    await apiClient.updateListingReportStatus(
      report.id,
      "triaged",
      "Acknowledged by operations reviewer and placed in verification schedule.",
      "ops_reviewer@gigmatcher.io"
    );
    showToast(`Report ${report.id} marked as Triaged.`);
    loadAllData();
  };

  // Open Evidence Edit Modal
  const handleOpenEvidenceEdit = (evidence: PaymentEvidence) => {
    setEditingEvidence(evidence);
    setEvidenceFormData({
      id: evidence.id,
      gigId: evidence.gigId,
      advertisedRate: evidence.advertisedRate,
      currency: evidence.currency,
      unit: evidence.unit,
      rateType: evidence.rateType,
      payoutMethods: evidence.payoutMethods.join(", "),
      sourceUrl: evidence.sourceUrl || "",
      evidenceNotes: evidence.evidenceNotes || "",
      verificationStatus: evidence.verificationStatus,
      extendDays: 60,
    });
    setIsEvidenceModalOpen(true);
  };

  // Save Evidence
  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvidence) return;

    const now = new Date();
    const nextReview = new Date(
      now.getTime() + evidenceFormData.extendDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const payoutArr = evidenceFormData.payoutMethods
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const updated: PaymentEvidence = {
      ...editingEvidence,
      advertisedRate: Number(evidenceFormData.advertisedRate),
      currency: evidenceFormData.currency,
      unit: evidenceFormData.unit,
      rateType: evidenceFormData.rateType,
      payoutMethods: payoutArr,
      sourceUrl: evidenceFormData.sourceUrl,
      evidenceNotes: evidenceFormData.evidenceNotes,
      verificationStatus: evidenceFormData.verificationStatus,
      reviewedAt: now.toISOString(),
      nextReviewAt: nextReview,
    };

    await apiClient.savePaymentEvidence(updated);

    // Synchronize listing rate and verification badge
    const targetGig = gigs.find((g) => g.id === updated.gigId);
    if (targetGig) {
      const gigUpdate: GigListing = {
        ...targetGig,
        payment: {
          amount: updated.advertisedRate,
          currency: updated.currency,
          unit: updated.unit,
          termsNote: targetGig.payment?.termsNote,
          paymentMethod: updated.payoutMethods,
        },
        paymentVerification: updated.verificationStatus,
        lastReviewedAt: now.toISOString(),
      };
      saveStoredGig(gigUpdate);
      await apiClient.adminSaveGig(gigUpdate);
    }

    await apiClient.recordAuditEvent({
      entityType: "payment_evidence",
      entityId: updated.id,
      actorEmail: "lead_verifier@gigmatcher.io",
      action: "verify_evidence",
      changes: {
        rate: { before: editingEvidence.advertisedRate, after: updated.advertisedRate },
        status: { before: editingEvidence.verificationStatus, after: updated.verificationStatus },
        rateType: { before: editingEvidence.rateType, after: updated.rateType },
      },
      justification: updated.evidenceNotes,
    });

    setIsEvidenceModalOpen(false);
    showToast("Payment evidence updated & synchronized with listing!");
    loadAllData();
  };

  const handleResetCatalog = () => {
    if (window.confirm("Reset catalog and local storage back to default Phase 4 verified state?")) {
      resetStoredGigs();
      showToast("Gigs catalog reset to seed defaults.");
      loadAllData();
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Operations Console
              </Badge>
              <Badge variant="outline" size="sm" className="bg-white/80">
                Phase 4 Verification
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 tracking-tight">
              Gig Operations & Review Center
            </h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">
              Manage live listings, enforce evidence-backed rates, triage community reports, and
              schedule recurring verification intervals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetCatalog}
              className="bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Catalog
            </Button>
            <Button size="sm" onClick={handleOpenCreate} className="font-semibold">
              <Plus className="w-4 h-4 mr-1.5" />
              New Opportunity
            </Button>
          </div>
        </div>

        {/* METRICS KPI CARDS (Phase 4 Spec) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published Listings
                </span>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.publishedCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  of {metrics.totalListingsCount} total
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Active in public search & matcher
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-border shadow-xs hover:border-slate-300 transition-all ${
              metrics.needsReviewCount > 0 ? "border-amber-200" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Needs Review
                </span>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.needsReviewCount}
                </span>
                <span className="text-xs text-amber-700 font-semibold">
                  Queue pending
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Overdue dates or open flags
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-border shadow-xs hover:border-slate-300 transition-all ${
              metrics.openReportsCount > 0 ? "border-rose-200" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Open Reports
                </span>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.openReportsCount}
                </span>
                <span className="text-xs text-rose-700 font-semibold">
                  Community flagged
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Rates, geoblocks, or dead links
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unverified Claims
                </span>
                <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.unverifiedClaimsCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Listings
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Partial or self-reported evidence
              </p>
            </CardContent>
          </Card>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "listings"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Listing Catalog ({gigs.length})
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "queue"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            Review Queue
            {reviewQueue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
                {reviewQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "evidence"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Evidence & Pay Rates ({paymentEvidence.length})
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "reports"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            User Reports
            {metrics.openReportsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-rose-100 text-rose-800 font-bold">
                {metrics.openReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "audit"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4" />
            Audit History ({auditEvents.length})
          </button>
        </div>

        {/* TAB 1: LISTING CATALOG */}
        {activeTab === "listings" && (
          <div className="space-y-6">
            {/* Search and Publication Status Filter */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by title, platform or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border focus:outline-hidden focus:border-brand-500 bg-canvas-bg/50"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500">Publication:</span>
                {(["all", "published", "draft", "paused", "archived"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold capitalize transition-colors ${
                      statusFilter === status
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGigs.map((gig) => {
                const pubStatus = gig.publicationStatus || "published";

                return (
                  <Card
                    key={gig.id}
                    className="bg-white border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Platform & Status Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {gig.platformName}
                          </span>
                          <h3 className="font-bold text-base text-ink line-clamp-1 mt-0.5">
                            {gig.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {pubStatus === "published" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                          )}
                          {pubStatus === "draft" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              Draft
                            </span>
                          )}
                          {pubStatus === "paused" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Paused
                            </span>
                          )}
                          {pubStatus === "archived" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                              Archived
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pay & Category */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge variant="primary" size="sm">
                          {gig.category}
                        </Badge>
                        <Badge variant="outline" size="sm" className="font-semibold text-slate-800">
                          ${gig.payment?.amount || 0} / {gig.payment?.unit || "hr"}
                        </Badge>
                        {gig.sponsored && (
                          <Badge variant="warning" size="sm">
                            Sponsored
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {gig.description}
                      </p>

                      {/* Verification Badges */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                        <PaymentVerificationBadge status={gig.paymentVerification} />
                        <EligibilityBadge
                          isEligible={true}
                          status={gig.eligibilityVerification}
                          label={gig.eligibleCountries.slice(0, 2).join(", ")}
                        />
                      </div>
                    </CardContent>

                    {/* Bottom Action Bar */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/gigs/${gig.slug}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(gig)}
                          className="h-7 px-2 text-xs text-brand-600 hover:text-brand-700"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>

                      {/* Quick Lifecycle Actions */}
                      <div className="flex items-center gap-1">
                        {pubStatus !== "published" && (
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleQuickStatusChange(gig, "published")}
                            className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                            title="Publish listing"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                        )}
                        {pubStatus === "published" && (
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => handleQuickStatusChange(gig, "paused")}
                            className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50"
                            title="Pause listing temporarily"
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {pubStatus !== "archived" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusChange(gig, "archived")}
                            className="h-7 px-2 text-xs text-slate-500 hover:text-rose-600"
                            title="Archive listing"
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REVIEW QUEUE & STALE FLAGS */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Stale-Data Detection & Review Scheduler
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Records that have exceeded their scheduled review date, have unverified claims, or have
                  received open community discrepancy reports are held here for verification sign-off.
                </p>
              </div>
            </div>

            {reviewQueue.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-border">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-ink mt-3">All Listings Verified!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No listings require immediate attention. All scheduled review dates are current and all
                  candidate reports are triaged.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Urgency</th>
                        <th className="py-3 px-4">Opportunity</th>
                        <th className="py-3 px-4">Flag Reason(s)</th>
                        <th className="py-3 px-4">Current Review Date</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reviewQueue.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold">
                            {item.urgency === "critical" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" /> Critical
                              </span>
                            )}
                            {item.urgency === "warning" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> Warning
                              </span>
                            )}
                            {item.urgency === "normal" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">{item.gig.title}</span>
                            <span className="text-slate-500">{item.gig.platformName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs font-medium">
                            {item.reason}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {item.nextReviewAt ? new Date(item.nextReviewAt).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(item)}
                              className="font-semibold text-xs h-8"
                            >
                              Conduct Review
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EVIDENCE & PAY RATES */}
        {activeTab === "evidence" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">Payment & Rate Evidence Log</h3>
                  <p className="text-xs text-slate-500">
                    Sourced compensation data backing listed platform rates. Distinguishes official postings from worker reports.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Gig Opportunity</th>
                      <th className="py-3 px-4">Advertised Rate</th>
                      <th className="py-3 px-4">Evidence Type</th>
                      <th className="py-3 px-4">Payout Rails</th>
                      <th className="py-3 px-4">Next Review</th>
                      <th className="py-3 px-4">Source & Notes</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paymentEvidence.map((pe) => {
                      const gig = gigs.find((g) => g.id === pe.gigId);

                      return (
                        <tr key={pe.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">{gig?.title || pe.gigId}</span>
                            <span className="text-slate-500">{gig?.platformName || "Platform"}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-ink">
                            ${pe.advertisedRate} / {pe.unit}
                          </td>
                          <td className="py-3 px-4">
                            {pe.rateType === "official_advertised" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Official Advertised
                              </span>
                            )}
                            {pe.rateType === "worker_reported" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Activity className="w-3 h-3" /> Worker Reported
                              </span>
                            )}
                            {pe.rateType === "unverified" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {pe.payoutMethods.join(", ")}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(pe.nextReviewAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            {pe.sourceUrl && (
                              <a
                                href={pe.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 hover:underline inline-flex items-center gap-1 font-semibold block truncate"
                              >
                                Source Proof <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <p className="text-slate-600 text-xs truncate mt-0.5">
                              {pe.evidenceNotes}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEvidenceEdit(pe)}
                              className="text-xs h-7 px-2.5"
                            >
                              Edit Evidence
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USER REPORTS TRIAGE */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink">Candidate Reports Triage</h3>
                <p className="text-xs text-slate-500">
                  User-submitted notices of closed queues, rate shifts, country restrictions, and 404 links.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(["all", "open", "triaged", "resolved", "dismissed"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold capitalize transition-colors ${
                      reportStatusFilter === st
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-border">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-ink mt-2">No Reports in this View</h3>
                <p className="text-xs text-slate-500">All reports matching the filter have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="bg-white border-border shadow-xs">
                    <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {report.reportType.replace(/_/g, " ")}
                          </span>

                          {report.status === "open" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Open
                            </span>
                          )}
                          {report.status === "triaged" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Triaged
                            </span>
                          )}
                          {report.status === "resolved" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Resolved
                            </span>
                          )}
                          {report.status === "dismissed" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                              Dismissed
                            </span>
                          )}

                          <span className="text-xs text-slate-400">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-ink">
                          {report.gigTitle || "Gig Listing"} •{" "}
                          <span className="text-slate-500 font-normal">{report.platformName}</span>
                        </h4>

                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          &ldquo;{report.description}&rdquo;
                        </p>

                        {report.resolutionNotes && (
                          <p className="text-xs text-emerald-700 font-medium">
                            <span className="font-bold">Resolution Note:</span> {report.resolutionNotes}
                          </p>
                        )}
                      </div>

                      {/* Triage Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {report.status === "open" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuickTriageReport(report)}
                            className="text-xs h-8"
                          >
                            Mark Triaged
                          </Button>
                        )}
                        {report.status !== "resolved" && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenReportAction(report, "resolve")}
                            className="text-xs h-8 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Resolve
                          </Button>
                        )}
                        {report.status !== "dismissed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReportAction(report, "dismiss")}
                            className="text-xs h-8 text-slate-500 hover:text-slate-700"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Dismiss
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AUDIT HISTORY LOG */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-bold text-ink">Immutable Audit Trail</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit history recording reviewer edits, verification approvals, report closures, and rationale.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Changes</th>
                      <th className="py-3 px-4">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {event.actorEmail}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-800">
                            {event.action.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {event.entityType}: {event.entityId}
                        </td>
                        <td className="py-3 px-4 max-w-xs font-mono text-[11px] text-slate-700">
                          {Object.keys(event.changes || {}).length > 0 ? (
                            Object.entries(event.changes).map(([k, v]) => (
                              <div key={k} className="truncate">
                                <span className="font-semibold">{k}:</span> {JSON.stringify(v.before)} &rarr; {JSON.stringify(v.after)}
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">
                          {event.justification || "Standard verification update"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE / EDIT LISTING */}
        <Dialog
          open={isListingModalOpen}
          onOpenChange={setIsListingModalOpen}
          title={editingGig ? `Edit Gig: ${editingGig.title}` : "Create New Gig Listing"}
          description="Define opportunity parameters, payment terms, country scope, and publication status."
        >
          <form onSubmit={handleSaveListing} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Opportunity Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="AI Coding">AI Coding</option>
                  <option value="AI Evaluation">AI Evaluation</option>
                  <option value="Data Annotation">Data Annotation</option>
                  <option value="Software & QA Testing">Software & QA Testing</option>
                  <option value="Voice & Audio AI">Voice & Audio AI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Publication Status
                </label>
                <select
                  value={formData.publicationStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, publicationStatus: e.target.value as PublicationStatus })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold text-brand-700"
                >
                  <option value="published">Published (Live in Search)</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="paused">Paused (Temporarily off)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Availability Status
                </label>
                <select
                  value={formData.availabilityStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, availabilityStatus: e.target.value as any })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="open">Open (Accepting)</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="selective">Selective</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pay Rate ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.payAmount}
                  onChange={(e) => setFormData({ ...formData, payAmount: Number(e.target.value) })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pay Unit
                </label>
                <select
                  value={formData.payUnit}
                  onChange={(e) => setFormData({ ...formData, payUnit: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="hour">Per Hour</option>
                  <option value="task">Per Task</option>
                  <option value="project">Per Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Verification
                </label>
                <select
                  value={formData.paymentVerification}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentVerification: e.target.value as PaymentVerification })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="verified">Verified (Direct Proof)</option>
                  <option value="partial">Partial (Worker Reported)</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Required Skills (comma separated)
              </label>
              <input
                type="text"
                required
                value={formData.skillsRequired}
                onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Supported / Eligible Countries (comma separated)
              </label>
              <input
                type="text"
                required
                value={formData.eligibleCountries}
                onChange={(e) => setFormData({ ...formData, eligibleCountries: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-border text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Official Application URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.officialUrl}
                  onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Eligibility Verification Note
                </label>
                <input
                  type="text"
                  value={formData.eligibilitySourceNote}
                  onChange={(e) => setFormData({ ...formData, eligibilitySourceNote: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="sponsored"
                checked={formData.sponsored}
                onChange={(e) => setFormData({ ...formData, sponsored: e.target.checked })}
                className="rounded border-border text-brand-600"
              />
              <label htmlFor="sponsored" className="text-xs font-semibold text-slate-700">
                Mark as Sponsored Listing (disclosed in UI)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsListingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Listing
              </Button>
            </div>
          </form>
        </Dialog>

        {/* MODAL 2: CONDUCT VERIFICATION REVIEW */}
        <Dialog
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          title={`Conduct Verification Review: ${reviewingQueueItem?.gig.title}`}
          description="Evaluate evidence, set publication status, and schedule next recurrence."
        >
          <form onSubmit={handleSubmitReviewDecision} className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">
                Platform: {reviewingQueueItem?.gig.platformName}
              </p>
              <p className="text-slate-600">
                <span className="font-semibold">Trigger reason:</span> {reviewingQueueItem?.reason}
              </p>
              {reviewingQueueItem?.evidenceNotes && (
                <p className="text-slate-600">
                  <span className="font-semibold">Evidence:</span> {reviewingQueueItem.evidenceNotes}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Review Decision
              </label>
              <select
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold"
              >
                <option value="approved">Approved & Verified (Set Published)</option>
                <option value="changes_requested">Changes Requested (Pause Listing)</option>
                <option value="stale_flagged">Stale / Needs More Proof (Mark Partial)</option>
                <option value="archived">Archive Listing (Remove from discovery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Extend Next Review By
              </label>
              <select
                value={reviewExtendDays}
                onChange={(e) => setReviewExtendDays(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
              >
                <option value={30}>30 Days (Fast cycle)</option>
                <option value={60}>60 Days (Standard cadence)</option>
                <option value={90}>90 Days (Established provider)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Verification Review Notes & Justification
              </label>
              <textarea
                rows={3}
                required
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="State sources checked, paystubs verified, or reason for status adjustment..."
                className="w-full p-2.5 rounded-lg border border-border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Submit Review Decision
              </Button>
            </div>
          </form>
        </Dialog>

        {/* MODAL 3: RESOLVE / DISMISS REPORT */}
        <Dialog
          open={isReportActionModalOpen}
          onOpenChange={setIsReportActionModalOpen}
          title={`${reportActionType === "resolve" ? "Resolve" : "Dismiss"} Community Report`}
          description={`Report ID: ${selectedReport?.id} for ${selectedReport?.platformName}`}
        >
          <form onSubmit={handleSubmitReportAction} className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block">Candidate Report Details:</span>
              <p className="text-slate-600 mt-1 italic">&ldquo;{selectedReport?.description}&rdquo;</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                {reportActionType === "resolve" ? "Resolution Summary" : "Reason for Dismissal"}
              </label>
              <textarea
                rows={3}
                required
                value={reportResolutionNotes}
                onChange={(e) => setReportResolutionNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsReportActionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={
                  reportActionType === "resolve"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    : "bg-slate-800 hover:bg-slate-900 text-white font-bold"
                }
              >
                {reportActionType === "resolve" ? "Mark as Resolved" : "Dismiss Report"}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* MODAL 4: EDIT PAYMENT EVIDENCE */}
        <Dialog
          open={isEvidenceModalOpen}
          onOpenChange={setIsEvidenceModalOpen}
          title={`Edit Compensation Evidence: ${editingEvidence?.gigId}`}
          description="Update advertised rate claims, evidence source link, and verification tier."
        >
          <form onSubmit={handleSaveEvidence} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Advertised Rate ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={evidenceFormData.advertisedRate}
                  onChange={(e) =>
                    setEvidenceFormData({ ...evidenceFormData, advertisedRate: Number(e.target.value) })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pay Unit
                </label>
                <select
                  value={evidenceFormData.unit}
                  onChange={(e) => setEvidenceFormData({ ...evidenceFormData, unit: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="hour">Per Hour</option>
                  <option value="task">Per Task</option>
                  <option value="milestone">Per Milestone</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Rate Evidence Tier
                </label>
                <select
                  value={evidenceFormData.rateType}
                  onChange={(e) =>
                    setEvidenceFormData({
                      ...evidenceFormData,
                      rateType: e.target.value as PaymentEvidenceRateType,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold"
                >
                  <option value="official_advertised">Official Advertised (Careers/FAQ)</option>
                  <option value="worker_reported">Worker Reported (Paystubs/Discord)</option>
                  <option value="unverified">Unverified Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Verification Status
                </label>
                <select
                  value={evidenceFormData.verificationStatus}
                  onChange={(e) =>
                    setEvidenceFormData({
                      ...evidenceFormData,
                      verificationStatus: e.target.value as PaymentVerification,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
                >
                  <option value="verified">Verified</option>
                  <option value="partial">Partial</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payout Rails (comma separated)
              </label>
              <input
                type="text"
                value={evidenceFormData.payoutMethods}
                onChange={(e) =>
                  setEvidenceFormData({ ...evidenceFormData, payoutMethods: e.target.value })
                }
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Source URL
              </label>
              <input
                type="url"
                value={evidenceFormData.sourceUrl}
                onChange={(e) =>
                  setEvidenceFormData({ ...evidenceFormData, sourceUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Evidence Documentation Notes
              </label>
              <textarea
                rows={3}
                required
                value={evidenceFormData.evidenceNotes}
                onChange={(e) =>
                  setEvidenceFormData({ ...evidenceFormData, evidenceNotes: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Next Review Recurrence
              </label>
              <select
                value={evidenceFormData.extendDays}
                onChange={(e) =>
                  setEvidenceFormData({ ...evidenceFormData, extendDays: Number(e.target.value) })
                }
                className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white"
              >
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEvidenceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Save & Synchronize Rate
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
