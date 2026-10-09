import React from "react";
import Link from "next/link";
import { UserCheck, Sparkles, CheckSquare, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Build Profile or Upload Resume",
      description:
        "Upload a sample PDF/DOCX or quickly select your technical stack, spoken languages, and country of residence. All data is processed client-side.",
      icon: FileText,
      badge: "Local-First Privacy",
    },
    {
      step: "02",
      title: "Get Matched & Inspect Gigs",
      description:
        "Receive transparent match scores (e.g. 92%) with matched vs missing skill breakdowns, verified payment ranges, and strict country eligibility checks.",
      icon: Sparkles,
      badge: "Transparent Scores",
    },
    {
      step: "03",
      title: "Apply Directly & Track Progress",
      description:
        "Follow official links to real platform portals. Track statuses from Shortlisted to Qualified and Active, add notes, and log hourly rates.",
      icon: CheckSquare,
      badge: "Full Application Tracker",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-canvas-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Three Simple Steps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            How GigMatcher Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-ink-muted">
            Eliminating guesswork for AI evaluators and coders worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-[16px] bg-white border border-border p-8 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-brand-200 tracking-tighter">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>

                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-slate-400">
                  <span>Step {index + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/onboarding">
            <Button size="lg" className="font-semibold shadow-md">
              Start Your Profile Matching <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
