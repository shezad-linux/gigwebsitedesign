"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Star,
  Globe2,
  Clock,
  DollarSign,
  AlertCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, PaymentVerificationBadge, EligibilityBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { GigListing, PaymentVerification, EligibilityVerification } from "@/types/gig";
import { getStoredGigs, saveStoredGig, resetStoredGigs } from "@/lib/storage";
import { apiClient } from "@/lib/api";

export default function AdminPage() {
  const [gigs, setGigs] = useState<GigListing[]>([]);
  const [editingGig, setEditingGig] = useState<GigListing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
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
    officialUrl: "https://example.com/careers",
    onboardingStepsText: "1. Resume submission\n2. Coding test\n3. Queue orientation",
    sponsored: false,
    experienceLevel: "mid" as "entry" | "mid" | "expert",
    availabilityStatus: "open" as "open" | "waitlist" | "selective" | "paused",
    eligibilitySourceNote: "Community verified via contributor onboarding threads.",
  });

  const refreshGigs = async () => {
    try {
      const data = await apiClient.getGigs();
      setGigs(data);
    } catch {
      setGigs(getStoredGigs());
    }
  };

  useEffect(() => {
    refreshGigs();
    const handleUpdate = () => { refreshGigs(); };
    window.addEventListener("gigmatcher_gigs_updated", handleUpdate);
    return () => window.removeEventListener("gigmatcher_gigs_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setFormData({
      id: `gig_custom_${Date.now()}`,
      slug: `custom-role-${Date.now().toString(36)}`,
      platformName: "New AI Platform",
      title: "Senior AI Task Evaluator",
      category: "AI Evaluation",
      description: "Perform high-precision evaluations on reasoning, coding, or safety outputs.",
      skillsRequired: "Prompt Engineering, Critical Thinking, Logic Evaluation",
      eligibleCountries: "Global, India, United States",
      remote: true,
      payAmount: 25,
      payCurrency: "USD",
      payUnit: "hour",
      payTermsNote: "Disbursed bi-weekly via Deel or PayPal",
      paymentVerification: "verified",
      eligibilityVerification: "verified",
      officialUrl: "https://example.com",
      onboardingStepsText: "1. Profile submission\n2. Baseline evaluation exam\n3. Queue invite",
      sponsored: false,
      experienceLevel: "mid",
      availabilityStatus: "open",
      eligibilitySourceNote: "Verified directly via platform career portal.",
    });
    setEditingGig(null);
    setIsCreateModalOpen(true);
  };

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
      officialUrl: gig.officialUrl,
      onboardingStepsText: gig.onboardingSteps.join("\n"),
      sponsored: gig.sponsored,
      experienceLevel: gig.experienceLevel || "mid",
      availabilityStatus: gig.availabilityStatus || "open",
      eligibilitySourceNote: gig.eligibilitySourceNote || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();

    const skillsArr = formData.skillsRequired
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const countriesArr = formData.eligibleCountries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const stepsArr = formData.onboardingStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newGig: GigListing = {
      id: formData.id || `gig_${Date.now()}`,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
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
      },
      paymentVerification: formData.paymentVerification,
      eligibilityVerification: formData.eligibilityVerification,
      officialUrl: formData.officialUrl,
      onboardingSteps: stepsArr,
      lastReviewedAt: new Date().toISOString(),
      sponsored: formData.sponsored,
      experienceLevel: formData.experienceLevel,
      availabilityStatus: formData.availabilityStatus,
      eligibilitySourceNote: formData.eligibilitySourceNote,
    };

    saveStoredGig(newGig);
    apiClient.adminSaveGig(newGig).catch((err) => console.warn("Admin backend sync failed:", err));
    setIsCreateModalOpen(false);
    showToast(editingGig ? `Updated "${newGig.title}"` : `Added "${newGig.title}" to catalog`);
  };

  const handleDeleteListing = (id: string, title: string) => {
    if (confirm(`Delete listing "${title}" from catalog?`)) {
      const current = getStoredGigs();
      const next = current.filter((g) => g.id !== id);
      localStorage.setItem("gigmatcher_gigs_catalog_v1", JSON.stringify(next));
      window.dispatchEvent(new Event("gigmatcher_gigs_updated"));
      showToast(`Deleted "${title}"`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm("Reset catalog back to the 15 default verified seed gigs?")) {
      resetStoredGigs();
      showToast("Reset catalog back to initial 15 listings");
    }
  };

  const toggleSponsored = (gig: GigListing) => {
    const updated = { ...gig, sponsored: !gig.sponsored };
    saveStoredGig(updated);
    apiClient.adminSaveGig(updated).catch((err) => console.warn("Admin backend sync failed:", err));
    showToast(`${gig.platformName} marked as ${updated.sponsored ? "Sponsored" : "Organic"}`);
  };

  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-[14px] border border-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-100 text-amber-800 font-bold text-xs">
                DEMO ONLY
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                Catalog Admin & Listing Manager
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Test creating, editing, and simulating sponsored listings. Changes save to local prototype state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetCatalog}
              className="text-xs text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Catalog (15 Gigs)
            </Button>
            <Button size="sm" onClick={handleOpenCreate} className="text-xs font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Add New Opportunity
            </Button>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Listings Table / Cards */}
        <div className="rounded-[14px] bg-white border border-border overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">
              All Catalog Opportunities ({gigs.length})
            </h2>
            <Link
              href="/dashboard"
              className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1"
            >
              Preview in User Matching Dashboard →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Platform & Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Payment Proof</th>
                  <th className="p-3.5">Eligibility</th>
                  <th className="p-3.5">Sponsored</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-ink text-sm">{gig.title}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <span>{gig.platformName}</span>
                        <span>·</span>
                        <a
                          href={gig.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 hover:underline flex items-center"
                        >
                          Official link <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[11px] font-semibold">
                        {gig.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-ink">
                      {gig.payment ? `$${gig.payment.amount} / ${gig.payment.unit}` : "Variable"}
                    </td>

                    <td className="p-3.5">
                      <PaymentVerificationBadge status={gig.paymentVerification} />
                    </td>

                    <td className="p-3.5">
                      <span className="text-[11px] text-slate-600 truncate max-w-[150px] block">
                        {gig.eligibleCountries.slice(0, 3).join(", ")}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => toggleSponsored(gig)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          gig.sponsored
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {gig.sponsored ? "Sponsored ★" : "Standard"}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-1">
                      <Link href={`/gigs/${gig.slug}`}>
                        <button
                          className="p-1.5 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-100"
                          title="View public page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(gig)}
                        className="p-1.5 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteListing(gig.id, gig.title)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT LISTING MODAL */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title={editingGig ? `Edit Listing: ${editingGig.platformName}` : "Create New Catalog Gig"}
        description="Configure eligibility, payment proofs, skills, and onboarding requirements."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveListing} className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Platform Name *
              </label>
              <input
                type="text"
                value={formData.platformName}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Role Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-2 rounded-lg border border-border text-xs bg-white"
              >
                <option value="AI Coding">AI Coding</option>
                <option value="AI Evaluation">AI Evaluation</option>
                <option value="Data Annotation">Data Annotation</option>
                <option value="Writing & Content">Writing & Content</option>
                <option value="Language & Translation">Language & Translation</option>
                <option value="Software & QA Testing">Software & QA Testing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Official Application URL *
              </label>
              <input
                type="url"
                value={formData.officialUrl}
                onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                placeholder="https://outlier.ai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Role Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-border text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Skills Required (Comma separated) *
              </label>
              <input
                type="text"
                value={formData.skillsRequired}
                onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                placeholder="Java, Python, Code Review"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Eligible Countries (Comma separated) *
              </label>
              <input
                type="text"
                value={formData.eligibleCountries}
                onChange={(e) => setFormData({ ...formData, eligibleCountries: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-border text-xs"
                placeholder="Global, India, United States"
                required
              />
            </div>
          </div>

          {/* Payment & Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Hourly Pay Rate ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={formData.payAmount}
                onChange={(e) => setFormData({ ...formData, payAmount: Number(e.target.value) })}
                className="w-full h-9 px-2 rounded-lg border border-border text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Payment Verification
              </label>
              <select
                value={formData.paymentVerification}
                onChange={(e) =>
                  setFormData({ ...formData, paymentVerification: e.target.value as any })
                }
                className="w-full h-9 px-2 rounded-lg border border-border text-xs bg-white"
              >
                <option value="verified">Verified (Proof Checked)</option>
                <option value="partial">Partial Verification</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Eligibility Verification
              </label>
              <select
                value={formData.eligibilityVerification}
                onChange={(e) =>
                  setFormData({ ...formData, eligibilityVerification: e.target.value as any })
                }
                className="w-full h-9 px-2 rounded-lg border border-border text-xs bg-white"
              >
                <option value="verified">Verified</option>
                <option value="partial">Needs Review</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Onboarding Steps (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.onboardingStepsText}
              onChange={(e) => setFormData({ ...formData, onboardingStepsText: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-border text-xs"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sponsored}
                onChange={(e) => setFormData({ ...formData, sponsored: e.target.checked })}
                className="rounded accent-brand-600"
              />
              <span>Mark as Sponsored Listing</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.remote}
                onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                className="rounded accent-brand-600"
              />
              <span>100% Remote Eligible</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save to Catalog
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
