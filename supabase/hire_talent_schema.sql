-- ==============================================================================
-- Hire Talent Architecture Schema: Profiles, Requests, Matches, Proposals, Activity
-- Remotasks.si — Managed Talent Hiring Engine
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 2. Talent Profiles & Portfolio Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT NOT NULL CHECK (char_length(headline) BETWEEN 5 AND 160),
  bio TEXT NOT NULL CHECK (char_length(bio) BETWEEN 20 AND 5000),
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years NUMERIC(4,1) NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  hourly_rate NUMERIC(8,2) NOT NULL DEFAULT 50 CHECK (hourly_rate >= 5),
  min_project_budget NUMERIC(8,2),
  availability_status TEXT NOT NULL DEFAULT 'available_now'
    CHECK (availability_status IN ('available_now', 'available_part_time', 'busy', 'not_available')),
  availability_hours_per_week INT NOT NULL DEFAULT 40 CHECK (availability_hours_per_week BETWEEN 0 AND 80),
  preferred_categories TEXT[] NOT NULL DEFAULT '{}',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  languages TEXT[] NOT NULL DEFAULT '{"English"}',
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_review', 'verified', 'suspended')),
  full_name TEXT,
  avatar_url TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.talent_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  project_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. Hire Requests (Client Project Submissions)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 20 AND 10000),
  category TEXT NOT NULL CHECK (category IN (
    'software-web',
    'mobile-apps',
    'ui-ux-design',
    'digital-marketing',
    'ai-automation',
    'qa-testing-consulting'
  )),
  hiring_model TEXT NOT NULL CHECK (hiring_model IN ('hourly', 'fixed')),
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  experience_level TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  expected_start_date DATE,
  deadline DATE,
  estimated_duration_weeks INT CHECK (estimated_duration_weeks IS NULL OR estimated_duration_weeks BETWEEN 1 AND 104),
  communication_pref TEXT NOT NULL DEFAULT 'flexible'
    CHECK (communication_pref IN ('slack', 'email', 'video_calls', 'flexible')),
  hourly_hours_per_week INT CHECK (hourly_hours_per_week IS NULL OR hourly_hours_per_week BETWEEN 1 AND 80),
  hourly_overlap_timezone TEXT,
  fixed_deliverables TEXT[] DEFAULT '{}',
  revision_rounds INT DEFAULT 2 CHECK (revision_rounds IS NULL OR revision_rounds BETWEEN 0 AND 20),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'matching',
    'talent_proposed',
    'client_deciding',
    'in_progress',
    'completed',
    'cancelled'
  )),
  internal_notes TEXT,
  assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. Hire Matches (Admin Recommendations & Invitations)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hire_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  match_score INT NOT NULL DEFAULT 85 CHECK (match_score BETWEEN 0 AND 100),
  match_rationale TEXT NOT NULL CHECK (char_length(match_rationale) BETWEEN 5 AND 1000),
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'invited', 'declined', 'accepted')),
  invited_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_match_per_request_talent UNIQUE (request_id, talent_id)
);

-- ==============================================================================
-- 5. Hire Proposals (Professional Quotes & Approaches)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hire_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  proposed_rate NUMERIC(10,2) NOT NULL CHECK (proposed_rate > 0),
  estimated_hours NUMERIC(8,2),
  cover_letter TEXT NOT NULL CHECK (char_length(cover_letter) BETWEEN 20 AND 5000),
  approach TEXT NOT NULL CHECK (char_length(approach) BETWEEN 20 AND 5000),
  deliverables TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_proposal_per_request_talent UNIQUE (request_id, talent_id)
);

-- ==============================================================================
-- 6. Hire Activity Log (Status Ledger & Audit Trail)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hire_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('client', 'talent', 'admin', 'system')),
  action TEXT NOT NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. Indexes for Query Performance
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_talent_profiles_status ON public.talent_profiles(verification_status, availability_status);
CREATE INDEX IF NOT EXISTS idx_talent_portfolio_talent ON public.talent_portfolio_items(talent_id);
CREATE INDEX IF NOT EXISTS idx_hire_requests_client ON public.hire_requests(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hire_requests_status ON public.hire_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hire_requests_category ON public.hire_requests(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hire_matches_request ON public.hire_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_hire_matches_talent ON public.hire_matches(talent_id, status);
CREATE INDEX IF NOT EXISTS idx_hire_proposals_request ON public.hire_proposals(request_id, status);
CREATE INDEX IF NOT EXISTS idx_hire_proposals_talent ON public.hire_proposals(talent_id);
CREATE INDEX IF NOT EXISTS idx_hire_activity_request ON public.hire_activity_log(request_id, created_at DESC);

-- ==============================================================================
-- 8. Enable Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_activity_log ENABLE ROW LEVEL SECURITY;

-- Revoke default broad grants
REVOKE ALL ON public.talent_profiles FROM anon, authenticated;
REVOKE ALL ON public.talent_portfolio_items FROM anon, authenticated;
REVOKE ALL ON public.hire_requests FROM anon, authenticated;
REVOKE ALL ON public.hire_matches FROM anon, authenticated;
REVOKE ALL ON public.hire_proposals FROM anon, authenticated;
REVOKE ALL ON public.hire_activity_log FROM anon, authenticated;

-- Grant minimal required operational privileges
GRANT SELECT ON public.talent_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.talent_profiles TO authenticated;

GRANT SELECT ON public.talent_portfolio_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.talent_portfolio_items TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_proposals TO authenticated;
GRANT SELECT, INSERT ON public.hire_activity_log TO authenticated;

-- ==============================================================================
-- 9. RLS Policies: talent_profiles & portfolio
-- ==============================================================================

-- Anyone can view verified talent profiles; unverified profiles visible to owner & admin
CREATE POLICY "Public can view verified talent profiles"
ON public.talent_profiles FOR SELECT
TO anon, authenticated
USING (
  verification_status = 'verified'
  OR user_id = auth.uid()
  OR public.is_admin_or_reviewer()
);

CREATE POLICY "Users can create their own talent profile"
ON public.talent_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND id = auth.uid());

CREATE POLICY "Users can edit their own talent profile"
ON public.talent_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_reviewer())
WITH CHECK (user_id = auth.uid() OR public.is_admin_or_reviewer());

