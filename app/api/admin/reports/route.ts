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

export async function GET() {
  try {
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

    const updated = updateListingReportStatus(
      reportId,
      status as ReportStatus,
      resolutionNotes,
      actorEmail || "admin@gigmatcher.io"
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
