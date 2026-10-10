import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

export function getSanitizedSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return raw.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function isSupabaseConfigured(): boolean {
  const url = getSanitizedSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (
    url.length > 0 &&
    anonKey.length > 0 &&
    !url.includes("your-project-id")
  );
}

let browserClient: SupabaseClient | null = null;

/**
 * Creates or retrieves the singleton Supabase browser client with cookie session persistence.
 * Safe for use in Next.js Client Components.
 */
export function createClient(): SupabaseClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    const url = getSanitizedSupabaseUrl();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