CREATE POLICY "Users can delete their own talent profile"
ON public.talent_profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_reviewer());

-- Portfolio policies
CREATE POLICY "Public can view talent portfolio items"
ON public.talent_portfolio_items FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.talent_profiles p
    WHERE p.id = talent_id
      AND (p.verification_status = 'verified' OR p.user_id = auth.uid() OR public.is_admin_or_reviewer())
  )
);

CREATE POLICY "Talent can manage their portfolio items"
ON public.talent_portfolio_items FOR ALL
TO authenticated
USING (talent_id = auth.uid() OR public.is_admin_or_reviewer())
WITH CHECK (talent_id = auth.uid() OR public.is_admin_or_reviewer());

-- ==============================================================================
-- 10. RLS Policies: hire_requests
-- ==============================================================================

-- Clients view their own requests; invited talent can view matched requests; admins view all
CREATE POLICY "Authorized parties can view hire requests"
ON public.hire_requests FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_matches m
    WHERE m.request_id = id
      AND m.talent_id = auth.uid()
      AND m.status IN ('invited', 'accepted')
  )
);

CREATE POLICY "Clients can create hire requests"
ON public.hire_requests FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients and admins can update hire requests"
ON public.hire_requests FOR UPDATE
TO authenticated
USING (client_id = auth.uid() OR public.is_admin_or_reviewer())
WITH CHECK (client_id = auth.uid() OR public.is_admin_or_reviewer());

CREATE POLICY "Clients and admins can delete hire requests"
ON public.hire_requests FOR DELETE
TO authenticated
USING (client_id = auth.uid() OR public.is_admin_or_reviewer());

-- ==============================================================================
-- 11. RLS Policies: hire_matches
-- ==============================================================================

CREATE POLICY "Clients, invited talent, and admins can view matches"
ON public.hire_matches FOR SELECT
TO authenticated
USING (
  talent_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_requests r
    WHERE r.id = request_id AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage matches"
ON public.hire_matches FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_reviewer());

CREATE POLICY "Talent can respond to match and admins can update"
ON public.hire_matches FOR UPDATE
TO authenticated
USING (talent_id = auth.uid() OR public.is_admin_or_reviewer())
WITH CHECK (talent_id = auth.uid() OR public.is_admin_or_reviewer());

CREATE POLICY "Admins can delete matches"
ON public.hire_matches FOR DELETE
TO authenticated
USING (public.is_admin_or_reviewer());

-- ==============================================================================
-- 12. RLS Policies: hire_proposals
-- ==============================================================================

CREATE POLICY "Authorized parties can view proposals"
ON public.hire_proposals FOR SELECT
TO authenticated
USING (
  talent_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_requests r
    WHERE r.id = request_id AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Matched talent can submit proposals"
ON public.hire_proposals FOR INSERT
TO authenticated
WITH CHECK (
  talent_id = auth.uid()
  AND (
    public.is_admin_or_reviewer()
    OR EXISTS (
      SELECT 1 FROM public.hire_matches m
      WHERE m.request_id = request_id
        AND m.talent_id = auth.uid()
        AND m.status IN ('invited', 'accepted')
    )
  )
);

CREATE POLICY "Talent, clients, and admins can update proposals"
ON public.hire_proposals FOR UPDATE
TO authenticated
USING (
  talent_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_requests r
    WHERE r.id = request_id AND r.client_id = auth.uid()
  )
)
WITH CHECK (
  talent_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_requests r
    WHERE r.id = request_id AND r.client_id = auth.uid()
  )
);

CREATE POLICY "Talent and admins can delete proposals"
ON public.hire_proposals FOR DELETE
TO authenticated
USING (talent_id = auth.uid() OR public.is_admin_or_reviewer());

