import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Gig Qualification Guides & Onboarding Preparation | GigMatcher",
  description:
    "Free practical guides to passing baseline evaluation assessments on Outlier AI, DataAnnotation, Alignerr, Mindrift, and Testlio.",
  alternates: {
    canonical: "https://gigmatcher.io/guides",
  },
};

const GUIDES = [
  {
    slug: "ai-evaluator-onboarding-guide",
    title: "How to Pass AI Model Evaluator Baseline Exams",
    category: "AI Evaluation",
    readTime: "7 min read",
    updatedAt: "May 2025",
    summary:
      "A step-by-step breakdown of what frontier AI labs look for in multi-turn conversation grading: rubric adherence, hallucination flagging, and concise evidence citation.",
    keyTakeaway: "Frontier labs reject vague justifications; reference the exact guideline sentence when docking points.",
  },
  {
    slug: "coding-benchmarks-guide",
    title: "Mastering AI Coding Benchmarks (LeetCode & Code Review Tests)",
    category: "AI Coding",
    readTime: "9 min read",
    updatedAt: "May 2025",
    summary:
      "Strategies for the 60-minute algorithmic screen: testing time complexity, crafting tricky edge cases (null inputs, integer overflows), and rewriting code in Python and Java.",
    keyTakeaway: "Frontier LLM evaluations test your ability to spot subtle logical bugs rather than standard syntax errors.",
  },
  {
    slug: "country-restrictions-and-payouts",
    title: "Understanding Country Geoblocks, W-8BEN Forms & Payout Rails",
    category: "Operations & Tax",
    readTime: "6 min read",
    updatedAt: "May 2025",
    summary:
      "Everything non-US and US freelancers need to know about Deel, PayPal, Airwallex, W-8BEN withholding exemptions, and why platforms periodically pause specific regional onboarding queues.",
    keyTakeaway: "Ensure your primary bank name matches your government ID exactly to prevent Deel and Airwallex disbursement holds.",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-canvas-bg py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800">Candidate Guides</span>
        </nav>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Free Resources
            </Badge>
            <Badge variant="outline" size="sm" className="bg-white">
              Candidate Preparation
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            AI Gig Qualification Guides
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Practical, verified walkthroughs to help software developers and domain evaluators pass platform
            onboarding screenings on the first attempt.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="space-y-5">
          {GUIDES.map((guide) => (
            <Card
              key={guide.slug}
              className="bg-white border-border shadow-xs hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {guide.category}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {guide.readTime}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">Updated {guide.updatedAt}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-ink">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="hover:text-brand-600 transition-colors"
                    >
                      {guide.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {guide.summary}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Key Insight:</span> {guide.keyTakeaway}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button href={`/guides/${guide.slug}`} size="md" className="font-bold text-xs w-full md:w-auto">
                    Read Guide <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
