import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Expert Services, Pricing & Server Coupon Calculation Suite", () => {
  // Service definition tests
  const EXPERT_SERVICES = [
    {
      id: "expert-resume-review",
      title: "Expert Resume Review",
      price: 799,
      billingUnit: "per review",
    },
    {
      id: "expert-resume-creation",
      title: "Expert Resume Creation",
      price: 1499,
      billingUnit: "per resume",
    },
    {
      id: "career-guidance",
      title: "Expert Career Guidance",
      price: 1199,
      billingUnit: "per session",
    },
    {
      id: "career-accelerator",
      title: "Career Accelerator",
      price: 3499,
      billingUnit: "per package",
    },
  ];

  function calculateCouponDiscount(coupon, service, context) {
    const originalPrice = service.price;
    const now = context?.now || new Date();

    if (!coupon || !coupon.code) {
      return {
        valid: false,
        error: "No coupon provided.",
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" is currently disabled or inactive.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" is not yet active.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" has expired.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (coupon.maxRedemptions && coupon.redemptionsCount >= coupon.maxRedemptions) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" has reached its maximum redemption limit.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (coupon.minOrderAmount && originalPrice < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrderAmount}.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (
      coupon.applicableServices &&
      coupon.applicableServices.length > 0 &&
      !coupon.applicableServices.includes(service.id)
    ) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" is not valid for ${service.title}.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    if (coupon.firstPurchaseOnly && context?.isFirstPurchase === false) {
      return {
        valid: false,
        error: `Coupon "${coupon.code}" is reserved for first-time customers only.`,
        originalPrice,
        discountAmount: 0,
        finalPrice: originalPrice,
      };
    }

    let rawDiscount = 0;
    if (coupon.discountType === "percentage") {
      rawDiscount = Math.round((originalPrice * coupon.discountValue) / 100);
      if (coupon.maxDiscountCap && rawDiscount > coupon.maxDiscountCap) {
        rawDiscount = coupon.maxDiscountCap;
      }
    } else {
      rawDiscount = Math.min(originalPrice, Math.round(coupon.discountValue));
    }

    const discountAmount = Math.max(0, Math.min(rawDiscount, originalPrice));
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      valid: true,
      originalPrice,
      discountAmount,
      finalPrice,
    };
  }

  test("verifies core 4 service tiers, pricing, and billing units", () => {
    assert.equal(EXPERT_SERVICES.length, 4);

    const review = EXPERT_SERVICES.find((s) => s.id === "expert-resume-review");
    assert.equal(review?.price, 799);
    assert.equal(review?.billingUnit, "per review");

    const creation = EXPERT_SERVICES.find((s) => s.id === "expert-resume-creation");
    assert.equal(creation?.price, 1499);
    assert.equal(creation?.billingUnit, "per resume");

    const guidance = EXPERT_SERVICES.find((s) => s.id === "career-guidance");
    assert.equal(guidance?.price, 1199);
    assert.equal(guidance?.billingUnit, "per session");

    const accelerator = EXPERT_SERVICES.find((s) => s.id === "career-accelerator");
    assert.equal(accelerator?.price, 3499);
    assert.equal(accelerator?.billingUnit, "per package");
  });

  test("calculates percentage discount accurately (e.g. 15% on ₹1,199 -> ₹180 discount, ₹1,019 final price)", () => {
    const service = { id: "career-guidance", title: "Career Guidance", price: 1199 };
    const coupon = {
      code: "LAUNCH15",
      discountType: "percentage",
      discountValue: 15,
      isActive: true,
    };

    const res = calculateCouponDiscount(coupon, service);
    assert.equal(res.valid, true);
    assert.equal(res.originalPrice, 1199);
    assert.equal(res.discountAmount, 180);
    assert.equal(res.finalPrice, 1019);
  });

  test("calculates fixed amount discount accurately (e.g. ₹200 on ₹1,499 -> ₹1,299 final price)", () => {
    const service = { id: "expert-resume-creation", title: "Resume Creation", price: 1499 };
    const coupon = {
      code: "STUDENT200",
      discountType: "fixed",
      discountValue: 200,
      isActive: true,
    };

    const res = calculateCouponDiscount(coupon, service);
    assert.equal(res.valid, true);
    assert.equal(res.originalPrice, 1499);
    assert.equal(res.discountAmount, 200);
    assert.equal(res.finalPrice, 1299);
  });

  test("enforces maximum discount cap on percentage coupons", () => {
    const service = { id: "career-accelerator", title: "Career Accelerator", price: 3499 };
    const coupon = {
      code: "CAPPED20",
      discountType: "percentage",
      discountValue: 20, // 20% of 3499 = 700
      maxDiscountCap: 500, // Capped at 500
      isActive: true,
    };

    const res = calculateCouponDiscount(coupon, service);
    assert.equal(res.valid, true);
    assert.equal(res.discountAmount, 500); // Capped from 700 to 500
    assert.equal(res.finalPrice, 2999);
  });

  test("enforces minimum order amount restriction", () => {
    const lowPriceService = { id: "expert-resume-review", title: "Resume Review", price: 799 };
    const coupon = {
      code: "HIGHORDER",
      discountType: "fixed",
      discountValue: 300,
      minOrderAmount: 2000,
      isActive: true,
    };

    const res = calculateCouponDiscount(coupon, lowPriceService);
    assert.equal(res.valid, false);
    assert.match(res.error, /minimum order value/i);
    assert.equal(res.finalPrice, 799);
  });

  test("rejects expired coupons gracefully", () => {
    const service = { id: "career-guidance", title: "Career Guidance", price: 1199 };
    const expiredCoupon = {
      code: "EXPIRED_TEST",
      discountType: "percentage",
      discountValue: 15,
      expiresAt: "2024-01-01T00:00:00Z",
      isActive: true,
    };

    const res = calculateCouponDiscount(expiredCoupon, service);
    assert.equal(res.valid, false);
    assert.match(res.error, /expired/i);
    assert.equal(res.finalPrice, 1199);
  });

  test("rejects inactive coupons", () => {
    const service = { id: "career-guidance", title: "Career Guidance", price: 1199 };
    const inactiveCoupon = {
      code: "DISABLED",
      discountType: "percentage",
      discountValue: 15,
      isActive: false,
    };

    const res = calculateCouponDiscount(inactiveCoupon, service);
    assert.equal(res.valid, false);
    assert.match(res.error, /disabled or inactive/i);
  });

  test("enforces applicable service constraints (e.g. CAREER20 restricted to career-accelerator)", () => {
    const wrongService = { id: "expert-resume-review", title: "Resume Review", price: 799 };
    const targetedService = { id: "career-accelerator", title: "Career Accelerator", price: 3499 };

    const coupon = {
      code: "CAREER20",
      discountType: "percentage",
      discountValue: 20,
      applicableServices: ["career-accelerator"],
      isActive: true,
    };

    // Attempt on wrong service
    const wrongRes = calculateCouponDiscount(coupon, wrongService);
    assert.equal(wrongRes.valid, false);
    assert.match(wrongRes.error, /not valid for/i);

    // Attempt on targeted service
    const correctRes = calculateCouponDiscount(coupon, targetedService);
    assert.equal(correctRes.valid, true);
    assert.equal(correctRes.discountAmount, 700);
    assert.equal(correctRes.finalPrice, 2799);
  });

  test("enforces first-purchase restriction", () => {
    const service = { id: "expert-resume-review", title: "Resume Review", price: 799 };
    const coupon = {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: 10,
      firstPurchaseOnly: true,
      isActive: true,
    };

    // Returning user
    const returningRes = calculateCouponDiscount(coupon, service, { isFirstPurchase: false });
    assert.equal(returningRes.valid, false);
    assert.match(returningRes.error, /first-time customers/i);

    // First time user
    const firstRes = calculateCouponDiscount(coupon, service, { isFirstPurchase: true });
    assert.equal(firstRes.valid, true);
    assert.equal(firstRes.discountAmount, 80);
    assert.equal(firstRes.finalPrice, 719);
  });

  test("enforces maximum total redemptions limit", () => {
    const service = { id: "career-guidance", title: "Career Guidance", price: 1199 };
    const exhaustedCoupon = {
      code: "LIMITED_MAX",
      discountType: "fixed",
      discountValue: 200,
      maxRedemptions: 50,
      redemptionsCount: 50,
      isActive: true,
    };

    const res = calculateCouponDiscount(exhaustedCoupon, service);
    assert.equal(res.valid, false);
    assert.match(res.error, /maximum redemption limit/i);
  });

  test("never allows final price to become negative", () => {
    const cheapService = { id: "micro-audit", title: "Micro Audit", price: 100 };
    const bigCoupon = {
      code: "GIANT500",
      discountType: "fixed",
      discountValue: 500,
      isActive: true,
    };

    const res = calculateCouponDiscount(bigCoupon, cheapService);
    assert.equal(res.valid, true);
    assert.equal(res.discountAmount, 100);
    assert.equal(res.finalPrice, 0);
  });
});
