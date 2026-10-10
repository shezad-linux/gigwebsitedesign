import { NextRequest, NextResponse } from "next/server";
import {
  EXPERT_SERVICES,
  INITIAL_COUPONS,
  calculateCouponDiscount,
  getStoredCoupons,
} from "@/lib/services-pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 30 requests per minute per IP to prevent coupon enumeration
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`coupon-validate:${clientIp}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 30,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many coupon validation requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const { code, serviceId, isFirstPurchase } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service identifier is required." },
        { status: 400 }
      );
    }

    const service = EXPERT_SERVICES.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { error: `Unknown service "${serviceId}".` },
        { status: 404 }
      );
    }

    // Clean normalized coupon code
    const rawCode = (code || "").toString().trim().toUpperCase();

    if (!rawCode) {
      // Empty code returns standard retail price
      return NextResponse.json({
        valid: false,
        error: "Please enter a coupon code.",
        service: {
          id: service.id,
          title: service.title,
          originalPrice: service.price,
        },
        originalPrice: service.price,
        discountAmount: 0,
        finalPrice: service.price,
        currency: service.currency,
        currencySymbol: service.currencySymbol,
        savingsText: "No discount",
      });
    }

    // Lookup coupon in current list (supports dynamic admin additions)
    const allCoupons = getStoredCoupons();
    const matchedCoupon = allCoupons.find(
      (c) => c.code.toUpperCase() === rawCode
    );

    if (!matchedCoupon) {
      return NextResponse.json(
        {
          valid: false,
          error: `Invalid coupon code "${rawCode}". Please check for typos.`,
          service: {
            id: service.id,
            title: service.title,
            originalPrice: service.price,
          },
          originalPrice: service.price,
          discountAmount: 0,
          finalPrice: service.price,
          currency: service.currency,
          currencySymbol: service.currencySymbol,
          savingsText: "Invalid code",
        },
        { status: 200 }
      );
    }

    // SECURITY: Authoritative server calculation
    const calculation = calculateCouponDiscount(matchedCoupon, service, {
      isFirstPurchase: isFirstPurchase !== false,
      now: new Date(),
    });

    return NextResponse.json(calculation, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
