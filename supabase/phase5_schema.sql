-- ==============================================================================
-- Supabase Schema: Phase 5 (Monetization, Outbound Tracking, Campaigns & Launch)
-- Run this script in the Supabase SQL Editor after `phase4_schema.sql`
-- ==============================================================================

-- 1. Affiliate Partners Directory
CREATE TABLE IF NOT EXISTS public.affiliate_partners (
    id TEXT PRIMARY KEY,
    platform_id TEXT REFERENCES public.platforms(id) ON DELETE SET NULL,
    program_name TEXT NOT NULL,
    affiliate_url_template TEXT NOT NULL,
    referral_code TEXT,
    commission_model TEXT NOT NULL DEFAULT 'cpa' CHECK (commission_model IN ('cpa', 'cpc', 'revshare', 'fixed')),
    commission_rate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'paused')),
    terms_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Affiliate Outbound Clicks (Privacy-Safe Attribution Ledger)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id TEXT PRIMARY KEY,
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    gig_title TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    partner_id TEXT REFERENCES public.affiliate_partners(id) ON DELETE SET NULL,
    destination_url TEXT NOT NULL,
    is_affiliate BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_gig_id ON public.affiliate_clicks(gig_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC);

-- 3. Sponsored Promotional Campaigns
CREATE TABLE IF NOT EXISTS public.sponsored_campaigns (
    id TEXT PRIMARY KEY,
    sponsor_name TEXT NOT NULL,
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    budget NUMERIC(10,2) NOT NULL DEFAULT 500.00,
    daily_budget NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    target_category TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    placement_rule TEXT NOT NULL DEFAULT 'featured_badge' CHECK (placement_rule IN ('top_of_category', 'featured_badge', 'homepage_hero')),
    impressions_count INT NOT NULL DEFAULT 0,
    clicks_count INT NOT NULL DEFAULT 0,
    cost_per_click NUMERIC(10,2) DEFAULT 1.50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsored_campaigns_status ON public.sponsored_campaigns(status);

-- 4. Campaign Events (Impressions and Click Tracking)
CREATE TABLE IF NOT EXISTS public.campaign_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL REFERENCES public.sponsored_campaigns(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id ON public.campaign_events(campaign_id);

-- 5. Privacy-Conscious Product Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- 6. Launch Checklist Tracking Ledger
CREATE TABLE IF NOT EXISTS public.launch_checklist_items (
    id TEXT PRIMARY KEY,
    sort_order INT NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('security', 'legal', 'infra', 'qa')),
    description TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_checklist_items ENABLE ROW LEVEL SECURITY;

-- Public read for active affiliate partners and campaigns
CREATE POLICY "Public read active affiliate partners"
    ON public.affiliate_partners FOR SELECT
    USING (status = 'active');

CREATE POLICY "Public read active campaigns"
    ON public.sponsored_campaigns FOR SELECT
    USING (status = 'active');

-- Allow anonymous & authenticated outbound click insertions
CREATE POLICY "Allow logging outbound clicks"
    ON public.affiliate_clicks FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Allow logging campaign events"
    ON public.campaign_events FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Allow logging analytics events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (TRUE);

-- Public read for launch checklist items
CREATE POLICY "Public read launch checklist"
    ON public.launch_checklist_items FOR SELECT
    USING (TRUE);
