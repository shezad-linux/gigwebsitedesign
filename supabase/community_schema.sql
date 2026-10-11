-- ==============================================================================
-- Community Schema: Posts, Replies, Reports, Automated Moderation & User Restrictions
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 2. Community Core Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 10000),
  link_url TEXT,
  affiliate_disclosure TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  flag_reason TEXT,
  review_status TEXT NOT NULL DEFAULT 'none' CHECK (review_status IN ('none', 'needs_review', 'urgent', 'resolved')),
  report_count INT NOT NULL DEFAULT 0,
  report_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_posts_http_url CHECK (
    link_url IS NULL OR link_url ~* '^https?://'
  )
);

CREATE TABLE IF NOT EXISTS public.community_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  flag_reason TEXT,
  review_status TEXT NOT NULL DEFAULT 'none' CHECK (review_status IN ('none', 'needs_review', 'urgent', 'resolved')),
  report_count INT NOT NULL DEFAULT 0,
  report_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'scam', 'misleading', 'abuse', 'other')),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 2000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT report_one_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL)
    OR (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  CONSTRAINT unique_report_per_user_per_post UNIQUE (reporter_id, post_id),
  CONSTRAINT unique_report_per_user_per_reply UNIQUE (reporter_id, reply_id)
);

-- ==============================================================================
-- 3. Community User Restrictions & Moderation Audit Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_user_restrictions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'warned', 'restricted', 'suspended')),
  reason TEXT,
  restricted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_moderation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'reply', 'user', 'report')),
  target_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('system', 'admin', 'moderator')),
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  risk_level TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backward compatibility migration for pre-existing tables
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low';
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS report_score NUMERIC(6,2) NOT NULL DEFAULT 0.00;

ALTER TABLE public.community_replies ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'low';
ALTER TABLE public.community_replies ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE public.community_replies ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.community_replies ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.community_replies ADD COLUMN IF NOT EXISTS report_score NUMERIC(6,2) NOT NULL DEFAULT 0.00;

-- ==============================================================================
-- 4. Indexes for Feed and Exception Queues
-- ==============================================================================

CREATE INDEX IF NOT EXISTS community_posts_feed_idx
  ON public.community_posts (created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS community_posts_author_idx
  ON public.community_posts (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_review_status_idx
  ON public.community_posts (review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_risk_idx
  ON public.community_posts (risk_level, created_at DESC);

CREATE INDEX IF NOT EXISTS community_replies_post_idx
  ON public.community_replies (post_id, created_at)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS community_replies_author_idx
  ON public.community_replies (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_reports_status_idx
  ON public.community_reports (status, created_at);

CREATE INDEX IF NOT EXISTS community_reports_reporter_idx
  ON public.community_reports (reporter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_moderation_audit_created_idx
  ON public.community_moderation_audit (created_at DESC);

-- ==============================================================================
-- 5. Hardened SECURITY DEFINER Helper Functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'reviewer')
    );
$$;

CREATE OR REPLACE FUNCTION public.can_moderate_community(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = target_user_id
          AND role IN ('admin', 'reviewer')
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_moderator() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_moderate_community(UUID) TO authenticated, service_role;

-- ==============================================================================
-- 6. Enable RLS on All Tables
-- ==============================================================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderation_audit ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. Grant Minimal Required Permissions
-- ==============================================================================

REVOKE ALL ON public.community_posts FROM anon, authenticated;
REVOKE ALL ON public.community_replies FROM anon, authenticated;
REVOKE ALL ON public.community_reports FROM anon, authenticated;
REVOKE ALL ON public.community_user_restrictions FROM anon, authenticated;
REVOKE ALL ON public.community_moderation_audit FROM anon, authenticated;

-- Public & Authenticated Read Permissions
GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT SELECT ON public.community_replies TO anon, authenticated;

-- Authenticated Member Mutation Permissions
GRANT INSERT (author_id, title, body, link_url, affiliate_disclosure, status)
  ON public.community_posts TO authenticated;

GRANT UPDATE (title, body, link_url, affiliate_disclosure, updated_at)
  ON public.community_posts TO authenticated;

GRANT DELETE ON public.community_posts TO authenticated;

GRANT INSERT (post_id, author_id, body, status)
  ON public.community_replies TO authenticated;

GRANT DELETE ON public.community_replies TO authenticated;

GRANT INSERT (reporter_id, post_id, reply_id, reason, details, status)
  ON public.community_reports TO authenticated;

-- User can check own restrictions
GRANT SELECT ON public.community_user_restrictions TO authenticated;

-- ==============================================================================
-- 8. RLS Policies: community_posts
-- ==============================================================================

CREATE POLICY "Published posts are public"
ON public.community_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Authors can view their own posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Authenticated users can create posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND status = 'published'
);

CREATE POLICY "Authors can edit their posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid()
  AND status = 'published'
)
WITH CHECK (
  author_id = auth.uid()
  AND status = 'published'
);

CREATE POLICY "Authors can delete their posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Moderators can view all posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (public.can_moderate_community());

CREATE POLICY "Moderators can moderate posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 9. RLS Policies: community_replies
-- ==============================================================================

CREATE POLICY "Published replies are public"
ON public.community_replies FOR SELECT
TO anon, authenticated
USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM public.community_posts p
    WHERE p.id = post_id AND p.status = 'published'
  )
);

CREATE POLICY "Authors can view their own replies"
ON public.community_replies FOR SELECT
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Users can reply to published posts"
ON public.community_replies FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND status = 'published'
  AND EXISTS (
    SELECT 1 FROM public.community_posts p
    WHERE p.id = post_id AND p.status = 'published'
  )
);

CREATE POLICY "Authors can delete their replies"
ON public.community_replies FOR DELETE
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Moderators can view all replies"
ON public.community_replies FOR SELECT
TO authenticated
USING (public.can_moderate_community());

CREATE POLICY "Moderators can moderate replies"
ON public.community_replies FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 10. RLS Policies: community_reports
-- ==============================================================================

CREATE POLICY "Users can report content"
ON public.community_reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view own reports"
ON public.community_reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "Moderators can view all reports"
ON public.community_reports FOR SELECT
TO authenticated
USING (public.can_moderate_community());

CREATE POLICY "Moderators can update report status"
ON public.community_reports FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 11. RLS Policies: community_user_restrictions
-- ==============================================================================

CREATE POLICY "Users can view own restriction status"
ON public.community_user_restrictions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Moderators can view all user restrictions"
ON public.community_user_restrictions FOR SELECT
TO authenticated
USING (public.can_moderate_community());

CREATE POLICY "Moderators can manage user restrictions"
ON public.community_user_restrictions FOR ALL
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 12. RLS Policies: community_moderation_audit
-- ==============================================================================

CREATE POLICY "Moderators can view moderation audit"
ON public.community_moderation_audit FOR SELECT
TO authenticated
USING (public.can_moderate_community());

CREATE POLICY "Moderators can insert moderation audit"
ON public.community_moderation_audit FOR INSERT
TO authenticated
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 13. Updated-at triggers
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_replies_updated_at ON public.community_replies;
CREATE TRIGGER update_community_replies_updated_at
    BEFORE UPDATE ON public.community_replies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_user_restrictions_updated_at ON public.community_user_restrictions;
CREATE TRIGGER update_community_user_restrictions_updated_at
    BEFORE UPDATE ON public.community_user_restrictions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();