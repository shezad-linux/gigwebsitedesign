/* ==============================================================================
   Community Automated Screening & Moderation Rules Engine
   Implements 3-tier risk classification: Low, Medium, High
   - Low: Publish immediately (normal discussions, legitimate gig posts)
   - Medium: Flag for review (unrealistic claims, suspicious links, duplicate text)
   - High: Auto-hide and alert admin (phishing, malware, exposed credentials, scam)
   ============================================================================== */

export type ModerationRiskLevel = "low" | "medium" | "high";
export type ModerationReviewStatus = "none" | "needs_review" | "urgent" | "resolved";

export interface ScreeningInput {
  title: string;
  body: string;
  link_url?: string | null;
  affiliate_disclosure?: string | null;
  authorPostHistory?: {
    recentTitles: string[];
    recentBodies: string[];
    accountAgeHours: number;
    totalPublishedPosts: number;
  };
}

export interface ScreeningResult {
  riskLevel: ModerationRiskLevel;
  reviewStatus: ModerationReviewStatus;
  reasons: string[];
  autoHide: boolean;
  requiresReview: boolean;
  matchedRules: string[];
  metrics: {
    unrealisticEarningsDetected: boolean;
    credentialExposureDetected: boolean;
    maliciousLinkDetected: boolean;
    suspiciousLinkShortenerDetected: boolean;
    duplicateContentDetected: boolean;
    excessiveCapsDetected: boolean;
  };
}

// 1. High-risk patterns: Credential leaks, Malware, Phishing
const CREDENTIAL_PATTERNS = [
  { name: "Stripe API Key", regex: /sk_live_[0-9a-zA-Z]{24,}/i },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "GitHub Personal Token", regex: /ghp_[0-9a-zA-Z]{36}/ },
  { name: "JWT Bearer Token", regex: /bearer\s+ey[a-zA-Z0-9_\-]{25,}\.[a-zA-Z0-9_\-]{25,}/i },
  { name: "Private RSA/SSH Key", regex: /-----BEGIN\s+(RSA|OPENSSH|EC|DSA)?\s*PRIVATE\s+KEY-----/i },
];

const MALICIOUS_EXTENSIONS = /\.(exe|scr|bat|cmd|apk|msi|vbs|ps1|reg)(\?.*)?$/i;

const HIGH_RISK_SCAM_PATTERNS = [
  { name: "Crypto Doubler / Recovery Scam", regex: /(send|transfer)\s+(btc|eth|crypto|usdt|bitcoin)\s+(to\s+wallet|to\s+double|and\s+get)/i },
  { name: "Pay Upfront Fee to Work", regex: /(pay|deposit|transfer)\s+(registration|activation|joining|processing|refundable)\s+fee\s+(first|before|to\s+receive\s+tasks)/i },
  { name: "WhatsApp Financial Scam Bot", regex: /whatsapp\s+(\+|00)[0-9\s\-]{8,}.*(investment|guaranteed\s+profit|crypto|returns)/i },
  { name: "Gift Card Payment Extortion", regex: /(pay\s+with|buy|send)\s+(apple|google\s+play|steam|amazon)\s+gift\s*card/i },
  { name: "Phishing / Account Takeover", regex: /(enter|verify|confirm)\s+(your\s+password|secret\s+key|seed\s+phrase|otp)\s+at\s+https?:\/\//i },
];

// 2. Medium-risk patterns: Unrealistic earnings claims, Link shorteners, Duplicates
// Per specification: "AI moderation should assist with classification, not be trusted as the sole judge...
// A phrase like 'earn ₹5,000 daily' should trigger scrutiny, not automatically prove fraud."
const UNREALISTIC_EARNINGS_PATTERNS = [
  { name: "Unrealistic Daily INR Earning", regex: /(earn|make|get)\s+(₹|rs\.?|inr)\s*([3-9],\d{3}|\d{5,})\s*(daily|per\s*day|\/day)/i },
  { name: "Unrealistic Daily USD Earning", regex: /(earn|make|get)\s+(\$|usd)\s*([2-9]\d{2}|\d{4,})\s*(daily|per\s*day|\/day)/i },
  { name: "Guaranteed Effortless Income", regex: /guaranteed\s+(income|returns|profits?)\s*(with(out)?\s+(no|zero)\s+(work|effort|skills)|100%|daily)/i },
  { name: "Get Rich Quick Claim", regex: /(become\s+rich|make\s+millions|quit\s+your\s+job\s+tomorrow)\s+(in\s+\d+\s*(days|weeks)|fast|instantly)/i },
];

const SUSPICIOUS_SHORTENER_HOSTS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "cutt.ly",
  "is.gd",
  "ow.ly",
  "buff.ly",
  "adf.ly",
  "rb.gy",
  "shorturl.at",
  "tiny.cc",
]);

/**
 * Calculates string similarity using Jaccard token overlap
 */
function calculateTextSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach(w => {
    if (wordsB.has(w)) intersection++;
  });

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Screen post or reply content against automated moderation rules
 */
