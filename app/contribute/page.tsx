import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  GitPullRequest,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileCode,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ContributionProposalForm } from "@/components/portfolio/ContributionProposalForm";
import { getPortfolioApps } from "@/lib/portfolio/storage";

export const metadata: Metadata = {
  title: "Contribute to Open-Source Projects | Remotasks Engineering",
  description:
    "Collaborate on production Android applications and games. Propose new features, fix bugs, optimize performance, earn contribution certificates, and explore internship opportunities.",
};

interface ContributePageProps {
  searchParams?: { app?: string };
}

const REVIEW_STAGES = [
  { stage: "Submitted", desc: "Proposal received and indexed in the engineering review queue." },
  { stage: "Under Review", desc: "Technical evaluation by module maintainers and architectural leads." },
  { stage: "Shortlisted", desc: "Candidate contacted for clarifying questions, API scope, or design review." },
  { stage: "Approved", desc: "Proposal greenlit for development; repository branching & milestone set." },
  { stage: "In Development", desc: "Active engineering, commits, unit tests, and PR draft authoring." },
  { stage: "Under Testing", desc: "Automated CI/CD build, linting, regression testing, and security review." },
  { stage: "Merged / Released", desc: "Code merged into production release and deployed to Google Play." },
  { stage: "Rejected", desc: "Constructive feedback provided if misaligned with roadmap or safety policies." },
];

export default function ContributePage({ searchParams }: ContributePageProps) {
  const apps = getPortfolioApps();
  const selectedAppId = searchParams?.app;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-24">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 bg-white py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-800">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Community Engineering Collaboration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
              Contribute to Open-Source Projects
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              Have an idea to make one of our applications better? We welcome developers, UI/UX designers, QA testers, students, and technology enthusiasts to collaborate on improvements.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#proposal-form"
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Submit Your Interest <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#certificates"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                Certificates &amp; Recognition
              </a>
              <a
                href="#internships"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                Internship Opportunities
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Workflow Timeline Section */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Transparent Evaluation
            </span>
            <h2 className="text-xl font-bold text-neutral-900 mt-1">
              Contribution Review Process
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Every proposal follows a structured internal engineering lifecycle. We do not automatically accept proposals, ensuring all contributions maintain production code standards.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEW_STAGES.map((step, idx) => (
              <div
                key={step.stage}
                className="relative rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    Stage {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{step.stage}</h3>
                <p className="mt-1 text-xs text-neutral-500 leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Certificates & Recognition */}
        <section id="certificates" className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Verified Credentials</span>
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Get Recognized for Your Contributions
              </h2>

              <p className="text-sm text-neutral-600 leading-relaxed">
                We value meaningful technical contributions. Contributors whose work is reviewed, accepted, and successfully integrated into a project may receive an official Certificate of Contribution.
              </p>

              <div className="pt-2">
                <Link
                  href="/verify-certificate"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                >
                  Verify an Issued Certificate <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Eligibility Requirements Box */}
            <div className="lg:max-w-md w-full rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-black" />
                Certificate Eligibility Criteria
              </h3>
              <p className="text-xs text-neutral-500">
                A certificate is never automatically issued for merely submitting an application, proposal, or bug report. Eligibility strictly requires:
              </p>
              <ul className="space-y-2 text-xs text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span><strong>Approved contribution</strong> with documented scope.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span><strong>Verified participation</strong> and responsive collaboration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span><strong>Completed work</strong> with zero critical test regressions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span><strong>Code review</strong> or equivalent validation by leads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span><strong>Acceptance &amp; integration</strong> into the official release.</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-500">
                Issued certificates include unique Certificate ID, issuer signoff, and QR verification code.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5B: Internship Opportunities */}
        <section id="internships" className="rounded-2xl border border-neutral-200 bg-black text-white p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Engineering Pathways</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Internship Opportunities
            </h2>

            {/* Mandatory verbatim statement */}
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium bg-white/10 p-4 rounded-xl border border-white/15">
              Outstanding contributors may be considered for internship opportunities based on technical skills, contribution quality, consistency, and project requirements. Internship opportunities are subject to selection and are not guaranteed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-neutral-300">
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="font-bold text-white text-sm mb-1">Clear Distinction of Credentials</h4>
                <p className="text-neutral-400 leading-relaxed">
                  A Certificate of Contribution recognizes completed code merges. An Internship Certificate is issued exclusively to candidates formally interviewed, selected, and contracted for structured internship terms.
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="font-bold text-white text-sm mb-1">No Employment Guarantee</h4>
                <p className="text-neutral-400 leading-relaxed">
                  We maintain strict meritocratic selection. Submitting a proposal does not promise employment or guaranteed placement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Proposal Submission Form */}
        <section id="proposal-form" className="space-y-4">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Application &amp; Proposal Form
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Submit Your Contribution Proposal
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Complete the 18 proposal fields below. All submissions are triaged by the maintainers within 3-5 business days.
            </p>
          </div>

          <ContributionProposalForm initialSelectedAppId={selectedAppId} apps={apps} />
        </section>
      </div>
    </div>
  );
}

