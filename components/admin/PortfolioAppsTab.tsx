"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Check,
  X,
  Code2,
  ShieldAlert,
} from "lucide-react";
import { PortfolioApp, AppCategory, DevelopmentStatus, PricingType } from "@/types/portfolio";
import { getPortfolioApps, savePortfolioApp, resetPortfolioApps } from "@/lib/portfolio/storage";
import { Dialog } from "@/components/ui/dialog";

const CATEGORIES: AppCategory[] = [
  "Games & Interactive Entertainment",
  "Photography, Camera & Personalization",
  "AI & Smart Utilities",
  "Productivity & Document Management",
  "Health & Wellness",
  "Finance & Payments",
  "Home & Lifestyle",
];

export const PortfolioAppsTab: React.FC = () => {
  const [apps, setApps] = useState<PortfolioApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [editingApp, setEditingApp] = useState<PortfolioApp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    packageName: "",
    category: "Games & Interactive Entertainment" as AppCategory,
    shortDescription: "",
    keyFeaturesText: "",
    developmentStatus: "published" as DevelopmentStatus,
    isPublished: true,
    isSuspended: false,
    googlePlayUrl: "",
    iconUrl: "",
    isOpenSource: false,
    openSourceRepoUrl: "",
    techStackText: "",
    acquisitionAvailable: true,
    askingPrice: 500000 as number | null,
    currency: "INR",
    pricingType: "negotiable" as PricingType,
    privateNegotiationNotes: "",
  });

  const loadApps = () => {
    setApps(getPortfolioApps());
  };

  useEffect(() => {
    loadApps();
    const handleUpdate = () => loadApps();
    window.addEventListener("portfolio_apps_updated", handleUpdate);
    return () => window.removeEventListener("portfolio_apps_updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (app: PortfolioApp) => {
    setEditingApp(app);
    setFormData({
      id: app.id,
      name: app.name,
      packageName: app.packageName,
      category: app.category,
      shortDescription: app.shortDescription,
      keyFeaturesText: app.keyFeatures.join("\n"),
      developmentStatus: app.developmentStatus,
      isPublished: app.isPublished,
      isSuspended: app.isSuspended,
      googlePlayUrl: app.googlePlayUrl,
      iconUrl: app.iconUrl,
      isOpenSource: app.isOpenSource,
      openSourceRepoUrl: app.openSourceRepoUrl || "",
      techStackText: app.techStack.join(", "),
      acquisitionAvailable: app.acquisitionAvailable,
      askingPrice: app.askingPrice,
      currency: app.currency || "INR",
      pricingType: app.pricingType || "negotiable",
      privateNegotiationNotes: app.privateNegotiationNotes || "",
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingApp(null);
    setFormData({
      id: `app-${Date.now()}`,
      name: "",
      packageName: "com.example.app",
      category: "AI & Smart Utilities",
      shortDescription: "",
      keyFeaturesText: "Feature 1\nFeature 2\nFeature 3",
      developmentStatus: "published",
      isPublished: true,
      isSuspended: false,
      googlePlayUrl: "https://play.google.com/store/apps/details?id=com.example.app",
      iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&h=256&fit=crop",
      isOpenSource: false,
      openSourceRepoUrl: "",
      techStackText: "Kotlin, Jetpack Compose",
      acquisitionAvailable: true,
      askingPrice: 500000,
      currency: "INR",
      pricingType: "negotiable",
      privateNegotiationNotes: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.packageName.trim()) {
      alert("Name and package name are required");
      return;
    }

    const appToSave: PortfolioApp = {
      id: formData.id || editingApp?.id || `app-${Date.now()}`,
      name: formData.name.trim(),
      packageName: formData.packageName.trim(),
      category: formData.category,
      shortDescription: formData.shortDescription.trim(),
      keyFeatures: formData.keyFeaturesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      developmentStatus: formData.developmentStatus,
      isPublished: formData.isPublished,
      isSuspended: formData.isSuspended,
      googlePlayUrl: formData.googlePlayUrl.trim(),
      iconUrl: formData.iconUrl.trim(),
      isOpenSource: formData.isOpenSource,
      openSourceRepoUrl: formData.openSourceRepoUrl.trim() || undefined,
      techStack: formData.techStackText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      acquisitionAvailable: formData.acquisitionAvailable,
      askingPrice: formData.askingPrice,
      currency: formData.currency,
      pricingType: formData.pricingType,
      privateNegotiationNotes: formData.privateNegotiationNotes.trim() || undefined,
      order: editingApp?.order || apps.length + 1,
      createdAt: editingApp?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savePortfolioApp(appToSave);
    setIsModalOpen(false);
    showToast(editingApp ? "Application updated successfully" : "New application added");
  };

  const handleReset = () => {
    if (confirm("Reset application catalogue to the 14 baseline apps?")) {
      resetPortfolioApps();
      showToast("Catalogue reset to 14 verified baseline applications.");
    }
  };

  const filteredApps = apps.filter((app) => {
    if (categoryFilter !== "All" && app.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        app.name.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q) ||
        app.shortDescription.toLowerCase().includes(q) ||
        app.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-black" />
            Application Catalogue Management ({apps.length} Apps)
          </h2>
          <p className="text-xs text-neutral-500">
            Edit application metadata, Google Play listings, asking prices, and acquisition availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            title="Reset to 14 standard applications"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, package name, or tech..."
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="All">All Categories ({apps.length})</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat} ({apps.filter((a) => a.category === cat).length})
            </option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/60 font-semibold text-neutral-500">
              <th className="p-3.5">App</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Open Source</th>
              <th className="p-3.5">Acquisition Status</th>
              <th className="p-3.5">Asking Price</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.iconUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 max-w-[220px]">
                      <p className="font-bold text-neutral-900 truncate">{app.name}</p>
                      <p className="font-mono text-[10px] text-neutral-400 truncate">{app.packageName}</p>
                    </div>
                  </div>
                </td>

                <td className="p-3.5 text-neutral-600">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px]">
                    {app.category}
                  </span>
                </td>

                <td className="p-3.5">
                  {app.isSuspended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-700" />
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Published
                    </span>
                  )}
                </td>

                <td className="p-3.5">
                  {app.isOpenSource ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900">
                      <Code2 className="w-3.5 h-3.5 text-black" /> Yes
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Proprietary</span>
                  )}
                </td>

                <td className="p-3.5">
                  {app.acquisitionAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <Check className="w-3.5 h-3.5" /> Available
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Unavailable</span>
                  )}
                </td>

                <td className="p-3.5 font-semibold text-neutral-900">
                  {app.askingPrice
                    ? `₹${app.askingPrice.toLocaleString("en-IN")}`
                    : "Price on Request"}
                </td>

                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleEdit(app)}
                      className="rounded-lg border border-neutral-200 p-1.5 text-neutral-700 hover:bg-neutral-100"
                      title="Edit App Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!app.isSuspended && (
                      <a
                        href={app.googlePlayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-neutral-200 p-1.5 text-neutral-700 hover:bg-neutral-100"
                        title="View Google Play Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingApp ? `Edit: ${editingApp.name}` : "Add New Application"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Application Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2 focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Package Name *</label>
              <input
                type="text"
                value={formData.packageName}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2 font-mono focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AppCategory })}
                className="w-full rounded-lg border border-neutral-200 p-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Development Status</label>
              <select
                value={formData.developmentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    developmentStatus: e.target.value as DevelopmentStatus,
                    isSuspended: e.target.value === "suspended",
                  })
                }
                className="w-full rounded-lg border border-neutral-200 p-2"
              >
                <option value="published">Published</option>
                <option value="in_development">In Development</option>
                <option value="beta">Beta Testing</option>
                <option value="suspended">Suspended by Google Play</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-xs text-neutral-800 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Google Play Store URL</label>
              <input
                type="url"
                value={formData.googlePlayUrl}
                onChange={(e) => setFormData({ ...formData, googlePlayUrl: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">Application Icon URL</label>
              <input
                type="url"
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 p-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-xs text-neutral-800 mb-1">
              Key Features (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.keyFeaturesText}
              onChange={(e) => setFormData({ ...formData, keyFeaturesText: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-xs text-neutral-800 mb-1">
              Tech Stack (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.techStackText}
              onChange={(e) => setFormData({ ...formData, techStackText: e.target.value })}
              placeholder="e.g. Kotlin, OpenCV, Jetpack Compose"
              className="w-full rounded-lg border border-neutral-200 p-2 text-xs"
            />
          </div>

          {/* Open Source settings */}
          <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-900">
              <input
                type="checkbox"
                checked={formData.isOpenSource}
                onChange={(e) => setFormData({ ...formData, isOpenSource: e.target.checked })}
                className="rounded border-neutral-300"
              />
              Mark as Open-Source Project
            </label>
            {formData.isOpenSource && (
              <div>
                <label className="block text-neutral-700 text-[11px] mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  value={formData.openSourceRepoUrl}
                  onChange={(e) => setFormData({ ...formData, openSourceRepoUrl: e.target.value })}
                  placeholder="https://github.com/remotasks/project"
                  className="w-full rounded-lg border border-neutral-200 p-2 bg-white"
                />
              </div>
            )}
          </div>

          {/* Acquisition settings */}
          <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50 space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-900">
              <input
                type="checkbox"
                checked={formData.acquisitionAvailable}
                onChange={(e) => setFormData({ ...formData, acquisitionAvailable: e.target.checked })}
                className="rounded border-neutral-300"
              />
              Available for Commercial Acquisition
            </label>

            {formData.acquisitionAvailable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-700 text-[11px] mb-1">Asking Price (INR)</label>
                  <input
                    type="number"
                    value={formData.askingPrice ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        askingPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Leave empty for Price on Request"
                    className="w-full rounded-lg border border-neutral-200 p-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 text-[11px] mb-1">Pricing Mode</label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) =>
                      setFormData({ ...formData, pricingType: e.target.value as PricingType })
                    }
                    className="w-full rounded-lg border border-neutral-200 p-2 bg-white"
                  >
                    <option value="negotiable">Negotiable</option>
                    <option value="fixed">Fixed Price</option>
                    <option value="on_request">Price on Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 text-[11px] mb-1">Currency</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 p-2 bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-neutral-700 text-[11px] mb-1">Private Negotiation Notes (Admin Only)</label>
                  <input
                    type="text"
                    value={formData.privateNegotiationNotes}
                    onChange={(e) => setFormData({ ...formData, privateNegotiationNotes: e.target.value })}
                    placeholder="e.g. Willing to bundle source code with 3 months transition support."
                    className="w-full rounded-lg border border-neutral-200 p-2 bg-white"
                  />
                </div>
              </div>
            )}
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
              Save Application
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
