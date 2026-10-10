import { NextRequest, NextResponse } from "next/server";
import { sendTestEmail, getEmailConfig } from "@/lib/email";
import { verifyAdminSession } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting: max 5 test emails per minute per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`admin-test-email:${clientIp}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 5,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many test email requests. Please wait 60 seconds before testing again." },
        { status: 429 }
      );
    }

    // 2. Admin authorization check
    if (isSupabaseConfigured()) {
      const authResult = await verifyAdminSession(["admin"]);
      if (!authResult.authorized) {
        return NextResponse.json(
          { error: authResult.reason || "Unauthorized: Administrator access required." },
          { status: authResult.user ? 403 : 401 }
        );
      }
    }

    // 3. Parse and validate recipient
    const body = await req.json();
    const recipient = body?.recipient?.trim();

    if (!recipient || !/^\S+@\S+\.\S+$/.test(recipient)) {
      return NextResponse.json(
        { error: "A valid recipient email address is required." },
        { status: 400 }
      );
    }

    const config = getEmailConfig();
    const result = await sendTestEmail(recipient);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to dispatch test email.",
          config: {
            provider: config.provider,
            from: config.from,
            isConfigured: config.isConfigured,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      simulated: result.simulated,
      id: result.id,
      message: result.simulated
        ? `Test email simulated successfully for ${recipient}. In production with RESEND_API_KEY, this will be dispatched live.`
        : `Live test email successfully dispatched via Resend to ${recipient}!`,
      config: {
        provider: config.provider,
        from: config.from,
        isConfigured: config.isConfigured,
      },
    });
  } catch (error: any) {
    console.error("Test email route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error dispatching test email." },
      { status: 500 }
    );
  }
}
