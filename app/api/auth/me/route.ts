import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuthUser } from "@/lib/supabase/server";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("remotasks_user_session");

  if (sessionCookie?.value) {
    try {
      const user = JSON.parse(sessionCookie.value);
      return NextResponse.json({
        authenticated: true,
        user,
      });
    } catch {
      // Invalid cookie JSON
    }
  }

  // Fallback to Supabase server auth
  const supabaseUser = await getServerAuthUser();
  if (supabaseUser) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        fullName:
          (supabaseUser.user_metadata?.full_name as string) ||
          supabaseUser.email?.split("@")[0] ||
          "Candidate",
        role: "user",
      },
    });
  }

  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}
