"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { CertificateViewer } from "@/components/portfolio/CertificateViewer";
import { ContributionCertificate } from "@/types/portfolio";

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [queryId, setQueryId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<ContributionCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificate = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const res = await fetch(`/api/portfolio/certificates?id=${encodeURIComponent(idToVerify.trim())}`);
      const json = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.error || "No valid certificate was found with this identifier.");
      }

      setCertificate(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to verify certificate.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchCertificate(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCertificate(queryId);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Public Verification Ledger</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Verify Contribution Certificate
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Verify the authenticity, contributor credentials, project scope, and code acceptance of any officially issued Remotasks Open-Source Certificate of Contribution.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Bar */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-AS782K or CERT-2026-ER994L)"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-3 text-sm text-neutral-900 font-mono placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryId.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Verify Now
            </button>
          </form>

          {/* Quick Demo Links */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span>Test verifiable IDs:</span>
            <button
              type="button"
              onClick={() => {
                setQueryId("CERT-2026-AS782K");
                fetchCertificate("CERT-2026-AS782K");
              }}
              className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-neutral-800 hover:bg-neutral-200"
            >
              CERT-2026-AS782K
            </button>
            <button
              type="button"
              onClick={() => {
                setQueryId("CERT-2026-ER994L");
                fetchCertificate("CERT-2026-ER994L");
              }}
              className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-neutral-800 hover:bg-neutral-200"
            >
              CERT-2026-ER994L
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Certificate Verification Notice</h4>
              <p className="mt-1 leading-relaxed text-amber-800">{error}</p>
              <p className="mt-2 text-[11px] text-amber-700">
                Please double-check the unique identifier code. Remember that certificates are only issued to approved, merged contributors after code review.
              </p>
            </div>
          </div>
        )}

        {/* Certificate Display */}
        {certificate && <CertificateViewer certificate={certificate} />}
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading certificate verifier...</div>}>
      <VerifyCertificateContent />
    </Suspense>
  );
}

