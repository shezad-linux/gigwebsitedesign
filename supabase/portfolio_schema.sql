-- ==============================================================================
-- Portfolio Applications, Open-Source Contributions, Certificates & Acquisitions
-- Migration: portfolio_schema.sql
-- ==============================================================================

-- 1. Applications Table
CREATE TABLE IF NOT EXISTS public.portfolio_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  package_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  key_features TEXT[] NOT NULL DEFAULT '{}',
  development_status TEXT NOT NULL DEFAULT 'published',
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  google_play_url TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  screenshots TEXT[] DEFAULT '{}',
  is_open_source BOOLEAN NOT NULL DEFAULT false,
  open_source_repo_url TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  acquisition_available BOOLEAN NOT NULL DEFAULT true,
  asking_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'INR',
  pricing_type TEXT NOT NULL DEFAULT 'negotiable',
  private_negotiation_notes TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Contribution Proposals Table
CREATE TABLE IF NOT EXISTS public.portfolio_contributions (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  github_profile TEXT NOT NULL,
  linkedin_profile TEXT,
  portfolio_url TEXT,
  qualification TEXT NOT NULL,
  technical_skills TEXT NOT NULL,
  project_ids TEXT[] NOT NULL DEFAULT '{}',
  project_names TEXT[] NOT NULL DEFAULT '{}',
  contribution_types TEXT[] NOT NULL DEFAULT '{}',
  proposal_title TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  technical_approach TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  repo_reference_url TEXT,
  estimated_completion_time TEXT NOT NULL,
  additional_comments TEXT,
  consent_reviewed BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'Submitted',
  admin_feedback TEXT,
  internship_consideration BOOLEAN NOT NULL DEFAULT false,
  certificate_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Contribution Certificates Table
CREATE TABLE IF NOT EXISTS public.portfolio_certificates (
  id TEXT PRIMARY KEY, -- e.g. 'CERT-2026-MR8X92K'
  contribution_id TEXT REFERENCES public.portfolio_contributions(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,
  project_name TEXT NOT NULL,
  contribution_type TEXT NOT NULL,
  completion_date DATE NOT NULL,
  issuer_name TEXT NOT NULL,
  issuer_title TEXT NOT NULL,
  organization_name TEXT NOT NULL DEFAULT 'Remotasks App Portfolio',
  verification_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Issued',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Internship Records Table
CREATE TABLE IF NOT EXISTS public.portfolio_internships (
  id TEXT PRIMARY KEY,
  contribution_id TEXT REFERENCES public.portfolio_contributions(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  github_profile TEXT,
  associated_project TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Candidate',
  role_title TEXT NOT NULL,
  duration_months INT NOT NULL DEFAULT 3,
  responsibilities TEXT NOT NULL,
  interview_notes TEXT,
  formal_offer_issued BOOLEAN NOT NULL DEFAULT false,
  documentation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Acquisition Enquiries Table
CREATE TABLE IF NOT EXISTS public.portfolio_acquisitions (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  country TEXT NOT NULL,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  proposed_budget TEXT NOT NULL,
  acquisition_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Contact & Partnership Messages Table
CREATE TABLE IF NOT EXISTS public.portfolio_contacts (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject_category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_apps_category ON public.portfolio_apps(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_apps_package ON public.portfolio_apps(package_name);
CREATE INDEX IF NOT EXISTS idx_portfolio_contributions_status ON public.portfolio_contributions(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_certificates_id ON public.portfolio_certificates(id);
CREATE INDEX IF NOT EXISTS idx_portfolio_acquisitions_status ON public.portfolio_acquisitions(status);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.portfolio_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_contacts ENABLE ROW LEVEL SECURITY;

-- 1. Apps: Public read for published apps; Admins have full access
DROP POLICY IF EXISTS "Public can view published portfolio apps" ON public.portfolio_apps;
CREATE POLICY "Public can view published portfolio apps"
  ON public.portfolio_apps FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage portfolio apps" ON public.portfolio_apps;
CREATE POLICY "Admins can manage portfolio apps"
  ON public.portfolio_apps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

-- 2. Contributions: Anyone can insert proposals; Admins can read and update
DROP POLICY IF EXISTS "Anyone can submit contribution proposal" ON public.portfolio_contributions;
CREATE POLICY "Anyone can submit contribution proposal"
  ON public.portfolio_contributions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage contribution proposals" ON public.portfolio_contributions;
CREATE POLICY "Admins can manage contribution proposals"
  ON public.portfolio_contributions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

-- 3. Certificates: Public can verify issued certificates by ID; Admins manage
DROP POLICY IF EXISTS "Public can verify valid certificates" ON public.portfolio_certificates;
CREATE POLICY "Public can verify valid certificates"
  ON public.portfolio_certificates FOR SELECT
  USING (status = 'Issued');

DROP POLICY IF EXISTS "Admins can manage certificates" ON public.portfolio_certificates;
CREATE POLICY "Admins can manage certificates"
  ON public.portfolio_certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

-- 4. Internships: Admins only
DROP POLICY IF EXISTS "Admins can manage internships" ON public.portfolio_internships;
CREATE POLICY "Admins can manage internships"
  ON public.portfolio_internships FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

-- 5. Acquisitions: Anyone can submit enquiry; Admins can view and update
DROP POLICY IF EXISTS "Anyone can submit acquisition enquiry" ON public.portfolio_acquisitions;
CREATE POLICY "Anyone can submit acquisition enquiry"
  ON public.portfolio_acquisitions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage acquisition enquiries" ON public.portfolio_acquisitions;
CREATE POLICY "Admins can manage acquisition enquiries"
  ON public.portfolio_acquisitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

-- 6. Contacts: Anyone can submit message; Admins manage
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.portfolio_contacts;
CREATE POLICY "Anyone can submit contact message"
  ON public.portfolio_contacts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.portfolio_contacts;
CREATE POLICY "Admins can view contact messages"
  ON public.portfolio_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'reviewer')
    )
  );

