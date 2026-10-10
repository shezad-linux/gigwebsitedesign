"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check, Calculator, Sparkles, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXPERT_SERVICES } from "@/lib/services-pricing";
import { CouponDiscountType, ExpertService } from "@/types/services";

interface CouponSimulatorProps {
  onApplyToCheckout?: (service: ExpertService, couponCode: string) => void;
  initialCode?: string;
}

export const CouponSimulator: React.FC<CouponSimulatorProps> = ({
  onApplyToCheckout,
  initialCode = "LAUNCH15",
}) => {
  const [couponCode, setCouponCode] = useState(initialCode);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("career-guidance");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [copied, setCopied] = useState(false);

  // Selected Service
  const selectedService = useMemo(() => {
    return (
      EXPERT_SERVICES.find((s) => s.id === selectedServiceId) ||
      EXPERT_SERVICES[0]
    );
  }, [selectedServiceId]);

  // Original Price
  const originalPrice = selectedService.price;

  // Calculation
  const { discountAmount, customerPays, displayDiscountValue } = useMemo(() => {
    let discount = 0;
    let display = "";

    if (discountType === "percentage") {
      discount = Math.round((originalPrice * discountValue) / 100);
      display = `${discountValue}%`;
    } else {
      discount = Math.min(originalPrice, Math.round(discountValue));
      display = `₹${discountValue.toLocaleString("en-IN")}`;
    }

    const pays = Math.max(0, originalPrice - discount);

    return {
      discountAmount: discount,
      customerPays: pays,
      displayDiscountValue: display,
    };
  }, [originalPrice, discountType, discountValue]);

  const handleCopy = () => {
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode.toUpperCase().trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-100 bg-neutral-50/70 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-black text-white">
                <Calculator className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-black tracking-tight">Coupon Preview</h2>
            </div>
            <p className="text-xs text-neutral-600">
              Try different settings to see how the discount affects checkout.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs">
              Live Interactive Simulator
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (Left) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Coupon Code Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Coupon code
            </label>
            <div className="relative">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. LAUNCH15"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white font-mono text-sm uppercase font-semibold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              <Tag className="absolute right-3.5 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Service
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXPERT_SERVICES.map((s) => {
                const isSelected = s.id === selectedServiceId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-black bg-neutral-900 text-white shadow-sm"
                        : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold leading-tight">{s.title}</span>
                      <span
                        className={`text-xs font-extrabold ml-2 ${
                          isSelected ? "text-white" : "text-black"
                        }`}
                      >
                        ₹{s.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] block mt-1 ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {s.billingUnit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Discount type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100 border border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setDiscountType("percentage");
                  if (discountValue > 100) setDiscountValue(15);
                }}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  discountType === "percentage"
                    ? "bg-white text-black shadow-xs border border-neutral-200"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscountType("fixed");
                  if (discountValue <= 100) setDiscountValue(200);
                }}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  discountType === "fixed"
                    ? "bg-white text-black shadow-xs border border-neutral-200"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Fixed amount (₹)
              </button>
            </div>
          </div>

          {/* Discount Value Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Discount value
              </label>
              <span className="text-base font-extrabold text-black font-mono">
                {displayDiscountValue}
              </span>
            </div>

            {discountType === "percentage" ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>5%</span>
                  <span>15%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>₹50</span>
                  <span>₹200</span>
                  <span>₹500</span>
                  <span>₹1,000</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Calculation Column (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/60 p-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Summary Breakdown
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                {selectedService.title}
              </span>
            </div>

            {/* Calculations Rows */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Original price</span>
                <span className="font-semibold text-black font-mono text-sm">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-black" />
                  Discount ({displayDiscountValue})
                </span>
                <span className="font-bold text-black font-mono text-sm">
                  −₹{discountAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Customer pays
                </span>
                <div className="text-3xl font-extrabold text-black font-mono tracking-tight">
                  ₹{customerPays.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed italic border-t border-neutral-200 pt-3">
              Illustrative calculation before applicable taxes and payment fees. This preview
              does not create a real coupon.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6">
            <Button
              onClick={handleCopy}
              disabled={!couponCode}
              variant="outline"
              className="w-full h-10 text-xs font-semibold border-neutral-300 hover:border-black hover:bg-white text-black flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy coupon code</span>
                </>
              )}
            </Button>

            {onApplyToCheckout && (
              <Button
                onClick={() => onApplyToCheckout(selectedService, couponCode)}
                className="w-full h-10 text-xs font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout with {couponCode || "Discount"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
