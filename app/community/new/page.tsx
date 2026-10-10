import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerAuthUser } from "@/lib/supabase/server";
import { CreatePostForm } from "@/components/community/CreatePostForm";

export const metadata: Metadata = {
  title: "Create Post — Community — Remotasks.si",
  description: "Share your experience or ask a question in the Remotasks.si community.",
};

export default async function NewPostPage() {
  const supabase = createClient();
  const user = supabase ? await getServerAuthUser() : null;

  if (!user) {
    redirect("/auth/callback?next=/community/new");
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

        <CreatePostForm />
      </div>
    </div>
  );
}