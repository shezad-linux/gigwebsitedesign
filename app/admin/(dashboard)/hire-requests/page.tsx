import React from "react";
import { HireRequestsTab } from "@/components/admin/HireRequestsTab";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export const metadata = {
  title: "Hire Talent Requests | Admin Operations Console",
  description: "Managed matching queue for business hire talent project briefs.",
};

export default function AdminHireRequestsPage() {
  return (
    <div className="min-h-screen bg-canvas-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Link href="/admin" className="hover:text-black flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Operations Console
          </Link>
          <span>/</span>
          <span className="text-black">Hire Requests</span>
        </div>

        <HireRequestsTab />
      </div>
    </div>
  );
}
