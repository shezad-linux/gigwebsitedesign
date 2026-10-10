"use client";

import React from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPERT_SERVICES } from "@/lib/services-pricing";
import { ExpertService } from "@/types/services";

interface PricingCardsProps {
  onSelectService: (service: ExpertService) => void;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ onSelectService }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {EXPERT_SERVICES.map((service) => {
        const isFeatured = service.id === "career-accelerator";

        return (
          <div
            key={service.id}
            className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 bg-white ${
              isFeatured
                ? "border-black shadow-lg ring-1 ring-black"
                : "border-neutral-200 shadow-sm hover:border-neutral-400 hover:shadow-md"
            }`}
          >
            {/* Top Badges */}
            <div>
              {service.popularBadge && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black text-white">
                    <Sparkles className="w-3 h-3 text-white" />
                    {service.popularBadge}
                  </span>
                </div>
              )}

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-black tracking-tight">{service.title}</h3>
              <p className="text-xs text-neutral-600 mt-1 min-h-[32px]">{service.subtitle}</p>

              {/* Price */}
              <div className="mt-5 mb-6 pb-5 border-b border-neutral-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-black tracking-tight">
                    ₹{service.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-medium text-neutral-600">
                    /{service.billingUnit.replace("per ", "")}
                  </span>
                </div>
                {service.recommendedRole && (
                  <p className="text-[11px] font-medium text-neutral-600 mt-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-neutral-800" />
                    {service.recommendedRole}
                  </p>
                )}
              </div>

              {/* Feature Points */}
              <div className="space-y-3 mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  What is included:
                </p>
                <ul className="space-y-2.5">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 leading-relaxed">
                      <div className="mt-0.5 rounded-full p-0.5 bg-neutral-100 border border-neutral-300 text-black shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-neutral-100 mt-auto">
              <Button
                onClick={() => onSelectService(service)}
                className={`w-full h-11 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isFeatured
                    ? "bg-black text-white hover:bg-neutral-800 shadow-sm"
                    : "bg-white text-black border border-black hover:bg-neutral-50"
                }`}
              >
                <span>Book {service.title.replace("Expert ", "")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <p className="text-[10px] text-center text-neutral-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Manual review by verified industry expert
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
