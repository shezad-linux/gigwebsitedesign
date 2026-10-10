/* ==============================================================================
   Community Queries
   Server-side read operations using Supabase client
   ============================================================================== */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  CommunityPost,
  CommunityReply,
  CommunityReport,
  PostWithReplies,
  CommunityFeedParams,
  CommunityFeedResult,
} from "./types";

const POSTS_PER_PAGE = 20;
const REPLIES_PER_PAGE = 50;

/* ==============================================================================
   Post Queries
   ============================================================================== */

export async function fetchCommunityFeed(
  supabase: SupabaseClient,
  params: CommunityFeedParams = {}
): Promise<CommunityFeedResult> {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? POSTS_PER_PAGE, POSTS_PER_PAGE);
  const offset = (page - 1) * limit;
  const search = params.search?.trim();

  let query = supabase
    .from("community_posts")
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching community feed:", error);
    throw new Error("Failed to fetch posts");
  }

  // Get author names and reply counts in parallel
  const authorIds = Array.from(new Set(data?.map((p) => p.author_id) || []));
  const postIds = data?.map((p) => p.id) || [];

  const [{ data: profiles }, { data: replyCounts }] = await Promise.all([
    authorIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name, country")
          .in("id", authorIds)
      : Promise.resolve({ data: [], error: null }),
    postIds.length > 0
      ? supabase
          .from("community_replies")
          .select("post_id")
          .in("post_id", postIds)
          .eq("status", "published")
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { name: p.full_name, country: p.country }])
  );

  const replyCountMap = new Map<string, number>();
  (replyCounts || []).forEach((r) => {
    replyCountMap.set(r.post_id, (replyCountMap.get(r.post_id) || 0) + 1);
  });

  const posts: CommunityPost[] = (data || []).map((p) => {
    const profile = profileMap.get(p.author_id);
    return {
      ...p,
      author_name: profile?.name || "Anonymous",
      author_country: profile?.country,
      reply_count: replyCountMap.get(p.id) || 0,
    };
  });

  return {
    posts,
    total: count || 0,
    page,
    limit,
    hasMore: offset + posts.length < (count || 0),
  };
}

export async function fetchPostWithReplies(
  supabase: SupabaseClient,
  postId: string,
  includeHidden: boolean = false
): Promise<PostWithReplies | null> {
  // Fetch post
  let postQuery = supabase
    .from("community_posts")
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .eq("id", postId);

  if (!includeHidden) {
    postQuery = postQuery.eq("status", "published");
  }

  const { data: post, error: postError } = await postQuery.single();

  if (postError || !post) {
    return null;
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, country")
    .eq("id", post.author_id)
    .single();

  // Fetch replies
  let replyQuery = supabase
    .from("community_replies")
    .select(
      `
      id,
      post_id,
      author_id,
      body,
      status,
      created_at,
      updated_at
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (!includeHidden) {
    replyQuery = replyQuery.eq("status", "published");
  }

  const { data: replies, error: repliesError } = await replyQuery;

  if (repliesError) {
    console.error("Error fetching replies:", repliesError);
    throw new Error("Failed to fetch replies");
  }

  // Fetch reply author profiles
  const replyAuthorIds = Array.from(new Set((replies || []).map((r) => r.author_id)));
  const { data: replyProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, country")
    .in("id", replyAuthorIds);

  const replyProfileMap = new Map(
    (replyProfiles || []).map((p) => [p.id, { name: p.full_name, country: p.country }])
  );

  return {
    post: {
      ...post,
      author_name: profile?.full_name || "Anonymous",
      author_country: profile?.country,
      reply_count: replies?.length || 0,
    },
    replies: (replies || []).map((r) => {
      const p = replyProfileMap.get(r.author_id);
      return {
        ...r,
        author_name: p?.name || "Anonymous",
        author_country: p?.country,
      };
    }),
  };
}

export async function fetchUserPosts(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 20
): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select(
      `
      id,
      author_id,
      title,
      body,
      link_url,
      affiliate_disclosure,
      status,
      created_at,
      updated_at
    `
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }

  return data || [];
}

/* ==============================================================================
   Reply Queries
   ============================================================================== */

export async function fetchRepliesForPost(
  supabase: SupabaseClient,
  postId: string,
  limit: number = REPLIES_PER_PAGE,
  offset: number = 0,
  includeHidden: boolean = false
): Promise<CommunityReply[]> {
  let query = supabase
    .from("community_replies")
    .select(
      `
      id,
      post_id,
      author_id,
      body,
      status,
      created_at,
      updated_at
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!includeHidden) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching replies:", error);
    throw new Error("Failed to fetch replies");
  }

  // Fetch author profiles
  const authorIds = Array.from(new Set((data || []).map((r) => r.author_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, country")
    .in("id", authorIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { name: p.full_name, country: p.country }])
  );

  return (data || []).map((r) => {
    const p = profileMap.get(r.author_id);
    return {
      ...r,
      author_name: p?.name || "Anonymous",
      author_country: p?.country,
    };
  });
}

/* ==============================================================================
   Report Queries
   ============================================================================== */

export async function fetchReportsQueue(
  supabase: SupabaseClient,
  status?: CommunityReport["status"],
  limit: number = 50,
  offset: number = 0
): Promise<CommunityReport[]> {
  let query = supabase
    .from("community_reports")
    .select(
      `
      id,
      reporter_id,
      post_id,
      reply_id,
      reason,
      details,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reports queue:", error);
    throw new Error("Failed to fetch reports");
  }

  // Enrich with post/reply info
  const postIds = Array.from(
    new Set((data || []).map((r) => r.post_id).filter(Boolean))
  );
  const replyIds = Array.from(
    new Set((data || []).map((r) => r.reply_id).filter(Boolean))
  );

  const [{ data: posts }, { data: replies }] = await Promise.all([
    postIds.length > 0
      ? supabase.from("community_posts").select("id, title").in("id", postIds)
      : Promise.resolve({ data: [], error: null }),
    replyIds.length > 0
      ? supabase.from("community_replies").select("id, body").in("id", replyIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const postMap = new Map((posts || []).map((p) => [p.id, p.title]));
  const replyMap = new Map((replies || []).map((r) => [r.id, r.body]));

  return (data || []).map((r) => ({
    ...r,
    post_title: r.post_id ? postMap.get(r.post_id) : undefined,
    reply_body: r.reply_id ? replyMap.get(r.reply_id)?.slice(0, 200) : undefined,
  }));
}

export async function fetchUserReports(
  supabase: SupabaseClient,
  userId: string
): Promise<CommunityReport[]> {
  const { data, error } = await supabase
    .from("community_reports")
    .select(
      `
      id,
      reporter_id,
      post_id,
      reply_id,
      reason,
      details,
      status,
      created_at
    `
    )
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user reports:", error);
    throw new Error("Failed to fetch user reports");
  }

  return data || [];
}

export async function checkExistingReport(
  supabase: SupabaseClient,
  reporterId: string,
  postId?: string,
  replyId?: string
): Promise<boolean> {
  let query = supabase
    .from("community_reports")
    .select("id")
    .eq("reporter_id", reporterId);

  if (postId) {
    query = query.eq("post_id", postId);
  }
  if (replyId) {
    query = query.eq("reply_id", replyId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Error checking existing report:", error);
    return false;
  }

  return !!data;
}