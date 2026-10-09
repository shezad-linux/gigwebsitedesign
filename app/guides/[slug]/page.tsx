import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Clock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GuideArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  updatedAt: string;
  author: string;
  introduction: string;
  sections: {
    heading: string;
    paragraphs: string[];
    callout?: string;
  }[];
  checklist: string[];
}

const ARTICLES_DATA: Record<string, GuideArticle> = {
  "ai-evaluator-onboarding-guide": {
    slug: "ai-evaluator-onboarding-guide",
    title: "How to Pass AI Model Evaluator Baseline Exams",
    category: "AI Evaluation",
    readTime: "7 min read",
    updatedAt: "May 2025",
    author: "GigMatcher Research Team",
    introduction:
      "Passing the initial evaluator screen on platforms like Outlier AI, Mindrift, or Alignerr requires shifting your mindset from a casual conversation partner to a strict, rubric-driven accuracy auditor. Here is what platforms evaluate during trial runs.",
    sections: [
      {
        heading: "1. Understanding the Four Core Dimensions",
        paragraphs: [
          "Most frontier AI labs instruct human raters to score outputs across four key dimensions: Factuality (is every claim verifiable?), Instruction Following (did the model answer constraints like 'under 200 words' or 'in bullet format'?), Safety/Harmlessness (does it promote dangerous actions?), and Tone/Helpfulness (is it professional, objective, and polite?).",
          "A common reason candidates fail baseline tests is rating a verbose, pleasant response high even when it subtlely hallucinated a minor historical date or scientific reference. Factuality always trumps tone.",
        ],
        callout: "Golden Rule: If a model writes 500 great words but ignores a negative constraint ('do not mention London'), it must be marked non-compliant on instruction following.",
      },
      {
        heading: "2. The Art of Justification Writing",
        paragraphs: [
          "Trial tests are graded not just on the 1-5 score you pick, but on the written justification you submit to explain your score. Quality assurance reviewers look for structured, verifiable citations.",
          "Avoid subjective commentary like 'I felt Response A was smoother'. Instead, write: 'Response A adhered to all 4 prompt constraints and accurately cited Newton's Second Law. Response B hallucinated the units (written as m/s instead of m/s² in paragraph 2) and omitted the requested summary paragraph.'",
        ],
      },
      {
        heading: "3. Spotting Subtle Hallucinations",
        paragraphs: [
          "Frontier models rarely hallucinate obvious falsehoods like 'the sky is green'. They hallucinate plausible-sounding bibliographic references, fictitious API function parameters, or incorrect statutory dates.",
          "Always open a separate tab and independently verify named entities, specific book chapters, legal codes, and mathematical proofs before validating a model output.",
        ],
      },
    ],
    checklist: [
      "Open official evaluation guidelines in a second monitor or split screen.",
      "Check negative constraints (what the prompt asked NOT to do) first.",
      "Google every specific numeric citation and named entity.",
      "Write justifications that mention specific paragraph and sentence numbers.",
    ],
  },
  "coding-benchmarks-guide": {
    slug: "coding-benchmarks-guide",
    title: "Mastering AI Coding Benchmarks (LeetCode & Code Review Tests)",
    category: "AI Coding",
    readTime: "9 min read",
    updatedAt: "May 2025",
    author: "Senior AI Alignment Contributor",
    introduction:
      "Developer gig tiers offer the highest compensation ($35 to $55/hr), but their qualification tests have a strict pass threshold. You will typically be given a prompt, an AI solution, and asked to find edge-case failures or rewrite the solution.",
    sections: [
      {
        heading: "1. The 60-Minute Assessment Structure",
        paragraphs: [
          "Platforms such as DataAnnotation Tech and Outlier AI test software engineers with multi-language code snippets. You are asked to review an AI-generated algorithm, state whether it meets optimal time complexity, and construct unit tests.",
          "Do not just test happy-path inputs (e.g. [1, 2, 3]). Raters look for candidates who immediately craft tricky test cases: empty arrays, integer overflows, cyclical graphs, negative indices, and concurrency race conditions.",
        ],
      },
      {
        heading: "2. Crafting Failing Test Suites",
        paragraphs: [
          "When an AI coding model produces a solution that passes sample test cases, your job is to break it. Look for off-by-one errors in sliding window loops, inefficient quadratic string concatenation, or unhandled null pointers.",
          "Writing clear assertions using standard frameworks (pytest for Python, JUnit for Java) proves you have professional engineering rigor.",
        ],
        callout: "Performance Watch: If an algorithm runs in O(N²) when an O(N log N) solution using two-pointers or heaps exists, you must flag the complexity penalty in your critique.",
      },
    ],
    checklist: [
      "Brush up on Python and Java type systems and collections.",
      "Test edge cases: empty strings, MAX_INT bounds, and duplicate keys.",
      "State Big-O time and space complexity explicitly in the review.",
      "Provide clean, documented alternatives rather than partial pseudo-code.",
    ],
  },
  "country-restrictions-and-payouts": {
    slug: "country-restrictions-and-payouts",
    title: "Understanding Country Geoblocks, W-8BEN Forms & Payout Rails",
    category: "Operations & Tax",
    readTime: "6 min read",
    updatedAt: "May 2025",
    author: "GigMatcher Operations Lead",
    introduction:
      "One of the biggest frustrations for AI gig workers is sudden regional pauses or payment delays. Understanding platform compliance and payout mechanisms helps prevent account suspensions.",
    sections: [
      {
        heading: "1. Why Platforms Pause Regional Queues",
        paragraphs: [
          "AI platforms balance their contributor pools by client demand. If a client needs prompt evaluators for US and UK cultural idioms, platforms pause onboarding for Indian or Brazilian IPs not because applicants lack skill, but because that project cohort is fully staffed.",
          "Never use a VPN to mask your location. Doing so violates platform Terms of Service and triggers automated fraud detection, resulting in permanent forfeiture of unpaid earnings.",
        ],
      },
      {
        heading: "2. The W-8BEN Form & Tax Withholding",
        paragraphs: [
          "If you reside outside the United States and work for US-headquartered platforms (Outlier, DataAnnotation), you will complete a W-8BEN certification during onboarding.",
          "This IRS form certifies that you are not a US tax resident, preventing standard 30% US income tax withholding on your foreign-sourced freelance earnings.",
        ],
        callout: "Important: Ensure your name on Deel/PayPal matches your passport or government national ID character-for-character to prevent payout holds.",
      },
    ],
    checklist: [
      "Never register via a VPN or commercial proxy server.",
      "Verify that your local bank accepts ACH or SWIFT wires from Deel/Airwallex.",
      "Keep a PDF copy of your submitted W-8BEN tax form.",
      "Set up two-factor authentication on both your gig account and payout wallet.",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = ARTICLES_DATA[params.slug];
  if (!article) return { title: "Guide Not Found | GigMatcher" };

  return {
    title: `${article.title} | GigMatcher Guides`,
    description: article.introduction.slice(0, 160),
    alternates: {
      canonical: `https://gigmatcher.io/guides/${article.slug}`,
    },
  };
}

export default function GuideDetailPage({ params }: { params: { slug: string } }) {
  const article = ARTICLES_DATA[params.slug];
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-canvas-bg py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/guides" className="hover:text-brand-600 transition-colors">
            Guides
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-800 truncate">{article.title}</span>
        </nav>

        {/* Article Header */}
        <article className="bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-xs space-y-8">
          <div className="space-y-4 border-b border-border pb-8">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Badge variant="primary" size="sm">
                {article.category}
              </Badge>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">By {article.author}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">Updated {article.updatedAt}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {article.introduction}
            </p>
          </div>

          {/* Body Sections */}
          <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            {article.sections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight">
                  {section.heading}
                </h2>

                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}

                {section.callout && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
                    {section.callout}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Practical Checklist */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <h3 className="font-bold text-base text-ink flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Pre-Screening Action Checklist
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {article.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Back navigation CTA */}
        <div className="flex items-center justify-between">
          <Link href="/guides">
            <Button variant="secondary" size="sm">
              &larr; Back to all guides
            </Button>
          </Link>

          <Link href="/onboarding">
            <Button size="sm" className="font-bold">
              Match My Skills to Live Gigs <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
