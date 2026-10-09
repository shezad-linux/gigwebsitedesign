import mammoth from "mammoth";

export interface ParsedDocumentResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  format: "pdf" | "docx";
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export function validateResumeFile(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File exceeds maximum size limit of 5 MB." };
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx") ||
    file.name.toLowerCase().endsWith(".doc");

  if (!isPdf && !isDocx) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a PDF or DOCX file.",
    };
  }

  return { valid: true };
}

/**
 * Extracts raw textual content from PDF or DOCX binary buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedDocumentResult> {
  const isPdf =
    mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    try {
      // Dynamic import to support both pdf-parse v2 (class-based) and v1 (function)
      // @ts-ignore
      const pdfModule: any = await import("pdf-parse");
      let cleaned = "";
      let pageCount = 1;

      if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        cleaned = (pdfData.text || "")
          .replace(/\r\n/g, "\n")
          .replace(/\t/g, " ")
          .trim();
        pageCount = pdfData.pages?.length || 1;
        await parser.destroy();
      } else if (typeof pdfModule === "function") {
        const pdfData = await pdfModule(buffer);
        cleaned = (pdfData.text || "")
          .replace(/\r\n/g, "\n")
          .replace(/\t/g, " ")
          .trim();
        pageCount = pdfData.numpages || 1;
      } else if (typeof pdfModule.default === "function") {
        const pdfData = await pdfModule.default(buffer);
        cleaned = (pdfData.text || "")
          .replace(/\r\n/g, "\n")
          .replace(/\t/g, " ")
          .trim();
        pageCount = pdfData.numpages || 1;
      } else {
        throw new Error("No compatible PDFParse function found in pdf-parse module.");
      }

      const words = cleaned.split(/\s+/).filter(Boolean);

      return {
        text: cleaned,
        pageCount,
        wordCount: words.length,
        format: "pdf",
      };
    } catch (err: any) {
      console.warn("pdf-parse extraction failed, attempting fallback:", err);
      // Fallback regex text extractor for basic text-stream PDFs
      const rawString = buffer.toString("utf-8");
      const match = rawString.match(/\(([^)]+)\)\s*Tj/g);
      let text = "";
      if (match) {
        text = match.map((m) => m.slice(1, -3)).join(" ");
      } else {
        text = rawString.replace(/[^\x20-\x7E\n]/g, " ");
      }
      return {
        text: text.slice(0, 10000),
        wordCount: text.split(/\s+/).length,
        format: "pdf",
      };
    }
  } else {
    // DOCX via Mammoth
    try {
      const result = await mammoth.extractRawText({ buffer });
      const cleaned = (result.value || "")
        .replace(/\r\n/g, "\n")
        .trim();

      return {
        text: cleaned,
        wordCount: cleaned.split(/\s+/).filter(Boolean).length,
        format: "docx",
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from Word document: ${err.message}`);
    }
  }
}
