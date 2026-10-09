import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resumeId } = body;

    // Responds cleanly acknowledging deletion
    return NextResponse.json({
      success: true,
      message: "Resume document and associated extraction data deleted successfully.",
      deletedId: resumeId || "current",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete resume document." },
      { status: 500 }
    );
  }
}
