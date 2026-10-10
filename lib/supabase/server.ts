import { createServerClient } from "@supabase/ssr";
import { createClient as createJsClient, SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSanitizedSupabaseUrl, isSupabaseConfigured } from "./client";

export type UserRole = "admin" | "reviewer" | "user";

/**
 * Creates a server-side Supabase client bound to the current request cookies.
 * For use in Server Components, Server Actions, and Route Handlers.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = cookies();
  const url = getSanitizedSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}

/**
 * Privileged server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Never exposed to the browser. Used for administrative bootstrapping or server verification.
 */
export function getAdminClient(): SupabaseClient | null {
  const url = getSanitizedSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceRoleKey || url.includes("your-project-id")) {
    return null;
  }

  return createJsClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Retrieves the currently authenticated Supabase user from the server session.
 * Uses auth.getUser() which validates the JWT on the Supabase auth server.
 */
export async function getServerAuthUser(): Promise<User | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (err) {
    console.error("Error retrieving server auth user:", err);
    return null;
  }
}

/**
 * Queries the trusted public.user_roles table for the specified user's role.
 * Does NOT trust client metadata or editable profiles.
 */
export async function getServerUserRole(userId: string): Promise<UserRole | null> {
  // First attempt using the service-role client if configured (bypasses RLS)
  const adminClient = getAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data?.role) {
        return data.role as UserRole;
      }
    } catch (err) {
      console.warn("Failed querying user role via admin client:", err);
    }
  }

  // Fallback to session client (which obeys RLS policy: users can select own role)
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data?.role) {
      return data.role as UserRole;
    }
    return "user";
  } catch (err) {
    console.error("Failed querying user role from user_roles table:", err);
    return null;
  }
}

export interface AdminVerificationResult {
  authorized: boolean;
  user: User | null;
  role: UserRole | null;
  reason?: string;
  isDemoMode?: boolean;
}

/**
 * Server-enforced role verification for administrative operations.
 * Validates:
 * 1. User has an active Supabase session (or demo mode if unconfigured)
 * 2. Role is strictly 'admin' (or optionally 'reviewer')
 * 3. Role is queried from the trusted public.user_roles table on the server
 */
export async function verifyAdminSession(
  allowedRoles: UserRole[] = ["admin"]
): Promise<AdminVerificationResult> {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      user: null,
      role: null,
      reason: "Supabase authentication backend not configured. Access denied.",
    };
  }

  const user = await getServerAuthUser();
  if (!user) {
    return {
      authorized: false,
      user: null,
      role: null,
      reason: "No active session found. Please sign in.",
    };
  }

  const role = await getServerUserRole(user.id);
  if (!role) {
    return {
      authorized: false,
      user,
      role: null,
      reason: "No role assigned to this account in user_roles table.",
    };
  }

  const authorized = allowedRoles.includes(role);
  return {
    authorized,
    user,
    role,
    reason: authorized
      ? undefined
      : `Account role "${role}" is not authorized. Required: ${allowedRoles.join(" or ")}.`,
  };
}
