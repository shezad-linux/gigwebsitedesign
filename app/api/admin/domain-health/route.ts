import { NextRequest, NextResponse } from "next/server";
import { getDomainHealthReport } from "@/lib/domain-health";
import { verifyAdminSession } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // If Supabase is configured, enforce admin authentication
    if (isSupabaseConfigured()) {
      const authResult = await verifyAdminSession(["admin", "reviewer"]);
      if (!authResult.authorized) {
        return NextResponse.json(
          { error: authResult.reason || "Unauthorized: Administrator access required." },
          { status: authResult.user ? 403 : 401 }
        );
      }
    }

    // Determine host from request headers or environment
    const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const protoHeader = req.headers.get("x-forwarded-proto") || "http";
    const requestUrl = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;

    const report = await getDomainHealthReport(requestUrl);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Failed to generate domain health report:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error inspecting domain health." },
      { status: 500 }
    );
  }
}
