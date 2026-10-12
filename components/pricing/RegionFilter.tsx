"use client";

import React from "react";
import { Globe, Check, Sparkles } from "lucide-react";
import { PRICING_REGIONS, PricingRegionCode } from "@/lib/services-pricing";

interface RegionFilterProps {
  currentRegion: PricingRegionCode;
  onSelectRegion: (region: PricingRegionCode) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({
  currentRegion,
  onSelectRegion,
}) => {
  const regions = Object.values(PRICING_REGIONS);
  const activeRegion = PRICING_REGIONS[currentRegion] || PRICING_REGIONS.US;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs mb-10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Info label */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Currency & Region
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                <Sparkles className="w-3 h-3 text-neutral-600" />
                Default: Dollars ($ USD)
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Change region to preview localized pricing, currency symbols, and regional promotional discounts.
            </p>
          </div>
        </div>

        {/* Region Selector Pills / Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="region-selector" className="sr-only">
            Select Your Region
          </label>
          <div className="relative w-full sm:w-auto">
            <select
              id="region-selector"
              value={currentRegion}
              onChange={(e) => onSelectRegion(e.target.value as PricingRegionCode)}
              className="w-full sm:w-auto appearance-none bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-300 text-black text-xs font-semibold py-2.5 pl-3.5 pr-10 rounded-xl cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black focus:border-black transition-all shadow-2xs"
            >
              {regions.map((reg) => (
                <option key={reg.code} value={reg.code}>
                  {reg.flag} {reg.name} ({reg.currency} {reg.currencySymbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick segmented pills for instant switching */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
          Quick select:
        </span>
        {regions.map((reg) => {
          const isSelected = reg.code === currentRegion;
          return (
            <button
              key={reg.code}
              type="button"
              onClick={() => onSelectRegion(reg.code)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              <span>{reg.flag}</span>
              <span>{reg.currency}</span>
              <span className="text-[10px] opacity-80">({reg.currencySymbol})</span>
              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
