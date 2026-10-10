-- ==============================================================================
-- Supabase Schema: Expert Services, Coupon System & Order Ledger
-- Provides server-authoritative discount validation, usage tracking, and RLS.
-- ==============================================================================

-- 1. Coupons & Promotions Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_cap NUMERIC(10, 2) CHECK (max_discount_cap > 0),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (min_order_amount >= 0),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    max_redemptions INT CHECK (max_redemptions > 0),
    redemptions_count INT NOT NULL DEFAULT 0 CHECK (redemptions_count >= 0),
    per_user_limit INT NOT NULL DEFAULT 1 CHECK (per_user_limit > 0),
    applicable_services TEXT[] NOT NULL DEFAULT '{}',
    first_purchase_only BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    restriction_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- 2. Service Orders Ledger
CREATE TABLE IF NOT EXISTS public.service_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_notes TEXT,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
    coupon_code TEXT,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    final_price NUMERIC(10, 2) NOT NULL CHECK (final_price >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_user_id ON public.service_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON public.service_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_orders_coupon_code ON public.service_orders(coupon_code);

-- 3. Coupon Redemptions Ledger
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    coupon_id TEXT REFERENCES public.coupons(id) ON DELETE SET NULL,
    coupon_code TEXT NOT NULL,
    order_id TEXT REFERENCES public.service_orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    service_id TEXT NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    final_price NUMERIC(10, 2) NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_customer_email ON public.coupon_redemptions(customer_email);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Coupons: Public read for active, started, and non-expired coupons
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
CREATE POLICY "Public read active coupons"
    ON public.coupons FOR SELECT
    USING (
        is_active = TRUE
        AND starts_at <= NOW()
        AND (expires_at IS NULL OR expires_at >= NOW())
    );

-- Coupons: Admin management (Full CRUD)
DROP POLICY IF EXISTS "Admins manage all coupons" ON public.coupons;
CREATE POLICY "Admins manage all coupons"
    ON public.coupons FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN ('admin@remotasks.si', 'admin@gigmatcher.io')
    );

-- Orders: Users can read their own orders
DROP POLICY IF EXISTS "Users read own orders" ON public.service_orders;
CREATE POLICY "Users read own orders"
    ON public.service_orders FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN ('admin@remotasks.si', 'admin@gigmatcher.io')
    );

-- Orders: Authenticated or anonymous can create a service order
DROP POLICY IF EXISTS "Allow creating orders" ON public.service_orders;
CREATE POLICY "Allow creating orders"
    ON public.service_orders FOR INSERT
    WITH CHECK (TRUE);

-- Redemptions: Users can read own redemptions, Admins can read all
DROP POLICY IF EXISTS "Users read own redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users read own redemptions"
    ON public.coupon_redemptions FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN ('admin@remotasks.si', 'admin@gigmatcher.io')
    );

DROP POLICY IF EXISTS "Allow logging redemptions" ON public.coupon_redemptions;
CREATE POLICY "Allow logging redemptions"
    ON public.coupon_redemptions FOR INSERT
    WITH CHECK (TRUE);
