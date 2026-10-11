-- ==============================================================================
-- Migration: 20261011213000_hire_projects_and_field_security.sql
-- 1. Tamper-Proof Triggers for verification_status and admin internal notes
-- 2. Confirmed Hire Projects, Milestones & Time Entries with strict RLS
-- ==============================================================================

-- 1. Prevent standard users from modifying their own verification_status
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

-- 2. Prevent non-admins from tampering with admin notes or assigned admin on requests
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

-- 3. Confirmed Projects Table
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

-- 4. Fixed-Price Milestones Table
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

-- 5. Hourly Time Entries Table
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

-- 6. Enable RLS
ALTER TABLE public.hire_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hire_time_entries ENABLE ROW LEVEL SECURITY;

-- 7. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_time_entries TO authenticated;

-- 8. Policies for hire_projects
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

-- 9. Policies for hire_milestones
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

-- 10. Policies for hire_time_entries
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
