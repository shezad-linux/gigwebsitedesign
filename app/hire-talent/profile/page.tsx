import { Metadata } from "next";
import { createClient, getServerAuthUser } from "@/lib/supabase/server";
import { fetchTalentProfileById } from "@/lib/hire-talent/queries";
import { TalentProfileForm } from "@/components/hire-talent/TalentProfileForm";

export const metadata: Metadata = {
  title: "Talent Profile — Join Remotasks.si Professional Pool",
  description: "Create and manage your professional talent profile to receive managed project invitations and client requests.",
};

export default async function TalentProfilePage() {
  const user = await getServerAuthUser();
  const supabase = createClient();

  let existingProfile = null;
  if (user && supabase) {
    existingProfile = await fetchTalentProfileById(supabase, user.id);
  }

  return (
    <div className="min-h-screen bg-canvas-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">
            Professional Talent Profile
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Build your verified profile to receive curated project invitations matching your hourly rates, technical skills, and availability.
          </p>
        </div>

        <TalentProfileForm initialProfile={existingProfile} />
      </div>
    </div>
  );
}
