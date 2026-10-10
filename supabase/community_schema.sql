-- ==============================================================================
-- Community Schema: Posts, Replies, Reports with hardened RLS
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 2. Community Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 160),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 10000),
  link_url TEXT,
  affiliate_disclosure TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
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
-- 3. Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS community_posts_feed_idx
  ON public.community_posts (created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS community_posts_author_idx
  ON public.community_posts (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_replies_post_idx
  ON public.community_replies (post_id, created_at)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS community_replies_author_idx
  ON public.community_replies (author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_reports_status_idx
  ON public.community_reports (status, created_at);

CREATE INDEX IF NOT EXISTS community_reports_reporter_idx
  ON public.community_reports (reporter_id, created_at DESC);

-- ==============================================================================
-- 4. Hardened SECURITY DEFINER Functions
-- ==============================================================================

-- Moderator check: user has admin or reviewer role
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

-- Check if a specific user can moderate community content
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
-- 5. Enable RLS on all community tables
-- ==============================================================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. Revoke broad grants, grant minimal required columns
-- ==============================================================================

REVOKE ALL ON public.community_posts FROM anon, authenticated;
REVOKE ALL ON public.community_replies FROM anon, authenticated;
REVOKE ALL ON public.community_reports FROM anon, authenticated;

GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT SELECT ON public.community_replies TO anon, authenticated;

GRANT INSERT (author_id, title, body, link_url, affiliate_disclosure)
  ON public.community_posts TO authenticated;

GRANT UPDATE (title, body, link_url, affiliate_disclosure, updated_at)
  ON public.community_posts TO authenticated;

GRANT DELETE ON public.community_posts TO authenticated;

GRANT INSERT (post_id, author_id, body)
  ON public.community_replies TO authenticated;

GRANT DELETE ON public.community_replies TO authenticated;

GRANT INSERT (reporter_id, post_id, reply_id, reason, details)
  ON public.community_reports TO authenticated;

-- ==============================================================================
-- 7. RLS Policies for community_posts
-- ==============================================================================

-- Published posts are public
CREATE POLICY "Published posts are public"
ON public.community_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Authors can view their own posts (including hidden/removed)
CREATE POLICY "Authors can view their own posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND status = 'published'
);

-- Authors can edit their own published posts
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

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- Moderators can hide/restore any post (update status)
CREATE POLICY "Moderators can moderate posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 8. RLS Policies for community_replies
-- ==============================================================================

-- Published replies on published posts are public
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

-- Authors can view their own replies
CREATE POLICY "Authors can view their own replies"
ON public.community_replies FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Users can reply to published posts
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

-- Authors can delete their own replies
CREATE POLICY "Authors can delete their replies"
ON public.community_replies FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- Moderators can hide/restore any reply
CREATE POLICY "Moderators can moderate replies"
ON public.community_replies FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 9. RLS Policies for community_reports
-- ==============================================================================

-- Users can submit reports
CREATE POLICY "Users can report content"
ON public.community_reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.community_reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

-- Moderators can view all reports
CREATE POLICY "Moderators can view all reports"
ON public.community_reports FOR SELECT
TO authenticated
USING (public.can_moderate_community());

-- Moderators can update report status
CREATE POLICY "Moderators can update report status"
ON public.community_reports FOR UPDATE
TO authenticated
USING (public.can_moderate_community())
WITH CHECK (public.can_moderate_community());

-- ==============================================================================
-- 10. Updated-at triggers
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