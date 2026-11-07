import { NextRequest, NextResponse } from "next/server";
import {
  getCertificates,
  getCertificateById,
  issueCertificate,
} from "@/lib/portfolio/storage";
import { certificateIssueSchema } from "@/lib/portfolio/validation";
import { verifyAdminSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Public certificate verification endpoint by ID
      const cert = getCertificateById(id);
      if (!cert) {
        return NextResponse.json(
          { success: false, error: "Certificate not found or invalid certificate ID" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: cert });
    }

    // Listing all certificates requires admin session
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const all = getCertificates();
    return NextResponse.json({ success: true, count: all.length, data: all });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates" },
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
    const parseResult = certificateIssueSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const cert = issueCertificate(data);

    return NextResponse.json({ success: true, data: cert });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to issue certificate" },
      { status: 500 }
    );
  }
}

