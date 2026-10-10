import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyChallengeToken } from "@/lib/auth-otp";
import { getAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp, challengeToken } = body;

    if (!email || !otp || !challengeToken) {
      return NextResponse.json(
        { success: false, error: "Missing required verification parameters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Rate limiting on verify attempts (max 5 attempts per 60s per email)
    const rateLimit = checkRateLimit(`verify-otp:${normalizedEmail}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 5,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please wait 60 seconds before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Cryptographic verification of token and OTP
    const verification = verifyChallengeToken({
      email: normalizedEmail,
      otp,
      challengeToken,
    });

    if (!verification.success || !verification.payload) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || "Invalid or expired verification code.",
        },
        { status: 400 }
      );
    }

    const { payload } = verification;
    let userId = payload.userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    let displayName = payload.fullName || "Candidate";

    // 3. Database Persistence in Supabase (if configured)
    const adminClient = getAdminClient();
    if (adminClient) {
      try {
        if (payload.mode === "signup") {
          // Create or retrieve auth user
          const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
            email: normalizedEmail,
            email_confirm: true,
            user_metadata: {
              full_name: displayName,
            },
          });

          if (!createError && createData?.user) {
            userId = createData.user.id;
          } else if (createError) {
            // If already in auth.users, find existing ID
            const { data: usersData } = await adminClient.auth.admin.listUsers();
            const existing = usersData?.users?.find(
              (u) => u.email?.toLowerCase() === normalizedEmail
            );
            if (existing) userId = existing.id;
          }

          // Create initial candidate profile record
          await adminClient.from("profiles").upsert({
            id: userId,
            email: normalizedEmail,
            full_name: displayName,
            country: "India",
            country_code: "IN",
            experience_level: "mid",
            updated_at: new Date().toISOString(),
          });
        } else {
          // Mode is signin: query latest profile details
          const { data: existingProfile } = await adminClient
            .from("profiles")
            .select("id, full_name, email")
            .eq("email", normalizedEmail)
            .maybeSingle();

          if (existingProfile) {
            userId = existingProfile.id;
            displayName = existingProfile.full_name || displayName;
          }
        }
      } catch (dbErr) {
        console.warn("Could not sync with Supabase profiles during OTP verify:", dbErr);
      }
    }

    const authenticatedUser = {
      id: userId,
      email: normalizedEmail,
      fullName: displayName,
      role: "user" as const,
      verifiedAt: new Date().toISOString(),
    };

    // 4. Create response and attach secure session cookie
    const response = NextResponse.json({
      success: true,
      message: "Email successfully verified!",
      user: authenticatedUser,
    });

    response.cookies.set("remotasks_user_session", JSON.stringify(authenticatedUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      httpOnly: false, // Accessible to client-side auth context
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: any) {
    console.error("Unhandled error in verify-otp route:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while verifying code." },
      { status: 500 }
    );
  }
}
