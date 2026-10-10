import React from "react";
import Link from "next/link";
import { ExternalLink, CheckCircle2, Star, Sparkles } from "lucide-react";

export const FeaturedPlatforms: React.FC = () => {
  const platforms = [
    {
      name: "Outlier AI",
      category: "AI Coding & Reasoning",
      verifiedRate: "$25 - $50 / hr",
      badge: "Actively Hiring",
      verified: true,
      countries: "IN, US, UK, Global",
    },
    {
      name: "DataAnnotation Tech",
      category: "Code & Creative Writing",
      verifiedRate: "$20 - $42.5 / hr",
      badge: "High Volume",
      verified: true,
      countries: "US, CA, UK, AU, NZ",
    },
    {
      name: "Alignerr",
      category: "Advanced Code Benchmark",
      verifiedRate: "$35 - $60 / hr",
      badge: "Deel Contractor",
      verified: true,
      countries: "Global (High Bar)",
    },
    {
      name: "Mindrift",
      category: "LLM Reasoning & QA",
      verifiedRate: "$18 - $28 / hr",
      badge: "Worldwide Open",
      verified: true,
      countries: "Global, India, EU",
    },
    {
      name: "Testlio",
      category: "Exploratory Mobile QA",
      verifiedRate: "$20 - $35 / hr",
      badge: "Device Pool",
      verified: true,
      countries: "Global",
    },
    {
      name: "Telus International",
      category: "Search & Multilingual",
      verifiedRate: "$14 - $22 / hr",
      badge: "Corporate Contract",
      verified: true,
      countries: "India, US, UK, DE",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-canvas-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 text-black" />
              <span>Catalog Coverage</span>
            </div>
            <h2 className="text-2xl font-extrabold text-black tracking-tight">
              Featured Platforms & Reviewed Listings
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Regularly audited for active payout cycles and open registration gates.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
          >
            View all 15 catalog opportunities →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs hover:border-black hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-black">{p.name}</h3>
                  <p className="text-xs text-neutral-500">{p.category}</p>
                </div>
                <span className="text-[10px] font-semibold text-black bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                  {p.badge}
                </span>
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
                  <span className="font-medium text-neutral-600">{p.countries}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
