import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Resume Upload & Extraction Suite", () => {
  // Test Candidate Name Extraction
  test("extracts candidate names across diverse resume header formats", () => {
    function extractCandidateName(text) {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        let line = lines[i];
        if (
          line.includes("@") ||
          line.includes("http") ||
          line.includes("www.") ||
          line.includes("github.com") ||
          line.includes("linkedin.com") ||
          /^(curriculum\s+vitae|resume|cv|summary|profile|contact|education|experience|technical\s+skills)$/i.test(line) ||
          /^--\s*\d+\s*of\s*\d+\s*--$/.test(line)
        ) {
          continue;
        }

        line = line.replace(/^(?:resume\s+of|cv\s*[-:]|name\s*[-:])\s*/i, "");
        const parts = line.split(/\s*[-|•–—/]\s*/);
        const candidateSegment = (parts[0] || "").replace(/^[•\-\*|#]+\s*/, "").trim();

        const commaParts = candidateSegment.split(
          /\s*,\s*(?:Senior|Lead|Junior|Staff|Principal|Software|AI|ML|Data|Web|Frontend|Backend|Full|QA|Engineer|Developer|Specialist|Ph\.?D|M\.?S|B\.?S|MBA|PMP)/i
        );
        const nameCandidate = commaParts[0].trim();

        const words = nameCandidate.split(/\s+/);
        if (
          words.length >= 1 &&
          words.length <= 4 &&
          nameCandidate.length >= 2 &&
          nameCandidate.length <= 40 &&
          /^[a-zA-Z\s.'-]+$/.test(nameCandidate)
        ) {
          if (nameCandidate === nameCandidate.toUpperCase() && nameCandidate.length > 3) {
            return nameCandidate
              .toLowerCase()
              .split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
          }
          return nameCandidate;
        }
      }
      return undefined;
    }

    assert.equal(extractCandidateName("Alex Rivera - Senior AI Engineer\nalex@example.com"), "Alex Rivera");
    assert.equal(extractCandidateName("Jane Doe | San Francisco, CA | Full Stack\njane@example.com"), "Jane Doe");
    assert.equal(extractCandidateName("ALEX RIVERA\nalex@example.com"), "Alex Rivera");
    assert.equal(extractCandidateName("Resume of Michael Chang\nmichael@example.com"), "Michael Chang");
    assert.equal(extractCandidateName("Curriculum Vitae\nSarah Connor\nsarah@example.com"), "Sarah Connor");
    assert.equal(extractCandidateName("-- 1 of 1 --\nDavid Kim - AI Evaluator\ndavid@example.com"), "David Kim");
  });

  // Test International Phone Number Extraction
  test("extracts international phone formats", () => {
    function extractCandidatePhone(text) {
      const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b/);
      if (!match) return undefined;
      const phone = match[0].trim();
      const digits = phone.replace(/\D/g, "");
      if (digits.length >= 7 && digits.length <= 15) {
        return phone;
      }
      return undefined;
    }

    assert.ok(extractCandidatePhone("Phone: +1 (555) 234-5678 | Email"));
    assert.ok(extractCandidatePhone("Contact: +91 98765 43210"));
    assert.ok(extractCandidatePhone("Tel: +44 7911 123456"));
    assert.ok(extractCandidatePhone("Mobile: +63 917 123 4567"));
  });

  // Test Country & City Mapping
  test("maps candidates from global tech hubs to country and ISO code", () => {
    const COUNTRY_PATTERNS = [
      { regex: /\b(india|bengaluru|bangalore|delhi|mumbai|hyderabad|pune|chennai|noida|gurugram|kolkata)\b/i, country: { name: "India", code: "IN" } },
      { regex: /\b(united\s+states|usa|u\.s\.a|california|san\s+francisco|new\s+york|texas|seattle|austin|chicago|los\s+angeles)\b/i, country: { name: "United States", code: "US" } },
      { regex: /\b(united\s+kingdom|uk|u\.k|london|manchester|birmingham|edinburgh|england)\b/i, country: { name: "United Kingdom", code: "GB" } },
      { regex: /\b(canada|toronto|vancouver|montreal|ottawa|ontario|quebec)\b/i, country: { name: "Canada", code: "CA" } },
      { regex: /\b(germany|berlin|munich|frankfurt|hamburg)\b/i, country: { name: "Germany", code: "DE" } },
      { regex: /\b(australia|sydney|melbourne|brisbane)\b/i, country: { name: "Australia", code: "AU" } },
      { regex: /\b(philippines|manila|cebu|quezon|davao)\b/i, country: { name: "Philippines", code: "PH" } },
      { regex: /\b(pakistan|karachi|lahore|islamabad|rawalpindi)\b/i, country: { name: "Pakistan", code: "PK" } },
      { regex: /\b(nigeria|lagos|abuja|ibadan)\b/i, country: { name: "Nigeria", code: "NG" } },
      { regex: /\b(kenya|nairobi|mombasa)\b/i, country: { name: "Kenya", code: "KE" } },
      { regex: /\b(brazil|brasil|sao\s+paulo|rio\s+de\s+janeiro)\b/i, country: { name: "Brazil", code: "BR" } },
      { regex: /\b(spain|madrid|barcelona|valencia)\b/i, country: { name: "Spain", code: "ES" } },
      { regex: /\b(france|paris|lyon|marseille)\b/i, country: { name: "France", code: "FR" } },
      { regex: /\b(japan|tokyo|osaka|kyoto)\b/i, country: { name: "Japan", code: "JP" } },
      { regex: /\b(south\s+africa|johannesburg|cape\s+town|durban)\b/i, country: { name: "South Africa", code: "ZA" } },
    ];

    function extractCandidateCountry(text) {
      for (const item of COUNTRY_PATTERNS) {
        if (item.regex.test(text)) {
          return item.country;
        }
      }
      return undefined;
    }

    assert.equal(extractCandidateCountry("Based in Bengaluru, Karnataka")?.name, "India");
    assert.equal(extractCandidateCountry("Lives in Manila, Philippines")?.name, "Philippines");
    assert.equal(extractCandidateCountry("Located in Lagos, Nigeria")?.name, "Nigeria");
    assert.equal(extractCandidateCountry("Software Engineer in Karachi, Pakistan")?.name, "Pakistan");
    assert.equal(extractCandidateCountry("San Francisco, CA")?.name, "United States");
    assert.equal(extractCandidateCountry("London, England")?.name, "United Kingdom");
  });

  // Test Languages Extraction
  test("extracts languages and proficiencies from resume text", () => {
    function extractLanguages(text) {
      const knownLanguages = [
        "English", "Spanish", "French", "German", "Mandarin", "Hindi",
        "Portuguese", "Arabic", "Bengali", "Russian", "Japanese", "Punjabi",
        "Tagalog", "Filipino", "Italian", "Turkish", "Korean", "Vietnamese",
        "Urdu", "Polish", "Dutch"
      ];

      const found = [];
      for (const lang of knownLanguages) {
        const regex = new RegExp(`\\b${lang}\\b(?:\\s*[-:(/]\\s*(native|bilingual|fluent|professional|conversational|intermediate|basic|elementary))?`, "i");
        const match = text.match(regex);
        if (match) {
          const rawProf = (match[1] || "").toLowerCase();
          let proficiency = "fluent";
          if (/native|bilingual|mother/i.test(rawProf)) proficiency = "native";
          else if (/conversational|intermediate|b1|b2/i.test(rawProf)) proficiency = "conversational";
          else if (/basic|elementary|a1|a2/i.test(rawProf)) proficiency = "basic";
          found.push({ name: lang, proficiency });
        }
      }
      return found;
    }

    const res = extractLanguages("Languages: English (Native), Spanish (Fluent), German (Conversational)");
    assert.equal(res.length, 3);
    assert.equal(res[0].name, "English");
    assert.equal(res[0].proficiency, "native");
    assert.equal(res[1].name, "Spanish");
    assert.equal(res[1].proficiency, "fluent");
    assert.equal(res[2].name, "German");
    assert.equal(res[2].proficiency, "conversational");
  });

  // Test File Validation Rules
  test("validates file upload bounds and formats accurately", () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    function validateFile(file) {
      if (!file) return { valid: false, error: "No file provided." };
      if (file.size > MAX_FILE_SIZE) return { valid: false, error: "File exceeds 5MB limit." };
      const name = (file.name || "").toLowerCase();
      if (name.endsWith(".doc")) return { valid: false, error: "Legacy .doc format is not supported." };
      const isAllowed = name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".txt") || name.endsWith(".md");
      if (!isAllowed) return { valid: false, error: "Unsupported format." };
      return { valid: true };
    }

    assert.equal(validateFile({ name: "resume.pdf", size: 100000 }).valid, true);
    assert.equal(validateFile({ name: "resume.docx", size: 50000 }).valid, true);
    assert.equal(validateFile({ name: "resume.txt", size: 12000 }).valid, true);
    assert.equal(validateFile({ name: "resume.doc", size: 80000 }).valid, false);
    assert.equal(validateFile({ name: "malicious.exe", size: 5000 }).valid, false);
    assert.equal(validateFile({ name: "huge.pdf", size: 10 * 1024 * 1024 }).valid, false);
  });

  // Test PDF Parsing and In-Process Worker Initialization
  test("extracts text from PDF document buffer using legacy pdfjs-dist in-process worker", async () => {
    if (!globalThis.pdfjsWorker) {
      globalThis.pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    }
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const samplePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 24 Tf
100 700 Td
(Alex Rivera - Senior AI Engineer) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000348 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
423
%%EOF`;

    const uint8 = new Uint8Array(Buffer.from(samplePdf));
    const doc = await pdfjs.getDocument({
      data: uint8,
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0,
    }).promise;

    assert.equal(doc.numPages, 1);
    const page = await doc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((i) => i.str).join(" ");
    assert.match(text, /Alex Rivera/);
    assert.match(text, /Senior AI Engineer/);
  });
});
