"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ExternalLink,
  Plus,
  ArrowRight,
  Bookmark,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Layers,
  GitPullRequest,
  Award,
  ShieldCheck,
  AlertCircle,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge, Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { TrackedApplication, ApplicationStatus } from "@/types/gig";
import { ContributionProposal, ContributionWorkflowStage } from "@/types/portfolio";
import {
  INITIAL_APPLICATIONS,
  getTrackedApplications,
  updateApplicationStatus,
  removeTrackedApplication,
} from "@/lib/storage";
import { getContributionProposals } from "@/lib/portfolio/storage";
import { apiClient } from "@/lib/api";

const ALL_GIG_STATUSES: ApplicationStatus[] = [
  "Shortlisted",
  "Applied",
  "Onboarding",
  "Qualified",
  "Active",
  "Rejected",
  "Withdrawn",
];

const ALL_CONTRIBUTION_STATUSES: (ContributionWorkflowStage | "All")[] = [
  "All",
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Approved",
  "In Development",
  "Under Testing",
  "Completed",
  "Rejected",
];

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "contributions" ? "contributions" : "gigs";

  const [activeTab, setActiveTab] = useState<"gigs" | "contributions">(initialTab);

  // Gig Applications State
  const [applications, setApplications] = useState<TrackedApplication[]>(INITIAL_APPLICATIONS);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [editingApp, setEditingApp] = useState<TrackedApplication | null>(null);

  // Edit Modal Form State
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("Shortlisted");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  // Contribution Proposals State
  const [proposals, setProposals] = useState<ContributionProposal[]>([]);
  const [selectedContributionFilter, setSelectedContributionFilter] = useState<string>("All");

  const refreshApplications = async () => {
    try {
      const data = await apiClient.getApplications();
      setApplications(data);
    } catch {
      setApplications(getTrackedApplications());
    }
  };

  const refreshProposals = () => {
    try {
      const stored = getContributionProposals();
      setProposals(stored);
    } catch (err) {
      console.error("Failed to load contribution proposals:", err);
    }
  };

  useEffect(() => {
    refreshApplications();
    refreshProposals();

    const handleGigUpdate = () => refreshApplications();
    const handleProposalUpdate = () => refreshProposals();

    window.addEventListener("gigmatcher_applications_updated", handleGigUpdate);
    window.addEventListener("portfolio_proposals_updated", handleProposalUpdate);

    return () => {
      window.removeEventListener("gigmatcher_applications_updated", handleGigUpdate);
      window.removeEventListener("portfolio_proposals_updated", handleProposalUpdate);
    };
  }, []);

  const handleOpenEdit = (app: TrackedApplication) => {
    setEditingApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes);
    setEditDate(app.appliedDate || new Date().toISOString().split("T")[0]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    await apiClient.updateApplication(editingApp.id, editStatus, editNotes, editDate);
    await refreshApplications();
    setEditingApp(null);
  };

  const handleRemove = async (id: string, title: string) => {
    if (confirm(`Remove "${title}" from your application tracker?`)) {
      await apiClient.deleteApplication(id);
      await refreshApplications();
    }
  };

  // Filtered gig applications
  const filteredApps = applications.filter((app) => {
    if (selectedStatusFilter === "All") return true;
    return app.status === selectedStatusFilter;
  });

  // Filtered contribution proposals
  const filteredProposals = proposals.filter((p) => {
    if (selectedContributionFilter === "All") return true;
    return p.status === selectedContributionFilter;
  });

  // Analytics Metrics for Gigs
  const activeCount = applications.filter((a) => a.status === "Active").length;
  const onboardingCount = applications.filter(
    (a) => a.status === "Onboarding" || a.status === "Qualified"
  ).length;
  const appliedCount = applications.filter((a) => a.status === "Applied").length;

  // Analytics Metrics for Contributions
  const approvedCount = proposals.filter(
    (p) => p.status === "Approved" || p.status === "In Development" || p.status === "Under Testing"
  ).length;
  const completedCount = proposals.filter((p) => p.status === "Completed" || (p.status as any) === "Merged / Released").length;
  const underReviewCount = proposals.filter((p) => p.status === "Under Review" || p.status === "Shortlisted").length;

  const getContributionBadgeColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "Completed":
      case "Merged / Released":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Development":
      case "Under Testing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Under Review":
      case "Shortlisted":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header with Dual-Area Tabs */}
        <div className="bg-white rounded-[14px] border border-border p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-black" />
                <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  Application Tracker
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Manage your qualification pipeline across Gig Marketplace and Apps &amp; Studio contributions.
              </p>
            </div>

            {/* Primary Workflow Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 border border-neutral-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("gigs")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "gigs"
                    ? "bg-white text-black shadow-xs font-bold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Gig Applications</span>
                <span className="text-[10px] bg-neutral-200 px-1.5 py-0.2 rounded-full font-bold">
                  {applications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contributions")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "contributions"
                    ? "bg-white text-black shadow-xs font-bold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Contribution Submissions</span>
                <span className="text-[10px] bg-neutral-200 px-1.5 py-0.2 rounded-full font-bold">
                  {proposals.length}
                </span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          {activeTab === "gigs" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                  Total Tracked Gigs
                </span>
                <span className="text-2xl font-black text-ink mt-0.5 block" suppressHydrationWarning>
                  {applications.length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-700 font-semibold uppercase text-[10px] block">
                  Active Projects
                </span>
                <span className="text-2xl font-black text-black mt-0.5 block">
                  {activeCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 font-semibold uppercase text-[10px] block">
                  In Qualification
                </span>
                <span className="text-2xl font-black text-black mt-0.5 block font-mono">
                  {onboardingCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-500 font-semibold uppercase text-[10px] block">
                  Submitted Applications
                </span>
                <span className="text-2xl font-black text-ink mt-0.5 block font-mono">
                  {appliedCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                  Total Proposals
                </span>
                <span className="text-2xl font-black text-ink mt-0.5 block">
                  {proposals.length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-amber-800 font-semibold uppercase text-[10px] block">
                  Under Review / Shortlisted
                </span>
                <span className="text-2xl font-black text-amber-900 mt-0.5 block">
                  {underReviewCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <span className="text-blue-800 font-semibold uppercase text-[10px] block">
                  Approved / In Dev
                </span>
                <span className="text-2xl font-black text-blue-900 mt-0.5 block font-mono">
                  {approvedCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-emerald-800 font-semibold uppercase text-[10px] block">
                  Completed / Certificates
                </span>
                <span className="text-2xl font-black text-emerald-900 mt-0.5 block font-mono">
                  {completedCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            VIEW 1: Gig Applications Pipeline (Preserved)
            ========================================================================= */}
        {activeTab === "gigs" && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-xs font-bold text-ink mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Stage:
              </span>
              {["All", ...ALL_GIG_STATUSES].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full font-semibold border transition-all whitespace-nowrap ${
                    selectedStatusFilter === st
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-white text-ink-muted border-border hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  {st}
                  {st !== "All" && (
                    <span className="ml-1.5 opacity-60 text-[10px]">
                      ({applications.filter((a) => a.status === st).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-[14px] border border-border p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <ApplicationStatusBadge status={app.status} />
                        <span className="text-xs font-semibold text-slate-400">·</span>
                        <span className="text-xs font-bold text-ink">{app.platformName}</span>
                        {app.appliedDate && (
                          <span className="text-[11px] text-ink-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {app.appliedDate}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-ink">{app.roleTitle}</h3>

                      {app.notes ? (
                        <p className="text-xs text-ink-muted bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                          <span className="font-semibold text-ink">Notes:</span> {app.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(app)}
                        className="text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Update Status
                      </Button>
                      <button
                        onClick={() => handleRemove(app.id, app.roleTitle)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[14px] bg-white border border-border p-12 text-center space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  No applications in "{selectedStatusFilter}" status
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                  Save opportunities from the matching dashboard to track your qualification steps and progress.
                </p>
                <div className="pt-2">
                  <Button href="/dashboard" size="sm">
                    Go to Matching Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: Contribution Submissions Pipeline (Independent Workflow)
            ========================================================================= */}
        {activeTab === "contributions" && (
          <div className="space-y-6">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-xs font-bold text-ink mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Stage:
              </span>
              {ALL_CONTRIBUTION_STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedContributionFilter(st)}
                  className={`px-3 py-1.5 rounded-full font-semibold border transition-all whitespace-nowrap ${
                    selectedContributionFilter === st
                      ? "bg-black text-white border-black shadow-xs"
                      : "bg-white text-ink-muted border-border hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  {st}
                  {st !== "All" && (
                    <span className="ml-1.5 opacity-60 text-[10px]">
                      ({proposals.filter((p) => p.status === st).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredProposals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-white rounded-[14px] border border-border p-5 shadow-xs hover:border-black transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getContributionBadgeColor(
                            proposal.status
                          )}`}
                        >
                          <Clock className="w-3 h-3" />
                          {proposal.status}
                        </span>

                        <span className="text-xs font-mono text-neutral-400">
                          {proposal.id.toUpperCase()}
                        </span>

                        {proposal.internshipConsideration && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Internship Track Candidate
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-black">{proposal.proposalTitle}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Target Applications:{" "}
                        <span className="font-semibold text-black">
                          {proposal.projectNames?.join(", ") || proposal.projectIds.join(", ")}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {proposal.contributionTypes.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-medium border border-neutral-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      {proposal.detailedDescription}
                    </p>

                    {proposal.adminFeedback && (
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                        <span className="font-bold block">Development Team Feedback:</span>
                        <p>{proposal.adminFeedback}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
                      <div className="flex items-center gap-3 text-neutral-500">
                        {proposal.githubProfile && (
                          <a
                            href={proposal.githubProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-black font-semibold hover:underline"
                          >
                            GitHub Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {proposal.certificateId && (
                        <Link
                          href={`/verify-certificate/${proposal.certificateId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 font-semibold text-xs shadow-xs transition-colors"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          View Issued Certificate ({proposal.certificateId})
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[14px] bg-white border border-border p-12 text-center space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-full bg-neutral-100 text-neutral-500 mx-auto flex items-center justify-center">
                  <GitPullRequest className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-black">
                  No contribution proposals in "{selectedContributionFilter}" status
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
                  Submit a feature proposal or bug report for any portfolio application to begin contributing.
                </p>
                <div className="pt-2">
                  <Button href="/contribute" size="sm">
                    Submit Contribution Proposal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT APPLICATION STATUS MODAL (Gig Applications) */}
      <Dialog
        open={Boolean(editingApp)}
        onOpenChange={(open) => !open && setEditingApp(null)}
        title="Update Application Status & Notes"
        description={editingApp ? `${editingApp.roleTitle} (${editingApp.platformName})` : ""}
      >
        {editingApp && (
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Current Pipeline Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs sm:text-sm font-semibold text-ink focus:ring-2 focus:ring-brand-500"
              >
                {ALL_GIG_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Date Applied / Recorded
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">
                Notes & Reminders
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Completed initial coding test, awaiting rubric feedback..."
                className="w-full p-3 rounded-lg border border-border bg-white text-xs sm:text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingApp(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Application Changes
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas-bg py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[14px] border border-border p-6 shadow-xs animate-pulse h-48" />
          </div>
        </div>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}
