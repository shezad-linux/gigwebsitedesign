-- ==============================================================================
-- Supabase Schema Additions: Phase 3 (AI Resume Parsing & Gig Matching)
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Private Storage Bucket Setup for Resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    FALSE,
    5242880, -- 5 MB limit
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
)
ON CONFLICT (id) DO UPDATE SET
    public = FALSE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

-- Storage RLS Policies (Private User Folder Isolation: resumes/<user_id>/*)
CREATE POLICY "Users can upload their own resume"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own resume"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own resume"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resumes' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 2. Resume Documents Metadata Table
CREATE TABLE IF NOT EXISTS public.resume_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'parsed', 'failed', 'deleted')),
    error_message TEXT,
    raw_text_length INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_documents_user_id ON public.resume_documents(user_id);

-- 3. Extracted Profiles Table (Versioned AI Extraction Waiting User Confirmation)
CREATE TABLE IF NOT EXISTS public.extracted_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resume_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version INT DEFAULT 1,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience_level TEXT DEFAULT 'entry_level' CHECK (experience_level IN ('entry_level', 'mid_level', 'senior', 'expert')),
    years_of_experience NUMERIC(3, 1) DEFAULT 0,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    needs_user_review BOOLEAN DEFAULT TRUE,
    user_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extracted_profiles_user_id ON public.extracted_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_profiles_resume_id ON public.extracted_profiles(resume_id);

-- 4. Canonical Skills Taxonomy Table
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY, -- Slug format (e.g. 'java', 'python', 'code-review')
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- 5. Skill Aliases Table (Normalize synonyms and variations to canonical skill)
CREATE TABLE IF NOT EXISTS public.skill_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    alias TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_alias ON public.skill_aliases(alias);

-- 6. User-Confirmed Skills Table
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency TEXT DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
    source TEXT DEFAULT 'resume' CHECK (source IN ('resume', 'manual', 'assessment')),
    source_section TEXT, -- e.g. 'Work Experience', 'Projects', 'Skills'
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);

-- 7. Country Eligibility Evidence Table (Maintained, Reviewable Sourced Data)
CREATE TABLE IF NOT EXISTS public.eligibility_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    country_code TEXT NOT NULL, -- e.g. 'IN', 'US', 'UK', 'CA', 'GLOBAL'
    eligibility_status TEXT NOT NULL CHECK (eligibility_status IN ('confirmed', 'excluded', 'unknown', 'needs_review')),
    scope TEXT NOT NULL CHECK (scope IN ('platform_wide', 'project_specific')),
    source_url TEXT,
    evidence_notes TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_gig_country_scope UNIQUE (gig_id, country_code, scope)
);

CREATE INDEX IF NOT EXISTS idx_eligibility_evidence_gig_id ON public.eligibility_evidence(gig_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_evidence_country ON public.eligibility_evidence(country_code);
CREATE INDEX IF NOT EXISTS idx_eligibility_evidence_next_review ON public.eligibility_evidence(next_review_at);

-- 8. Deterministic Match Results Cache Table
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gig_id TEXT NOT NULL REFERENCES public.gig_listings(id) ON DELETE CASCADE,
    skill_fit_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    eligibility_status TEXT NOT NULL,
    explanation_reasons JSONB DEFAULT '[]'::jsonb,
    algorithm_version TEXT DEFAULT 'v3.0-deterministic',
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_gig_match UNIQUE (user_id, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_user_id ON public.match_results(user_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.resume_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- 1. resume_documents RLS
CREATE POLICY "Users can manage own resume documents"
    ON public.resume_documents
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. extracted_profiles RLS
CREATE POLICY "Users can view and update own extracted profiles"
    ON public.extracted_profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. skills & skill_aliases RLS (Public read, admin write)
CREATE POLICY "Public read canonical skills"
    ON public.skills FOR SELECT USING (true);

CREATE POLICY "Public read skill aliases"
    ON public.skill_aliases FOR SELECT USING (true);

-- 4. user_skills RLS
CREATE POLICY "Users can manage own confirmed skills"
    ON public.user_skills
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. eligibility_evidence RLS (Public read verified eligibility data)
CREATE POLICY "Public read eligibility evidence"
    ON public.eligibility_evidence FOR SELECT USING (true);

-- 6. match_results RLS
CREATE POLICY "Users can view own match results"
    ON public.match_results
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
