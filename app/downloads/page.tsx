import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileCode, Globe, CheckCircle2, Sparkles, ExternalLink, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Origin Downloads — NexaFlow Landing Template | Remotasks.si",
  description:
    "Download both the standalone HTML5 edition and the Next.js / React (TypeScript) edition of the NexaFlow modern automation landing page directly from our origin server.",
};

export default function DownloadsPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Origin Download Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            NexaFlow Landing Page Downloads
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-base sm:text-lg">
            Download the production-ready landing page in your preferred stack. Hosted directly on our origin server for quick deployment.
          </p>
        </div>

        {/* Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: HTML5 Version */}
          <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 hover:border-neutral-700 transition">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Single File HTML5
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">NexaFlow (HTML5 Edition)</h3>
                <p className="text-sm text-neutral-400 mt-2">
                  Zero setup required. Ready to run directly in any web browser with Tailwind CSS via CDN and interactive vanilla JS mobile menu toggle.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>File: <code>nexaflow.html</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Tailwind CSS via CDN</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Works offline & on any static web host</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href="/api/downloads/nexaflow.html"
                download="nexaflow.html"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download HTML File</span>
              </a>

              <a
                href="/downloads/nexaflow.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition border border-neutral-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Browser Preview</span>
              </a>
            </div>
          </div>

          {/* Card 2: Next.js / React Version */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-neutral-900/60 p-8 hover:border-indigo-500/50 transition">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                  React / Next.js (TSX)
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">NexaFlow (React/Next.js Edition)</h3>
                <p className="text-sm text-neutral-400 mt-2">
                  Production TypeScript component built with <code>&quot;use client&quot;</code>, Lucide React icons, and utility classes matching Tailwind CSS.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>File: <code>NexaFlow.tsx</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>TypeScript &amp; React Hooks (useState)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Compatible with Next.js App &amp; Pages Router</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href="/api/downloads/NexaFlow.tsx"
                download="NexaFlow.tsx"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download React/Next.js (.tsx)</span>
              </a>

              <a
                href="/downloads/NexaFlow.tsx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition border border-neutral-700"
              >
                <FileCode className="w-4 h-4" />
                <span>View Raw Source Code</span>
              </a>
            </div>
          </div>
        </div>

        {/* Origin URLs Documentation Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
            Direct Origin URLs
          </h4>
          <p className="text-xs text-neutral-400">
            You can also link directly to these origin static endpoints or curl/wget them in CI/CD pipelines:
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex items-center justify-between text-neutral-300">
              <span>GET /downloads/nexaflow.html</span>
              <span className="text-neutral-500">HTML5 Standalone</span>
            </div>
            <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex items-center justify-between text-neutral-300">
              <span>GET /downloads/NexaFlow.tsx</span>
              <span className="text-neutral-500">React / Next.js Component</span>
            </div>
            <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex items-center justify-between text-neutral-300">
              <span>GET /api/downloads/:filename</span>
              <span className="text-neutral-500">Forced Attachment Download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

