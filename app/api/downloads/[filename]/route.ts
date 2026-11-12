import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  // Whitelist safe downloadable files
  const allowedFiles: Record<string, { mime: string; downloadName: string }> = {
    "nexaflow.html": {
      mime: "text/html; charset=utf-8",
      downloadName: "nexaflow.html",
    },
    "NexaFlow.tsx": {
      mime: "text/plain; charset=utf-8",
      downloadName: "NexaFlow.tsx",
    },
  };

  const fileConfig = allowedFiles[filename];

  if (!fileConfig) {
    return new NextResponse("File not found or unauthorized", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "downloads", filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found on server", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": fileConfig.mime,
      "Content-Disposition": `attachment; filename="${fileConfig.downloadName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

