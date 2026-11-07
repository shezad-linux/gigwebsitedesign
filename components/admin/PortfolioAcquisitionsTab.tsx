"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Building,
  Mail,
  Phone,
  Globe,
  Search,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AcquisitionEnquiry,
  AcquisitionEnquiryStatus,
  PortfolioApp,
} from "@/types/portfolio";
import {
  getAcquisitionEnquiries,
  updateAcquisitionStatus,
  getPortfolioApps,
  savePortfolioApp,
} from "@/lib/portfolio/storage";

const ENQUIRY_STATUSES: AcquisitionEnquiryStatus[] = [
  "New",
  "Under Review",
  "NDA Sent",
  "Due Diligence",
  "Negotiation",
  "Closed",
  "Declined",
];

export const PortfolioAcquisitionsTab: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AcquisitionEnquiry[]>([]);
  const [apps, setApps] = useState<PortfolioApp[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"enquiries" | "pricing">("enquiries");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  // Price editor state
  const [editingPriceAppId, setEditingPriceAppId] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({
    askingPrice: 0 as number | null,
    pricingType: "negotiable" as "fixed" | "negotiable" | "on_request",
    currency: "INR",
    acquisitionAvailable: true,
    privateNegotiationNotes: "",
  });

  const loadData = () => {
    setEnquiries(getAcquisitionEnquiries());
    setApps(getPortfolioApps());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("portfolio_acquisitions_updated", handleUpdate);
    window.addEventListener("portfolio_apps_updated", handleUpdate);
    return () => {
      window.removeEventListener("portfolio_acquisitions_updated", handleUpdate);
      window.removeEventListener("portfolio_apps_updated", handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = (id: string, newStatus: AcquisitionEnquiryStatus) => {
    const notes = notesMap[id];
    updateAcquisitionStatus(id, newStatus, notes);
    showToast(`Enquiry status updated to: ${newStatus}`);
  };

  const handleSaveNotes = (id: string) => {
    const enquiry = enquiries.find((e) => e.id === id);
    if (!enquiry) return;
    updateAcquisitionStatus(id, enquiry.status, notesMap[id]);
    showToast("Admin notes saved.");
  };

  const startEditPrice = (app: PortfolioApp) => {
    setEditingPriceAppId(app.id);
    setPriceForm({
      askingPrice: app.askingPrice,
      pricingType: app.pricingType,
      currency: app.currency || "INR",
      acquisitionAvailable: app.acquisitionAvailable,
      privateNegotiationNotes: app.privateNegotiationNotes || "",
    });
  };

  const saveAppPrice = (app: PortfolioApp) => {
    savePortfolioApp({
      ...app,
      askingPrice: priceForm.askingPrice,
      pricingType: priceForm.pricingType,
      currency: priceForm.currency,
      acquisitionAvailable: priceForm.acquisitionAvailable,
      privateNegotiationNotes: priceForm.privateNegotiationNotes,
    });
    setEditingPriceAppId(null);
    showToast(`Updated pricing for ${app.name}`);
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== "All" && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.appName.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        (e.businessName && e.businessName.toLowerCase().includes(q))
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

      {/* Control Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-black" />
            App &amp; Game Acquisition Marketplace Management
          </h2>
          <p className="text-xs text-neutral-500">
            Track interested buyers, review acquisition budget offers, and manage pricing across all 14 portfolio applications.
          </p>
        </div>

        <div className="flex rounded-xl bg-neutral-100 p-1 text-xs">
          <button
            onClick={() => setActiveSubTab("enquiries")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
              activeSubTab === "enquiries"
                ? "bg-white text-black shadow-sm"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            Buyer Enquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveSubTab("pricing")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
              activeSubTab === "pricing"
                ? "bg-white text-black shadow-sm"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            Catalogue Pricing ({apps.length})
          </button>
        </div>
      </div>

      {activeSubTab === "enquiries" ? (
        /* ==================== Buyer Enquiries View ==================== */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buyer name, email, target app, or country..."
                className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900"
            >
              <option value="All">All Stages ({enquiries.length})</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s} ({enquiries.filter((e) => e.status === s).length})
                </option>
              ))}
            </select>
          </div>

          {/* Enquiries Cards */}
          <div className="space-y-3">
            {filteredEnquiries.map((enquiry) => {
              const isExpanded = expandedId === enquiry.id;

              return (
                <div
                  key={enquiry.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-neutral-400">
                          {enquiry.id}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-800">
                          {enquiry.status}
                        </span>
                        <span className="rounded-md bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 border border-neutral-200">
                          {enquiry.acquisitionType}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-neutral-900">
                        {enquiry.appName} — Offer:{" "}
                        <span className="text-black">{enquiry.proposedBudget}</span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                        <span>
                          Buyer: <strong>{enquiry.fullName}</strong>{" "}
                          {enquiry.businessName && `(${enquiry.businessName})`}
                        </span>
                        <span>Email: {enquiry.email}</span>
                        <span>Tel: {enquiry.contactNumber}</span>
                        <span>Country: {enquiry.country}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <select
                        value={enquiry.status}
                        onChange={(e) =>
                          handleStatusChange(
                            enquiry.id,
                            e.target.value as AcquisitionEnquiryStatus
                          )
                        }
                        className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-800"
                      >
                        {ENQUIRY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
                        className="rounded-lg border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-neutral-100 pt-3 space-y-3 text-xs bg-neutral-50/60 p-4 rounded-xl">
                      <div>
                        <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                          Buyer Message &amp; Acquisition Objectives
                        </span>
                        <p className="text-neutral-800 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                          {enquiry.message}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                          Internal Negotiation Notes
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={notesMap[enquiry.id] ?? (enquiry.adminNotes || "")}
                            onChange={(e) =>
                              setNotesMap({ ...notesMap, [enquiry.id]: e.target.value })
                            }
                            placeholder="Add confidential notes on valuation, due diligence, NDA status..."
                            className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 bg-white"
                          />
                          <button
                            onClick={() => handleSaveNotes(enquiry.id)}
                            className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                          >
                            Save Notes
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
      ) : (
        /* ==================== Catalogue Pricing View ==================== */
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/60 font-semibold text-neutral-500">
                <th className="p-3.5">Application</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Acquisition Availability</th>
                <th className="p-3.5">Pricing Mode</th>
                <th className="p-3.5">Asking Price</th>
                <th className="p-3.5">Private Negotiation Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {apps.map((app) => {
                const isEditing = editingPriceAppId === app.id;

                return (
                  <tr key={app.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={app.iconUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{app.name}</p>
                          <p className="font-mono text-[10px] text-neutral-400">{app.packageName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-neutral-600">{app.category}</td>

                    <td className="p-3.5">
                      {isEditing ? (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={priceForm.acquisitionAvailable}
                            onChange={(e) =>
                              setPriceForm({ ...priceForm, acquisitionAvailable: e.target.checked })
                            }
                            className="rounded border-neutral-300"
                          />
                          <span>Available</span>
                        </label>
                      ) : app.acquisitionAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Listed
                        </span>
                      ) : (
                        <span className="text-neutral-400">Off Market</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {isEditing ? (
                        <select
                          value={priceForm.pricingType}
                          onChange={(e) =>
                            setPriceForm({
                              ...priceForm,
                              pricingType: e.target.value as any,
                            })
                          }
                          className="rounded border border-neutral-300 p-1 text-xs"
                        >
                          <option value="negotiable">Negotiable</option>
                          <option value="fixed">Fixed Price</option>
                          <option value="on_request">Price on Request</option>
                        </select>
                      ) : (
                        <span className="uppercase text-[10px] font-bold text-neutral-500">
                          {app.pricingType}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-neutral-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={priceForm.askingPrice ?? ""}
                          onChange={(e) =>
                            setPriceForm({
                              ...priceForm,
                              askingPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Price on Request"
                          className="w-28 rounded border border-neutral-300 p-1 text-xs"
                        />
                      ) : app.askingPrice ? (
                        `₹${app.askingPrice.toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-neutral-400">Price on Request</span>
                      )}
                    </td>

                    <td className="p-3.5 max-w-[200px] truncate text-neutral-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={priceForm.privateNegotiationNotes}
                          onChange={(e) =>
                            setPriceForm({
                              ...priceForm,
                              privateNegotiationNotes: e.target.value,
                            })
                          }
                          placeholder="Private notes..."
                          className="w-full rounded border border-neutral-300 p-1 text-xs"
                        />
                      ) : (
                        app.privateNegotiationNotes || "—"
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveAppPrice(app)}
                            className="rounded-lg bg-black px-2.5 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPriceAppId(null)}
                            className="rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditPrice(app)}
                          className="rounded-lg border border-neutral-200 p-1.5 text-neutral-700 hover:bg-neutral-100"
                          title="Edit Pricing"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

