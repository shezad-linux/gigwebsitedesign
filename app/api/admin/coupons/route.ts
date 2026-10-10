import { NextRequest, NextResponse } from "next/server";
import {
  getStoredCoupons,
  upsertCoupon,
  deleteStoredCoupon,
  getStoredOrders,
} from "@/lib/services-pricing";
import { Coupon } from "@/types/services";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = getStoredCoupons();
    const orders = getStoredOrders();

    const totalRedemptions = orders.filter((o) => !!o.couponCode).length;
    const totalDiscountGiven = orders.reduce((acc, o) => acc + (o.discountAmount || 0), 0);
    const totalCouponRevenue = orders
      .filter((o) => !!o.couponCode)
      .reduce((acc, o) => acc + (o.finalPrice || 0), 0);
    const activeCouponsCount = coupons.filter((c) => c.isActive).length;

    return NextResponse.json({
      success: true,
      coupons,
      orders,
      metrics: {
        totalCoupons: coupons.length,
        activeCoupons: activeCouponsCount,
        totalRedemptions,
        totalDiscountGiven,
        totalCouponRevenue,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      maxDiscountCap,
      minOrderAmount,
      startsAt,
      expiresAt,
      maxRedemptions,
      perUserLimit,
      applicableServices,
      firstPurchaseOnly,
      isActive,
      description,
      restrictionNote,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    if (!discountType || !["percentage", "fixed"].includes(discountType)) {
      return NextResponse.json(
        { error: "Discount type must be 'percentage' or 'fixed'." },
        { status: 400 }
      );
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be a positive number." },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && numValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const newCoupon: Coupon = {
      id: body.id || `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: numValue,
      maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : undefined,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      startsAt: startsAt || new Date().toISOString(),
      expiresAt: expiresAt || undefined,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      redemptionsCount: body.redemptionsCount || 0,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      applicableServices: Array.isArray(applicableServices) ? applicableServices : [],
      firstPurchaseOnly: Boolean(firstPurchaseOnly),
      isActive: isActive !== false,
      description: description ? description.trim() : undefined,
      restrictionNote: restrictionNote ? restrictionNote.trim() : undefined,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = upsertCoupon(newCoupon);

    return NextResponse.json(
      {
        success: true,
        message: `Coupon ${newCoupon.code} saved successfully.`,
        coupon: newCoupon,
        coupons: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required for deletion." },
        { status: 400 }
      );
    }

    const updated = deleteStoredCoupon(id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully.",
      coupons: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
