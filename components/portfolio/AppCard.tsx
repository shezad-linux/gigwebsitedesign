"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Code2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  GitPullRequest,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { PortfolioApp } from "@/types/portfolio";
import { Button } from "@/components/ui/button";

interface AppCardProps {
  app: PortfolioApp;
  featured?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ app, featured = false }) => {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number | null, currency: string, pricingType: string) => {
    if (pricingType === "on_request" || price === null || price === undefined) {
      return "Price on Request";
    }
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(price);
    return `${formatted} (${pricingType === "fixed" ? "Fixed" : "Negotiable"})`;
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        app.isSuspended
          ? "border-amber-200 bg-amber-50/20"
          : featured
          ? "border-neutral-900 ring-1 ring-neutral-900"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <div>
        {/* Top Header: Icon + Category + Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-inner">
              {!imageError && app.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={app.iconUrl}
                  alt={`${app.name} icon`}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white font-bold text-xl">
                  {app.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <span className="inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                {app.category}
              </span>
              <h3 className="mt-1 font-bold text-lg text-neutral-900 leading-snug tracking-tight">
                {app.name}
              </h3>
              <p className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">
                {app.packageName}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {app.isSuspended ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-300 shrink-0">
              <ShieldAlert className="w-3 h-3 text-amber-700" />
              Suspended
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live on Play
            </span>
          )}
        </div>

        {/* Short Description */}
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          {app.shortDescription}
        </p>

        {/* Suspended Notice Banner */}
        {app.isSuspended && (
          <div className="mt-3 rounded-lg border border-amber-300/80 bg-amber-100/60 p-3 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Listing Notice
            </p>
            <p className="mt-0.5 text-[11px] leading-normal text-amber-800">
              This application is currently suspended on Google Play and is unavailable for public testing or download until reinstated. Its codebase and IP remain accessible for acquisition or technical review.
            </p>
          </div>
        )}

        {/* Key Features */}
        <div className="mt-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Key Features
          </h4>
          <ul className="space-y-1.5">
            {app.keyFeatures.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {app.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
            >
              {tech}
            </span>
          ))}
          {app.isOpenSource && (
            <span className="rounded-md border border-black/20 bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 inline-flex items-center gap-1">
              <Code2 className="w-2.5 h-2.5" />
              Open Source
            </span>
          )}
        </div>
      </div>

      {/* Footer Area: Pricing + Action Buttons */}
      <div className="mt-6 border-t border-neutral-100 pt-4">
        {/* Asking Price Display */}
        {app.acquisitionAvailable && (
          <div className="mb-3.5 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Acquisition Price:</span>
            <span className="font-bold text-neutral-900">
              {formatPrice(app.askingPrice, app.currency, app.pricingType)}
            </span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Google Play Button */}
          {app.isSuspended ? (
            <button
              disabled
              title="Unavailable for testing until reinstated"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-400 cursor-not-allowed opacity-75"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Unavailable
            </button>
          ) : (
            <a
              href={app.googlePlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Play Store
            </a>
          )}

          {/* Contribute Button */}
          <Link
            href={`/contribute?app=${app.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
          >
            <GitPullRequest className="mr-1.5 h-3.5 w-3.5 text-neutral-600" />
            Contribute
          </Link>

          {/* Acquisition Enquiry Button */}
          <Link
            href={`/acquisition?app=${app.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
          >
            <DollarSign className="mr-1.5 h-3.5 w-3.5 text-neutral-600" />
            Acquisition
          </Link>
        </div>
      </div>
    </div>
  );
};

