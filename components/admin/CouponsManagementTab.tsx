"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Users,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CouponSimulator } from "@/components/pricing/CouponSimulator";
import {
  EXPERT_SERVICES,
  getStoredCoupons,
  upsertCoupon,
  deleteStoredCoupon,
  getStoredOrders,
} from "@/lib/services-pricing";
import { Coupon, ServiceOrder, CouponDiscountType } from "@/types/services";

interface CouponsManagementTabProps {
  showToast: (msg: string) => void;
}

export const CouponsManagementTab: React.FC<CouponsManagementTabProps> = ({ showToast }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStoredCoupons());
  const [orders, setOrders] = useState<ServiceOrder[]>(() => getStoredOrders());

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as CouponDiscountType,
    discountValue: 15,
    maxDiscountCap: "",
    minOrderAmount: "",
    startsAt: new Date().toISOString().split("T")[0],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxRedemptions: "",
    perUserLimit: 1,
    applicableServices: [] as string[],
    firstPurchaseOnly: false,
    isActive: true,
    description: "",
    restrictionNote: "",
  });

  const refreshData = () => {
    setCoupons(getStoredCoupons());
    setOrders(getStoredOrders());
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const redeemedOrders = orders.filter((o) => !!o.couponCode);
    const totalRedemptions = redeemedOrders.length;
    const totalDiscountGiven = redeemedOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const totalRevenueGenerated = redeemedOrders.reduce((sum, o) => sum + (o.finalPrice || 0), 0);

    return {
      totalCoupons,
      activeCoupons,
      totalRedemptions,
      totalDiscountGiven,
      totalRevenueGenerated,
    };
  }, [coupons, orders]);

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      // Status filter
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;
      if (statusFilter === "expired") {
        if (!c.expiresAt || new Date(c.expiresAt) >= now) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.code.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.restrictionNote || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [coupons, statusFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 15,
      maxDiscountCap: "",
      minOrderAmount: "",
      startsAt: new Date().toISOString().split("T")[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      maxRedemptions: "",
      perUserLimit: 1,
      applicableServices: [],
      firstPurchaseOnly: false,
      isActive: true,
      description: "",
      restrictionNote: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountCap: coupon.maxDiscountCap !== undefined ? String(coupon.maxDiscountCap) : "",
      minOrderAmount: coupon.minOrderAmount !== undefined ? String(coupon.minOrderAmount) : "",
      startsAt: coupon.startsAt ? coupon.startsAt.split("T")[0] : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      maxRedemptions: coupon.maxRedemptions !== undefined ? String(coupon.maxRedemptions) : "",
      perUserLimit: coupon.perUserLimit || 1,
      applicableServices: coupon.applicableServices || [],
      firstPurchaseOnly: Boolean(coupon.firstPurchaseOnly),
      isActive: coupon.isActive,
      description: coupon.description || "",
      restrictionNote: coupon.restrictionNote || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (coupon: Coupon) => {
    const updated = upsertCoupon({
      ...coupon,
      isActive: !coupon.isActive,
      updatedAt: new Date().toISOString(),
    });
    setCoupons(updated);
    showToast(`Coupon ${coupon.code} is now ${!coupon.isActive ? "active" : "inactive"}.`);
  };

  const handleDelete = (couponId: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      const updated = deleteStoredCoupon(couponId);
      setCoupons(updated);
      showToast(`Coupon ${code} deleted.`);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Copied ${code} to clipboard.`);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast("Coupon code is required.");
      return;
    }

    const payload: Coupon = {
      id: editingCoupon ? editingCoupon.id : `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxDiscountCap: formData.maxDiscountCap ? Number(formData.maxDiscountCap) : undefined,
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : new Date().toISOString(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      maxRedemptions: formData.maxRedemptions ? Number(formData.maxRedemptions) : undefined,
      redemptionsCount: editingCoupon ? editingCoupon.redemptionsCount : 0,
      perUserLimit: Number(formData.perUserLimit) || 1,
      applicableServices: formData.applicableServices,
      firstPurchaseOnly: Boolean(formData.firstPurchaseOnly),
      isActive: Boolean(formData.isActive),
      description: formData.description.trim() || undefined,
      restrictionNote: formData.restrictionNote.trim() || undefined,
      createdAt: editingCoupon ? editingCoupon.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = upsertCoupon(payload);
    setCoupons(updated);
    setIsModalOpen(false);
    showToast(`Coupon ${payload.code} saved successfully.`);
  };

  const toggleServiceApplicability = (serviceId: string) => {
    setFormData((prev) => {
      const exists = prev.applicableServices.includes(serviceId);
      if (exists) {
        return {
          ...prev,
          applicableServices: prev.applicableServices.filter((id) => id !== serviceId),
        };
      } else {
        return {
          ...prev,
          applicableServices: [...prev.applicableServices, serviceId],
        };
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Coupons
            </span>
            <Tag className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-extrabold text-black mt-2 font-mono">
            {metrics.totalCoupons}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {metrics.activeCoupons} currently active
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Redemptions
            </span>
            <Users className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-extrabold text-black mt-2 font-mono">
            {metrics.totalRedemptions}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Across all service orders
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Coupon Revenue
            </span>
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-extrabold text-black mt-2 font-mono">
            ₹{metrics.totalRevenueGenerated.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Net customer billings
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Discounts Provided
            </span>
            <Percent className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-extrabold text-black mt-2 font-mono">
            ₹{metrics.totalDiscountGiven.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Customer savings granted
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-extrabold text-black mt-2 font-mono">
            ₹
            {metrics.totalRedemptions > 0
              ? Math.round(metrics.totalRevenueGenerated / metrics.totalRedemptions).toLocaleString("en-IN")
              : 0}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            With applied coupons
          </span>
        </div>
      </div>

      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code or description..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs text-black focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-200 text-xs text-black bg-white focus:outline-none focus:border-black"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="h-9 px-4 rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-black tracking-tight flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Active & Configured Coupons ({filteredCoupons.length})
          </h3>
          <span className="text-[11px] text-neutral-500">
            Authoritative Server Calculation Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Restrictions & Rules</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No coupons found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const now = new Date();
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
                  const isCopied = copiedCode === coupon.code;

                  return (
                    <tr key={coupon.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-black px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-xs">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy code"
                            className="p-1 rounded text-neutral-400 hover:text-black hover:bg-neutral-100"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-black">
                        {coupon.discountType === "percentage" ? (
                          <div>
                            <span>{coupon.discountValue}% off</span>
                            {coupon.maxDiscountCap && (
                              <span className="block text-[10px] text-neutral-500 font-sans font-normal">
                                Max cap: ₹{coupon.maxDiscountCap}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span>₹{coupon.discountValue} flat off</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-neutral-600 space-y-0.5">
                        {coupon.minOrderAmount ? (
                          <div>Min order: ₹{coupon.minOrderAmount}</div>
                        ) : null}
                        {coupon.firstPurchaseOnly && (
                          <div className="text-black font-semibold">First-time customers only</div>
                        )}
                        {coupon.applicableServices && coupon.applicableServices.length > 0 ? (
                          <div className="text-neutral-800">
                            Services: {coupon.applicableServices.join(", ")}
                          </div>
                        ) : (
                          <div>All services eligible</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-black">{coupon.redemptionsCount || 0}</span>
                          {coupon.maxRedemptions && (
                            <span className="text-neutral-500 text-[11px]">/ {coupon.maxRedemptions}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block">
                          Limit {coupon.perUserLimit || 1}/user
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-neutral-600">
                        {coupon.startsAt && (
                          <div>From: {new Date(coupon.startsAt).toLocaleDateString()}</div>
                        )}
                        {coupon.expiresAt ? (
                          <div className={isExpired ? "text-neutral-900 font-bold" : ""}>
                            Until: {new Date(coupon.expiresAt).toLocaleDateString()}
                          </div>
                        ) : (
                          <div>Never expires</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            coupon.isActive && !isExpired
                              ? "bg-black text-white hover:bg-neutral-800"
                              : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                          }`}
                        >
                          {coupon.isActive && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redemptions & Usage Report */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-black tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Usage & Redemption Audit Report ({orders.filter((o) => !!o.couponCode).length} orders)
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Live transaction ledger showing real coupon applications and collected revenue.
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Total Revenue: ₹{metrics.totalRevenueGenerated.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer Email</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Coupon Applied</th>
                <th className="py-3 px-4">Original Price</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4 text-right">Customer Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {orders
                .filter((o) => !!o.couponCode)
                .map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-black">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-neutral-700">
                      {order.customerEmail}
                    </td>
                    <td className="py-3 px-4 font-medium text-black">
                      {order.serviceName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono font-bold text-xs text-black">
                        {order.couponCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      ₹{order.originalPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-mono text-black font-semibold">
                      −₹{order.discountAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-black text-right">
                      ₹{order.finalPrice.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Simulator Sandbox in Admin */}
      <div className="p-6 rounded-2xl border border-neutral-200 bg-white space-y-4">
        <div>
          <h3 className="text-base font-bold text-black tracking-tight flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Checkout Simulator Sandbox
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Admins can preview how coupons behave for candidates before publishing them publicly.
          </p>
        </div>
        <CouponSimulator />
      </div>

      {/* Create / Edit Coupon Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-8 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-black tracking-tight">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
                </h3>
                <p className="text-xs text-neutral-500">
                  Configure promotion details, limits, restrictions, and eligibility.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100"
              >
                <Check className="w-5 h-5 hidden" />
                <span className="text-sm font-bold">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Code & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono font-bold uppercase text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as CouponDiscountType })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-black bg-white focus:outline-none focus:border-black"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Discount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Value & Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Discount Value * ({formData.discountType === "percentage" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.maxDiscountCap}
                    onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Min Order & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Total Redemption Limit
                  </label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Limit Per User
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Start & Expiry Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-black focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Eligible Services */}
              <div>
                <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Eligible Services (Leave empty for all services)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXPERT_SERVICES.map((s) => {
                    const isChecked = formData.applicableServices.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "border-black bg-neutral-100 text-black font-semibold"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleServiceApplicability(s.id)}
                          className="accent-black rounded"
                        />
                        <span className="text-xs">{s.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Restriction Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.firstPurchaseOnly}
                    onChange={(e) => setFormData({ ...formData, firstPurchaseOnly: e.target.checked })}
                    className="accent-black rounded"
                  />
                  <span className="text-neutral-700 font-medium">First purchase only restriction</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-black rounded"
                  />
                  <span className="text-neutral-700 font-medium">Coupon is Active</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Public Description & Offer Text
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 15% off launch special for first 500 customers"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-black focus:outline-none focus:border-black"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 text-xs px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 text-xs px-6 bg-black text-white hover:bg-neutral-800"
                >
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
