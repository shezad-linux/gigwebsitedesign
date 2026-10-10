import React from "react";
import Link from "next/link";
import {
  Code2,
  BrainCircuit,
  Tags,
  PenTool,
  Languages,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "@/data/categories";

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  BrainCircuit,
  Tags,
  PenTool,
  Languages,
  ShieldCheck,
};

export const CategoriesSection: React.FC = () => {
  return (
    <section id="categories" className="py-16 md:py-24 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-black border border-neutral-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Explore High-Demand Niches</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
            Popular AI Gig Categories
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-500">
            From algorithmic coding benchmarks to prompt safety analysis, discover roles matched to your exact expertise.
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Code2;
            return (
              <div
                key={cat.id}
                className="group rounded-[14px] border border-neutral-200 bg-neutral-50/50 p-6 hover:bg-white hover:border-black hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-black bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-full font-mono">
                      {cat.typicalRate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-black transition-colors">
                    {cat.name}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Popular skills tags */}
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                      In-Demand Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.popularSkills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs rounded-md bg-white text-neutral-800 border border-neutral-200 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 flex items-center justify-between text-xs text-neutral-500">
                  <span className="text-[11px] text-neutral-400">
                    {cat.samplePlatforms.slice(0, 2).join(", ")}
                  </span>
                  <Link
                    href={`/dashboard?category=${encodeURIComponent(cat.name)}`}
                    className="font-semibold text-black group-hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    Browse Gigs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
