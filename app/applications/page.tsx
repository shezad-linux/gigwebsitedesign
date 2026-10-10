"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge, Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { TrackedApplication, ApplicationStatus } from "@/types/gig";
import {
  getTrackedApplications,
  updateApplicationStatus,
  removeTrackedApplication,
} from "@/lib/storage";

import { apiClient } from "@/lib/api";

const ALL_STATUSES: ApplicationStatus[] = [
  "Shortlisted",
  "Applied",
  "Onboarding",
  "Qualified",
  "Active",
  "Rejected",
  "Withdrawn",
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<TrackedApplication[]>(() => getTrackedApplications());
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [editingApp, setEditingApp] = useState<TrackedApplication | null>(null);

  // Edit Modal Form State
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("Shortlisted");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  const refreshApplications = async () => {
    try {
      const data = await apiClient.getApplications();
      setApplications(data);
    } catch {
      setApplications(getTrackedApplications());
    }
  };

  useEffect(() => {
    refreshApplications();
    const handleUpdate = () => refreshApplications();
    window.addEventListener("gigmatcher_applications_updated", handleUpdate);
    return () => window.removeEventListener("gigmatcher_applications_updated", handleUpdate);
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

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    if (selectedStatusFilter === "All") return true;
    return app.status === selectedStatusFilter;
  });

  // Analytics Metrics
  const activeCount = applications.filter((a) => a.status === "Active").length;
  const onboardingCount = applications.filter(
    (a) => a.status === "Onboarding" || a.status === "Qualified"
  ).length;
  const appliedCount = applications.filter((a) => a.status === "Applied").length;

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="bg-white rounded-[14px] border border-border p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  Saved Gigs & Application Tracker
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Manage your qualification pipeline, update application stages, and record personal notes.
              </p>
            </div>

            <Link href="/dashboard">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> Browse More Matches
              </Button>
            </Link>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                Total Tracked
              </span>
              <span className="text-2xl font-black text-ink mt-0.5 block">
                {applications.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-200/60">
              <span className="text-brand-700 font-semibold uppercase text-[10px] block">
                Active Projects
              </span>
              <span className="text-2xl font-black text-brand-700 mt-0.5 block">
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
              <span className="text-2xl font-black text-black mt-0.5 block font-mono">
                {appliedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs by Status */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2">
          {["All", ...ALL_STATUSES].map((st) => {
            const count =
              st === "All"
                ? applications.length
                : applications.filter((a) => a.status === st).length;
            const isSelected = selectedStatusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-black text-white shadow-xs font-bold"
                    : "bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        {filteredApps.length > 0 ? (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="rounded-[14px] bg-white border border-neutral-200 p-5 sm:p-6 shadow-xs hover:border-black transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                        {app.platformName}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-500">{app.category}</span>
                      {app.paySummary && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="text-xs font-semibold text-black font-mono">
                            {app.paySummary}
                          </span>
                        </>
                      )}
                    </div>
                    <Link
                      href={`/gigs/${app.gigSlug}`}
                      className="text-base sm:text-lg font-bold text-black hover:underline transition-colors inline-block"
                    >
                      {app.roleTitle}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ApplicationStatusBadge status={app.status} />

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEdit(app)}
                      className="text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Update Status
                    </Button>

                    <button
                      onClick={() => handleRemove(app.id, app.roleTitle)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 border border-transparent hover:border-neutral-300 transition-colors"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes & Tracking Metadata */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ink">Personal Notes: </span>
                        <span>{app.notes || "No notes recorded yet."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 gap-2">
                    <div className="flex items-center gap-3">
                      {app.appliedDate && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Applied: {app.appliedDate}
                        </span>
                      )}
                      <span>Last updated: {app.lastUpdated}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/gigs/${app.gigSlug}`}
                        className="text-brand-600 hover:underline font-semibold"
                      >
                        Inspect Full Match Details →
                      </Link>
                      <a
                        href={app.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-ink font-semibold flex items-center gap-1"
                      >
                        Official Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
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
              <Link href="/dashboard">
                <Button size="sm">
                  Go to Matching Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* EDIT APPLICATION STATUS MODAL */}
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
                {ALL_STATUSES.map((st) => (
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
