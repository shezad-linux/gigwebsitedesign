"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is my resume or profile sent to any external AI service or third-party server?",
      a: "No. Your profile data is encrypted and securely stored in your verified account (or local session). No resumes or contact information are sold or shared with third-party advertisers.",
    },
    {
      q: "How is the match score (e.g. 92%) calculated?",
      a: "The matching engine calculates scores across four transparent dimensions: Skill Overlap (55%), Experience Level Alignment (15%), Category Interest Fit (15%), and Verified Geographic Country Eligibility (15%). You can inspect both matched skills and missing requirements on every card.",
    },
    {
      q: "What does 'Payment Verified' vs 'Needs Current Verification' mean?",
      a: "'Payment Verified' indicates our community has documented real freelancer disbursements (via PayPal, Deel, Wise, or Direct Deposit). 'Needs Current Verification' means either project queues are experiencing seasonal fluctuations or rate structures have recently changed.",
    },
    {
      q: "Can I use GigMatcher if I don't have a resume PDF ready?",
      a: "Absolutely. Our onboarding flow provides a dedicated manual entry route where you can select your programming languages, tools, country, and weekly availability in less than two minutes without uploading any document.",
    },
    {
      q: "Are the hourly rates guaranteed by GigMatcher?",
      a: "No. All rates listed are published or community-documented figures. Freelance AI work depends on individual rubric qualifications, test task scores, and active client budget batches. We never present potential earnings as guaranteed income.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-black border border-neutral-200 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-black" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Transparent Answers
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500">
            Clear guidelines on data security, matching mechanics, and earnings transparency.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-black hover:text-neutral-700 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-black" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
