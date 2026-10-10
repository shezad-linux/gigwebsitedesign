"use server";

import { createClient, getServerUserRole, UserRole } from "./server";
import { isSupabaseConfigured } from "./client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export interface LoginActionResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  email?: string;
  isDemo?: boolean;
}

/**
 * Server action for admin authentication.
 * Enforces server-side credentials verification + server-side RBAC check before
 * granting access to /admin.
 */
export async function adminLoginAction(
  prevState: any,
  formData: FormData
): Promise<LoginActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: "Please provide both email and password.",
    };
  }

  // Rate limiting: max 5 login attempts per 60s per email to stop credential stuffing
  const rateLimit = checkRateLimit(`admin-login:${email.toLowerCase()}`, {
    interval: 60_000,
    uniqueTokenPerInterval: 5,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many sign-in attempts. Please wait 60 seconds before trying again.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Authentication service unavailable: Supabase credentials are not configured in environment variables.",
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Supabase client initialization failed.",
    };
  }

  // Step 1: Verify credentials against Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !data.user) {
    return {
      success: false,
      error: authError?.message || "Invalid email or password.",
    };
  }

  const user = data.user;

  // Step 2: Strictly verify role on the server from public.user_roles
  const role = await getServerUserRole(user.id);

  if (role !== "admin" && role !== "reviewer") {
    // SECURITY ENFORCEMENT: Immediately invalidate session for unauthorized users
    await supabase.auth.signOut();

    return {
      success: false,
      error: `Access Denied: Account "${user.email}" does not have administrative privileges (Current role: ${role || "unassigned"}). Please contact the platform owner to assign the admin role.`,
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    role,
    email: user.email,
  };
}

/**
 * Server action for admin logout.
 * Clears cookies and session on the server.
 */
export async function adminSignOutAction(): Promise<{ success: boolean }> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Server action to inspect the current session's role status.
 */
export async function getAdminSessionStatusAction(): Promise<{
  authenticated: boolean;
  authorized: boolean;
  role: UserRole | null;
  email: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return {
      authenticated: false,
      authorized: false,
      role: null,
      email: null,
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      authenticated: false,
      authorized: false,
      role: null,
      email: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      authorized: false,
      role: null,
      email: null,
    };
  }

  const role = await getServerUserRole(user.id);
  const authorized = role === "admin" || role === "reviewer";

  return {
    authenticated: true,
    authorized,
    role,
    email: user.email || null,
  };
}
