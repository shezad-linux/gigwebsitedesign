"use client";

/* ==============================================================================
   RequestDetailView Component
   Client & talent interactive workspace for reviewing matches, submitting
   proposals, deciding on offers, and tracking project lifecycle.
   ============================================================================== */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  DollarSign,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  Send,
  MessageSquare,
  FileText,
  Star,
  Check,
  X,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  HireRequest,
  HireMatch,
  HireProposal,
  HireActivityLog,
} from "@/lib/hire-talent/types";
import {
  respondToMatchAction,
  submitHireProposalAction,
  updateProposalDecisionAction,
} from "@/app/actions/hire-talent";

interface RequestDetailViewProps {
  request: HireRequest;
  matches: HireMatch[];
  proposals: HireProposal[];
  activity: HireActivityLog[];
  currentUserId?: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export function RequestDetailView({
  request,
  matches,
  proposals,
  activity,
  currentUserId,
  isOwner,
  isAdmin,
}: RequestDetailViewProps) {
  const router = useRouter();

  // Proposal modal state for invited talent
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposedRate, setProposedRate] = useState<number>(
    request.hiring_model === "hourly" ? request.budget_min || 65 : request.budget_min || 2000
  );
  const [estimatedHours, setEstimatedHours] = useState<number | "">(40);
  const [coverLetter, setCoverLetter] = useState("");
  const [approach, setApproach] = useState("");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Check if current user is an invited talent
  const myMatch = matches.find((m) => m.talent_id === currentUserId);
  const myProposal = proposals.find((p) => p.talent_id === currentUserId);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Talent Match Response
  const handleRespondMatch = async (matchId: string, response: "accepted" | "declined") => {
    setActionLoading(`match-${matchId}`);
    try {
      const res = await respondToMatchAction(matchId, response);
      if (res.success) {
        showToast(`You have ${response} this project invitation`);
        router.refresh();
      } else {
        showToast(res.error || "Action failed", "error");
      }
    } catch {
      showToast("Error processing response", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Client proposal acceptance / decline
  const handleProposalDecision = async (
    proposalId: string,
    decision: "accepted" | "declined" | "shortlisted"
  ) => {
    setActionLoading(`proposal-${proposalId}`);
    try {
      const res = await updateProposalDecisionAction(proposalId, decision);
      if (res.success) {
        showToast(`Proposal successfully marked as ${decision}`);
        router.refresh();
      } else {
        showToast(res.error || "Failed to update proposal", "error");
      }
    } catch {
      showToast("Error processing decision", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Submit proposal handler
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProposal(true);
    try {
      const res = await submitHireProposalAction({
        request_id: request.id,
        proposed_rate: proposedRate,
        estimated_hours: estimatedHours === "" ? undefined : Number(estimatedHours),
        cover_letter: coverLetter,
        approach,
      });

      if (res.success) {
        showToast("Proposal submitted successfully!");
        setShowProposalForm(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to submit proposal", "error");
      }
    } catch {
      showToast("Error submitting proposal", "error");
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  const statusColors: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-700",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-amber-50 text-amber-700 border-amber-200",
    matching: "bg-purple-50 text-purple-700 border-purple-200",
    talent_proposed: "bg-indigo-50 text-indigo-700 border-indigo-200",
    client_deciding: "bg-yellow-50 text-yellow-800 border-yellow-200",
    in_progress: "bg-emerald-50 text-emerald-800 border-emerald-200",
    completed: "bg-black text-white",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
            toastMessage.type === "success"
              ? "bg-black text-white border-neutral-800"
              : "bg-red-950 text-red-200 border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[request.status] || "bg-neutral-100 text-black"}`}>
              {request.status.replace("_", " ")}
            </span>
            <span className="text-xs text-neutral-400">
              Created {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>

          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            {request.category.replace("-", " ")}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {request.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
          <div>
            <span className="text-neutral-400 block font-bold uppercase text-[10px]">Hiring Model</span>
            <span className="font-bold text-black capitalize">{request.hiring_model}</span>
          </div>
          <div>
            <span className="text-neutral-400 block font-bold uppercase text-[10px]">Budget Target</span>
            <span className="font-bold text-black">
              {request.hiring_model === "hourly"
                ? `$${request.budget_min || 40} - $${request.budget_max || 90}/hr`
                : `$${request.budget_min || 1000} - $${request.budget_max || 5000} Total`}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block font-bold uppercase text-[10px]">Duration</span>
            <span className="font-bold text-black">{request.estimated_duration_weeks || 4} Weeks</span>
          </div>
          <div>
            <span className="text-neutral-400 block font-bold uppercase text-[10px]">Experience</span>
            <span className="font-bold text-black capitalize">{request.experience_level}</span>
          </div>
        </div>
      </div>

      {/* TALENT INVITATION CALLOUT (FOR INVITED PROFESSIONAL) */}
      {myMatch && (
        <Card className="bg-black text-white border-neutral-800 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Project Invitation ({myMatch.match_score}% Match)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  You have been matched to this project.
                </h3>
                <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                  <strong>Rationale:</strong> {myMatch.match_rationale}
                </p>
              </div>

              {myMatch.status === "invited" ? (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleRespondMatch(myMatch.id, "accepted")}
                    disabled={actionLoading === `match-${myMatch.id}`}
                    className="bg-white text-black hover:bg-neutral-100 font-bold text-xs"
                  >
                    Accept & Propose
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespondMatch(myMatch.id, "declined")}
                    disabled={actionLoading === `match-${myMatch.id}`}
                    className="border-neutral-700 text-neutral-300 hover:bg-neutral-900 text-xs"
                  >
                    Decline
                  </Button>
                </div>
              ) : myMatch.status === "accepted" && !myProposal ? (
                <Button
                  size="sm"
                  onClick={() => setShowProposalForm(true)}
                  className="bg-white text-black hover:bg-neutral-100 font-bold text-xs shrink-0"
                >
                  Submit Proposal Quote
                </Button>
              ) : (
                <span className="text-xs text-neutral-400 font-bold uppercase">
                  Status: {myMatch.status}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROPOSAL SUBMISSION MODAL / FORM */}
      {showProposalForm && (
        <Card className="bg-white border-black shadow-lg">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg font-black text-black">
              Submit Your Proposal Quote
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Provide your proposed commercial rate, technical approach, and deliverables breakdown.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Proposed Rate (USD {request.hiring_model === "hourly" ? "/ hour" : "Total"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={proposedRate}
                    onChange={(e) => setProposedRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                    Estimated Hours / Timeline
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Cover Letter / Executive Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Introduce yourself, your relevant background on similar projects, and why you are the best fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">
                  Technical Implementation Approach *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain your architectural plan, tech stack selections, testing strategy, and communication cadence..."
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-black focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProposalForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingProposal || coverLetter.length < 20}
                  className="bg-black text-white hover:bg-neutral-800 text-xs font-bold"
                >
                  {isSubmittingProposal ? "Submitting..." : "Submit Proposal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PROJECT DETAILS & SCOPE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-bold text-black">
                Project Scope & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6">
              <p className="text-xs text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {request.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Required Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {request.required_skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {request.fixed_deliverables && request.fixed_deliverables.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Deliverables Checklist
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-700">
                    {request.fixed_deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SUBMITTED PROPOSALS */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black flex items-center justify-between">
              <span>Proposals & Quotes ({proposals.length})</span>
            </h3>

            {proposals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
                No proposals submitted yet. Our talent coordinators are currently inviting verified specialists.
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const talent = proposal.talent;
                  return (
                    <Card key={proposal.id} className="bg-white border-neutral-200 shadow-xs">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shrink-0">
                              {talent?.full_name?.charAt(0) || "P"}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-black">
                                {talent?.full_name || "Specialist"}
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                {talent?.headline || "Verified Talent"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-black">
                              ${proposal.proposed_rate}
                              <span className="text-xs font-normal text-neutral-500">
                                {request.hiring_model === "hourly" ? "/hr" : " Total"}
                              </span>
                            </span>
                            {proposal.estimated_hours && (
                              <span className="block text-[11px] text-neutral-400">
                                ~{proposal.estimated_hours} hours
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <strong className="text-neutral-900 block mb-1">Cover Note:</strong>
                            <p className="text-neutral-700 whitespace-pre-wrap">{proposal.cover_letter}</p>
                          </div>
                          <div>
                            <strong className="text-neutral-900 block mb-1">Technical Approach:</strong>
                            <p className="text-neutral-700 whitespace-pre-wrap">{proposal.approach}</p>
                          </div>
                        </div>

                        {/* Proposal Actions for Client */}
                        {(isOwner || isAdmin) && (
                          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                              proposal.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : proposal.status === "declined"
                                ? "bg-red-100 text-red-800"
                                : "bg-neutral-100 text-neutral-700"
                            }`}>
                              {proposal.status}
                            </span>

                            {proposal.status === "submitted" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleProposalDecision(proposal.id, "accepted")}
                                  disabled={actionLoading === `proposal-${proposal.id}`}
                                  className="bg-black text-white hover:bg-neutral-800 text-xs font-bold gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Accept & Engage
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProposalDecision(proposal.id, "declined")}
                                  disabled={actionLoading === `proposal-${proposal.id}`}
                                  className="border-neutral-300 text-xs hover:bg-neutral-50"
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR: MATCHES & ACTIVITY LOG */}
        <div className="space-y-6">
          {/* Matched Professionals List */}
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Recommended Matches ({matches.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              {matches.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  Talent coordinators are actively reviewing candidate profiles for this request.
                </p>
              ) : (
                matches.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-black truncate max-w-[150px]">
                        {m.talent?.full_name || "Specialist"}
                      </span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {m.match_score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 line-clamp-2">
                      {m.match_rationale}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity / Audit History */}
          <Card className="bg-white border-neutral-200 shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Engagement History
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 pt-0">
              {activity.length === 0 ? (
                <p className="text-xs text-neutral-400">No activity logged yet.</p>
              ) : (
                <div className="space-y-3 border-l-2 border-neutral-200 pl-3">
                  {activity.map((act) => (
                    <div key={act.id} className="text-xs space-y-0.5">
                      <span className="font-bold text-black block capitalize">
                        {act.action.replace(/_/g, " ")}
                      </span>
                      {act.notes && <p className="text-[11px] text-neutral-600">{act.notes}</p>}
                      <span className="text-[10px] text-neutral-400 block">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
