"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, Layers, Code2, DollarSign, X, Check } from "lucide-react";
import { PortfolioApp, AppCategory } from "@/types/portfolio";
import { AppCard } from "./AppCard";

interface AppsDirectoryProps {
  initialApps: PortfolioApp[];
  defaultCategory?: string;
}

const CATEGORIES: ("All" | AppCategory)[] = [
  "All",
  "Games & Interactive Entertainment",
  "Photography, Camera & Personalization",
  "AI & Smart Utilities",
  "Productivity & Document Management",
  "Health & Wellness",
  "Finance & Payments",
  "Home & Lifestyle",
];

export const AppsDirectory: React.FC<AppsDirectoryProps> = ({
  initialApps,
  defaultCategory = "All",
}) => {
  const [apps, setApps] = useState<PortfolioApp[]>(initialApps);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [acquisitionOnly, setAcquisitionOnly] = useState(false);

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Category filter
      if (selectedCategory !== "All" && app.category !== selectedCategory) {
        return false;
      }

      // Open source toggle
      if (openSourceOnly && !app.isOpenSource) {
        return false;
      }

      // Acquisition toggle
      if (acquisitionOnly && !app.acquisitionAvailable) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = app.name.toLowerCase().includes(query);
        const matchesDesc = app.shortDescription.toLowerCase().includes(query);
        const matchesCategory = app.category.toLowerCase().includes(query);
        const matchesPkg = app.packageName.toLowerCase().includes(query);
        const matchesTech = app.techStack.some((t) => t.toLowerCase().includes(query));
        const matchesFeatures = app.keyFeatures.some((f) => f.toLowerCase().includes(query));

        if (
          !matchesName &&
          !matchesDesc &&
          !matchesCategory &&
          !matchesPkg &&
          !matchesTech &&
          !matchesFeatures
        ) {
          return false;
        }
      }

      return true;
    });
  }, [apps, selectedCategory, openSourceOnly, acquisitionOnly, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setOpenSourceOnly(false);
    setAcquisitionOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All" ||
    openSourceOnly ||
    acquisitionOnly;

  return (
    <div className="space-y-8">
      {/* Search and Filters Control Bar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app name, feature, tech stack (e.g. OpenCV, Kotlin, LLM)..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 pl-10 pr-10 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Checkboxes */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 cursor-pointer select-none hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={openSourceOnly}
                onChange={(e) => setOpenSourceOnly(e.target.checked)}
                className="rounded border-neutral-300 text-black focus:ring-black h-3.5 w-3.5"
              />
              <span className="font-medium text-neutral-700 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-neutral-500" />
                Open Source Only
              </span>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 cursor-pointer select-none hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={acquisitionOnly}
                onChange={(e) => setAcquisitionOnly(e.target.checked)}
                className="rounded border-neutral-300 text-black focus:ring-black h-3.5 w-3.5"
              />
              <span className="font-medium text-neutral-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                Acquisition Ready
              </span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-neutral-500 hover:text-black underline px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider / Wrap */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === "All"
                  ? apps.length
                  : apps.filter((a) => a.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                    isSelected
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black"
                  }`}
                >
                  {cat}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <p>
          Showing <span className="font-semibold text-neutral-900">{filteredApps.length}</span>{" "}
          of {apps.length} applications
        </p>
        {selectedCategory !== "All" && (
          <p className="font-medium text-neutral-700">Category: {selectedCategory}</p>
        )}
      </div>

      {/* Applications Grid */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-bold text-base text-neutral-900">No applications matched</h3>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            We couldn&apos;t find any application matching your current search or category filter. Try clearing filters or searching another keyword.
          </p>
          <div className="mt-6">
            <button
              onClick={clearFilters}
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

