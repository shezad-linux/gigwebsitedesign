import { Metadata } from "next";
import Link from "next/link";
import { Plus, Clock, DollarSign, ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createClient, getServerAuthUser } from "@/lib/supabase/server";
import { fetchHireRequestsByClient } from "@/lib/hire-talent/queries";

export const metadata: Metadata = {
  title: "My Project Requests — Hire Talent | Remotasks.si",
  description: "View and manage your submitted hiring requests, talent matches, and proposal quotes.",
};

export default async function ClientRequestsPage() {
  const user = await getServerAuthUser();
  const supabase = createClient();

  const requests = user && supabase ? await fetchHireRequestsByClient(supabase, user.id) : [];

  return (
    <div className="min-h-screen bg-canvas-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">
              My Project Requests
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track matching progress, review proposals, and manage accepted specialists.
            </p>
          </div>

          <Link href="/hire-talent/request">
            <Button size="sm" className="bg-black text-white hover:bg-neutral-800 text-xs font-bold gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              Post New Project
            </Button>
          </Link>
        </div>

        {requests.length === 0 ? (
          <Card className="bg-white border-neutral-200 text-center py-16">
            <CardContent className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-black">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-black">No project requests yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Post a project with your requirements and our team will match suitable professionals for your review.
                </p>
              </div>
              <Link href="/hire-talent/request">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-800 text-xs font-bold">
                  Post a Project Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id} className="bg-white border-neutral-200 hover:border-black transition-all">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-neutral-100 text-neutral-800">
                        {req.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {req.category.replace("-", " ")}
                      </span>
                      <span className="text-xs text-neutral-400 capitalize">
                        • {req.hiring_model}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-black hover:underline">
                      <Link href={`/hire-talent/requests/${req.id}`}>{req.title}</Link>
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-2 max-w-2xl">
                      {req.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-black">
                      {req.hiring_model === "hourly"
                        ? `$${req.budget_min || 40} - $${req.budget_max || 90}/hr`
                        : `$${req.budget_min || 1000} - $${req.budget_max || 5000} Total`}
                    </span>

                    <Link href={`/hire-talent/requests/${req.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold gap-1 border-neutral-300 hover:bg-neutral-50">
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