-- ==============================================================================
-- 13. RLS Policies: hire_activity_log
-- ==============================================================================

CREATE POLICY "Parties to request can view activity logs"
ON public.hire_activity_log FOR SELECT
TO authenticated
USING (
  public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_requests r
    WHERE r.id = request_id AND r.client_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.hire_matches m
    WHERE m.request_id = request_id
      AND m.talent_id = auth.uid()
      AND m.status IN ('invited', 'accepted')
  )
);

CREATE POLICY "Authenticated parties can insert activity log"
ON public.hire_activity_log FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid() OR public.is_admin_or_reviewer());

-- ==============================================================================
-- 14. Column-Level Security & Tamper-Proof Triggers
-- ==============================================================================

-- Prevent standard users from modifying their own verification_status
CREATE OR REPLACE FUNCTION public.protect_talent_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
    IF NOT public.is_admin_or_reviewer() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify talent verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_talent_verification_status ON public.talent_profiles;
CREATE TRIGGER trg_protect_talent_verification_status
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_talent_verification_status();

-- Prevent non-admins from tampering with admin notes or assigned admin on requests
CREATE OR REPLACE FUNCTION public.protect_hire_request_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.internal_notes IS DISTINCT FROM NEW.internal_notes OR OLD.assigned_admin_id IS DISTINCT FROM NEW.assigned_admin_id) THEN
    IF NOT public.is_admin_or_reviewer() THEN
      NEW.internal_notes := OLD.internal_notes;
      NEW.assigned_admin_id := OLD.assigned_admin_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_hire_request_admin_fields ON public.hire_requests;
CREATE TRIGGER trg_protect_hire_request_admin_fields
BEFORE UPDATE ON public.hire_requests
FOR EACH ROW
EXECUTE FUNCTION public.protect_hire_request_admin_fields();

-- ==============================================================================
-- 15. Confirmed Projects, Milestones & Time Entries (Phase 2 Contracts)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.hire_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES public.hire_proposals(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  hiring_model TEXT NOT NULL CHECK (hiring_model IN ('hourly', 'fixed')),
  currency TEXT NOT NULL DEFAULT 'USD',
  agreed_rate NUMERIC(10,2),
  agreed_budget NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'disputed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hire_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hire_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  description TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'paid')),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hire_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hire_projects(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  hours NUMERIC(5,2) NOT NULL CHECK (hours BETWEEN 0.25 AND 24),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 1000),
  status TEXT NOT NULL DEFAULT 'logged'
    CHECK (status IN ('logged', 'submitted', 'approved', 'invoiced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hire_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_time_entries ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_time_entries TO authenticated;

-- Policies for hire_projects
DROP POLICY IF EXISTS "Project parties and admins can view projects" ON public.hire_projects;
CREATE POLICY "Project parties and admins can view projects"
ON public.hire_projects FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR talent_id = auth.uid() OR public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Clients and admins can insert projects" ON public.hire_projects;
CREATE POLICY "Clients and admins can insert projects"
ON public.hire_projects FOR INSERT
TO authenticated
WITH CHECK (client_id = auth.uid() OR public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Parties and admins can update project status" ON public.hire_projects;
CREATE POLICY "Parties and admins can update project status"
ON public.hire_projects FOR UPDATE
TO authenticated
USING (client_id = auth.uid() OR talent_id = auth.uid() OR public.is_admin_or_reviewer())
WITH CHECK (client_id = auth.uid() OR talent_id = auth.uid() OR public.is_admin_or_reviewer());

-- Policies for hire_milestones
DROP POLICY IF EXISTS "Project parties can view milestones" ON public.hire_milestones;
CREATE POLICY "Project parties can view milestones"
ON public.hire_milestones FOR SELECT
TO authenticated
USING (
  public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_projects p
    WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.talent_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Parties can manage milestones" ON public.hire_milestones;
CREATE POLICY "Parties can manage milestones"
ON public.hire_milestones FOR ALL
TO authenticated
USING (
  public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_projects p
    WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.talent_id = auth.uid())
  )
);

-- Policies for hire_time_entries
DROP POLICY IF EXISTS "Parties can view time entries" ON public.hire_time_entries;
CREATE POLICY "Parties can view time entries"
ON public.hire_time_entries FOR SELECT
TO authenticated
USING (
  public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_projects p
    WHERE p.id = project_id AND (p.client_id = auth.uid() OR p.talent_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Talent can log own time entries" ON public.hire_time_entries;
CREATE POLICY "Talent can log own time entries"
ON public.hire_time_entries FOR INSERT
TO authenticated
WITH CHECK (talent_id = auth.uid() OR public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Parties can update time entries" ON public.hire_time_entries;
CREATE POLICY "Parties can update time entries"
ON public.hire_time_entries FOR UPDATE
TO authenticated
USING (
  talent_id = auth.uid()
  OR public.is_admin_or_reviewer()
  OR EXISTS (
    SELECT 1 FROM public.hire_projects p
    WHERE p.id = project_id AND p.client_id = auth.uid()
  )
);
