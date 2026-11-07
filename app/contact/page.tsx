"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Building,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Globe,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subjectCategory: "Business partnerships" as
      | "Business partnerships"
      | "Technical collaboration"
      | "App development"
      | "Game development"
      | "Acquisition discussions"
      | "Other enquiries",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = "Please enter your name";
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.length < 15) {
      newErrors.message = "Message must be at least 15 characters long";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/portfolio/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to deliver message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <Mail className="w-3.5 h-3.5" />
              <span>Direct Communication Channel</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Contact &amp; Collaboration
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Connect directly with our engineering and business development team regarding app acquisitions, technical collaboration, custom development, or general inquiries.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configured Business Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="font-bold text-base text-neutral-900">
                Official Business Contact
              </h3>

              <div className="space-y-4 text-xs text-neutral-600">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">General Support &amp; Queries</span>
                    <a
                      href="mailto:support@remotasks.si"
                      className="text-neutral-900 hover:underline font-mono text-xs"
                    >
                      support@remotasks.si
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Primary Web Portal</span>
                    <span className="text-neutral-600 font-mono text-xs">
                      https://remotasks.si
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Response Timeline</span>
                    <span className="text-neutral-500">
                      Standard inquiries reviewed within 24 to 48 business hours.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-500 leading-normal">
                  <p className="font-semibold text-neutral-900 mb-0.5">Looking to contribute code?</p>
                  Submit your proposals via our{" "}
                  <a href="/contribute" className="text-black font-semibold underline">
                    Contribute Portal
                  </a>{" "}
                  for formal queue tracking.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: General Enquiry Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">Message Received</h3>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto">
                    Thank you for contacting us. We have received your inquiry and our team will reply to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        subjectCategory: "Business partnerships",
                        message: "",
                      });
                    }}
                    className="mt-4 rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">General Enquiry Form</h3>
                    <p className="text-xs text-neutral-500">
                      Select your inquiry topic and provide your details below.
                    </p>
                  </div>

                  {errors.form && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.form}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Alex Morgan"
                        className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                          errors.fullName ? "border-red-300" : "border-neutral-200"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] text-red-600">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                          errors.email ? "border-red-300" : "border-neutral-200"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Inquiry Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subjectCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subjectCategory: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="Business partnerships">Business partnerships</option>
                      <option value="Technical collaboration">Technical collaboration</option>
                      <option value="App development">App development</option>
                      <option value="Game development">Game development</option>
                      <option value="Acquisition discussions">Acquisition discussions</option>
                      <option value="Other enquiries">Other enquiries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      Message &amp; Scope <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share details regarding your partnership proposal, questions, or timeline..."
                      className={`w-full rounded-xl border bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black ${
                        errors.message ? "border-red-300" : "border-neutral-200"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] text-red-600">{errors.message}</p>
                    )}
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

