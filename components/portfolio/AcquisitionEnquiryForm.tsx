"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Globe,
  Send,
  Loader2,
  FileText,
} from "lucide-react";
import { PortfolioApp, AcquisitionType } from "@/types/portfolio";
import { PORTFOLIO_APPS } from "@/data/portfolio-apps";

interface AcquisitionEnquiryFormProps {
  initialAppId?: string;
  apps?: PortfolioApp[];
}

const ACQUISITION_TYPES: AcquisitionType[] = [
  "Full App Acquisition",
  "Full Game Acquisition",
  "Source Code Acquisition",
  "Partnership",
  "Licensing",
  "Other",
];

export const AcquisitionEnquiryForm: React.FC<AcquisitionEnquiryFormProps> = ({
  initialAppId,
  apps = PORTFOLIO_APPS,
}) => {
  const selectedApp = apps.find((a) => a.id === initialAppId) || apps[0];

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    contactNumber: "",
    country: "",
    appId: selectedApp?.id || "",
    appName: selectedApp?.name || "",
    proposedBudget: "",
    acquisitionType: "Full App Acquisition" as AcquisitionType,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    id: string;
    appName: string;
    email: string;
  } | null>(null);

  const handleAppChange = (appId: string) => {
    const found = apps.find((a) => a.id === appId);
    setFormData((prev) => ({
      ...prev,
      appId,
      appName: found ? found.name : appId,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = "Please enter your full name";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid business or personal email";
    }
    if (!formData.contactNumber.trim() || formData.contactNumber.length < 6) {
      newErrors.contactNumber = "Please provide your phone or WhatsApp contact number";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Please enter your country of operation";
    }
    if (!formData.appId) {
      newErrors.appId = "Please select the application or game of interest";
    }
    if (!formData.proposedBudget.trim()) {
      newErrors.proposedBudget = "Please indicate your proposed acquisition budget or price range";
    }
    if (!formData.message.trim() || formData.message.length < 15) {
      newErrors.message = "Please include a brief message outlining your acquisition objectives (min 15 chars)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/portfolio/acquisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit enquiry");
      }

      setSubmittedEnquiry({
        id: json.data.id,
        appName: formData.appName,
        email: formData.email,
      });
    } catch (err: any) {
      setErrors({ form: err.message || "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submittedEnquiry) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-3">
          Acquisition Enquiry Logged
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Thank you for reaching out
        </h2>
        <p className="mt-3 text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
          Your enquiry regarding the acquisition of <strong className="text-neutral-900">{submittedEnquiry.appName}</strong> has been registered under reference:
        </p>

        <div className="my-6 inline-block rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-3 font-mono text-base font-bold text-neutral-900 shadow-inner">
          {submittedEnquiry.id}
        </div>

        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Our acquisitions and licensing lead will review your submission and contact you at <strong>{submittedEnquiry.email}</strong> within 1-2 business days to schedule an introductory discussion.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedEnquiry(null);
              setFormData({
                fullName: "",
                businessName: "",
                email: "",
                contactNumber: "",
                country: "",
                appId: apps[0]?.id || "",
                appName: apps[0]?.name || "",
                proposedBudget: "",
                acquisitionType: "Full App Acquisition",
                message: "",
              });
            }}
            className="rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            Submit Another Enquiry
          </button>
          <Link
            href="/acquisition"
            className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
          Request an Acquisition Quotation & Consultation
        </h3>
        <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
          Inquire directly regarding app purchases, source code buyouts, IP transfer, or strategic partnerships.
        </p>
      </div>

      {errors.form && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Full Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.fullName ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.fullName && <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>}
        </div>

        {/* 2. Business / Organization */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Business / Organization <span className="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="e.g. Acme Ventures / Independent Developer"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* 3. Email */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@acme.com"
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.email ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
        </div>

        {/* 4. Contact Number */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            placeholder="+91 98200 12345 / +1 (555) 012-3456"
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.contactNumber ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.contactNumber && (
            <p className="mt-1 text-[11px] text-red-600">{errors.contactNumber}</p>
          )}
        </div>

        {/* 5. Country */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g. India, United States, United Kingdom"
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.country ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.country && <p className="mt-1 text-[11px] text-red-600">{errors.country}</p>}
        </div>

        {/* 6. Application or Game Interested In */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Application or Game Interested In <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.appId}
            onChange={(e) => handleAppChange(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.category})
              </option>
            ))}
          </select>
        </div>

        {/* 7. Proposed Acquisition Budget */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Proposed Acquisition Budget <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.proposedBudget}
            onChange={(e) => setFormData({ ...formData, proposedBudget: e.target.value })}
            placeholder="e.g. ₹5,00,000 / $10,000 USD / Open to Quote"
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.proposedBudget ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.proposedBudget && (
            <p className="mt-1 text-[11px] text-red-600">{errors.proposedBudget}</p>
          )}
        </div>

        {/* 8. Acquisition Type */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Acquisition Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.acquisitionType}
            onChange={(e) =>
              setFormData({ ...formData, acquisitionType: e.target.value as AcquisitionType })
            }
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            {ACQUISITION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 9. Additional Message */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-neutral-800 mb-1">
            Additional Message & Acquisition Intent <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Please describe your background, timeline, strategic vision for the app, and any specific requirements (e.g. Google Play Console transfer, IP assignment, post-sale support)..."
            className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
              errors.message ? "border-red-300" : "border-neutral-200"
            }`}
          />
          {errors.message && <p className="mt-1 text-[11px] text-red-600">{errors.message}</p>}
        </div>
      </div>

      {/* Mandatory Legal & Due Diligence Notice */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600 space-y-1">
        <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          Acquisition Due Diligence & Platform Notice
        </p>
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Submitting this acquisition enquiry does not constitute a binding purchase agreement, option, or transfer of ownership. All acquisitions are subject to mutual execution of a formal Asset Purchase Agreement, mutual due diligence, code audit, verified escrow settlement, and compliance with Google Play Developer Policy requirements.
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Enquiry...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Acquisition Enquiry
            </>
          )}
        </button>
      </div>
    </form>
  );
};

