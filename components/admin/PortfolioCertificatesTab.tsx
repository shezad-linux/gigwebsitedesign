"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Plus,
  Printer,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  X,
  FileText,
} from "lucide-react";
import { ContributionCertificate } from "@/types/portfolio";
import { getCertificates, issueCertificate } from "@/lib/portfolio/storage";
import { Dialog } from "@/components/ui/dialog";
import { PORTFOLIO_APPS } from "@/data/portfolio-apps";

export const PortfolioCertificatesTab: React.FC = () => {
  const [certificates, setCertificates] = useState<ContributionCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    contributorName: "",
    contributorEmail: "",
    projectName: "DocuScan: OpenCv Smart Scanner",
    contributionType: "Performance Optimization & C++ NDK Acceleration",
    completionDate: new Date().toISOString().split("T")[0],
    issuerName: "Lead Android Architect",
    issuerTitle: "Principal Systems Engineer",
    organizationName: "Remotasks App Portfolio",
    summary: "Successfully integrated verified code and test suite into production.",
  });

  const loadCertificates = () => {
    setCertificates(getCertificates());
  };

  useEffect(() => {
    loadCertificates();
    const handleUpdate = () => loadCertificates();
    window.addEventListener("portfolio_certificates_updated", handleUpdate);
    return () => window.removeEventListener("portfolio_certificates_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contributorName.trim() || !formData.contributorEmail.trim()) {
      alert("Contributor name and email are required");
      return;
    }

    const cert = issueCertificate(formData);
    setIsModalOpen(false);
    showToast(`Certificate ${cert.id} generated successfully!`);
  };

  const filtered = certificates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.id.toLowerCase().includes(q) ||
      c.contributorName.toLowerCase().includes(q) ||
      c.contributorEmail.toLowerCase().includes(q) ||
      c.projectName.toLowerCase().includes(q)
    );
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
            <Award className="w-5 h-5 text-black" />
            Contribution Certificate Management ({certificates.length} Issued)
          </h2>
          <p className="text-xs text-neutral-500">
            Issue cryptographically trackable certificates to approved contributors upon peer-reviewed code merge.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Issue New Certificate
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by certificate ID, contributor name, or project..."
          className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Certificates Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/60 font-semibold text-neutral-500">
              <th className="p-3.5">Certificate ID</th>
              <th className="p-3.5">Contributor</th>
              <th className="p-3.5">Project &amp; Contribution</th>
              <th className="p-3.5">Completion Date</th>
              <th className="p-3.5">Issuer Signoff</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((cert) => (
              <tr key={cert.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                      {cert.id}
                    </span>
                  </div>
                </td>

                <td className="p-3.5">
                  <p className="font-bold text-neutral-900">{cert.contributorName}</p>
                  <p className="text-[11px] text-neutral-500">{cert.contributorEmail}</p>
                </td>

                <td className="p-3.5 max-w-[220px]">
                  <p className="font-semibold text-neutral-900 truncate">{cert.projectName}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{cert.contributionType}</p>
                </td>

                <td className="p-3.5 text-neutral-700 font-mono text-[11px]">
                  {cert.completionDate}
                </td>

                <td className="p-3.5">
                  <p className="font-medium text-neutral-900">{cert.issuerName}</p>
                  <p className="text-[10px] text-neutral-400">{cert.issuerTitle}</p>
                </td>

                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/verify-certificate/${cert.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100"
                      title="View & Download PDF Certificate"
                    >
                      <Printer className="w-3 h-3" />
                      View / PDF
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Issue Official Contribution Certificate"
        maxWidth="lg"
      >
        <form onSubmit={handleIssue} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Contributor Full Name *</label>
              <input
                type="text"
                value={formData.contributorName}
                onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
                placeholder="e.g. Maya Lin"
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Contributor Email *</label>
              <input
                type="email"
                value={formData.contributorEmail}
                onChange={(e) => setFormData({ ...formData, contributorEmail: e.target.value })}
                placeholder="maya@example.com"
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Target Project Name *</label>
              <select
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
              >
                {PORTFOLIO_APPS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Completion Date *</label>
              <input
                type="date"
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Authorized Issuer Name *</label>
              <input
                type="text"
                value={formData.issuerName}
                onChange={(e) => setFormData({ ...formData, issuerName: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Issuer Title *</label>
              <input
                type="text"
                value={formData.issuerTitle}
                onChange={(e) => setFormData({ ...formData, issuerTitle: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">Contribution Type / Scope *</label>
            <input
              type="text"
              value={formData.contributionType}
              onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
              placeholder="e.g. Native C++ NDK Acceleration & Contour Optimization"
              className="w-full rounded-lg border border-neutral-200 p-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Engineering Impact &amp; Summary *
            </label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 p-2"
              required
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
              Issue &amp; Authenticate Certificate
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
