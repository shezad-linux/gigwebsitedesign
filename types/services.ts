export type CouponDiscountType = "percentage" | "fixed";

export interface ExpertService {
  id: string;
  title: string;
  subtitle: string;
  price: number; // in INR
  currency: string; // "INR"
  currencySymbol: string; // "₹"
  billingUnit: string; // "per review", "per resume", "per session", "per package"
  features: string[];
  popularBadge?: string;
  recommendedRole?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number; // e.g. 15 for 15% or 200 for ₹200
  maxDiscountCap?: number; // optional max discount in INR for percentage
  minOrderAmount?: number; // optional min order amount in INR
  startsAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  maxRedemptions?: number;
  redemptionsCount: number;
  perUserLimit?: number;
  applicableServices: string[]; // empty array means applicable to all services
  firstPurchaseOnly?: boolean;
  isActive: boolean;
  description?: string;
  restrictionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationRequest {
  code: string;
  serviceId: string;
  userEmail?: string;
  isFirstPurchase?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: {
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    description?: string;
    maxDiscountCap?: number;
  };
  service: {
    id: string;
    title: string;
    originalPrice: number;
  };
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  currencySymbol: string;
  savingsText: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerNotes?: string;
  serviceId: string;
  serviceName: string;
  originalPrice: number;
  couponCode?: string;
  discountAmount: number;
  finalPrice: number;
  currency: string;
  status: "pending" | "completed" | "refunded";
  createdAt: string;
}

export interface CouponUsageReportItem {
  id: string;
  orderNumber: string;
  couponCode: string;
  customerEmail: string;
  serviceName: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  redeemedAt: string;
}
