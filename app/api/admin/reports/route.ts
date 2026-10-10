import { NextRequest, NextResponse } from "next/server";
import {
  fetchSupabaseReports,
  updateSupabaseReportStatus,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  getStoredListingReports,
  updateListingReportStatus,
} from "@/lib/operations";
import { ReportStatus } from "@/types/gig";
import { verifyAdminSession } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Server-enforced role check: only admins & reviewers can view full reports queue
    const authResult = await verifyAdminSession(["admin", "reviewer"]);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || "Forbidden: Administrator or reviewer role required." },
        { status: authResult.user ? 403 : 401 }
      );
    }

    if (isSupabaseConfigured()) {
      const reports = await fetchSupabaseReports();
      if (reports && reports.length > 0) {
        return NextResponse.json({ success: true, data: reports });
      }
    }
    const localReports = getStoredListingReports();
    return NextResponse.json({ success: true, data: localReports });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch reports." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Server-enforced role check: mutations require admin or reviewer role
    const authResult = await verifyAdminSession(["admin", "reviewer"]);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || "Forbidden: Administrator or reviewer role required to modify reports." },
        { status: authResult.user ? 403 : 401 }
      );
    }

    const body = await req.json();
    const { reportId, status, resolutionNotes, actorEmail } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { error: "reportId and status are required." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      try {
        await updateSupabaseReportStatus(reportId, status as ReportStatus, resolutionNotes);
      } catch (err) {
        console.warn("Supabase update report status failed:", err);
      }
    }

    const effectiveActor = authResult.user?.email || actorEmail || "admin@gigmatcher.io";

    const updated = updateListingReportStatus(
      reportId,
      status as ReportStatus,
      resolutionNotes,
      effectiveActor
    );

    return NextResponse.json({
      success: true,
      message: `Report ${reportId} marked as ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update report status." },
      { status: 500 }
    );
  }
}
