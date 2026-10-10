"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpertService, CouponValidationResult, ServiceOrder } from "@/types/services";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ExpertService | null;
  initialCouponCode?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  service,
  initialCouponCode = "",
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<ServiceOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync initial coupon code when opening modal
  useEffect(() => {
    if (isOpen && initialCouponCode) {
      setCouponCode(initialCouponCode);
      if (service) {
        validateCoupon(initialCouponCode, service.id);
      }
    }
  }, [isOpen, initialCouponCode, service]);

  if (!isOpen || !service) return null;

  const validateCoupon = async (codeToTest: string, serviceId: string) => {
    if (!codeToTest.trim()) {
      setCouponResult(null);
      setCouponError(null);
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToTest.trim(),
          serviceId,
          isFirstPurchase: true,
        }),
      });

      const data: CouponValidationResult = await res.json();
      if (data.valid) {
        setCouponResult(data);
        setCouponError(null);
      } else {
        setCouponResult(null);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err: any) {
      setCouponError("Unable to validate coupon at this time.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      validateCoupon(couponCode, service.id);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    setCouponError(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setSubmitError("Please fill in your name and email address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerNotes: customerNotes.trim() || undefined,
          couponCode: couponResult?.coupon?.code || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompletedOrder(data.order);
      } else {
        setSubmitError(data.error || "Failed to process order.");
      }
    } catch (err: any) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const originalPrice = service.price;
  const discountAmount = couponResult ? couponResult.discountAmount : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black tracking-tight">
                {completedOrder ? "Order Confirmed" : "Book Expert Service"}
              </h3>
              <p className="text-xs text-neutral-500">
                {completedOrder ? "Your request has been placed" : service.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {completedOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-black tracking-tight">
                  Thank You, {completedOrder.customerName}!
                </h4>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Your order has been recorded. Our industry expert will review your profile and contact you at{" "}
                  <strong className="text-black font-semibold">{completedOrder.customerEmail}</strong> within 24 hours.
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 text-left text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-500">Order Number:</span>
                  <span className="font-bold text-black">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Service:</span>
                  <span className="font-semibold text-black">{completedOrder.serviceName}</span>
                </div>
                {completedOrder.couponCode && (
                  <div className="flex justify-between text-neutral-800">
                    <span>Coupon Applied:</span>
                    <span>{completedOrder.couponCode} (−₹{completedOrder.discountAmount})</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-extrabold text-black">
                  <span>Total Paid:</span>
                  <span>₹{completedOrder.finalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button
                  onClick={onClose}
                  className="bg-black text-white hover:bg-neutral-800 px-6 h-10 text-xs font-semibold rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Order Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Service Header Info */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-black text-sm">{service.title}</h4>
                  <p className="text-xs text-neutral-600">{service.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-black font-mono">
                    ₹{service.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] block text-neutral-600">{service.billingUnit}</span>
                </div>
              </div>

              {/* Contact Information Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Target Role or Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Targeting AI Evaluation or Python Code Review gigs on Outlier/DataAnnotation..."
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Have a Coupon Code?
                </label>

                {couponResult ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-black" />
                      <div>
                        <span className="font-bold text-black font-mono">{couponResult.coupon?.code}</span>
                        <span className="text-neutral-600 ml-2">
                          ({couponResult.savingsText})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-neutral-600 hover:text-black underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g. LAUNCH15)"
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-xs uppercase text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      variant="outline"
                      className="h-10 text-xs font-semibold px-4 border-neutral-300 hover:border-black"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-neutral-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-neutral-500" />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Original Price</span>
                  <span className="font-mono font-semibold text-black">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-black font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount Applied
                    </span>
                    <span className="font-mono font-bold">
                      −₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-bold text-black">
                  <span>Customer Pays</span>
                  <span className="text-base font-extrabold font-mono">
                    ₹{finalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Security and Submit button */}
              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm & Book for ₹{finalPrice.toLocaleString("en-IN")}</span>
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-neutral-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Server-verified price calculation · 100% Satisfaction Guarantee
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
