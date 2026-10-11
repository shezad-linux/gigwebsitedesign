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
  TrendingUp,
  CheckSquare,
  BarChart3,
  Award,
  LogOut,
  Tag,
  Globe,
  Mail,
  Users,
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
  AffiliatePartner,
  SponsoredCampaign,
  AnalyticsSummary,
  LaunchChecklistItem,
  CommissionModel,
  CampaignStatus,
  CampaignPlacementRule,
} from "@/types/gig";
import { getStoredGigs, saveStoredGig, resetStoredGigs } from "@/lib/storage";
import {
  getReviewQueue,
  getOperationsMetrics,
  ReviewQueueItem,
} from "@/lib/operations";
import { apiClient } from "@/lib/api";
import { adminSignOutAction, getAdminSessionStatusAction } from "@/lib/supabase/auth-actions";
import { CouponsManagementTab } from "@/components/admin/CouponsManagementTab";
import { DomainHealthCard } from "@/components/admin/DomainHealthCard";
import { CommunityModerationTab } from "@/components/admin/CommunityModerationTab";
import { HireRequestsTab } from "@/components/admin/HireRequestsTab";

type ActiveTab =
  | "listings"
  | "queue"
  | "evidence"
  | "community"
  | "hire-requests"
  | "reports"
  | "monetization"
  | "coupons"
  | "domain"
  | "checklist"
  | "audit";

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
  const [adminEmail, setAdminEmail] = useState<string>("admin@remotasks.si");
  const [adminRole, setAdminRole] = useState<string>("admin");

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

  // Phase 5 Monetization & Launch States
  const [affiliatePartners, setAffiliatePartners] = useState<AffiliatePartner[]>([]);
  const [sponsoredCampaigns, setSponsoredCampaigns] = useState<SponsoredCampaign[]>([]);
  const [launchChecklist, setLaunchChecklist] = useState<LaunchChecklistItem[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null);
  const [partnerFormData, setPartnerFormData] = useState({
    id: "",
    platformId: "",
    platformName: "",
    programName: "",
    affiliateUrlTemplate: "",
    referralCode: "",
    commissionModel: "cpa" as CommissionModel,
    commissionRate: "$30 / qualifying candidate",
    status: "active" as "active" | "pending" | "paused",
    termsUrl: "",
    notes: "",
  });

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SponsoredCampaign | null>(null);
  const [campaignFormData, setCampaignFormData] = useState({
    id: "",
    sponsorName: "",
    gigId: "",
    budget: 1000,
    dailyBudget: 50,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    targetCategory: "AI Coding",
    status: "active" as CampaignStatus,
    placementRule: "featured_badge" as CampaignPlacementRule,
    costPerClick: 1.5,
  });

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
      const [
        gigsData,
        evidenceData,
        reportsData,
        auditData,
        partnersData,
        campaignsData,
        checklistData,
        analyticsData,
      ] = await Promise.all([
        apiClient.getGigs(),
        apiClient.getPaymentEvidence(),
        apiClient.getListingReports(),
        apiClient.getAuditEvents(),
        apiClient.getAffiliatePartners(),
        apiClient.getSponsoredCampaigns(),
        apiClient.getLaunchChecklist(),
        apiClient.getAnalyticsSummary(),
      ]);
      setGigs(gigsData);
      setPaymentEvidence(evidenceData);
      setReports(reportsData);
      setAuditEvents(auditData);
      setAffiliatePartners(partnersData);
      setSponsoredCampaigns(campaignsData);
      setLaunchChecklist(checklistData);
      setAnalyticsSummary(analyticsData);
    } catch {
      setGigs(getStoredGigs());
      setPaymentEvidence(await apiClient.getPaymentEvidence());
      setReports(await apiClient.getListingReports());
      setAuditEvents(await apiClient.getAuditEvents());
      setAffiliatePartners(await apiClient.getAffiliatePartners());
      setSponsoredCampaigns(await apiClient.getSponsoredCampaigns());
      setLaunchChecklist(await apiClient.getLaunchChecklist());
      setAnalyticsSummary(await apiClient.getAnalyticsSummary());
    }
  };

  const handleLogout = async () => {
    await adminSignOutAction();
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    loadAllData();

    getAdminSessionStatusAction().then((status) => {
      if (status.email) setAdminEmail(status.email);
      if (status.role) setAdminRole(status.role);
    });

    const handleGigsUpdate = () => loadAllData();
    const handleReportsUpdate = () => loadAllData();
    const handleAuditUpdate = () => loadAllData();
    const handleAffiliatesUpdate = () => loadAllData();
    const handleCampaignsUpdate = () => loadAllData();
    const handleChecklistUpdate = () => loadAllData();

    window.addEventListener("gigmatcher_gigs_updated", handleGigsUpdate);
    window.addEventListener("gigmatcher_reports_updated", handleReportsUpdate);
    window.addEventListener("gigmatcher_audit_updated", handleAuditUpdate);
    window.addEventListener("gigmatcher_affiliates_updated", handleAffiliatesUpdate);
    window.addEventListener("gigmatcher_campaigns_updated", handleCampaignsUpdate);
    window.addEventListener("gigmatcher_checklist_updated", handleChecklistUpdate);

    return () => {
      window.removeEventListener("gigmatcher_gigs_updated", handleGigsUpdate);
      window.removeEventListener("gigmatcher_reports_updated", handleReportsUpdate);
      window.removeEventListener("gigmatcher_audit_updated", handleAuditUpdate);
      window.removeEventListener("gigmatcher_affiliates_updated", handleAffiliatesUpdate);
      window.removeEventListener("gigmatcher_campaigns_updated", handleCampaignsUpdate);
      window.removeEventListener("gigmatcher_checklist_updated", handleChecklistUpdate);
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
      actorEmail: adminEmail,
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
      actorEmail: adminEmail,
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
      actorEmail: adminEmail,
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
      adminEmail
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
      adminEmail
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
      actorEmail: adminEmail,
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

  // Open Partner Edit Modal
  const handleOpenPartnerEdit = (partner: AffiliatePartner) => {
    setEditingPartner(partner);
    setPartnerFormData({
      id: partner.id,
      platformId: partner.platformId,
      platformName: partner.platformName,
      programName: partner.programName,
      affiliateUrlTemplate: partner.affiliateUrlTemplate,
      referralCode: partner.referralCode || "",
      commissionModel: partner.commissionModel,
      commissionRate: partner.commissionRate,
      status: partner.status,
      termsUrl: partner.termsUrl || "",
      notes: partner.notes || "",
    });
    setIsPartnerModalOpen(true);
  };

  // Save Partner
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    const updated: AffiliatePartner = {
      ...editingPartner,
      platformName: partnerFormData.platformName,
      programName: partnerFormData.programName,
      affiliateUrlTemplate: partnerFormData.affiliateUrlTemplate,
      referralCode: partnerFormData.referralCode || undefined,
      commissionModel: partnerFormData.commissionModel,
      commissionRate: partnerFormData.commissionRate,
      status: partnerFormData.status,
      termsUrl: partnerFormData.termsUrl || undefined,
      notes: partnerFormData.notes || undefined,
      updatedAt: new Date().toISOString(),
    };

    await apiClient.saveAffiliatePartner(updated);
    setIsPartnerModalOpen(false);
    showToast(`Affiliate partner ${updated.platformName} updated.`);
    loadAllData();
  };

  // Open Campaign Create Modal
  const handleOpenCampaignCreate = () => {
    setEditingCampaign(null);
    setCampaignFormData({
      id: `camp_${Date.now()}`,
      sponsorName: "New Sponsor",
      gigId: gigs[0]?.id || "",
      budget: 1000,
      dailyBudget: 50,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      targetCategory: "AI Coding",
      status: "active",
      placementRule: "featured_badge",
      costPerClick: 1.5,
    });
    setIsCampaignModalOpen(true);
  };

  // Open Campaign Edit Modal
  const handleOpenCampaignEdit = (campaign: SponsoredCampaign) => {
    setEditingCampaign(campaign);
    setCampaignFormData({
      id: campaign.id,
      sponsorName: campaign.sponsorName,
      gigId: campaign.gigId,
      budget: campaign.budget,
      dailyBudget: campaign.dailyBudget,
      startDate: campaign.startDate.split("T")[0],
      endDate: campaign.endDate.split("T")[0],
      targetCategory: campaign.targetCategory || "AI Coding",
      status: campaign.status,
      placementRule: campaign.placementRule,
      costPerClick: campaign.costPerClick || 1.5,
    });
    setIsCampaignModalOpen(true);
  };

  // Save Campaign
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetGig = gigs.find((g) => g.id === campaignFormData.gigId);

    const campaignObj: SponsoredCampaign = {
      id: campaignFormData.id,
      sponsorName: campaignFormData.sponsorName,
      gigId: campaignFormData.gigId,
      gigTitle: targetGig?.title || "Sponsored Opportunity",
      platformName: targetGig?.platformName || campaignFormData.sponsorName,
      budget: Number(campaignFormData.budget),
      dailyBudget: Number(campaignFormData.dailyBudget),
      spent: editingCampaign?.spent || 0,
      startDate: new Date(campaignFormData.startDate).toISOString(),
      endDate: new Date(campaignFormData.endDate).toISOString(),
      targetCategory: campaignFormData.targetCategory,
      status: campaignFormData.status,
      placementRule: campaignFormData.placementRule,
      impressionsCount: editingCampaign?.impressionsCount || 0,
      clicksCount: editingCampaign?.clicksCount || 0,
      costPerClick: Number(campaignFormData.costPerClick),
    };

    await apiClient.saveSponsoredCampaign(campaignObj);

    // If campaign is active, ensure the gig has sponsored = true
    if (targetGig) {
      const gigUpdate = { ...targetGig, sponsored: campaignObj.status === "active" };
      saveStoredGig(gigUpdate);
      await apiClient.adminSaveGig(gigUpdate);
    }

    setIsCampaignModalOpen(false);
    showToast(`Campaign ${campaignObj.sponsorName} saved.`);
    loadAllData();
  };

  // Toggle Launch Checklist Item
  const handleToggleChecklist = async (id: string) => {
    const updated = await apiClient.toggleChecklistItem(id);
    setLaunchChecklist(updated);
    showToast("Launch checklist checkpoint updated.");
  };

  const handleResetCatalog = () => {
    if (window.confirm("Reset catalog and local storage back to default verified state?")) {
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
          <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                Operations Console
              </Badge>
              <Badge variant="outline" size="sm" className="bg-white/80">
                Listing Verification
              </Badge>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-black text-white border border-neutral-700 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>{adminEmail}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-white text-black rounded font-mono">
                  {adminRole}
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 tracking-tight">
              Gig Operations & Review Center
            </h1>
            <p className="text-sm text-ink-muted mt-1 max-w-2xl">
              Manage live listings, enforce evidence-backed rates, triage community reports, and
              schedule recurring verification intervals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border-neutral-300"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetCatalog}
              className="bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Catalog
            </Button>
            <Button 
              size="sm" 
              onClick={handleOpenCreate} 
              className="font-semibold bg-black hover:bg-neutral-800 text-white border border-black shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Opportunity
            </Button>
          </div>
        </div>

        {/* METRICS KPI CARDS (Phase 4 Spec) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-xs hover:border-black transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published Listings
                </span>
                <span className="p-2 bg-neutral-100 text-black rounded-lg">
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
              <p className="text-xs text-black font-semibold mt-1">
                Active in public search & matcher
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-border shadow-xs hover:border-black transition-all ${
              metrics.needsReviewCount > 0 ? "border-black" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Needs Review
                </span>
                <span className="p-2 bg-neutral-100 text-black rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.needsReviewCount}
                </span>
                <span className="text-xs text-black font-semibold">
                  Queue pending
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Overdue dates or open flags
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-white border-border shadow-xs hover:border-black transition-all ${
              metrics.openReportsCount > 0 ? "border-black" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Open Reports
                </span>
                <span className="p-2 bg-neutral-100 text-black rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink">
                  {metrics.openReportsCount}
                </span>
                <span className="text-xs text-black font-semibold">
                  Community flagged
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Rates, geoblocks, or dead links
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-xs hover:border-black transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unverified Claims
                </span>
                <span className="p-2 bg-neutral-100 text-black rounded-lg">
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
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-black text-white font-bold">
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
            onClick={() => setActiveTab("community")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "community"
                ? "border-black text-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            Community Moderation
          </button>

          <button
            onClick={() => setActiveTab("hire-requests")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "hire-requests"
                ? "border-black text-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-black" />
            Hire Requests (Managed)
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
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-black text-white font-bold">
                {metrics.openReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("monetization")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "monetization"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Monetization & Ads ({affiliatePartners.length})
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "coupons"
                ? "border-black text-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            Coupons & Pricing
          </button>

          <button
            onClick={() => setActiveTab("domain")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "domain"
                ? "border-black text-black"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            Domain & Email
          </button>

          <button
            onClick={() => setActiveTab("checklist")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "checklist"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Launch Checklist
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-neutral-200 text-black font-bold">
              {launchChecklist.filter((c) => c.completed).length}/{launchChecklist.length || 10}
            </span>
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
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black text-white border border-black">
                              Published
                            </span>
                          )}
                          {pubStatus === "draft" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              Draft
                            </span>
                          )}
                          {pubStatus === "paused" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">
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
                            className="h-7 px-2 text-xs text-black hover:bg-neutral-200 font-semibold"
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
                            className="h-7 px-2 text-xs text-neutral-700 hover:bg-neutral-200 font-semibold"
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
                            className="h-7 px-2 text-xs text-slate-500 hover:text-black"
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
            <div className="bg-neutral-100 border border-neutral-300 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-black uppercase tracking-wide">
                  Stale-Data Detection & Review Scheduler
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Records that have exceeded their scheduled review date, have unverified claims, or have
                  received open community discrepancy reports are held here for verification sign-off.
                </p>
              </div>
            </div>

            {reviewQueue.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-border">
                <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-black text-white border border-black">
                                <AlertTriangle className="w-3 h-3" /> Critical
                              </span>
                            )}
                            {item.urgency === "warning" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">
                                <Clock className="w-3 h-3" /> Warning
                              </span>
                            )}
                            {item.urgency === "normal" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-black text-white border border-black">
                                <CheckCircle2 className="w-3 h-3" /> Official Advertised
                              </span>
                            )}
                            {pe.rateType === "worker_reported" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 text-black border border-neutral-300">
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
                <CheckCircle2 className="w-10 h-10 text-black mx-auto" />
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
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black text-white border border-black">
                              Open
                            </span>
                          )}
                          {report.status === "triaged" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">
                              Triaged
                            </span>
                          )}
                          {report.status === "resolved" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-black border border-neutral-300">
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
                          <p className="text-xs text-black font-medium">
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
                            className="text-xs h-8 font-semibold bg-black hover:bg-neutral-800 text-white"
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

        {/* TAB 5: MONETIZATION & ADS */}
        {activeTab === "monetization" && (
          <div className="space-y-8">
            {/* Analytics KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card className="bg-white border-border shadow-xs">
                <CardContent className="p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Page Views
                  </span>
                  <span className="text-2xl font-black text-ink mt-1 block">
                    {(analyticsSummary?.pageViews || 14250).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-neutral-600 font-medium">30-day traffic</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-xs">
                <CardContent className="p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Candidates Matched
                  </span>
                  <span className="text-2xl font-black text-ink mt-1 block">
                    {(analyticsSummary?.uniqueVisitors || 4890).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-black font-semibold">Profiles evaluated</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-xs">
                <CardContent className="p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Outbound Clicks
                  </span>
                  <span className="text-2xl font-black text-ink mt-1 block">
                    {(analyticsSummary?.outboundApplications || 1026).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-neutral-600 font-medium">Direct applications</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-xs">
                <CardContent className="p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Affiliate Clicks
                  </span>
                  <span className="text-2xl font-black text-ink mt-1 block">
                    {(analyticsSummary?.affiliateClicks || 640).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-neutral-600 font-medium">Attributed leads</span>
                </CardContent>
              </Card>

              <Card className="bg-white border-border shadow-xs col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Est. Revenue
                  </span>
                  <span className="text-2xl font-black text-black mt-1 block">
                    ${(
                      (analyticsSummary?.estimatedAffiliateRevenue || 770) +
                      (analyticsSummary?.sponsoredRevenue || 527.5)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Affiliate + Ads</span>
                </CardContent>
              </Card>
            </div>

            {/* Affiliate Partners Directory */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-ink flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    Affiliate Partner Configurations
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official referral configurations. URLs with referral tags are resolved on outbound clicks and disclosed transparently.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Platform & Program</th>
                      <th className="py-3 px-4">Model & Rate</th>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Clicks & Conversions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {affiliatePartners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{partner.platformName}</span>
                          <span className="text-slate-500 text-[11px]">{partner.programName}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className="uppercase text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono mr-1.5">
                            {partner.commissionModel}
                          </span>
                          {partner.commissionRate}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {partner.referralCode || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="font-bold text-ink">{partner.totalClicks || 0}</span> clicks ·{" "}
                          <span className="font-bold text-black">{partner.totalConversions || 0}</span> conv
                        </td>
                        <td className="py-3 px-4">
                          {partner.status === "active" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black text-white border border-black">
                              Active
                            </span>
                          )}
                          {partner.status === "pending" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">
                              Pending
                            </span>
                          )}
                          {partner.status === "paused" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                              Paused
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPartnerEdit(partner)}
                            className="text-xs h-7 px-2.5"
                          >
                            Configure
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sponsored Campaigns Manager */}
            <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-ink flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" />
                    Sponsored Promotional Placements
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paid platform campaigns. Every listing is explicitly labelled with a Sponsored badge and kept separate from organic skill-matching.
                  </p>
                </div>
                <Button size="sm" onClick={handleOpenCampaignCreate} className="font-semibold text-xs h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Sponsor & Listing</th>
                      <th className="py-3 px-4">Budget / Daily</th>
                      <th className="py-3 px-4">Spent</th>
                      <th className="py-3 px-4">Performance</th>
                      <th className="py-3 px-4">Placement Rule</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sponsoredCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{camp.sponsorName}</span>
                          <span className="text-slate-500 text-[11px] truncate max-w-xs block">
                            {camp.gigTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-ink">
                          ${camp.budget} / ${camp.dailyBudget}
                        </td>
                        <td className="py-3 px-4 font-bold text-black">
                          ${camp.spent.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="font-bold text-ink">{camp.impressionsCount}</span> imp ·{" "}
                          <span className="font-bold text-ink">{camp.clicksCount}</span> clicks (CPC ${camp.costPerClick || 1.5})
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 uppercase">
                            {camp.placementRule.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {camp.status === "active" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-black text-white border border-black">
                              Active
                            </span>
                          )}
                          {camp.status === "paused" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">
                              Paused
                            </span>
                          )}
                          {camp.status === "completed" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCampaignEdit(camp)}
                            className="text-xs h-7 px-2.5"
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMMUNITY EXCEPTION MODERATION */}
        {activeTab === "community" && (
          <CommunityModerationTab />
        )}

        {/* TAB: HIRE REQUESTS MANAGED MATCHING */}
        {activeTab === "hire-requests" && (
          <HireRequestsTab showToast={showToast} />
        )}

        {/* TAB: COUPONS & PRICING MANAGEMENT */}
        {activeTab === "coupons" && (
          <CouponsManagementTab showToast={showToast} />
        )}

        {/* TAB: DOMAIN & EMAIL DELIVERABILITY */}
        {activeTab === "domain" && (
          <DomainHealthCard
            adminEmail={adminEmail}
            onRefreshChecklist={loadAllData}
          />
        )}

        {/* TAB 6: LAUNCH READINESS CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="space-y-6">
            {/* Readiness Banner */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      Production Readiness
                    </Badge>
                    <Badge variant="outline" size="sm" className="bg-neutral-100 text-black border-neutral-300 font-bold">
                      {launchChecklist.filter((c) => c.completed).length} / {launchChecklist.length || 10} Checkpoints Complete
                    </Badge>
                  </div>
                  <h3 className="text-xl font-extrabold text-ink tracking-tight mt-1">
                    Production Launch Verification Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory 10-checkpoint security, legal, infrastructure, and user trust pre-flight list before public marketing.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-2xl font-black text-black">
                    {Math.round(
                      (launchChecklist.filter((c) => c.completed).length / (launchChecklist.length || 10)) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase">Launch Ready</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (launchChecklist.filter((c) => c.completed).length / (launchChecklist.length || 10)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {launchChecklist.map((item) => (
                <Card
                  key={item.id}
                  className={`bg-white border transition-all ${
                    item.completed ? "border-neutral-400 bg-neutral-100" : "border-border shadow-xs"
                  }`}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        item.completed
                          ? "bg-black border-black text-white"
                          : "border-slate-300 hover:border-black bg-white"
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400">#{item.order}</span>
                        <h4
                          className={`font-bold text-sm ${
                            item.completed ? "text-neutral-500 line-through decoration-neutral-400" : "text-ink"
                          }`}
                        >
                          {item.title}
                        </h4>

                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-black border border-neutral-300">
                          {item.category}
                        </span>

                        {item.completedAt && (
                          <span className="text-[11px] text-slate-400">
                            Verified {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                      {item.notes && (
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                          <span className="font-bold text-slate-900">Verification Stamp:</span> {item.notes}
                        </div>
                      )}

                      {item.id === "chk_01_domain_https" && (
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("domain")}
                            className="text-xs h-7 gap-1.5 font-bold border-black text-black hover:bg-neutral-100 rounded-lg"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Open Domain & Email Deliverability Center
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <Button type="submit" size="sm" className="bg-black hover:bg-neutral-800 text-white font-bold">
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
                className="bg-black hover:bg-neutral-800 text-white font-bold"
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

        {/* MODAL 5: EDIT AFFILIATE PARTNER */}
        <Dialog
          open={isPartnerModalOpen}
          onOpenChange={setIsPartnerModalOpen}
          title={`Configure Affiliate Partner: ${editingPartner?.platformName}`}
          description="Update tracking template, referral code, and commission parameters."
        >
          <form onSubmit={handleSavePartner} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  required
                  value={partnerFormData.platformName}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, platformName: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  required
                  value={partnerFormData.programName}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, programName: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Affiliate URL Template (use {"{referralCode}"} placeholder)
              </label>
              <input
                type="text"
                required
                value={partnerFormData.affiliateUrlTemplate}
                onChange={(e) =>
                  setPartnerFormData({ ...partnerFormData, affiliateUrlTemplate: e.target.value })
                }
                className="w-full h-9 px-3 rounded-lg border border-border text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Referral Code
                </label>
                <input
                  type="text"
                  value={partnerFormData.referralCode}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, referralCode: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Commission Model
                </label>
                <select
                  value={partnerFormData.commissionModel}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      commissionModel: e.target.value as CommissionModel,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white uppercase font-mono"
                >
                  <option value="cpa">CPA (Cost per Acquisition)</option>
                  <option value="cpc">CPC (Cost per Click)</option>
                  <option value="fixed">Fixed bounty</option>
                  <option value="revshare">Revenue Share</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Partner Status
                </label>
                <select
                  value={partnerFormData.status}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold"
                >
                  <option value="active">Active (Resolves links)</option>
                  <option value="pending">Pending</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Commission Rate Terms
              </label>
              <input
                type="text"
                required
                value={partnerFormData.commissionRate}
                onChange={(e) =>
                  setPartnerFormData({ ...partnerFormData, commissionRate: e.target.value })
                }
                placeholder="e.g. $30 per approved contributor"
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Partner Notes & Terms URL
              </label>
              <textarea
                rows={2}
                value={partnerFormData.notes}
                onChange={(e) => setPartnerFormData({ ...partnerFormData, notes: e.target.value })}
                className="w-full p-2 rounded-lg border border-border text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPartnerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Save Partner
              </Button>
            </div>
          </form>
        </Dialog>

        {/* MODAL 6: CREATE / EDIT SPONSORED CAMPAIGN */}
        <Dialog
          open={isCampaignModalOpen}
          onOpenChange={setIsCampaignModalOpen}
          title={
            editingCampaign
              ? `Edit Campaign: ${editingCampaign.sponsorName}`
              : "New Sponsored Promotional Campaign"
          }
          description="Configure promotional budget, targeting category, and placement rules."
        >
          <form onSubmit={handleSaveCampaign} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Sponsor Brand
                </label>
                <input
                  type="text"
                  required
                  value={campaignFormData.sponsorName}
                  onChange={(e) =>
                    setCampaignFormData({ ...campaignFormData, sponsorName: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Promoted Listing Opportunity
                </label>
                <select
                  value={campaignFormData.gigId}
                  onChange={(e) =>
                    setCampaignFormData({ ...campaignFormData, gigId: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white truncate"
                >
                  {gigs.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.platformName} - {g.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Total Budget ($)
                </label>
                <input
                  type="number"
                  required
                  value={campaignFormData.budget}
                  onChange={(e) =>
                    setCampaignFormData({ ...campaignFormData, budget: Number(e.target.value) })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Daily Cap ($)
                </label>
                <input
                  type="number"
                  required
                  value={campaignFormData.dailyBudget}
                  onChange={(e) =>
                    setCampaignFormData({
                      ...campaignFormData,
                      dailyBudget: Number(e.target.value),
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cost per Click ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={campaignFormData.costPerClick}
                  onChange={(e) =>
                    setCampaignFormData({
                      ...campaignFormData,
                      costPerClick: Number(e.target.value),
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={campaignFormData.startDate}
                  onChange={(e) =>
                    setCampaignFormData({ ...campaignFormData, startDate: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={campaignFormData.endDate}
                  onChange={(e) =>
                    setCampaignFormData({ ...campaignFormData, endDate: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Placement Rule
                </label>
                <select
                  value={campaignFormData.placementRule}
                  onChange={(e) =>
                    setCampaignFormData({
                      ...campaignFormData,
                      placementRule: e.target.value as CampaignPlacementRule,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold"
                >
                  <option value="featured_badge">Featured Badge (Card Highlight)</option>
                  <option value="top_of_category">Top of Category Directory</option>
                  <option value="homepage_hero">Homepage Hero Placement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Campaign Status
                </label>
                <select
                  value={campaignFormData.status}
                  onChange={(e) =>
                    setCampaignFormData({
                      ...campaignFormData,
                      status: e.target.value as CampaignStatus,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border text-xs bg-white font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsCampaignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Save Campaign
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
}
