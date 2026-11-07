import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { getPortfolioApps } from "@/lib/portfolio/storage";
import { AcquisitionEnquiryForm } from "@/components/portfolio/AcquisitionEnquiryForm";
import { PortfolioApp } from "@/types/portfolio";

export const metadata: Metadata = {
  title: "App & Game Acquisition Marketplace | Remotasks Portfolio",
  description:
    "Explore opportunities to acquire applications and games from our portfolio. Transparent asking prices, code audits, IP transfer, and developer consultations.",
};

interface AcquisitionPageProps {
  searchParams?: { app?: string };
}

export default function AcquisitionPage({ searchParams }: AcquisitionPageProps) {
  const apps = getPortfolioApps();
  const selectedAppId = searchParams?.app;

  const formatPrice = (price: number | null, currency: string, pricingType: string) => {
    if (pricingType === "on_request" || price === null || price === undefined) {
      return "Price on Request";
    }
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(price);
    return `${formatted} (${pricingType === "fixed" ? "Fixed Price" : "Negotiable"})`;
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Commercial Acquisitions &amp; IP Transfers</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Interested in Owning an App or Game?
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Explore opportunities to acquire applications and games from our portfolio. Whether you&apos;re an individual developer, startup, or business, contact us to discuss an acquisition.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#enquiry-form"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Request an Acquisition Quotation <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#listings"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                Browse Available Listings
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Marketplace Directory Section */}
        <section id="listings" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Asset Marketplace
              </span>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
                Available Portfolio Assets
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Showing all 14 published, beta, and suspended catalogue apps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-neutral-400 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {app.category}
                      </span>
                      <h3 className="text-base font-bold text-neutral-900 mt-1 leading-snug">
                        {app.name}
                      </h3>
                      <p className="font-mono text-[11px] text-neutral-400 truncate max-w-[190px]">
                        {app.packageName}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-neutral-600 leading-relaxed">
                    {app.shortDescription}
                  </p>

                  {/* Suspended Notice */}
                  {app.isSuspended && (
                    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-900">
                      <strong>Suspended on Google Play:</strong> Unavailable for testing; code and asset bundle available for purchase and rebranding.
                    </div>
                  )}

                  {/* Tech stack */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {app.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Asking Price:</span>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(app.askingPrice, app.currency, app.pricingType)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`#enquiry-form`}
                      className="flex-1 inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      Contact for Acquisition
                    </a>

                    {!app.isSuspended && (
                      <a
                        href={app.googlePlayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="View Public Google Play Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Due Diligence & Legal Workflow */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Transaction Integrity
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-1">
              Acquisition Due Diligence &amp; Transfer Process
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              We uphold transparent, secure, and legally governed acquisition procedures for individual developers, venture studios, and corporate buyers.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
              <span className="font-mono text-[10px] font-bold text-neutral-400 block mb-1">01. INQUIRY</span>
              <h4 className="text-xs font-bold text-neutral-900">Initial Brief &amp; NDA</h4>
              <p className="text-[11px] text-neutral-500 mt-1">Mutual NDA execution to discuss codebase architecture and private negotiation notes.</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
              <span className="font-mono text-[10px] font-bold text-neutral-400 block mb-1">02. AUDIT</span>
              <h4 className="text-xs font-bold text-neutral-900">Technical Due Diligence</h4>
              <p className="text-[11px] text-neutral-500 mt-1">Full source code review, dependency audit, and Google Play Console status verification.</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
              <span className="font-mono text-[10px] font-bold text-neutral-400 block mb-1">03. ESCROW</span>
              <h4 className="text-xs font-bold text-neutral-900">Escrow Settlement</h4>
              <p className="text-[11px] text-neutral-500 mt-1">Execution of standard Asset Purchase Agreement with funds safely held in verified escrow.</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
              <span className="font-mono text-[10px] font-bold text-neutral-400 block mb-1">04. HANDOVER</span>
              <h4 className="text-xs font-bold text-neutral-900">Transfer &amp; Transition</h4>
              <p className="text-[11px] text-neutral-500 mt-1">Official Google Play App Transfer, Git repo handover, signing keys, and 14 days transition support.</p>
            </div>
          </div>
        </section>

        {/* Acquisition Enquiry Form */}
        <section id="enquiry-form">
          <AcquisitionEnquiryForm initialAppId={selectedAppId} apps={apps} />
        </section>
      </div>
    </div>
  );
}

