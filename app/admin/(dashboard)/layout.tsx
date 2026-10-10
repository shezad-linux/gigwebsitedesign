import React from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/supabase/server";
import { AccessDeniedScreen } from "@/components/admin/AccessDeniedScreen";

export const metadata = {
  title: "Admin Operations Console | Gig Matcher",
  description: "Server-enforced role-based access control admin dashboard.",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-enforced RBAC verification
  // Inspects user session and validates role against public.user_roles in database
  const { authorized, user, role, reason } = await verifyAdminSession([
    "admin",
    "reviewer",
  ]);

  if (!authorized) {
    if (!user) {
      // Unauthenticated visitor
      redirect("/admin/login?next=/admin");
    }

    // Authenticated user without admin/reviewer role
    return (
      <AccessDeniedScreen
        email={user.email}
        role={role}
        reason={reason}
      />
    );
  }

  return <>{children}</>;
}
