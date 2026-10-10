import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getServerAuthUser } from "@/lib/supabase/server";
import { CreatePostForm } from "@/components/community/CreatePostForm";
import { CommunityAuthPrompt } from "@/components/community/CommunityAuthPrompt";

export const metadata: Metadata = {
  title: "Create Post — Community — Remotasks.si",
  description: "Share your experience or ask a question in the Remotasks.si community.",
};

export default async function NewPostPage() {
  const supabase = createClient();
  let user = null;
  if (supabase) {
    try {
      user = await getServerAuthUser();
    } catch {
      user = null;
    }
  }

  return (
    <div className="min-h-screen bg-canvas-bg">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink tracking-tight">Create Post</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Share your experience, ask a question, or start a discussion.
          </p>
        </header>

        {user ? (
          <CreatePostForm />
        ) : (
          <CommunityAuthPrompt
            redirectTo="/community/new"
            title="Sign in with Google to post"
            description="To keep discussions helpful and protect the community from spam and scams, please sign in with Google before publishing."
          />
        )}
      </div>
    </div>
  );
}