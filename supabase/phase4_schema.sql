-- ==============================================================================
-- Supabase Schema Additions: Phase 4 (Gig Data Operations & Verification)
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Platforms Table (Reusable Provider Information)
CREATE TABLE IF NOT EXISTS public.platforms (
    id TEXT PRIMARY KEY, -- e.g. 'outlier', 'dataannotation', 'alignerr'
    name TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    careers_url TEXT,
    logo_url TEXT,
    description TEXT,
    headquarters TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platforms_name ON public.platforms(name);

-- 2. Extend gig_listings with publication_status if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gig_listings' 
        AND column_name = 'publication_status'
    ) THEN
        ALTER TABLE public.gig_listings 
        ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'published' 
        CHECK (publication_status IN ('draft', 'published', 'paused', 'archived'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gig_listings_status ON public.gig_listings(publication_status);

-- 3. Payment Evidence Table (Rates, Types, Terms, and Source Proof)
CREATE TABLE IF NOT EXISTS public.payment_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    advertised_rate NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    unit TEXT NOT NULL DEFAULT 'hour' CHECK (unit IN ('hour', 'task', 'milestone', 'project')),
    rate_type TEXT NOT NULL DEFAULT 'official_advertised' 
        CHECK (rate_type IN ('official_advertised', 'worker_reported', 'unverified')),
    payout_methods TEXT[] DEFAULT ARRAY['PayPal'],
    source_url TEXT,
    evidence_notes TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified' 
        CHECK (verification_status IN ('verified', 'partial', 'unverified')),
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_payment_evidence_gig UNIQUE (gig_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_evidence_gig_id ON public.payment_evidence(gig_id);
CREATE INDEX IF NOT EXISTS idx_payment_evidence_next_review ON public.payment_evidence(next_review_at);

-- 4. Listing Reviews Table (Review Decisions, Reviewers, and Next Review Dates)
CREATE TABLE IF NOT EXISTS public.listing_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_email TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'changes_requested', 'stale_flagged', 'archived')),
    notes TEXT,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '60 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_reviews_gig_id ON public.listing_reviews(gig_id);
CREATE INDEX IF NOT EXISTS idx_listing_reviews_reviewed_at ON public.listing_reviews(reviewed_at);

-- 5. User Reports Table (Community Feedback on Stale, Closed, or Inaccurate Listings)
CREATE TABLE IF NOT EXISTS public.listing_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reporter_email TEXT,
    report_type TEXT NOT NULL CHECK (
        report_type IN (
            'closed_application',
            'changed_country_restriction',
            'incorrect_payment',
            'broken_link',
            'other'
        )
    ),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'triaged', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_gig_id ON public.listing_reports(gig_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);

-- 6. Audit Events Table (Administrative History, Diffs, and Change Justifications)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (
        entity_type IN ('gig_listing', 'eligibility_evidence', 'payment_evidence', 'listing_report', 'platform')
    ),
    entity_id TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (
        action IN (
            'create',
            'update',
            'publish',
            'pause',
            'archive',
            'restore',
            'resolve_report',
            'verify_evidence'
        )
    ),
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    justification TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- 1. platforms: Public read, admins manage
CREATE POLICY "Public read platforms"
    ON public.platforms FOR SELECT USING (true);

-- 2. payment_evidence: Public read verified evidence, admins manage
CREATE POLICY "Public read payment evidence"
    ON public.payment_evidence FOR SELECT USING (true);

-- 3. listing_reviews: Public read review decisions
CREATE POLICY "Public read listing reviews"
    ON public.listing_reviews FOR SELECT USING (true);

-- 4. listing_reports: Anyone can submit a report, admins read & update
CREATE POLICY "Anyone can submit a listing report"
    ON public.listing_reports FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view own reports"
    ON public.listing_reports FOR SELECT
    USING (auth.uid() = reporter_id OR auth.jwt() ->> 'role' = 'admin');

-- 5. audit_events: Read-only for authenticated admins
CREATE POLICY "Admin read audit events"
    ON public.audit_events FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin' OR auth.role() = 'service_role');
