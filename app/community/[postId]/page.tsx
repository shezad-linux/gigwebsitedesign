import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPostWithReplies } from "@/lib/community/queries";
import { PostDetail } from "@/components/community/PostDetail";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { postId } = await params;
  const supabase = createClient();
  let title = "Post — Community — Remotasks.si";

  if (supabase) {
    const { data: post } = await supabase
      .from("community_posts")
      .select("title")
      .eq("id", postId)
      .eq("status", "published")
      .single();
    if (post) {
      title = `${post.title} — Community — Remotasks.si`;
    }
  }

  return {
    title,
    description: "View and participate in community discussion on Remotasks.si.",
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const supabase = createClient();

  if (!supabase) {
    notFound();
  }

  let result = null;
  try {
    result = await fetchPostWithReplies(supabase, postId, false);
  } catch (err) {
    console.error("Failed to load post:", err);
  }

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PostDetail post={result.post} replies={result.replies} />
      </div>
    </div>
  );
}