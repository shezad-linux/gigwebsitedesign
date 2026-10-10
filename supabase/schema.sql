-- ==============================================================================
-- Supabase Schema for AI Gig-Matching Platform
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Gig Listings Table (Public Catalog)
CREATE TABLE IF NOT EXISTS public.gig_listings (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    platform_name TEXT NOT NULL,
    platform_logo TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    remote BOOLEAN DEFAULT TRUE,
    pay_amount NUMERIC(10, 2),
    pay_currency TEXT DEFAULT 'USD',
    pay_unit TEXT DEFAULT 'hour',
    pay_terms_note TEXT,
    payment_verification TEXT NOT NULL CHECK (payment_verification IN ('verified', 'partial', 'unverified')),
    eligibility_verification TEXT NOT NULL CHECK (eligibility_verification IN ('verified', 'partial', 'unverified')),
    official_url TEXT NOT NULL,
    sponsored BOOLEAN DEFAULT FALSE,
    availability_status TEXT DEFAULT 'open' CHECK (availability_status IN ('open', 'waitlist', 'selective', 'paused')),
    estimated_effort TEXT,
    experience_level TEXT DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'expert')),
    eligibility_source_note TEXT,
    affiliate_disclosure TEXT,
    rating NUMERIC(3, 2),
    active_projects_count INT DEFAULT 0,
    skills_required TEXT[] DEFAULT '{}',
    eligible_countries TEXT[] DEFAULT '{}',
    onboarding_steps TEXT[] DEFAULT '{}',
    overview_highlights TEXT[] DEFAULT '{}',
    last_reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gig_listings_category ON public.gig_listings(category);
CREATE INDEX IF NOT EXISTS idx_gig_listings_slug ON public.gig_listings(slug);
CREATE INDEX IF NOT EXISTS idx_gig_listings_sponsored ON public.gig_listings(sponsored);

-- 3. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT 'Candidate',
    country TEXT DEFAULT 'India',
    country_code TEXT DEFAULT 'IN',
    work_authorization TEXT,
    experience_level TEXT DEFAULT 'mid' CHECK (experience_level IN ('entry', 'mid', 'expert')),
    years_of_experience INT DEFAULT 0,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    remote_only BOOLEAN DEFAULT TRUE,
    weekly_hours_available INT DEFAULT 20,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    languages JSONB DEFAULT '[]'::jsonb,
    desired_categories TEXT[] DEFAULT '{}',
    preferred_payout_methods TEXT[] DEFAULT '{}',
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Saved Gigs Table (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_gigs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_saved_user_gig UNIQUE (user_id, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_gigs_user_id ON public.saved_gigs(user_id);

-- 5. Application Tracker Entries Table
CREATE TABLE IF NOT EXISTS public.application_tracker_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Shortlisted', 'Applied', 'Onboarding', 'Qualified', 'Active', 'Rejected', 'Withdrawn')),
    applied_date DATE DEFAULT CURRENT_DATE,
    last_updated DATE DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tracker_user_gig UNIQUE (user_id, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_tracker_user_id ON public.application_tracker_entries(user_id);

-- 6. Trigger to automatically create a profile row upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Candidate'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.gig_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_tracker_entries ENABLE ROW LEVEL SECURITY;

-- Gig Listings Policies (Public read access)
CREATE POLICY "Public read access for gig listings"
    ON public.gig_listings
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can modify gig listings"
    ON public.gig_listings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- Saved Gigs Policies (Strict User Isolation)
CREATE POLICY "Users can view own saved gigs"
    ON public.saved_gigs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save gigs for themselves"
    ON public.saved_gigs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved gigs"
    ON public.saved_gigs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Application Tracker Policies (Strict User Isolation)
CREATE POLICY "Users can view own applications"
    ON public.application_tracker_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON public.application_tracker_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON public.application_tracker_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
    ON public.application_tracker_entries
    FOR DELETE
    USING (auth.uid() = user_id);
