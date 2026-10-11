import { Metadata } from "next";
import { Suspense } from "react";
import { ProjectRequestForm } from "@/components/hire-talent/ProjectRequestForm";

export const metadata: Metadata = {
  title: "Post a Project Request — Hire Talent | Remotasks.si",
  description:
    "Submit your technical scope, choose between hourly and fixed-price hiring models, and get matched with verified specialists within 48 hours.",
};

export default function ProjectRequestPage() {
  return (
    <div className="min-h-screen bg-canvas-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading request form...</div>}>
          <ProjectRequestForm />
        </Suspense>
      </div>
    </div>
  );
}
