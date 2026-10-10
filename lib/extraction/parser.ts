import mammoth from "mammoth";

export interface ParsedDocumentResult {
  text: string;
  pageCount?: number;
  wordCount: number;
  format: "pdf" | "docx" | "txt";
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
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

  const nameLower = (file.name || "").toLowerCase();
  const isPdf =
    file.type === "application/pdf" || nameLower.endsWith(".pdf");
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    nameLower.endsWith(".docx");
  const isLegacyDoc =
    file.type === "application/msword" || nameLower.endsWith(".doc");
  const isText =
    file.type === "text/plain" ||
    file.type === "text/markdown" ||
    nameLower.endsWith(".txt") ||
    nameLower.endsWith(".md") ||
    nameLower.endsWith(".rtf");

  if (isLegacyDoc) {
    return {
      valid: false,
      error: "Legacy .doc format is not supported. Please save and upload as .docx or .pdf.",
    };
  }

  if (!isPdf && !isDocx && !isText) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
    };
  }

  return { valid: true };
}

/**
 * Cleans extracted text from page delimiters and unprintable control artifacts
 */
function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove pdf-parse v2 page delimiter artifacts (-- 1 of 1 --)
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
    // Normalize excessive horizontal whitespace per line
    .replace(/[ \t]+/g, " ")
    // Remove non-printable control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse 3+ newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts raw textual content from PDF, DOCX, or plain text binary buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedDocumentResult> {
  const nameLower = fileName.toLowerCase();
  const isPdf = mimeType === "application/pdf" || nameLower.endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    nameLower.endsWith(".docx");
  const isText =
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    nameLower.endsWith(".txt") ||
    nameLower.endsWith(".md") ||
    nameLower.endsWith(".rtf");

  if (isText) {
    const rawText = buffer.toString("utf-8");
    const cleaned = cleanExtractedText(rawText);
    const words = cleaned.split(/\s+/).filter(Boolean);
    return {
      text: cleaned,
      pageCount: 1,
      wordCount: words.length,
      format: "txt",
    };
  }

  if (isPdf) {
    try {
      let extractedText = "";
      let pageCount = 1;

      try {
        // In Node.js / Next.js server environments, preload the worker onto globalThis
        // to prevent webpack chunk path resolution failures (fake worker dynamic import error)
        if (!(globalThis as any).pdfjsWorker) {
          try {
            // @ts-ignore
            (globalThis as any).pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
          } catch {
            // Worker preload fallback
          }
        }

        // Use Mozilla official legacy server build of pdfjs-dist
        // @ts-ignore
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        const uint8 = new Uint8Array(buffer);
        const loadingTask = pdfjs.getDocument({
          data: uint8,
          useSystemFonts: true,
          disableFontFace: true,
          verbosity: 0,
        });

        const doc = await loadingTask.promise;
        pageCount = doc.numPages || 1;

        const pageTexts: string[] = [];
        for (let i = 1; i <= pageCount; i++) {
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
          pageTexts.push(pageText);
          if (typeof page.cleanup === "function") {
            page.cleanup();
          }
        }
        extractedText = pageTexts.join("\n\n");
      } catch (pdfjsErr: any) {
        console.warn("pdfjs-dist legacy parsing failed, falling back to stream parsing:", pdfjsErr?.message);
        // Fallback: try raw text stream extraction
        const rawString = buffer.toString("utf-8");
        const matches = rawString.match(/\(([^)]{2,})\)\s*Tj/g);
        if (matches && matches.length >= 3) {
          const streamText = matches.map((m: string) => m.slice(1, -3)).join(" ");
          extractedText = streamText;
        }
      }

      let cleaned = cleanExtractedText(extractedText);

      // If text extraction yielded very few readable characters (e.g. uncompressed raw stream fallback)
      if (cleaned.length < 20) {
        const rawString = buffer.toString("utf-8");
        const matches = rawString.match(/\(([^)]{2,})\)\s*Tj/g);
        if (matches && matches.length >= 3) {
          const streamText = matches.map((m: string) => m.slice(1, -3)).join(" ");
          cleaned = cleanExtractedText(streamText);
        }
      }

      if (!cleaned || cleaned.length < 15) {
        throw new Error(
          "Could not extract readable text from document. Scanned image PDFs require OCR or manual profile entry."
        );
      }

      const words = cleaned.split(/\s+/).filter(Boolean);

      return {
        text: cleaned,
        pageCount,
        wordCount: words.length,
        format: "pdf",
      };
    } catch (err: any) {
      if (err.message && err.message.includes("Scanned image")) {
        throw err;
      }
      throw new Error(
        `Failed to parse PDF document: ${err.message || "Unreadable PDF encoding"}. Please upload a text-based PDF or DOCX.`
      );
    }
  }

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const cleaned = cleanExtractedText(result.value || "");
      if (!cleaned || cleaned.length < 15) {
        throw new Error("Word document contains no readable text.");
      }

      const words = cleaned.split(/\s+/).filter(Boolean);
      return {
        text: cleaned,
        pageCount: 1,
        wordCount: words.length,
        format: "docx",
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from Word document: ${err.message}`);
    }
  }

  throw new Error("Unsupported document format. Please upload a PDF, DOCX, or TXT file.");
}
