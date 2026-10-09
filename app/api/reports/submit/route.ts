import { NextRequest, NextResponse } from "next/server";
import { insertSupabaseReport, isSupabaseConfigured } from "@/lib/supabase";
import { submitReport } from "@/lib/operations";
import { ReportType } from "@/types/gig";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gigId, gigTitle, platformName, reporterEmail, reportType, description } = body;

    if (!gigId || !reportType || !description) {
      return NextResponse.json(
        { error: "Missing required fields: gigId, reportType, and description are required." },
        { status: 400 }
      );
    }

    const payload = {
      gigId,
      gigTitle: gigTitle || "AI Gig Opportunity",
      platformName: platformName || "Platform",
      reporterEmail: reporterEmail || undefined,
      reportType: reportType as ReportType,
      description: description.trim(),
    };

    if (isSupabaseConfigured()) {
      try {
        await insertSupabaseReport(payload);
      } catch (err) {
        console.warn("Supabase insert report error, falling back to local storage:", err);
      }
    }

    const createdReport = submitReport(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully to operations queue.",
        data: createdReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in report submission API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error submitting report." },
      { status: 500 }
    );
  }
}
