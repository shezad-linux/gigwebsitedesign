"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  FileText,
  User,
  Search,
  ExternalLink,
  ShieldCheck,
  Award,
} from "lucide-react";
import { InternshipRecord, InternshipStatus } from "@/types/portfolio";
import { getInternships, saveInternship, updateInternshipStatus } from "@/lib/portfolio/storage";
import { Dialog } from "@/components/ui/dialog";

const INTERNSHIP_STATUSES: InternshipStatus[] = [
  "Submitted",
  "Under Review",
  "Interview",
  "Selected",
  "Not Selected",
  "Candidate",
  "Shortlisted",
  "Declined",
];

export const PortfolioInternshipsTab: React.FC = () => {
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InternshipRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    candidateName: "",
    candidateEmail: "",
    githubProfile: "",
    associatedProject: "DocuScan: OpenCv Smart Scanner",
    status: "Shortlisted" as InternshipStatus,
    roleTitle: "Android Systems Engineering Intern",
    durationMonths: 3,
    responsibilities: "",
    interviewNotes: "",
    formalOfferIssued: false,
    documentationUrl: "",
  });

  const loadInternships = () => {
    setInternships(getInternships());
  };

  useEffect(() => {
    loadInternships();
    const handleUpdate = () => loadInternships();
    window.addEventListener("portfolio_internships_updated", handleUpdate);
    return () => window.removeEventListener("portfolio_internships_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (record: InternshipRecord) => {
    setEditingRecord(record);
    setFormData({
      id: record.id,
      candidateName: record.candidateName,
      candidateEmail: record.candidateEmail,
      githubProfile: record.githubProfile || "",
      associatedProject: record.associatedProject,
      status: record.status,
      roleTitle: record.roleTitle,
      durationMonths: record.durationMonths,
      responsibilities: record.responsibilities,
      interviewNotes: record.interviewNotes || "",
      formalOfferIssued: record.formalOfferIssued,
      documentationUrl: record.documentationUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingRecord(null);
    setFormData({
      id: `intern-${Date.now()}`,
      candidateName: "",
      candidateEmail: "",
      githubProfile: "",
      associatedProject: "AI Edge: On-Device AI",
      status: "Shortlisted",
      roleTitle: "Android Engineering Intern",
      durationMonths: 3,
      responsibilities: "Collaborate on core mobile pipelines, automated testing, and CI/CD maintenance.",
      interviewNotes: "",
      formalOfferIssued: false,
      documentationUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName.trim() || !formData.candidateEmail.trim()) {
      alert("Name and email are required");
      return;
    }

    saveInternship({
      ...formData,
      id: formData.id || editingRecord?.id || `intern-${Date.now()}`,
    });

    setIsModalOpen(false);
    showToast(editingRecord ? "Internship record updated" : "Intern candidate recorded");
  };

  const handleStatusChange = (id: string, newStatus: InternshipStatus) => {
    updateInternshipStatus(id, newStatus);
    showToast(`Status changed to ${newStatus}`);
  };

  const filtered = internships.filter((item) => {
    if (statusFilter !== "All" && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateEmail.toLowerCase().includes(q) ||
        item.roleTitle.toLowerCase().includes(q) ||
        item.associatedProject.toLowerCase().includes(q)
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
            <GraduationCap className="w-5 h-5 text-black" />
            Internship Program &amp; Candidate Management ({internships.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Track shortlisted contributors, record interview rounds, manage term duration, and issue formal internship documentation.
          </p>
        </div>

        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {/* Strict Distinction Banner */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-xs text-purple-900">
        <p className="font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          Internship Selection Separation Notice
        </p>
        <p className="mt-1 text-[11px] text-purple-800 leading-relaxed">
          Internship selection is completely distinct from open-source contribution approval. Contributors must undergo interview evaluation and contractual onboarding before an Internship Certificate or formal offer is issued.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, email, project, or role..."
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
        >
          <option value="All">All Statuses ({internships.length})</option>
          {INTERNSHIP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s} ({internships.filter((i) => i.status === s).length})
            </option>
          ))}
        </select>
      </div>

      {/* Internships Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/60 font-semibold text-neutral-500">
              <th className="p-3.5">Candidate</th>
              <th className="p-3.5">Role &amp; Project</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5">Stage / Status</th>
              <th className="p-3.5">Interview / Notes</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="p-3.5">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-900">{item.candidateName}</p>
                    <p className="text-[11px] text-neutral-500">{item.candidateEmail}</p>
                    {item.githubProfile && (
                      <a
                        href={item.githubProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-neutral-400 hover:text-black underline inline-flex items-center gap-0.5"
                      >
                        GitHub <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </td>

                <td className="p-3.5">
                  <p className="font-semibold text-neutral-900">{item.roleTitle}</p>
                  <p className="text-[11px] text-neutral-500">{item.associatedProject}</p>
                </td>

                <td className="p-3.5 font-medium text-neutral-700">
                  {item.durationMonths} Months
                </td>

                <td className="p-3.5">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as InternshipStatus)
                    }
                    className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-900"
                  >
                    {INTERNSHIP_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3.5 max-w-[200px] truncate text-neutral-600">
                  {item.interviewNotes || item.responsibilities || "—"}
                </td>

                <td className="p-3.5 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded-lg border border-neutral-200 p-1.5 text-neutral-700 hover:bg-neutral-100"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingRecord ? `Edit Candidate: ${editingRecord.candidateName}` : "New Internship Record"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Candidate Name *</label>
              <input
                type="text"
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Target Project</label>
              <input
                type="text"
                value={formData.associatedProject}
                onChange={(e) => setFormData({ ...formData, associatedProject: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Role Title</label>
              <input
                type="text"
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Term Duration (Months)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Internship Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InternshipStatus })}
                className="w-full rounded-lg border border-neutral-200 p-2"
              >
                {INTERNSHIP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Responsibilities &amp; Scope</label>
            <textarea
              rows={3}
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Interview &amp; Selection Notes</label>
            <textarea
              rows={2}
              value={formData.interviewNotes}
              onChange={(e) => setFormData({ ...formData, interviewNotes: e.target.value })}
              placeholder="Record interview notes, technical screening results, and start dates..."
              className="w-full rounded-lg border border-neutral-200 p-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800"
            >
              Save Record
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
