import { NextRequest, NextResponse } from "next/server";
import { validateResumeFile, extractTextFromBuffer } from "@/lib/extraction/parser";
import { extractStructuredProfile } from "@/lib/extraction/ai-extractor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during resume parsing." },
      { status: 500 }
    );
  }
}
