import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  GitPullRequest,
  ShieldCheck,
  Smartphone,
  Cpu,
  Layers,
  Award,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | Remotasks Application Portfolio & Studio",
  description:
    "Learn about our engineering philosophy, mission, Android and game development journey, open-source standards, and core technical stack.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Header Banner */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineering &amp; Innovation Studio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              About Our Portfolio &amp; Journey
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              We design, architect, and ship high-performance Android applications and games focused on privacy, offline capabilities, edge AI, computer vision, and user-centric utilities.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Mission & Philosophy */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Our Development Philosophy
          </h2>
          <div className="prose prose-neutral text-sm text-neutral-600 leading-relaxed space-y-4">
            <p>
              Founded with the belief that mobile software should be fast, transparent, and respectful of user privacy, our portfolio spans 14 production applications across gaming, machine learning, camera processing, and productivity.
            </p>
            <p>
              Unlike conventional mobile apps loaded with intrusive advertising SDKs and tracking telemetry, our applications emphasize <strong>on-device compute</strong>. From running quantized neural networks locally with MediaPipe to executing OpenCV perspective warps in native C++ NDK, we prioritize user control and zero-cloud dependency wherever feasible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Privacy First</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Zero data harvesting. Local storage with SQLCipher and on-device machine learning inference.
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Open-Source Core</h3>
              <p className="text-xs text-neutral-500 mt-1">
                We believe in community-driven code audits, reproducible benchmarks, and collaborative engineering.
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
              <h3 className="font-bold text-sm text-neutral-900">Production Standards</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Strict CI/CD testing, TalkBack WCAG 2.1 AA accessibility compliance, and low battery consumption.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Spotlight */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Core Technology Stack
          </h2>
          <p className="text-xs text-neutral-500 -mt-3">
            The modern frameworks and native runtime engines powering our applications:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">Kotlin &amp; Compose</span>
              <span className="text-neutral-500 text-[11px]">Modern declarative Android UI</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">OpenCV &amp; C++ NDK</span>
              <span className="text-neutral-500 text-[11px]">Real-time computer vision</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">MediaPipe &amp; TFLite</span>
              <span className="text-neutral-500 text-[11px]">On-device quantized LLMs</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">Godot &amp; Unity</span>
              <span className="text-neutral-500 text-[11px]">60FPS interactive 2D/3D engines</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">Next.js &amp; TypeScript</span>
              <span className="text-neutral-500 text-[11px]">Web portal &amp; developer hub</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">Supabase &amp; PostgreSQL</span>
              <span className="text-neutral-500 text-[11px]">Robust RLS security backend</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">Tailwind CSS</span>
              <span className="text-neutral-500 text-[11px]">Obsidian Monochrome design</span>
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 bg-neutral-50/50">
              <span className="font-bold text-neutral-900 block">GitHub Actions</span>
              <span className="text-neutral-500 text-[11px]">Automated test CI/CD pipelines</span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-black text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold">Ready to collaborate with us?</h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Submit an open-source contribution proposal, explore an acquisition opportunity, or join our community discussions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black px-4 py-2.5 text-xs font-bold hover:bg-neutral-200 transition-colors"
            >
              Start Contributing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 text-white px-4 py-2.5 text-xs font-semibold hover:bg-neutral-900 transition-colors"
            >
              Contact Owner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

