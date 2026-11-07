import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code2,
  GitPullRequest,
  Award,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioApp } from "@/types/portfolio";

interface StudioShowcaseSectionsProps {
  featuredApps: PortfolioApp[];
}

export const StudioShowcaseSections: React.FC<StudioShowcaseSectionsProps> = ({
  featuredApps,
}) => {
  return (
    <>
      {/* =========================================================================
          SECTION 1: Explore Our Apps & Games
          ========================================================================= */}
      <section className="py-20 bg-neutral-50/80 border-t border-neutral-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-300 text-black text-xs font-semibold shadow-xs">
                <Smartphone className="w-3.5 h-3.5 text-black" />
                <span>Apps &amp; Product Studio</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-500 font-medium">14 Published Titles</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
                Explore Our Apps &amp; Games
              </h2>

              <p className="text-base text-neutral-600 leading-relaxed">
                Beyond our AI gig matching engine, Remotasks develops and publishes native Android
                applications, offline utilities, and interactive entertainment on Google Play.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/apps"
                className="inline-flex items-center justify-center rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 shadow-sm transition-all"
              >
                View Full Directory (14 Apps)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Featured Apps Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-200 p-5 shadow-xs hover:shadow-md hover:border-black transition-all"
              >
                <div>
                  {/* Top Bar: Icon and Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xs">
                      {app.iconUrl ? (
                        <Image
                          src={app.iconUrl}
                          alt={app.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black text-white font-bold text-lg">
                          {app.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {app.isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Published
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {app.pricingType === "on_request" || !app.askingPrice
                          ? "Price on Request"
                          : `₹${app.askingPrice.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-bold text-base text-black group-hover:text-neutral-700 transition-colors line-clamp-1">
                    {app.name}
                  </h3>
                  <p className="text-[11px] font-medium text-neutral-400 mb-2">{app.category}</p>

                  {/* Description */}
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                    {app.shortDescription}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                  {app.isSuspended ? (
                    <span className="text-[11px] text-neutral-400 italic">Unavailable for testing</span>
                  ) : (
                    <a
                      href={app.googlePlayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-black font-semibold hover:underline"
                    >
                      Google Play
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <Link
                    href={`/contribute?project=${app.id}`}
                    className="text-neutral-500 hover:text-black font-medium"
                  >
                    Propose Feature &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Build With Us
          ========================================================================= */}
      <section className="py-20 bg-white border-t border-neutral-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-black text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5 text-black" />
              <span>Open Collaboration &amp; Recognition</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-black">
              Build With Us
            </h2>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Help us improve existing products, propose new ideas, collaborate on open-source
              development, and earn official credentials. We welcome engineers, designers, testers,
              and students to shape our development journey.
            </p>
          </div>

          {/* 4 Pillars Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: Feature Proposals */}
            <div className="flex flex-col justify-between rounded-2xl bg-neutral-50 border border-neutral-200 p-6 hover:border-black transition-all">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black">Propose Features &amp; Fixes</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Have an idea to make one of our applications better? Submit structured feature
                  proposals, report bugs, or suggest UI/UX optimizations.
                </p>
              </div>
              <Link
                href="/contribute"
                className="mt-6 inline-flex items-center text-xs font-semibold text-black hover:underline"
              >
                Submit Proposal <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Card 2: Open Source Repos */}
            <div className="flex flex-col justify-between rounded-2xl bg-neutral-50 border border-neutral-200 p-6 hover:border-black transition-all">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black">Open-Source Codebases</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Explore active open-source projects across our Android catalogue. Review code, test
                  builds, and propose architectural pull requests.
                </p>
              </div>
              <Link
                href="/open-source"
                className="mt-6 inline-flex items-center text-xs font-semibold text-black hover:underline"
              >
                Explore Projects <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Card 3: Certificates & Internships */}
            <div className="flex flex-col justify-between rounded-2xl bg-neutral-50 border border-neutral-200 p-6 hover:border-black transition-all">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black">Certificates &amp; Internships</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Contributors with accepted, merged work receive an official Certificate of
                  Contribution. Outstanding contributors may qualify for technical internships.
                </p>
              </div>
              <Link
                href="/verify-certificate"
                className="mt-6 inline-flex items-center text-xs font-semibold text-black hover:underline"
              >
                Verify Credentials <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Card 4: App Acquisition */}
            <div className="flex flex-col justify-between rounded-2xl bg-neutral-50 border border-neutral-200 p-6 hover:border-black transition-all">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black">Acquire Apps &amp; Games</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Interested in acquiring an existing application, game, or source code for your
                  business? Inquire directly with the development team.
                </p>
              </div>
              <Link
                href="/acquisition"
                className="mt-6 inline-flex items-center text-xs font-semibold text-black hover:underline"
              >
                View Marketplace <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Internship Pathway Notice Callout */}
          <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-black text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs text-neutral-600 leading-relaxed">
              <span className="font-semibold text-black">Selection Policy: </span>
              Outstanding contributors may be considered for internship opportunities based on
              technical skills, contribution quality, consistency, and project requirements.
              Internship opportunities are subject to selection and are not guaranteed.
            </div>
            <Link
              href="/contribute"
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 transition-colors"
            >
              Start Contributing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
