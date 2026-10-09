import React from "react";
import { ShieldCheck, CheckCircle2, Clock, Globe2, AlertTriangle, FileLock2 } from "lucide-react";

export const TrustSection: React.FC = () => {
  const pillars = [
    {
      title: "Payment Evidence & Proof",
      description:
        "Every listing is tagged as Verified, Partial, or Unverified based on community paystubs, disbursement receipts, or verified contractor contracts (PayPal, Deel, Payoneer).",
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Real Country Eligibility",
      description:
        "We flag geographic restrictions before you spend hours applying. Distinguish between true worldwide remote gigs versus US/UK-only regional pools.",
      icon: Globe2,
      color: "text-brand-700 bg-brand-50 border-brand-200",
    },
    {
      title: "Freshness & Verification Timestamps",
      description:
        "AI platforms pause and reopen queues frequently. Our listings include last-reviewed dates and availability status (Open, Waitlist, Paused) to eliminate dead ends.",
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      title: "Affiliate & Sponsor Transparency",
      description:
        "Sponsored listings are visibly labeled. We never inflate match scores for sponsored slots; your profile-to-job algorithm is always purely merit-based.",
      icon: FileLock2,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Phantom Queue Guarantee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Why We Verify Every Single Listing
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              The AI gig space is littered with stale job boards, hidden geo-blocks, and unrealistic income claims. GigMatcher is engineered to bring radical clarity to freelance AI work.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Our Listing Integrity Standard</span>
              </div>
              <p>
                A published rate is never presented as guaranteed earnings. A platform accepting registrations does not prove that active projects are currently in queue.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-xl border border-border bg-canvas-bg hover:bg-white hover:shadow-card transition-all"
                >
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center mb-3 ${pillar.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-ink mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
