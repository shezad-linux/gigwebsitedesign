"use client";

import React, { useState } from "react";
import { Copy, Check, Tag, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LaunchCouponItem {
  code: string;
  offer: string;
  restriction: string;
  description: string;
  recommendedService?: string;
}

const LAUNCH_COUPONS: LaunchCouponItem[] = [
  {
    code: "WELCOME10",
    offer: "10% off",
    restriction: "First purchase",
    description: "Applies to any service for new users.",
  },
  {
    code: "LAUNCH15",
    offer: "15% off",
    restriction: "Limited launch period",
    description: "Universal launch promotion during early rollout.",
  },
  {
    code: "STUDENT200",
    offer: "₹200 off",
    restriction: "Verified students",
    description: "Flat fee reduction on orders of ₹700 or more.",
  },
  {
    code: "CAREER20",
    offer: "20% off",
    restriction: "Career Accelerator only",
    description: "Maximum discount on our complete combined premium package.",
    recommendedService: "career-accelerator",
  },
  {
    code: "RETURN10",
    offer: "10% off",
    restriction: "Eligible returning customers",
    description: "Loyalty voucher for follow-up mentoring or second reviews.",
  },
];

interface LaunchCouponsTableProps {
  onSelectCoupon?: (code: string) => void;
}

export const LaunchCouponsTable: React.FC<LaunchCouponsTableProps> = ({
  onSelectCoupon,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <h3 className="text-lg font-bold text-black tracking-tight">Suggested Launch Coupons</h3>
          </div>
          <p className="text-xs text-neutral-600 mt-0.5">
            Pre-configured promotional codes available for checkout and preview simulation.
          </p>
        </div>
        <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
          Official Offers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3 px-6">Code</th>
              <th className="py-3 px-6">Offer</th>
              <th className="py-3 px-6">Suggested restriction</th>
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {LAUNCH_COUPONS.map((coupon) => {
              const isCopied = copiedCode === coupon.code;

              return (
                <tr key={coupon.code} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 font-mono font-bold text-black text-xs">
                      <Tag className="w-3 h-3 text-neutral-500" />
                      <span>{coupon.code}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-black font-mono">
                    {coupon.offer}
                  </td>
                  <td className="py-4 px-6 text-neutral-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium">
                      {coupon.restriction}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-600">
                    {coupon.description}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-neutral-200 hover:border-black bg-white text-black transition-all"
                        title="Copy code"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-black" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      {onSelectCoupon && (
                        <button
                          onClick={() => onSelectCoupon(coupon.code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-black text-white hover:bg-neutral-800 transition-all"
                        >
                          <span>Apply</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <p className="text-[11px] text-neutral-500 text-center">
          These are suggested campaign codes. Coupons are validated and applied on the server during checkout.
        </p>
      </div>
    </div>
  );
};
