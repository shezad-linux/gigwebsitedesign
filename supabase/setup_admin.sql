-- ==============================================================================
-- Self-Contained Admin Setup & Direct Role Assignment
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'reviewer', 'user')) DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Trusted Security Definer Functions for Role Checking
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

GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_reviewer() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_current_role() TO authenticated, service_role;

-- 3. Default role assignment for new public signups (prevents privilege escalation)
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

-- 4. RLS policies on user_roles
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

-- 5. Helper Function: assign_admin_role_by_email
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

REVOKE ALL ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_by_email(TEXT, TEXT) TO service_role;

-- 6. Direct Role Assignment for shezad@remotasks.si
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE LOWER(email) = LOWER('shezad@remotasks.si');

    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role, updated_at)
        VALUES (v_user_id, 'admin', NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET role = 'admin', updated_at = NOW();
    END IF;
END $$;

-- 7. Verification Output: Inspect role assigned to shezad@remotasks.si
SELECT 
    u.id AS user_id, 
    u.email, 
    COALESCE(r.role, 'NOT_YET_ASSIGNED') AS role,
    r.updated_at
FROM auth.users u
LEFT JOIN public.user_roles r ON u.id = r.user_id
WHERE LOWER(u.email) = LOWER('shezad@remotasks.si');
