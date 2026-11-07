"use client";

import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Award,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  ContributionProposal,
  ContributionWorkflowStage,
  ContributionType,
} from "@/types/portfolio";
import {
  getContributionProposals,
  updateProposalStatus,
  issueCertificate,
  saveInternship,
} from "@/lib/portfolio/storage";
import { PORTFOLIO_APPS } from "@/data/portfolio-apps";

const STAGES: ContributionWorkflowStage[] = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Approved",
  "In Development",
  "Under Testing",
  "Completed",
  "Merged / Released",
  "Rejected",
];

export const PortfolioContributionsTab: React.FC = () => {
  const [proposals, setProposals] = useState<ContributionProposal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const loadProposals = () => {
    setProposals(getContributionProposals());
  };

  useEffect(() => {
    loadProposals();
    const handleUpdate = () => loadProposals();
    window.addEventListener("portfolio_proposals_updated", handleUpdate);
    return () => window.removeEventListener("portfolio_proposals_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (id: string, newStatus: ContributionWorkflowStage) => {
    const feedback = feedbackMap[id];
    updateProposalStatus(id, newStatus, feedback);
    showToast(`Proposal status updated to: ${newStatus}`);
  };

  const handleGrantCertificate = (proposal: ContributionProposal) => {
    const cert = issueCertificate({
      contributionId: proposal.id,
      contributorName: proposal.fullName,
      contributorEmail: proposal.email,
      projectName: proposal.projectNames?.[0] || "Android Portfolio Project",
      contributionType: proposal.contributionTypes.join(", "),
      completionDate: new Date().toISOString().split("T")[0],
      issuerName: "Lead Android Architect",
      issuerTitle: "Principal Systems Engineer",
      organizationName: "Remotasks App Portfolio",
      summary: `Completed and integrated peer-reviewed engineering work: ${proposal.proposalTitle}`,
    });

    updateProposalStatus(proposal.id, "Merged / Released", "Certificate issued upon verified completion.");
    showToast(`Official Certificate ${cert.id} issued to ${proposal.fullName}!`);
  };

  const handleConsiderInternship = (proposal: ContributionProposal) => {
    const record = saveInternship({
      contributionId: proposal.id,
      candidateName: proposal.fullName,
      candidateEmail: proposal.email,
      githubProfile: proposal.githubProfile,
      associatedProject: proposal.projectNames?.[0] || "Android App Project",
      status: "Shortlisted",
      roleTitle: `${proposal.contributionTypes[0] || "Android"} Engineering Intern`,
      durationMonths: 3,
      responsibilities: `Selected through verified contribution: "${proposal.proposalTitle}". Candidate demonstrated exceptional skills in ${proposal.technicalSkills}.`,
      formalOfferIssued: false,
    });

    updateProposalStatus(proposal.id, proposal.status, undefined, true);
    showToast(`Candidate ${proposal.fullName} shortlisted in Internship Management!`);
  };

  const filtered = proposals.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (projectFilter !== "All" && !p.projectIds.includes(projectFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.proposalTitle.toLowerCase().includes(q) ||
        p.technicalSkills.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-black" />
            Contribution Proposals Management ({proposals.length} Submissions)
          </h2>
          <p className="text-xs text-neutral-500">
            Review submissions, evaluate technical approaches, shortlist candidates, track progress, and issue certificates.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contributor name, email, skills, or title..."
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
        >
          <option value="All">All Stages ({proposals.length})</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s} ({proposals.filter((p) => p.status === s).length})
            </option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
        >
          <option value="All">All Projects</option>
          {PORTFOLIO_APPS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filtered.map((proposal) => {
          const isExpanded = expandedId === proposal.id;

          return (
            <div
              key={proposal.id}
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-400">
                      {proposal.id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        proposal.status === "Approved" || proposal.status === "Merged / Released"
                          ? "bg-emerald-100 text-emerald-800"
                          : proposal.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : proposal.status === "Shortlisted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      {proposal.status}
                    </span>

                    {proposal.certificateId && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Certificate Issued
                      </span>
                    )}

                    {proposal.internshipConsideration && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Internship Track
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-neutral-900 leading-snug">
                    {proposal.proposalTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                    <span>
                      Contributor: <strong>{proposal.fullName}</strong> ({proposal.email})
                    </span>
                    <span>
                      Target: <strong>{proposal.projectNames?.join(", ") || "General"}</strong>
                    </span>
                    <span>Timeline: {proposal.estimatedCompletionTime}</span>
                  </div>
                </div>

                {/* Status Switcher & Expand Button */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <select
                    value={proposal.status}
                    onChange={(e) =>
                      handleStatusChange(proposal.id, e.target.value as ContributionWorkflowStage)
                    }
                    className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Candidate Profile & Technical Approach */}
              {isExpanded && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 p-5 space-y-5 text-xs">
                  {/* Candidate Profile Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-neutral-200 bg-white p-4">
                    <div>
                      <span className="font-bold text-neutral-500 uppercase text-[10px] block">
                        Qualification
                      </span>
                      <p className="font-semibold text-neutral-900 mt-0.5">{proposal.qualification}</p>
                    </div>

                    <div>
                      <span className="font-bold text-neutral-500 uppercase text-[10px] block">
                        Technical Skills
                      </span>
                      <p className="font-semibold text-neutral-900 mt-0.5">{proposal.technicalSkills}</p>
                    </div>

                    <div>
                      <span className="font-bold text-neutral-500 uppercase text-[10px] block">
                        Verified Links
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <a
                          href={proposal.githubProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-black underline flex items-center gap-1"
                        >
                          GitHub <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        {proposal.linkedinProfile && (
                          <a
                            href={proposal.linkedinProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 underline flex items-center gap-1"
                          >
                            LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {proposal.portfolioUrl && (
                          <a
                            href={proposal.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-neutral-700 underline flex items-center gap-1"
                          >
                            Portfolio <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold uppercase text-[10px] text-neutral-400 block mb-0.5">
                        Detailed Description
                      </span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                        {proposal.detailedDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold uppercase text-[10px] text-neutral-400 block mb-0.5">
                          Problem Being Solved
                        </span>
                        <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                          {proposal.problemSolved}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold uppercase text-[10px] text-neutral-400 block mb-0.5">
                          Proposed Technical Approach
                        </span>
                        <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                          {proposal.technicalApproach}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold uppercase text-[10px] text-neutral-400 block mb-0.5">
                        Expected Outcome
                      </span>
                      <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                        {proposal.expectedOutcome}
                      </p>
                    </div>
                  </div>

                  {/* Admin Notes & Quick Actions */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                    <span className="font-bold text-neutral-900 block text-xs">
                      Admin Decision &amp; Communication Feedback
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={feedbackMap[proposal.id] ?? (proposal.adminFeedback || "")}
                        onChange={(e) =>
                          setFeedbackMap({ ...feedbackMap, [proposal.id]: e.target.value })
                        }
                        placeholder="Add review feedback visible to contributor in decision email..."
                        className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900"
                      />
                      <button
                        onClick={() =>
                          updateProposalStatus(
                            proposal.id,
                            proposal.status,
                            feedbackMap[proposal.id] || proposal.adminFeedback
                          )
                        }
                        className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                      >
                        Save Note
                      </button>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleConsiderInternship(proposal)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-100"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Shortlist for Internship
                      </button>

                      <button
                        onClick={() => handleGrantCertificate(proposal)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Approve &amp; Issue Contribution Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