export function screenContent(input: ScreeningInput): ScreeningResult {
  const combinedText = `${input.title} ${input.body}`.trim();
  const reasons: string[] = [];
  const matchedRules: string[] = [];

  let riskLevel: ModerationRiskLevel = "low";
  let reviewStatus: ModerationReviewStatus = "none";
  let autoHide = false;
  let requiresReview = false;

  const metrics = {
    unrealisticEarningsDetected: false,
    credentialExposureDetected: false,
    maliciousLinkDetected: false,
    suspiciousLinkShortenerDetected: false,
    duplicateContentDetected: false,
    excessiveCapsDetected: false,
  };

  // -------------------------------------------------------------
  // HIGH RISK CHECKS: Credential Leaks, Phishing, Malware
  // -------------------------------------------------------------

  // 1. Check for exposed secrets / credentials
  for (const cred of CREDENTIAL_PATTERNS) {
    if (cred.regex.test(combinedText)) {
      metrics.credentialExposureDetected = true;
      matchedRules.push(`credential_leak:${cred.name}`);
      reasons.push(`Contains exposed sensitive credentials (${cred.name})`);
      riskLevel = "high";
      autoHide = true;
      reviewStatus = "urgent";
    }
  }

  // 2. Check for malicious executables in links
  if (input.link_url) {
    try {
      const url = new URL(input.link_url);
      if (MALICIOUS_EXTENSIONS.test(url.pathname)) {
        metrics.maliciousLinkDetected = true;
        matchedRules.push("malicious_attachment_url");
        reasons.push("URL points directly to an executable/malware file extension");
        riskLevel = "high";
        autoHide = true;
        reviewStatus = "urgent";
      }
    } catch {
      // Invalid URL handled by validator
    }
  }

  // 3. Check for high-risk scam patterns
  for (const scam of HIGH_RISK_SCAM_PATTERNS) {
    if (scam.regex.test(combinedText)) {
      matchedRules.push(`high_risk_scam:${scam.name}`);
      reasons.push(`High-confidence fraudulent or extortion pattern detected (${scam.name})`);
      riskLevel = "high";
      autoHide = true;
      reviewStatus = "urgent";
    }
  }

  // -------------------------------------------------------------
  // MEDIUM RISK CHECKS: Unrealistic Claims, Link Shorteners, Duplicates
  // (Only if not already classified as High Risk)
  // -------------------------------------------------------------

  if (riskLevel !== "high") {
    // 4. Check for unrealistic earnings claims (Scrutiny, not automatic fraud)
    const inrMatch = combinedText.match(/(?:earn|make|get)\s*(?:up\s*to)?\s*(?:₹|rs\.?|inr)\s*([0-9,]+)\s*(?:daily|per\s*day|\/day|a\s*day)/i);
    if (inrMatch) {
      const val = parseInt(inrMatch[1].replace(/,/g, ""), 10);
      if (val >= 3000) {
        metrics.unrealisticEarningsDetected = true;
        matchedRules.push("unrealistic_earnings:Daily INR Earning");
        reasons.push(`Contains unverified or exaggerated daily income claim (₹${inrMatch[1]})`);
        riskLevel = "medium";
        requiresReview = true;
        reviewStatus = "needs_review";
      }
    }

    const usdMatch = combinedText.match(/(?:earn|make|get)\s*(?:up\s*to)?\s*(?:\$|usd)\s*([0-9,]+)\s*(?:daily|per\s*day|\/day|a\s*day)/i);
    if (usdMatch) {
      const val = parseInt(usdMatch[1].replace(/,/g, ""), 10);
      if (val >= 200) {
        metrics.unrealisticEarningsDetected = true;
        matchedRules.push("unrealistic_earnings:Daily USD Earning");
        reasons.push(`Contains unverified or exaggerated daily income claim ($${usdMatch[1]})`);
        riskLevel = "medium";
        requiresReview = true;
        reviewStatus = "needs_review";
      }
    }

    for (const claim of UNREALISTIC_EARNINGS_PATTERNS) {
      if (claim.regex.test(combinedText)) {
        metrics.unrealisticEarningsDetected = true;
        matchedRules.push(`unrealistic_earnings:${claim.name}`);
        reasons.push(`Contains unverified or exaggerated income claim ("${claim.name}")`);
        riskLevel = "medium";
        requiresReview = true;
        reviewStatus = "needs_review";
      }
    }

    // 5. Check for obfuscated link shorteners
    if (input.link_url) {
      try {
        const url = new URL(input.link_url);
        const host = url.hostname.toLowerCase().replace(/^www\./, "");
        if (SUSPICIOUS_SHORTENER_HOSTS.has(host)) {
          metrics.suspiciousLinkShortenerDetected = true;
          matchedRules.push("link_shortener_obfuscation");
          reasons.push(`URL uses redirect/shortener service (${host}) requiring destination review`);
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      } catch {
        // Ignored
      }
    }

    // 6. Check for duplicate content against author's recent posts
    if (input.authorPostHistory) {
      const { recentTitles, recentBodies } = input.authorPostHistory;
      let isDuplicate = false;

      for (const pastTitle of recentTitles || []) {
        if (calculateTextSimilarity(input.title, pastTitle) > 0.8) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        for (const pastBody of recentBodies || []) {
          if (calculateTextSimilarity(input.body, pastBody) > 0.85) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (isDuplicate) {
        metrics.duplicateContentDetected = true;
        matchedRules.push("duplicate_content_detected");
        reasons.push("Substantially identical content was recently posted by this author");
        riskLevel = "medium";
        requiresReview = true;
        reviewStatus = "needs_review";
      }
    }

    // 7. Check for excessive uppercase shouting (> 60% uppercase with length > 30)
    const letters = combinedText.replace(/[^a-zA-Z]/g, "");
    if (letters.length > 30) {
      const upperCount = (letters.match(/[A-Z]/g) || []).length;
      if (upperCount / letters.length > 0.65) {
        metrics.excessiveCapsDetected = true;
        matchedRules.push("excessive_uppercase_shouting");
        reasons.push("Excessive uppercase lettering indicates aggressive promotional text");
        if (riskLevel === "low") {
          riskLevel = "medium";
          requiresReview = true;
          reviewStatus = "needs_review";
        }
      }
    }
  }

  return {
    riskLevel,
    reviewStatus,
    reasons,
    autoHide,
    requiresReview,
    matchedRules,
    metrics,
  };
}
