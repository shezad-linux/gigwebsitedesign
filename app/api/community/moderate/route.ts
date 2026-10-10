import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyModeratorSession } from "@/lib/supabase/server";
import { moderatePostSchema, moderateReplySchema, resolveReportSchema } from "@/lib/community/validation";
import {
  moderatePostStatus,
  moderateReplyStatus,
  updateReportStatus,
} from "@/lib/community/mutations";
import {
  auditPostModeration,
  auditReplyModeration,
  auditReportResolution,
} from "@/lib/community/audit";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyModeratorSession();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { error: auth.reason || "Moderator access required" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { type, targetId, action, status, resolutionNotes, reason } = body;

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    switch (type) {
      case "post": {
        const validated = moderatePostSchema.safeParse({ action, reason });
        if (!validated.success) {
          return NextResponse.json(
            { error: "Invalid input", details: validated.error.flatten() },
            { status: 400 }
          );
        }

        const post = await moderatePostStatus(
          supabase,
          targetId,
          action === "hide" ? "hidden" : "restored"
        );

        if (post) {
          await auditPostModeration(supabase, targetId, auth.user.email || "unknown", action, reason);
        }

        return NextResponse.json({
          success: true,
          message: `Post ${action}d successfully`,
          data: post,
        });
      }

      case "reply": {
        const validated = moderateReplySchema.safeParse({ action, reason });
        if (!validated.success) {
          return NextResponse.json(
            { error: "Invalid input", details: validated.error.flatten() },
            { status: 400 }
          );
        }

        const reply = await moderateReplyStatus(
          supabase,
          targetId,
          action === "hide" ? "hidden" : "restored"
        );

        if (reply) {
          await auditReplyModeration(supabase, targetId, auth.user.email || "unknown", action, reason);
        }

        return NextResponse.json({
          success: true,
          message: `Reply ${action}d successfully`,
          data: reply,
        });
      }

      case "report": {
        const validated = resolveReportSchema.safeParse({ status, resolutionNotes });
        if (!validated.success) {
          return NextResponse.json(
            { error: "Invalid input", details: validated.error.flatten() },
            { status: 400 }
          );
        }

        const report = await updateReportStatus(
          supabase,
          targetId,
          status,
          resolutionNotes
        );

        if (report) {
          await auditReportResolution(supabase, targetId, auth.user.email || "unknown", status, resolutionNotes);
        }

        return NextResponse.json({
          success: true,
          message: `Report ${status} successfully`,
          data: report,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid moderation type. Must be 'post', 'reply', or 'report'" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Community moderate API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform moderation action" },
      { status: 500 }
    );
  }
}