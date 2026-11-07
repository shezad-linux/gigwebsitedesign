import { NextRequest, NextResponse } from "next/server";
import {
  getInternships,
  saveInternship,
  updateInternshipStatus,
} from "@/lib/portfolio/storage";
import { verifyAdminSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const internships = getInternships();
    return NextResponse.json({ success: true, count: internships.length, data: internships });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch internships" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json();
    if (!body.candidateName || !body.candidateEmail || !body.associatedProject) {
      return NextResponse.json(
        { error: "Candidate name, email, and project are required" },
        { status: 400 }
      );
    }

    const saved = saveInternship(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save internship" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { id, status, interviewNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Internship ID and status are required" },
        { status: 400 }
      );
    }

    const updated = updateInternshipStatus(id, status, interviewNotes);
    if (!updated) {
      return NextResponse.json({ error: "Internship record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update internship" },
      { status: 500 }
    );
  }
}

