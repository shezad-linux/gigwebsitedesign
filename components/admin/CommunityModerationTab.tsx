"use client";

/* ==============================================================================
   CommunityModerationTab Component
   Exception-based community moderation dashboard:
   - Urgent: High-confidence security risks and serious community reports
   - Needs Review: Suspicious content and repeat offenders
   - Daily Summary: Comprehensive 24h metrics and false positive tracking
   - Audit Log: Full ledger of automated and manual decisions
   ============================================================================== */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserX,
  RefreshCw,
  Mail,
  Clock,
  Activity,
  FileText,
  Search,
  ExternalLink,
  Ban,
  Check,
  X,
  Flame,
  BarChart3,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  getCommunityModerationOverviewAction,
  moderateCommunityPostAction,
  moderateCommunityReplyAction,
  resolveCommunityReportAction,
  restrictCommunityUserAction,
  sendDailySummaryEmailAction,
} from "@/app/actions/community";

interface ModerationItem {
  id: string;
  targetType: "post" | "reply" | "report";
  title: string;
  excerpt: string;
  authorId: string;
  riskLevel: "high" | "medium";
  flagReason: string;
  reportCount: number;
  reportScore: number;
  status: string;
  createdAt: string;
}

interface OverviewData {
  urgentQueue: ModerationItem[];
  needsReviewQueue: ModerationItem[];
  dailyMetrics: {
    totalPostsToday: number;
    autoHiddenThreats: number;
    needsReviewCount: number;
    openReportsCount: number;
    resolvedReportsCount: number;
    activeSuspensionsCount: number;
    falsePositivesCount: number;
    repeatOffendersCount: number;
    averageTurnaroundMinutes: number;
  };
  auditLog: any[];
}

