"use client";

/* ==============================================================================
   HireRequestsTab Component
   Admin Operations Console for Remotasks.si Managed Matching:
   - Filter queues: New Submissions, Review, Matching, Proposals, Active, Completed
   - Talent Match Dialog with explainable scoring (0-100) and rationale breakdown
   - Status updates & internal coordinator audit trail
   - Detailed inspection drawer with client criteria and proposals
   ============================================================================== */

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  Sliders,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  FileText,
  Check,
  X,
  AlertCircle,
  Briefcase,
  DollarSign,
  Layers,
  ShieldCheck,
  Award,
  Send,
  UserCheck,
  MessageSquare,
  ChevronRight,
  Code2,
  Calendar,
  Building,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  HireRequest,
  HireRequestStatus,
  TalentProfile,
  HireServiceCategory,
  HIRE_SERVICE_CATEGORIES,
} from "@/lib/hire-talent/types";
import { evaluateTalentMatch } from "@/lib/hire-talent/matching";
import {
  getAdminHireRequestsOverviewAction,
  getAdminTalentPoolAction,
  getAdminHireRequestDetailsAction,
  adminRecommendTalentAction,
  adminUpdateRequestStatusAction,
} from "@/app/actions/hire-talent";

interface HireRequestsTabProps {
  showToast?: (msg: string) => void;
}

