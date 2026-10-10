import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchCommunityFeed } from "@/lib/community/queries";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunityFeedResult } from "@/lib/community/types";

export const metadata: Metadata = {
  title: "Community — Remotasks.si",
  description: "Join the Remotasks.si community. Share experiences, ask questions, and discuss AI evaluation platforms with fellow contributors.",
};

interface CommunityPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const search = resolvedParams.search || "";

  const supabase = createClient();
  let feedData: CommunityFeedResult = { posts: [], total: 0, page: 1, limit: 20, hasMore: false };

  if (supabase) {
    feedData = await fetchCommunityFeed(supabase, { page, search, limit: 20 });
  }

  return (
    <div className="min-h-screen bg-canvas-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink tracking-tight">Community</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Connect with fellow contributors. Share experiences, ask questions, and discuss AI evaluation platforms.
          </p>
        </header>

        <CommunityFeed
          initialPosts={feedData.posts}
          pagination={{
            page: feedData.page,
            limit: feedData.limit,
            total: feedData.total,
            hasMore: feedData.hasMore,
          }}
          search={search}
        />
      </div>
    </div>
  );
}