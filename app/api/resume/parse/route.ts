import { NextRequest, NextResponse } from "next/server";
import { validateResumeFile, extractTextFromBuffer } from "@/lib/extraction/parser";
import { extractStructuredProfile } from "@/lib/extraction/ai-extractor";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 0. Enforce rate limiting: 10 parses per 60s window per client IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`resume-parse:${clientIp}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 10,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many parse requests. Please wait a minute before uploading another resume." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data." },
        { status: 400 }
      );
    }

    // 1. Validate file format and size
    const validation = validateResumeFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 2. Read buffer & extract raw text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedDoc = await extractTextFromBuffer(buffer, file.type, file.name);

    if (!parsedDoc.text || parsedDoc.text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from document. Scanned images require OCR or manual skill entry.",
        },
        { status: 422 }
      );
    }

    // 3. AI & Semantic skill extraction with evidence mapping
    const structuredProfile = await extractStructuredProfile(parsedDoc.text);

    return NextResponse.json({
      success: true,
      document: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        wordCount: parsedDoc.wordCount,
        format: parsedDoc.format,
      },
      extractedProfile: structuredProfile,
    });
  } catch (error: any) {
    const isValidationError =
      error.message &&
      (error.message.includes("Scanned image") ||
        error.message.includes("readable text") ||
        error.message.includes("Legacy") ||
        error.message.includes("Unsupported") ||
        error.message.includes("format"));

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during resume parsing." },
      { status: isValidationError ? 422 : 500 }
    );
  }
}
