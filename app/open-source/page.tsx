import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  GitPullRequest,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { getPortfolioApps } from "@/lib/portfolio/storage";

export const metadata: Metadata = {
  title: "Open Source Projects | Remotasks Engineering",
  description:
    "Explore our open-source Android applications and games. Collaborate on edge AI, computer vision, audio synthesis, and mobile tools.",
};

export default function OpenSourcePage() {
  const allApps = getPortfolioApps();
  const openSourceApps = allApps.filter((a) => a.isOpenSource);

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Hero Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <Code2 className="w-3.5 h-3.5 text-black" />
              <span>Open-Source Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Open Source Projects
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Have an idea to make one of our applications better? We welcome developers, UI/UX designers, QA testers, students, and technology enthusiasts to collaborate on improvements, audit source code, and submit architectural proposals.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/contribute"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Submit Your Interest <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                Browse All Applications
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Active Open-Source Codebases</h2>
            <p className="text-xs text-neutral-500">
              {openSourceApps.length} projects open for community pull requests and feature proposals.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openSourceApps.map((app) => (
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

                {/* Tech Stack */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {app.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Highlights */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1.5">
                    Collaboration Areas
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {app.keyFeatures.slice(0, 2).map((feat, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-neutral-700 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-neutral-400" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-2">
                <Link
                  href={`/contribute?app=${app.id}`}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  <GitPullRequest className="w-3.5 h-3.5 mr-1.5" />
                  Propose Improvement
                </Link>

                {app.openSourceRepoUrl && (
                  <a
                    href={app.openSourceRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contribution Info Callout */}
        <div className="mt-14 rounded-2xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Real-World Codebases</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Work on production Android applications featuring Jetpack Compose, C++ NDK, OpenCV, and local offline LLM neural networks.
              </p>
            </div>

            <div>
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Official Recognition</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Contributors whose pull requests are accepted and merged receive a verifiable, cryptographically logged Certificate of Contribution.
              </p>
            </div>

            <div>
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Internship Pathways</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                High-impact contributors demonstrating consistent engineering excellence may be considered for sponsored engineering internships.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

