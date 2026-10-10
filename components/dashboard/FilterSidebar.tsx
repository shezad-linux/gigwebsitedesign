"use client";

import React from "react";
import { Filter, RotateCcw, Check, Sparkles, Globe, DollarSign, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterState, DEFAULT_FILTERS } from "@/lib/filters";
import { UserProfile } from "@/types/profile";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  availablePlatforms: string[];
  userProfile: UserProfile;
  totalCount: number;
  filteredCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  availablePlatforms,
  userProfile,
  totalCount,
  filteredCount,
}) => {
  const categories = [
    { label: "All Categories", value: "all" },
    { label: "AI Coding", value: "AI Coding" },
    { label: "AI Evaluation", value: "AI Evaluation" },
    { label: "Data Annotation", value: "Data Annotation" },
    { label: "Writing & Content", value: "Writing & Content" },
    { label: "Language & Translation", value: "Language & Translation" },
    { label: "Software & QA Testing", value: "Software & QA Testing" },
  ];

  const handleReset = () => {
    onChange({ ...DEFAULT_FILTERS });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.countryScope !== "all" ||
    filters.remoteOnly !== false ||
    filters.experienceLevel !== "all" ||
    filters.paymentVerification !== "all" ||
    filters.platform !== "all" ||
    filters.minMatchScore > 0;

  return (
    <aside className="w-full bg-white rounded-[14px] border border-neutral-200 p-5 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-black" />
          <h2 className="text-sm font-bold text-black">Filters</h2>
          <span className="text-[11px] text-neutral-500 font-normal">
            ({filteredCount} of {totalCount})
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-black hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Category
        </label>
        <div className="space-y-1">
          {categories.map((c) => {
            const isSelected = filters.category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onChange({ ...filters, category: c.value })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-black text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <span>{c.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Eligibility Filter */}
      <div className="space-y-2 pt-3 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Country Eligibility
        </label>
        <div className="space-y-1.5 text-xs">
          <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
            <input
              type="radio"
              name="countryScope"
              checked={filters.countryScope === "all"}
              onChange={() => onChange({ ...filters, countryScope: "all" })}
              className="accent-black"
            />
            <span>All Listings</span>
          </label>
          <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
            <input
              type="radio"
              name="countryScope"
              checked={filters.countryScope === "eligible-only"}
              onChange={() => onChange({ ...filters, countryScope: "eligible-only" })}
              className="accent-black"
            />
            <span>
              Eligible in <strong className="text-black">{userProfile.country || "My Country"}</strong>
            </span>
          </label>
          <label className="flex items-center gap-2 text-neutral-700 cursor-pointer">
            <input
              type="radio"
              name="countryScope"
              checked={filters.countryScope === "global-only"}
              onChange={() => onChange({ ...filters, countryScope: "global-only" })}
              className="accent-black"
            />
            <span>Worldwide / Global Only</span>
          </label>
        </div>
      </div>

      {/* Payment Verification Filter */}
      <div className="space-y-2 pt-3 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Payment Proof
        </label>
        <select
          value={filters.paymentVerification}
          onChange={(e) => onChange({ ...filters, paymentVerification: e.target.value as any })}
          className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-1 focus:ring-black focus:border-black"
        >
          <option value="all">Any Verification Level</option>
          <option value="verified">Verified Proof Only</option>
          <option value="partial">Partial Verification</option>
          <option value="unverified">Unverified Only</option>
        </select>
      </div>

      {/* Experience Level */}
      <div className="space-y-2 pt-3 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Experience Level
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { label: "All Levels", val: "all" },
            { label: "Entry", val: "entry" },
            { label: "Mid", val: "mid" },
            { label: "Expert", val: "expert" },
          ].map((lvl) => (
            <button
              key={lvl.val}
              type="button"
              onClick={() => onChange({ ...filters, experienceLevel: lvl.val as any })}
              className={`py-1 px-2 rounded text-xs font-medium border text-center transition-colors ${
                filters.experienceLevel === lvl.val
                  ? "bg-black text-white border-black font-bold"
                  : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Filter */}
      <div className="space-y-2 pt-3 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Platform
        </label>
        <select
          value={filters.platform}
          onChange={(e) => onChange({ ...filters, platform: e.target.value })}
          className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 focus:ring-1 focus:ring-black focus:border-black"
        >
          <option value="all">All Platforms ({availablePlatforms.length})</option>
          {availablePlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Match Score Slider */}
      <div className="space-y-2 pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-neutral-500 uppercase tracking-wider">
            Min Match Score
          </label>
          <span className="font-bold text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 font-mono">
            {filters.minMatchScore}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={filters.minMatchScore}
          onChange={(e) => onChange({ ...filters, minMatchScore: Number(e.target.value) })}
          className="w-full accent-black cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
          <span>0% (All)</span>
          <span>50%</span>
          <span>90% (Top Fit)</span>
        </div>
      </div>

      {/* Remote Only Checkbox */}
      <div className="pt-3 border-t border-neutral-100">
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(e) => onChange({ ...filters, remoteOnly: e.target.checked })}
            className="rounded accent-black"
          />
          <span>Remote-only opportunities</span>
        </label>
      </div>
    </aside>
  );
};
