import React from "react";
import Link from "next/link";
import { ExternalLink, CheckCircle2, Star, Sparkles, ArrowUpRight } from "lucide-react";

export const FeaturedPlatforms: React.FC = () => {
  const platforms = [
    {
      name: "Mercor",
      category: "Elite AI Engineering & Research",
      verifiedRate: "$50 - $120+ / hr",
      badge: "Premium Partner",
      verified: true,
      countries: "Global Remote",
      url: "https://t.mercor.com/hYqU9",
      isPremium: true,
    },
    {
      name: "Ethos",
      category: "Autonomous Agent Benchmarking",
      verifiedRate: "$25 - $45 / hr",
      badge: "Premium Partner",
      verified: true,
      countries: "Global, US, IN, EU",
      url: "https://agent.askethos.com/refer/i9tslep82zx4",
      isPremium: true,
    },
    {
      name: "Handshake AI",
      category: "Move Program · AI Contributor",
      verifiedRate: "$22 - $40 / hr",
      badge: "Premium Partner",
      verified: true,
      countries: "US, UK, CA, IN, Global",
      url: "https://joinhandshake.com/move-program/referral?referralCode=6EE9DF&utm_source=referral",
      isPremium: true,
    },
    {
      name: "Outlier AI",
      category: "AI Coding & Reasoning",
      verifiedRate: "$25 - $50 / hr",
      badge: "Actively Hiring",
      verified: true,
      countries: "IN, US, UK, Global",
      url: "https://outlier.ai",
      isPremium: false,
    },
    {
      name: "DataAnnotation Tech",
      category: "Code & Creative Writing",
      verifiedRate: "$20 - $42.5 / hr",
      badge: "High Volume",
      verified: true,
      countries: "US, CA, UK, AU, NZ",
      url: "https://www.dataannotation.tech",
      isPremium: false,
    },
    {
      name: "Alignerr",
      category: "Advanced Code Benchmark",
      verifiedRate: "$35 - $60 / hr",
      badge: "Deel Contractor",
      verified: true,
      countries: "Global (High Bar)",
      url: "https://www.alignerr.com",
      isPremium: false,
    },
    {
      name: "Mindrift",
      category: "LLM Reasoning & QA",
      verifiedRate: "$18 - $28 / hr",
      badge: "Worldwide Open",
      verified: true,
      countries: "Global, India, EU",
      url: "https://mindrift.ai",
      isPremium: false,
    },
    {
      name: "Testlio",
      category: "Exploratory Mobile QA",
      verifiedRate: "$20 - $35 / hr",
      badge: "Device Pool",
      verified: true,
      countries: "Global",
      url: "https://testlio.com",
      isPremium: false,
    },
    {
      name: "Telus International",
      category: "Search & Multilingual",
      verifiedRate: "$14 - $22 / hr",
      badge: "Corporate Contract",
      verified: true,
      countries: "India, US, UK, DE",
      url: "https://www.telusinternational.com",
      isPremium: false,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-canvas-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 text-black" />
              <span>Catalog Coverage · Premium Network</span>
            </div>
            <h2 className="text-2xl font-extrabold text-black tracking-tight">
              Featured Platforms & Reviewed Listings
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Regularly audited for active payout cycles, priority referrals, and open registration gates.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
          >
            View all catalog opportunities →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => {
            const CardContent = (
              <div
                className={`p-5 rounded-xl border transition-all h-full flex flex-col justify-between ${
                  p.isPremium
                    ? "bg-white border-black shadow-sm ring-1 ring-black/5 hover:shadow-md"
                    : "bg-white border-neutral-200 shadow-xs hover:border-black hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-black">{p.name}</h3>
                        {p.isPremium && (
                          <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{p.category}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isPremium
                          ? "bg-black text-white"
                          : "text-black bg-neutral-100 border border-neutral-200"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-medium">Estimated Rate</span>
                    <span className="font-semibold text-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-black" /> {p.verifiedRate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block font-medium">Eligible Regions</span>
                    <span className="font-medium text-neutral-600 flex items-center gap-1 justify-end">
                      {p.countries}
                      {p.url && <ArrowUpRight className="w-3 h-3 text-neutral-400" />}
                    </span>
                  </div>
                </div>
              </div>
            );

            if (p.url) {
              return (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  {CardContent}
                </a>
              );
            }

            return <div key={p.name}>{CardContent}</div>;
          })}
        </div>
      </div>
    </section>
  );
};
