import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createClient,
  getAdminClient,
  getServerAuthUser,
  getServerUserRole,
} from "@/lib/supabase/server";
import { fetchHireRequestById } from "@/lib/hire-talent/queries";
import { RequestDetailView } from "@/components/hire-talent/RequestDetailView";

interface RequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RequestDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const effectiveClient = getAdminClient() || createClient();

  if (effectiveClient) {
    const { request } = await fetchHireRequestById(effectiveClient, id);
    if (request) {
      return {
        title: `${request.title} — Hire Talent | Remotasks.si`,
        description: request.description.slice(0, 160),
      };
    }
  }

  return {
    title: "Project Request Details — Remotasks.si",
  };
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const user = await getServerAuthUser();
  const role = user ? await getServerUserRole(user.id) : null;
  const isAdmin = role === "admin" || role === "reviewer";

  const effectiveClient = getAdminClient() || createClient();
  if (!effectiveClient) {
    notFound();
  }

  const { request, matches, proposals, activity } = await fetchHireRequestById(effectiveClient, id);

  if (!request) {
    notFound();
  }

  const isOwner = !!(user && user.id === request.client_id);

  // If not admin and not owner, check if user is matched talent
  if (!isAdmin && !isOwner) {
    const isMatched = matches.some((m) => m.talent_id === user?.id);
    if (!isMatched) {
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-canvas-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <RequestDetailView
          request={request}
          matches={matches}
          proposals={proposals}
          activity={activity}
          currentUserId={user?.id}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
