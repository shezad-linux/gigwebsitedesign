-- ==============================================================================
-- Supabase Server-Enforced RBAC Migration
-- AI Gig-Matching Platform: Admin Role-Based Access Control
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create the user_roles table
-- Administrative roles are strictly separated from user-editable profiles.
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'user')) DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based querying
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable Row Level Security (RLS) immediately
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Trusted Security Definer Functions for Role Checking
-- These functions run with elevated privileges to check public.user_roles
-- safely without recursive RLS issues, with search_path anchored to public.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.has_role(lookup_user_id UUID, required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = lookup_user_id
          AND role = required_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_reviewer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'reviewer')
    );
$$;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT COALESCE(
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid()),
        'user'
    );
$$;

-- Grant execution to authenticated & service_role users
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_reviewer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_role() TO authenticated, service_role;

-- ==============================================================================
-- 3. Automatic Default Role Assignment for New Signups
-- Every new account created via auth.users automatically receives 'user' role.
-- Public signup can NEVER grant 'admin' or 'reviewer'.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, 'user', NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill any existing users who lack a user_roles entry
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT id, 'user', NOW(), NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- ==============================================================================
-- 4. Row Level Security Policies for user_roles Table
-- Ordinary users can ONLY view their own role.
-- They CANNOT insert, update, or delete roles.
-- Only admins and service_role can manage roles.
-- ==============================================================================

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles"
    ON public.user_roles
    FOR UPDATE
    USING (public.is_admin() OR auth.role() = 'service_role')
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles"
    ON public.user_roles
    FOR DELETE
    USING (public.is_admin() OR auth.role() = 'service_role');

-- ==============================================================================
-- 5. Resilient Policy Application on Domain Tables
-- Dynamic SQL via EXECUTE ensures this migration succeeds regardless of whether
-- Phase 4 or Phase 5 tables (payment_evidence, listing_reports, etc.) exist yet.
-- ==============================================================================

-- 5a. gig_listings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gig_listings') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin or service role can modify gig listings" ON public.gig_listings';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can insert gig listings" ON public.gig_listings';
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can update gig listings" ON public.gig_listings';
        EXECUTE 'DROP POLICY IF EXISTS "Admins can delete gig listings" ON public.gig_listings';

        EXECUTE 'CREATE POLICY "Admins can insert gig listings"
            ON public.gig_listings FOR INSERT
            WITH CHECK (public.is_admin() OR auth.role() = ''service_role'')';

        EXECUTE 'CREATE POLICY "Admins and reviewers can update gig listings"
            ON public.gig_listings FOR UPDATE
            USING (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';

        EXECUTE 'CREATE POLICY "Admins can delete gig listings"
            ON public.gig_listings FOR DELETE
            USING (public.is_admin() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- 5b. payment_evidence (created in Phase 4 schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_evidence') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can manage payment evidence" ON public.payment_evidence';
        EXECUTE 'CREATE POLICY "Admins and reviewers can manage payment evidence"
            ON public.payment_evidence FOR ALL
            USING (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- 5c. listing_reviews (created in Phase 4 schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_reviews') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can create listing reviews" ON public.listing_reviews';
        EXECUTE 'CREATE POLICY "Admins and reviewers can create listing reviews"
            ON public.listing_reviews FOR INSERT
            WITH CHECK (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- 5d. listing_reports (created in Phase 4 schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listing_reports') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can view own reports" ON public.listing_reports';
        EXECUTE 'DROP POLICY IF EXISTS "Users view own reports or admins and reviewers view all" ON public.listing_reports';
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can update listing reports" ON public.listing_reports';

        EXECUTE 'CREATE POLICY "Users view own reports or admins and reviewers view all"
            ON public.listing_reports FOR SELECT
            USING (
                auth.uid() = reporter_id 
                OR public.is_admin_or_reviewer() 
                OR auth.role() = ''service_role''
            )';

        EXECUTE 'CREATE POLICY "Admins and reviewers can update listing reports"
            ON public.listing_reports FOR UPDATE
            USING (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- 5e. audit_events (created in Phase 4 schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_events') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admin read audit events" ON public.audit_events';
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can read audit events" ON public.audit_events';
        EXECUTE 'DROP POLICY IF EXISTS "Admins and reviewers can insert audit events" ON public.audit_events';

        EXECUTE 'CREATE POLICY "Admins and reviewers can read audit events"
            ON public.audit_events FOR SELECT
            USING (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';

        EXECUTE 'CREATE POLICY "Admins and reviewers can insert audit events"
            ON public.audit_events FOR INSERT
            WITH CHECK (public.is_admin_or_reviewer() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- 5f. affiliate_partners, sponsored_campaigns & launch_checklist_items (created in Phase 5 schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'affiliate_partners') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins manage affiliate partners" ON public.affiliate_partners';
        EXECUTE 'CREATE POLICY "Admins manage affiliate partners"
            ON public.affiliate_partners FOR ALL
            USING (public.is_admin() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin() OR auth.role() = ''service_role'')';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsored_campaigns') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins manage sponsored campaigns" ON public.sponsored_campaigns';
        EXECUTE 'CREATE POLICY "Admins manage sponsored campaigns"
            ON public.sponsored_campaigns FOR ALL
            USING (public.is_admin() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin() OR auth.role() = ''service_role'')';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'launch_checklist_items') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Admins manage launch checklist" ON public.launch_checklist_items';
        EXECUTE 'CREATE POLICY "Admins manage launch checklist"
            ON public.launch_checklist_items FOR ALL
            USING (public.is_admin() OR auth.role() = ''service_role'')
            WITH CHECK (public.is_admin() OR auth.role() = ''service_role'')';
    END IF;
END $$;

-- ==============================================================================
-- 6. Helper Procedure to Assign Initial Admin / Reviewer
-- Run this securely in the Supabase SQL Editor to bootstrap your admin account.
-- It requires elevated database privileges and cannot be executed by public users.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.assign_admin_role_by_email(target_email TEXT, assigned_role TEXT DEFAULT 'admin')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    IF assigned_role NOT IN ('admin', 'reviewer', 'user') THEN
        RAISE EXCEPTION 'Invalid role specified: %. Must be admin, reviewer, or user.', assigned_role;
    END IF;

    SELECT id INTO target_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER(TRIM(target_email));

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email "%" was not found in auth.users. Please create or invite the user first under Supabase Authentication -> Users.', target_email;
    END IF;

    INSERT INTO public.user_roles (user_id, role, updated_at)
    VALUES (target_user_id, assigned_role, NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET role = EXCLUDED.role,
        updated_at = NOW();
END;
$$;

-- Restrict execution to service_role and postgres superusers
REVOKE ALL ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT) TO service_role;

-- ==============================================================================
-- How to assign your first administrator account:
--
-- Step 1: In Supabase Dashboard, navigate to Authentication -> Users
-- Step 2: Click "Add User" -> "Create User" or "Invite User"
-- Step 3: Enter the admin email and complete password setup
-- Step 4: Run this admin_rbac.sql script in the SQL Editor
-- Step 5: Run the following query in the SQL Editor with your admin email:
--
--     SELECT public.assign_admin_role_by_email('your-admin-email@example.com', 'admin');
--
-- Step 6: Sign in at /admin/login using that email and password.
-- ==============================================================================
