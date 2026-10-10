import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSanitizedSupabaseUrl } from "@/lib/supabase/client";

/**
 * Supabase Auth Callback Route Handler (Next.js App Router)
 * 
 * Exchanges PKCE auth code for session tokens and sets HTTP-only cookies.
 * Handles OAuth redirects (Google) and synchronizes candidate profile state.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const url = getSanitizedSupabaseUrl();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (url && anonKey) {
      const supabase = createServerClient(url, anonKey, {
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
              // Ignore if invoked in an environment where cookies cannot be set
            }
          },
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const user = data.session.user;
        const displayName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          user.email?.split("@")[0] ||
          "Candidate";

        // Sync candidate profile in public.profiles table
        try {
          await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email,
              full_name: displayName,
              country: "India",
              country_code: "IN",
              experience_level: "mid",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch (dbErr) {
          console.warn("Could not upsert profile on Google OAuth callback:", dbErr);
        }

        // Set readable candidate session cookie
        const sessionPayload = {
          id: user.id,
          email: user.email,
          fullName: displayName,
          role: "user",
          verifiedAt: new Date().toISOString(),
        };

        cookieStore.set("remotasks_user_session", JSON.stringify(sessionPayload), {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: "lax",
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
        });

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }
  }

  // Fallback to home page if code exchange fails or is missing
  return NextResponse.redirect(`${origin}/`);
}