export function CommunityModerationTab() {
  const [activeSubTab, setActiveSubTab] = useState<"urgent" | "review" | "metrics" | "audit">("urgent");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [auditFilter, setAuditFilter] = useState<"all" | "system" | "admin">("all");
  const [auditSearch, setAuditSearch] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await getCommunityModerationOverviewAction();
      if (res.success && res.data) {
        setOverview(res.data as OverviewData);
      } else {
        showToast(res.error || "Failed to load moderation overview", "error");
      }
    } catch {
      showToast("Network exception fetching moderation data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  // Post Actions
  const handleModeratePost = async (postId: string, action: "hide" | "restore" | "approve", reason: string) => {
    setActionLoading(postId);
    try {
      const res = await moderateCommunityPostAction(postId, action, reason);
      if (res.success) {
        showToast(`Post ${action === "restore" ? "restored" : action === "approve" ? "approved" : "hidden"} successfully`);
        await loadOverview();
      } else {
        showToast(res.error || "Moderation failed", "error");
      }
    } catch {
      showToast("Error executing moderation action", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // User Suspension Action
  const handleSuspendUser = async (userId: string, hours: number) => {
    setActionLoading(`suspend-${userId}`);
    try {
      const res = await restrictCommunityUserAction(userId, "suspended", `Suspended by admin for ${hours}h due to community violations`, hours);
      if (res.success) {
        showToast(`User suspended for ${hours} hours`);
        await loadOverview();
      } else {
        showToast(res.error || "Failed to suspend user", "error");
      }
    } catch {
      showToast("Error updating user restriction", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Report Resolution Action
  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    setActionLoading(`report-${reportId}`);
    try {
      const res = await resolveCommunityReportAction(reportId, status, "Processed in Exception Queue");
      if (res.success) {
        showToast(`Report marked as ${status}`);
        await loadOverview();
      } else {
        showToast(res.error || "Failed to resolve report", "error");
      }
    } catch {
      showToast("Error updating report", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Dispatch Daily Summary Email
  const handleSendSummaryEmail = async () => {
    setActionLoading("email-summary");
    try {
      const res = await sendDailySummaryEmailAction();
      if (res.success) {
        showToast("Daily summary digest dispatched to admin email");
      } else {
        showToast(res.error || "Failed to dispatch email", "error");
      }
    } catch {
      showToast("Error sending summary email", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const urgentCount = overview?.urgentQueue.length || 0;
  const reviewCount = overview?.needsReviewQueue.length || 0;

  const filteredAuditLog = (overview?.auditLog || []).filter((item) => {
    if (auditFilter === "system" && item.actor_type !== "system") return false;
    if (auditFilter === "admin" && item.actor_type !== "admin" && item.actor_type !== "moderator") return false;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      const matchAction = item.action?.toLowerCase().includes(q);
      const matchReason = item.reason?.toLowerCase().includes(q);
      const matchActor = item.actor_id?.toLowerCase().includes(q);
      return matchAction || matchReason || matchActor;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2.5 transition-all ${
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

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-black tracking-tight">Community Exception Moderation</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Automated Shield Active
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Normal community posts publish immediately without manual queues. This exception console highlights only high-confidence threats, suspicious flags, and reports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendSummaryEmail}
            disabled={actionLoading === "email-summary" || loading}
            className="text-xs gap-1.5 border-neutral-300 hover:bg-neutral-50"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-600" />
            Send Daily Digest
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadOverview}
            disabled={loading}
            className="text-xs gap-1.5 border-neutral-300 hover:bg-neutral-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("urgent")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "urgent"
              ? "bg-black text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-500" />
          <span>Urgent Exceptions</span>
          {urgentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-extrabold">
              {urgentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("review")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "review"
              ? "bg-black text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Needs Review</span>
          {reviewCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-extrabold">
              {reviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("metrics")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "metrics"
              ? "bg-black text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-neutral-500" />
          <span>Daily Summary & Metrics</span>
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "audit"
              ? "bg-black text-white shadow-xs"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-neutral-500" />
          <span>Moderation Audit Log</span>
        </button>
      </div>

      {/* SUB-TAB 1: URGENT QUEUE */}
      {activeSubTab === "urgent" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
                  Urgent Priority Exception Queue
                </h4>
                <p className="text-xs text-red-700">
                  Auto-isolated security threats (malware, phishing, credential leaks) and posts exceeding report escalation thresholds.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-lg">
              {urgentCount} Items
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">Loading urgent queue...</div>
          ) : urgentCount === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-black">No Urgent Incidents</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Zero security threats or urgent report spikes currently detected. All automated barriers are running cleanly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.urgentQueue.map((item) => (
                <Card key={item.id} className="bg-white border-red-200 shadow-xs">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-600 text-white">
                          HIGH RISK / URGENT
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                          {item.targetType.toUpperCase()}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {item.status === "hidden" && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-neutral-900 text-white">
                            AUTO-HIDDEN
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-black">{item.title}</h4>
                      <p className="text-xs text-neutral-600 line-clamp-2">{item.excerpt}</p>

                      <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 text-xs text-red-800">
                        <strong>Reason:</strong> {item.flagReason}
                      </div>

                      <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                        <span>Author ID: <code className="bg-neutral-100 px-1 py-0.5 rounded">{item.authorId.slice(0, 8)}...</code></span>
                        {item.reportCount > 0 && (
                          <span className="text-amber-600 font-semibold">Reports: {item.reportCount} (Score: {item.reportScore})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      {item.targetType === "post" && (
                        <>
                          {item.status === "hidden" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModeratePost(item.id, "restore", "Restored by admin (false positive)")}
                              disabled={actionLoading === item.id}
                              className="text-xs gap-1 border-neutral-300 hover:bg-neutral-100"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Restore (False Positive)
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleModeratePost(item.id, "hide", "Confirmed threat by admin")}
                              disabled={actionLoading === item.id}
                              className="text-xs gap-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Confirm Hide
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendUser(item.authorId, 48)}
                            disabled={actionLoading === `suspend-${item.authorId}`}
                            className="text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Suspend Author (48h)
                          </Button>
                        </>
                      )}

                      {item.targetType === "report" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleResolveReport(item.id, "resolved")}
                            disabled={actionLoading === `report-${item.id}`}
                            className="text-xs gap-1 bg-black text-white hover:bg-neutral-800"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveReport(item.id, "dismissed")}
                            disabled={actionLoading === `report-${item.id}`}
                            className="text-xs gap-1 border-neutral-300"
                          >
                            <X className="w-3.5 h-3.5" />
                            Dismiss
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: NEEDS REVIEW QUEUE */}
      {activeSubTab === "review" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Needs Review Exception Queue
                </h4>
                <p className="text-xs text-amber-700">
                  Unrealistic income claims, link shorteners, or repeat content flags. Content is published for visitors unless hidden by admin.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
              {reviewCount} Items
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">Loading review queue...</div>
          ) : reviewCount === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-black">Review Queue Clean</h3>
              <p className="text-xs text-neutral-500 mt-1">
                No ambiguous claims or medium-risk content requiring moderation scrutiny.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.needsReviewQueue.map((item) => (
                <Card key={item.id} className="bg-white border-neutral-200 shadow-xs">
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-black">
                          MEDIUM RISK
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                          {item.targetType.toUpperCase()}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          PUBLISHED (UNDER SCRUTINY)
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-black">{item.title}</h4>
                      <p className="text-xs text-neutral-600 line-clamp-2">{item.excerpt}</p>

                      <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                        <strong>Scrutiny Flag:</strong> {item.flagReason}
                      </div>

                      <div className="text-[11px] text-neutral-500 flex items-center gap-3">
                        <span>Author ID: <code className="bg-neutral-100 px-1 py-0.5 rounded">{item.authorId.slice(0, 8)}...</code></span>
                        {item.reportCount > 0 && (
                          <span className="text-amber-600 font-semibold">Reports: {item.reportCount}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleModeratePost(item.id, "approve", "Approved by admin")}
                        disabled={actionLoading === item.id}
                        className="text-xs gap-1 bg-black text-white hover:bg-neutral-800"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve (Clear Flag)
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModeratePost(item.id, "hide", "Hidden after scrutiny review")}
                        disabled={actionLoading === item.id}
                        className="text-xs gap-1 border-neutral-300 hover:bg-neutral-100 text-neutral-700"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        Hide Post
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspendUser(item.authorId, 24)}
                        disabled={actionLoading === `suspend-${item.authorId}`}
                        className="text-xs gap-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Warn / Restrict (24h)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: DAILY SUMMARY & PERFORMANCE METRICS */}
      {activeSubTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Posts Today (24h)</span>
                <div className="text-2xl font-black text-black mt-1">
                  {overview?.dailyMetrics.totalPostsToday ?? 0}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Published without manual queue</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Auto-Hidden Threats</span>
                <div className="text-2xl font-black text-red-600 mt-1">
                  {overview?.dailyMetrics.autoHiddenThreats ?? 0}
                </div>
                <span className="text-[11px] text-neutral-500">High-confidence malware/phishing</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Open Reports</span>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {overview?.dailyMetrics.openReportsCount ?? 0}
                </div>
                <span className="text-[11px] text-neutral-500">Awaiting triage</span>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardContent className="p-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Avg Turnaround</span>
                <div className="text-2xl font-black text-black mt-1">
                  {overview?.dailyMetrics.averageTurnaroundMinutes ?? 18}m
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Exception-based efficiency</span>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metric Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Tracked False Positives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold text-black">
                  {overview?.dailyMetrics.falsePositivesCount ?? 0}
                </div>
                <p className="text-xs text-neutral-500">
                  Posts restored by admin after being auto-flagged. Used to fine-tune regex heuristic thresholds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Repeat Offenders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold text-black">
                  {overview?.dailyMetrics.repeatOffendersCount ?? 0}
                </div>
                <p className="text-xs text-neutral-500">
                  Authors with multiple flagged or reported submissions across the platform.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-200 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Active Suspensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-xl font-bold text-black">
                  {overview?.dailyMetrics.activeSuspensionsCount ?? 0}
                </div>
                <p className="text-xs text-neutral-500">
                  User accounts with temporary or permanent posting restrictions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MODERATION AUDIT LOG */}
      {activeSubTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(["all", "system", "admin"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setAuditFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                    auditFilter === filter
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {filter === "all" ? "All Actors" : filter === "system" ? "System Automated" : "Admin Decisions"}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search audit actions..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {filteredAuditLog.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
              No audit records matching current criteria.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 shadow-xs">
              {filteredAuditLog.map((log) => (
                <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          log.actor_type === "system"
                            ? "bg-neutral-100 text-neutral-800 border border-neutral-200"
                            : "bg-black text-white"
                        }`}
                      >
                        {log.actor_type}
                      </span>
                      <span className="text-xs font-bold text-black font-mono">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600">
                      {log.reason || "Action executed as part of routine moderation workflow"}
                    </p>

                    <div className="text-[11px] text-neutral-400 flex items-center gap-3">
                      <span>Target: {log.target_type} (#{log.target_id?.slice(0, 8)})</span>
                      <span>Actor: {log.actor_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
