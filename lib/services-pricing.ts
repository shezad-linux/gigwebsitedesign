import {
  ExpertService,
  Coupon,
  CouponValidationResult,
  ServiceOrder,
  CouponUsageReportItem,
} from "@/types/services";

export const EXPERT_SERVICES: ExpertService[] = [
  {
    id: "expert-resume-review",
    title: "Expert Resume Review",
    subtitle: "Manual review by an industry expert",
    price: 799,
    currency: "INR",
    currencySymbol: "₹",
    billingUnit: "per review",
    features: [
      "Detailed feedback on resume structure, skills, and achievements.",
      "Role-specific improvement recommendations.",
      "ATS compatibility and formatting review.",
      "One follow-up review.",
    ],
    recommendedRole: "Students & Early-Career Applicants",
  },
  {
    id: "expert-resume-creation",
    title: "Expert Resume Creation",
    subtitle: "A new, professionally written resume",
    price: 1499,
    currency: "INR",
    currencySymbol: "₹",
    billingUnit: "per resume",
    features: [
      "Personalized information collection.",
      "Resume tailored to a target role or gig category.",
      "PDF and editable document.",
      "One revision.",
    ],
    recommendedRole: "Transitioning to AI & Tech Gigs",
  },
  {
    id: "career-guidance",
    title: "Expert Career Guidance",
    subtitle: "Personalized mentoring session",
    price: 1199,
    currency: "INR",
    currencySymbol: "₹",
    billingUnit: "per session",
    features: [
      "One-to-one industry expert consultation.",
      "Skill-gap and career-readiness assessment.",
      "Recommended skills, projects, and learning resources.",
      "Personalized job-search action plan.",
    ],
    recommendedRole: "1-on-1 Consultation & Skill Strategy",
  },
  {
    id: "career-accelerator",
    title: "Career Accelerator",
    subtitle: "Combined premium support package",
    price: 3499,
    currency: "INR",
    currencySymbol: "₹",
    billingUnit: "per package",
    popularBadge: "Recommended · Best Value",
    features: [
      "Expert resume review or creation.",
      "Personalized gig matching and eligibility review.",
      "Skill-development roadmap.",
      "One expert mentoring session.",
      "Application preparation and tracking.",
    ],
    recommendedRole: "Full Career & Application Acceleration",
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "cpn_welcome10",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountCap: 500,
    minOrderAmount: 0,
    startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 1000,
    redemptionsCount: 84,
    perUserLimit: 1,
    applicableServices: [],
    firstPurchaseOnly: true,
    isActive: true,
    description: "10% off for your first purchase.",
    restrictionNote: "First purchase",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cpn_launch15",
    code: "LAUNCH15",
    discountType: "percentage",
    discountValue: 15,
    maxDiscountCap: 600,
    minOrderAmount: 0,
    startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 500,
    redemptionsCount: 142,
    perUserLimit: 1,
    applicableServices: [],
    firstPurchaseOnly: false,
    isActive: true,
    description: "15% off during the limited launch period.",
    restrictionNote: "Limited launch period",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cpn_student200",
    code: "STUDENT200",
    discountType: "fixed",
    discountValue: 200,
    minOrderAmount: 700,
    startsAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 2000,
    redemptionsCount: 215,
    perUserLimit: 1,
    applicableServices: [],
    firstPurchaseOnly: false,
    isActive: true,
    description: "₹200 discount for verified students.",
    restrictionNote: "Verified students",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cpn_career20",
    code: "CAREER20",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountCap: 1000,
    minOrderAmount: 3000,
    startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 300,
    redemptionsCount: 46,
    perUserLimit: 1,
    applicableServices: ["career-accelerator"],
    firstPurchaseOnly: false,
    isActive: true,
    description: "20% off the Career Accelerator premium package.",
    restrictionNote: "Career Accelerator only",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cpn_return10",
    code: "RETURN10",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountCap: 400,
    minOrderAmount: 0,
    startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 800,
    redemptionsCount: 39,
    perUserLimit: 2,
    applicableServices: [],
    firstPurchaseOnly: false,
    isActive: true,
    description: "10% loyalty discount for returning customers.",
    restrictionNote: "Eligible returning customers",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: "ord_101",
    orderNumber: "GM-ORD-2025-0101",
    customerName: "Rohan Sharma",
    customerEmail: "rohan.sharma@example.com",
    serviceId: "expert-resume-review",
    serviceName: "Expert Resume Review",
    originalPrice: 799,
    couponCode: "WELCOME10",
    discountAmount: 80,
    finalPrice: 719,
    currency: "INR",
    status: "completed",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_102",
    orderNumber: "GM-ORD-2025-0102",
    customerName: "Priya Nair",
    customerEmail: "priya.nair@example.com",
    serviceId: "career-guidance",
    serviceName: "Expert Career Guidance",
    originalPrice: 1199,
    couponCode: "LAUNCH15",
    discountAmount: 180,
    finalPrice: 1019,
    currency: "INR",
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_103",
    orderNumber: "GM-ORD-2025-0103",
    customerName: "Aman Verma",
    customerEmail: "aman.v@example.com",
    serviceId: "career-accelerator",
    serviceName: "Career Accelerator",
    originalPrice: 3499,
    couponCode: "CAREER20",
    discountAmount: 700,
    finalPrice: 2799,
    currency: "INR",
    status: "completed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_104",
    orderNumber: "GM-ORD-2025-0104",
    customerName: "Sneha Patel",
    customerEmail: "sneha.p@example.com",
    serviceId: "expert-resume-creation",
    serviceName: "Expert Resume Creation",
    originalPrice: 1499,
    couponCode: "STUDENT200",
    discountAmount: 200,
    finalPrice: 1299,
    currency: "INR",
    status: "completed",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const STORAGE_KEYS = {
  COUPONS: "gigmatcher_coupons_v1",
  ORDERS: "gigmatcher_service_orders_v1",
};

/**
 * Server-authoritative calculation of coupon discount and final price.
 * SECURITY: Always execute this calculation on the server. Never trust client-supplied discount amounts.
 */
export function calculateCouponDiscount(
  coupon: Coupon | null | undefined,
  service: ExpertService,
  context?: {
    isFirstPurchase?: boolean;
    now?: Date;
  }
): CouponValidationResult {
  const originalPrice = service.price;
  const now = context?.now || new Date();

  // Baseline no coupon
  if (!coupon || !coupon.code) {
    return {
      valid: false,
      error: "No coupon provided.",
      service: {
        id: service.id,
        title: service.title,
        originalPrice,
      },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "No discount applied",
    };
  }

  // 1. Active status check
  if (!coupon.isActive) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is currently disabled or inactive.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Coupon inactive",
    };
  }

  // 2. Start date check
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is not yet active.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Coupon not started",
    };
  }

  // 3. Expiration date check
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" has expired.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Coupon expired",
    };
  }

  // 4. Total redemption limit check
  if (
    coupon.maxRedemptions &&
    coupon.redemptionsCount >= coupon.maxRedemptions
  ) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" has reached its maximum redemption limit.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Redemption limit reached",
    };
  }

  // 5. Minimum order amount check
  if (coupon.minOrderAmount && originalPrice < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrderAmount}.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Below minimum order amount",
    };
  }

  // 6. Service restriction check
  if (
    coupon.applicableServices &&
    coupon.applicableServices.length > 0 &&
    !coupon.applicableServices.includes(service.id)
  ) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is not valid for ${service.title}. It applies only to designated packages.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "Service not eligible",
    };
  }

  // 7. First purchase restriction check
  if (coupon.firstPurchaseOnly && context?.isFirstPurchase === false) {
    return {
      valid: false,
      error: `Coupon "${coupon.code}" is reserved for first-time customers only.`,
      service: { id: service.id, title: service.title, originalPrice },
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      currency: service.currency,
      currencySymbol: service.currencySymbol,
      savingsText: "First-purchase only",
    };
  }

  // 8. Calculate Discount
  let rawDiscount = 0;
  let savingsText = "";

  if (coupon.discountType === "percentage") {
    rawDiscount = Math.round((originalPrice * coupon.discountValue) / 100);
    // Apply cap if present
    if (coupon.maxDiscountCap && rawDiscount > coupon.maxDiscountCap) {
      rawDiscount = coupon.maxDiscountCap;
      savingsText = `${coupon.discountValue}% off (capped at ₹${coupon.maxDiscountCap})`;
    } else {
      savingsText = `${coupon.discountValue}% off`;
    }
  } else {
    // Fixed amount discount in INR
    rawDiscount = Math.min(originalPrice, Math.round(coupon.discountValue));
    savingsText = `₹${rawDiscount} off`;
  }

  const discountAmount = Math.max(0, Math.min(rawDiscount, originalPrice));
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
      maxDiscountCap: coupon.maxDiscountCap,
    },
    service: {
      id: service.id,
      title: service.title,
      originalPrice,
    },
    originalPrice,
    discountAmount,
    finalPrice,
    currency: service.currency,
    currencySymbol: service.currencySymbol,
    savingsText,
  };
}