export const HireRequestsTab: React.FC<HireRequestsTabProps> = ({ showToast }) => {
  const [requests, setRequests] = useState<(HireRequest & { match_count: number; proposal_count: number })[]>([]);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Match Modal State
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [targetRequestForMatch, setTargetRequestForMatch] = useState<HireRequest | null>(null);
  const [selectedTalentForMatch, setSelectedTalentForMatch] = useState<TalentProfile | null>(null);
  const [matchScore, setMatchScore] = useState<number>(85);
  const [matchRationale, setMatchRationale] = useState<string>("");
  const [sendInviteCheck, setSendInviteCheck] = useState<boolean>(true);
  const [submittingMatch, setSubmittingMatch] = useState<boolean>(false);
  const [talentSearchQuery, setTalentSearchQuery] = useState("");

  // Status & Notes Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetRequestForStatus, setTargetRequestForStatus] = useState<HireRequest | null>(null);
  const [newStatus, setNewStatus] = useState<HireRequestStatus>("matching");
  const [internalNotes, setInternalNotes] = useState<string>("");
  const [submittingStatus, setSubmittingStatus] = useState<boolean>(false);

  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeRequestDetails, setActiveRequestDetails] = useState<{
    request: HireRequest | null;
    matches: any[];
    proposals: any[];
    activity: any[];
  } | null>(null);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
    else alert(msg);
  };

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [overviewRes, talentRes] = await Promise.all([
        getAdminHireRequestsOverviewAction(),
        getAdminTalentPoolAction({ verifiedOnly: false }),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setRequests(overviewRes.data.requests || []);
        setCountsByStatus(overviewRes.data.countsByStatus || {});
      }

      if (talentRes.success && talentRes.data) {
        setTalents(talentRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load hire requests tab data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && req.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = req.title.toLowerCase().includes(q);
        const matchSkills = req.required_skills?.some((s) => s.toLowerCase().includes(q));
        const matchClient = req.client_email?.toLowerCase().includes(q) || req.client_name?.toLowerCase().includes(q);
        const matchDesc = req.description?.toLowerCase().includes(q);
        return matchTitle || matchSkills || matchClient || matchDesc;
      }
      return true;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const triage = requests.filter((r) => r.status === "submitted" || r.status === "under_review").length;
    const inMatching = requests.filter((r) => r.status === "matching" || r.status === "talent_proposed").length;
    const active = requests.filter((r) => r.status === "in_progress").length;
    return { total, triage, inMatching, active };
  }, [requests]);

  // Filtered talent pool in Match dialog
  const filteredTalentsForMatch = useMemo(() => {
    if (!targetRequestForMatch) return talents;
    let list = talents;

    if (talentSearchQuery.trim()) {
      const q = talentSearchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.full_name?.toLowerCase().includes(q) ||
          t.headline?.toLowerCase().includes(q) ||
          t.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [talents, targetRequestForMatch, talentSearchQuery]);

  // Open Match Dialog
  const handleOpenMatchModal = (req: HireRequest) => {
    setTargetRequestForMatch(req);
    setTalentSearchQuery("");

    // Auto-select best matching talent if available
    const candidates = talents.filter((t) => t.preferred_categories.includes(req.category));
    const firstCandidate = candidates[0] || talents[0] || null;

    setSelectedTalentForMatch(firstCandidate);

    if (firstCandidate) {
      const evaluation = evaluateTalentMatch(req, firstCandidate);
      setMatchScore(evaluation.score);
      setMatchRationale(evaluation.rationale);
    } else {
      setMatchScore(85);
      setMatchRationale("Verified professional with strong domain portfolio.");
    }

    setSendInviteCheck(true);
    setIsMatchModalOpen(true);
  };

  // Select Talent in Match Dialog
  const handleSelectTalent = (t: TalentProfile) => {
    setSelectedTalentForMatch(t);
    if (targetRequestForMatch) {
      const evaluation = evaluateTalentMatch(targetRequestForMatch, t);
      setMatchScore(evaluation.score);
      setMatchRationale(evaluation.rationale);
    }
  };

  // Submit Match Action
  const handleSubmitMatch = async () => {
    if (!targetRequestForMatch || !selectedTalentForMatch) return;
    setSubmittingMatch(true);

    try {
      const res = await adminRecommendTalentAction({
        requestId: targetRequestForMatch.id,
        talentId: selectedTalentForMatch.id,
        matchScore,
        matchRationale,
        sendInvite: sendInviteCheck,
      });

      if (res.success) {
        notify(`Matched ${selectedTalentForMatch.full_name || "talent"} to "${targetRequestForMatch.title}"!`);
        setIsMatchModalOpen(false);
        await loadData(true);
      } else {
        notify(res.error || "Failed to recommend talent");
      }
    } catch (err: any) {
      notify(err.message || "Failed to recommend talent");
    } finally {
      setSubmittingMatch(false);
    }
  };

  // Open Status Dialog
  const handleOpenStatusModal = (req: HireRequest) => {
    setTargetRequestForStatus(req);
    setNewStatus(req.status);
    setInternalNotes(req.internal_notes || "");
    setIsStatusModalOpen(true);
  };

  // Submit Status Change
  const handleSubmitStatus = async () => {
    if (!targetRequestForStatus) return;
    setSubmittingStatus(true);

    try {
      const res = await adminUpdateRequestStatusAction(
        targetRequestForStatus.id,
        newStatus,
        internalNotes
      );

      if (res.success) {
        notify(`Updated request status to ${newStatus.replace("_", " ")}`);
        setIsStatusModalOpen(false);
        await loadData(true);
      } else {
        notify(res.error || "Failed to update request status");
      }
    } catch (err: any) {
      notify(err.message || "Failed to update status");
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Open Full Details Drawer
  const handleOpenDetailsModal = async (req: HireRequest) => {
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);

    try {
      const res = await getAdminHireRequestDetailsAction(req.id);
      if (res.success && res.data) {
        setActiveRequestDetails(res.data);
      } else {
        setActiveRequestDetails({
          request: req,
          matches: [],
          proposals: [],
          activity: [],
        });
      }
    } catch {
      setActiveRequestDetails({
        request: req,
        matches: [],
        proposals: [],
        activity: [],
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: HireRequestStatus) => {
    switch (status) {
      case "submitted":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">New Submission</span>;
      case "under_review":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Needs Review</span>;
      case "matching":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">Matching in Progress</span>;
      case "talent_proposed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">Proposals Awaiting Review</span>;
      case "client_deciding":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Client Deciding</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black text-white border border-black">Active Work</span>;
      case "completed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-300">Completed</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      case "draft":
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
              Managed Matching
            </span>
            <span className="text-xs text-neutral-500">· Human-Assisted Enterprise Talent</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
            Hire Talent Request Operations
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Review client project scopes, evaluate transparent matching scores, and invite pre-vetted professionals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="border-neutral-300 hover:bg-neutral-100 text-xs font-semibold bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/hire-talent/request">
            <Button size="sm" className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Client Request
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Total Requests
              </span>
              <span className="p-2 bg-neutral-100 text-black rounded-lg">
                <Briefcase className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-black">
              {metrics.total}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Submitted client briefs</p>
          </CardContent>
        </Card>

        <Card className={`bg-white border-neutral-200 shadow-xs ${metrics.triage > 0 ? "border-amber-400" : ""}`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Needs Triage
              </span>
              <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-700">
              {metrics.triage}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Pending review or clarification</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                In Matching
              </span>
              <span className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-700">
              {metrics.inMatching}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Inviting talent & proposals</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Active Work
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-black">
              {metrics.active}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Engagements underway</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "all", label: "All", count: requests.length },
              { id: "submitted", label: "New", count: countsByStatus["submitted"] || 0 },
              { id: "under_review", label: "Review", count: countsByStatus["under_review"] || 0 },
              { id: "matching", label: "Matching", count: countsByStatus["matching"] || 0 },
              { id: "talent_proposed", label: "Proposals", count: countsByStatus["talent_proposed"] || 0 },
              { id: "client_deciding", label: "Deciding", count: countsByStatus["client_deciding"] || 0 },
              { id: "in_progress", label: "Active", count: countsByStatus["in_progress"] || 0 },
              { id: "completed", label: "Completed", count: countsByStatus["completed"] || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.id ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-800"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Categories</option>
              {Object.values(HIRE_SERVICE_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.shortTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, required skills, or client name..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* REQUESTS LIST TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-neutral-400 mb-3" />
          <p className="text-xs text-neutral-600 font-semibold">Loading managed matching requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-black">No requests match current filters</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clear filters to view all client submissions.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setCategoryFilter("all");
              setSearchQuery("");
            }}
            className="text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => {
            const catMeta = HIRE_SERVICE_CATEGORIES[req.category] || {
              shortTitle: req.category,
            };

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-neutral-200 hover:border-black transition-all p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Request Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(req.status)}
                    <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {catMeta.shortTitle}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase">
                      {req.hiring_model === "hourly" ? "Hourly Rate" : "Fixed Scope"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black tracking-tight truncate">
                      {req.title}
                    </h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {req.description}
                    </p>
                  </div>

                  {/* Criteria & Badges */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-1 font-semibold text-black">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                      {req.hiring_model === "hourly" ? (
                        <span>
                          ${req.budget_min || 0} - ${req.budget_max || 0}/hr
                          {req.hourly_hours_per_week ? ` · ${req.hourly_hours_per_week}h/wk` : ""}
                        </span>
                      ) : (
                        <span>
                          ${req.budget_min?.toLocaleString() || 0} - ${req.budget_max?.toLocaleString() || 0} Total
                        </span>
                      )}
                    </div>

                    {req.estimated_duration_weeks && (
                      <div className="flex items-center gap-1 text-neutral-500">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{req.estimated_duration_weeks} weeks</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-neutral-500">
                      <Building className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{req.client_name || req.client_email || "Client #" + req.client_id.slice(0, 8)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {req.required_skills && req.required_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {req.required_skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-neutral-50 text-neutral-700 text-[10px] font-medium rounded border border-neutral-200"
                        >
                          {skill}
                        </span>
                      ))}
                      {req.required_skills.length > 5 && (
                        <span className="text-[10px] text-neutral-400 font-medium">
                          +{req.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {req.internal_notes && (
                    <div className="text-[11px] bg-neutral-50 border-l-2 border-black pl-2.5 py-1 text-neutral-700 font-medium">
                      <span className="font-bold text-black">Coordinator Note:</span> {req.internal_notes}
                    </div>
                  )}
                </div>

                {/* Right: Matches & Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-neutral-700">
                      <UserCheck className="w-3.5 h-3.5 text-black" />
                      <span>{req.match_count} matched</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-neutral-700">
                      <FileText className="w-3.5 h-3.5 text-black" />
                      <span>{req.proposal_count} proposals</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenMatchModal(req)}
                      className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Match Talent
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStatusModal(req)}
                      className="text-xs font-semibold border-neutral-300 hover:bg-neutral-100 bg-white"
                    >
                      <Sliders className="w-3.5 h-3.5 mr-1" />
                      Status
                    </Button>

                    <Link href={`/hire-talent/requests/${req.id}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-neutral-600 hover:text-black hover:bg-neutral-100"
                        title="View Client Workspace"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetailsModal(req)}
                      className="text-xs text-neutral-600 hover:text-black hover:bg-neutral-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==============================================================================
          MANAGED MATCHING DIALOG
          ============================================================================== */}
      <Dialog
        open={isMatchModalOpen}
        onOpenChange={setIsMatchModalOpen}
        title="Recommend & Match Talent"
        maxWidth="lg"
      >
        {targetRequestForMatch && (
          <div className="space-y-5">
            {/* Target Project Summary */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-1">
                <span>TARGET PROJECT BRIEF</span>
                <span className="font-mono text-black">{targetRequestForMatch.hiring_model.toUpperCase()}</span>
              </div>
              <h4 className="text-sm font-bold text-black">{targetRequestForMatch.title}</h4>
              <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                {targetRequestForMatch.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-neutral-200 text-xs">
                <span className="font-semibold text-black">Skills required:</span>
                {targetRequestForMatch.required_skills?.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-white text-neutral-800 text-[10px] rounded border border-neutral-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Talent Picker Search */}
            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                Select Pre-Vetted Professional
              </label>
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={talentSearchQuery}
                  onChange={(e) => setTalentSearchQuery(e.target.value)}
                  placeholder="Filter talent by name, skills, or headline..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 border border-neutral-200 rounded-xl p-2 bg-neutral-50/50">
                {filteredTalentsForMatch.map((talent) => {
                  const isSelected = selectedTalentForMatch?.id === talent.id;
                  return (
                    <div
                      key={talent.id}
                      onClick={() => handleSelectTalent(talent)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-black shadow-xs ring-1 ring-black"
                          : "bg-white border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                            {(talent.full_name || "T").charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-black">
                              {talent.full_name || "Verified Talent"}
                            </span>
                            <span className="text-[11px] text-neutral-500 ml-2">
                              ${talent.hourly_rate}/hr · {talent.experience_years}y exp
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                      </div>
                      <p className="text-[11px] text-neutral-600 line-clamp-1 mt-1 font-medium">
                        {talent.headline}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {talent.skills.slice(0, 4).map((s) => (
                          <span key={s} className="text-[9px] bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score & Rationale Engine Output */}
            {selectedTalentForMatch && (
              <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black" />
                    <span className="text-xs font-bold text-black uppercase tracking-wider">
                      Match Compatibility Engine
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium">Calculated Fit:</span>
                    <span className="text-sm font-extrabold text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {matchScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Explainable Recommendation Rationale (Presented to Client)
                  </label>
                  <textarea
                    rows={3}
                    value={matchRationale}
                    onChange={(e) => setMatchRationale(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sendInviteCheck"
                    checked={sendInviteCheck}
                    onChange={(e) => setSendInviteCheck(e.target.checked)}
                    className="rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <label htmlFor="sendInviteCheck" className="text-xs text-neutral-700 font-medium cursor-pointer">
                    Send immediate invitation notification to talent profile
                  </label>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMatchModalOpen(false)}
                disabled={submittingMatch}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitMatch}
                disabled={!selectedTalentForMatch || submittingMatch}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
              >
                {submittingMatch ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving Match...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Confirm & Recommend Match
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ==============================================================================
          STATUS & INTERNAL NOTES MODAL
          ============================================================================== */}
      <Dialog
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Update Request Lifecycle & Notes"
        maxWidth="md"
      >
        {targetRequestForStatus && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Target Project</p>
              <h4 className="text-sm font-bold text-black">{targetRequestForStatus.title}</h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as HireRequestStatus)}
                className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="submitted">New Submission (Triage)</option>
                <option value="under_review">Needs Review / Clarification</option>
                <option value="matching">Matching in Progress</option>
                <option value="talent_proposed">Proposals Awaiting Client Review</option>
                <option value="client_deciding">Client Deciding</option>
                <option value="in_progress">In Progress (Active Work)</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                Internal Coordinator Notes
              </label>
              <textarea
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add private operational notes, client communications, or timeline adjustments..."
                className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Visible to administrators and recorded in the audit trail.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={submittingStatus}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitStatus}
                disabled={submittingStatus}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
              >
                {submittingStatus ? "Saving..." : "Save Status Changes"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* ==============================================================================
          FULL INSPECTION DETAILS DIALOG
          ============================================================================== */}
      <Dialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        title="Project Request Inspection"
        maxWidth="lg"
      >
        {loadingDetails ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-500">Loading request details...</p>
          </div>
        ) : activeRequestDetails?.request ? (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Title & Metadata */}
            <div className="border-b border-neutral-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusBadge(activeRequestDetails.request.status)}
                <span className="text-xs font-mono text-neutral-500">
                  ID: {activeRequestDetails.request.id.slice(0, 13)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-black">{activeRequestDetails.request.title}</h3>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                {activeRequestDetails.request.description}
              </p>
            </div>

            {/* Scope / Deliverables */}
            {activeRequestDetails.request.fixed_deliverables && activeRequestDetails.request.fixed_deliverables.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  Fixed Project Deliverables
                </h4>
                <div className="space-y-1.5">
                  {activeRequestDetails.request.fixed_deliverables.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-200">
                      <CheckSquare className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Talent List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Recommended Matches ({activeRequestDetails.matches?.length || 0})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    if (activeRequestDetails.request) handleOpenMatchModal(activeRequestDetails.request);
                  }}
                  className="text-xs h-7 px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Match
                </Button>
              </div>

              {activeRequestDetails.matches && activeRequestDetails.matches.length > 0 ? (
                <div className="space-y-2">
                  {activeRequestDetails.matches.map((match) => (
                    <div key={match.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black">
                          {match.talent?.full_name || "Talent #" + match.talent_id.slice(0, 8)}
                        </span>
                        <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {match.match_score}% Fit · Status: {match.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-normal">
                        {match.match_rationale}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No professionals matched yet.</p>
              )}
            </div>

            {/* Proposals List */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                Proposals Submitted ({activeRequestDetails.proposals?.length || 0})
              </h4>
              {activeRequestDetails.proposals && activeRequestDetails.proposals.length > 0 ? (
                <div className="space-y-2">
                  {activeRequestDetails.proposals.map((prop) => (
                    <div key={prop.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-black">
                          {prop.talent?.full_name || "Talent"}
                        </span>
                        <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-neutral-200">
                          ${prop.proposed_rate} · Status: {prop.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">
                        {prop.cover_letter}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No proposals received yet.</p>
              )}
            </div>

            {/* Activity History */}
            <div>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                Operational Activity Log
              </h4>
              <div className="space-y-1 text-xs text-neutral-600">
                {activeRequestDetails.activity && activeRequestDetails.activity.length > 0 ? (
                  activeRequestDetails.activity.map((act) => (
                    <div key={act.id} className="flex items-center justify-between py-1 border-b border-neutral-100">
                      <span>{act.notes || act.action}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 italic">No activity recorded yet.</p>
                )}
              </div>
            </div>

            {/* Link to Client Workspace */}
            <div className="pt-2 border-t border-neutral-200 flex justify-end">
              <Link href={`/hire-talent/requests/${activeRequestDetails.request.id}`} target="_blank">
                <Button size="sm" className="bg-black text-white text-xs font-semibold">
                  Open Client Workspace <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
};
