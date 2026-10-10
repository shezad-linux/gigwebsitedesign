import { NextRequest, NextResponse } from "next/server";
import { insertSupabaseReport, isSupabaseConfigured } from "@/lib/supabase";
import { submitReport } from "@/lib/operations";
import { ReportType } from "@/types/gig";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Enforce rate limit: max 15 submissions per 60s per client IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`report-submit:${clientIp}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 15,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many reports submitted. Please wait a minute before submitting another report." },
        { status: 429 }
      );
    }

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