/**
 * Storage / Client helpers
 */
export function getStoredCoupons(): Coupon[] {
  if (typeof window === "undefined") return INITIAL_COUPONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw) as Coupon[];
  } catch (err) {
    console.error("Failed to read coupons from storage:", err);
    return INITIAL_COUPONS;
  }
}

export function saveStoredCoupons(coupons: Coupon[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new Event("gigmatcher_coupons_updated"));
  } catch (err) {
    console.error("Failed to save coupons to storage:", err);
  }
}

export function upsertCoupon(coupon: Coupon): Coupon[] {
  const current = getStoredCoupons();
  const normalizedCode = coupon.code.trim().toUpperCase();
  const index = current.findIndex(
    (c) => c.id === coupon.id || c.code.toUpperCase() === normalizedCode
  );

  let updated: Coupon[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = {
      ...coupon,
      code: normalizedCode,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated = [
      {
        ...coupon,
        code: normalizedCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  saveStoredCoupons(updated);
  return updated;
}

export function deleteStoredCoupon(couponId: string): Coupon[] {
  const current = getStoredCoupons();
  const updated = current.filter((c) => c.id !== couponId);
  saveStoredCoupons(updated);
  return updated;
}

export function getStoredOrders(): ServiceOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw) as ServiceOrder[];
  } catch (err) {
    console.error("Failed to read orders from storage:", err);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: ServiceOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new Event("gigmatcher_orders_updated"));
  } catch (err) {
    console.error("Failed to save orders to storage:", err);
  }
}

export function recordNewOrder(order: Omit<ServiceOrder, "id" | "orderNumber" | "createdAt">): ServiceOrder {
  const currentOrders = getStoredOrders();
  const orderNumber = `GM-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: ServiceOrder = {
    ...order,
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderNumber,
    createdAt: new Date().toISOString(),
  };

  const updatedOrders = [newOrder, ...currentOrders];
  saveStoredOrders(updatedOrders);

  // If a coupon was used, increment its redemption count
  if (order.couponCode) {
    const coupons = getStoredCoupons();
    const cIndex = coupons.findIndex(
      (c) => c.code.toUpperCase() === order.couponCode?.toUpperCase()
    );
    if (cIndex >= 0) {
      coupons[cIndex].redemptionsCount = (coupons[cIndex].redemptionsCount || 0) + 1;
      saveStoredCoupons(coupons);
    }
  }

  return newOrder;
}
