import { NextRequest, NextResponse } from "next/server";
import {
  EXPERT_SERVICES,
  getStoredCoupons,
  calculateCouponDiscount,
  recordNewOrder,
} from "@/lib/services-pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendOrderConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit checkout requests: 10 per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`checkout-order:${clientIp}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 10,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      couponCode,
    } = body;

    // Validation
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service selection is required." },
        { status: 400 }
      );
    }

    const service = EXPERT_SERVICES.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { error: `Invalid service "${serviceId}".` },
        { status: 404 }
      );
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!customerEmail || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // SECURITY: Authoritative Server Price Recalculation
    let discountAmount = 0;
    let validatedCouponCode: string | undefined = undefined;

    if (couponCode && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const allCoupons = getStoredCoupons();
      const matchedCoupon = allCoupons.find(
        (c) => c.code.toUpperCase() === normalizedCode
      );

      if (matchedCoupon) {
        const validation = calculateCouponDiscount(matchedCoupon, service, {
          isFirstPurchase: true,
          now: new Date(),
        });

        if (validation.valid) {
          discountAmount = validation.discountAmount;
          validatedCouponCode = matchedCoupon.code;
        }
      }
    }

    const originalPrice = service.price;
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    // Save order
    const order = recordNewOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      customerNotes: customerNotes ? customerNotes.trim() : undefined,
      serviceId: service.id,
      serviceName: service.title,
      originalPrice,
      couponCode: validatedCouponCode,
      discountAmount,
      finalPrice,
      currency: "INR",
      status: "completed",
    });

    // Dispatch transactional email (receipt + expert assignment notice)
    let emailDelivery: { success: boolean; simulated?: boolean; error?: string } = {
      success: true,
      simulated: true,
    };

    try {
      emailDelivery = await sendOrderConfirmation({
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        serviceName: order.serviceName,
        originalPrice: order.originalPrice,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        finalPrice: order.finalPrice,
        currency: order.currency,
        orderDate: order.createdAt,
        customerNotes: order.customerNotes,
      });
    } catch (emailErr: any) {
      console.error("Non-fatal: Failed to dispatch order confirmation email:", emailErr);
      emailDelivery = { success: false, error: emailErr?.message };
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully! An expert has been assigned to your request.",
        order,
        emailDelivery,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process order." },
      { status: 500 }
    );
  }
}
