/**
 * Production Link Health Validator & SSRF Guard
 *
 * Validates external outbound URLs to:
 * 1. Prevent Server-Side Request Forgery (SSRF) targeting internal IPs/cloud metadata.
 * 2. Verify external gig URL health, detect 404s, domain expiration, or connection timeouts.
 * 3. Provide graceful fallback handling for broken links reported by the community.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "169.254.169.254", // AWS/GCP metadata
  "metadata.google.internal",
  "instance-data",
]);

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^fc00:/,
  /^fe80:/,
];

export interface UrlValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export interface UrlHealthResult {
  healthy: boolean;
  statusCode?: number;
  error?: string;
  responseTimeMs?: number;
}

/**
 * Validates outbound URL structure and prevents SSRF vulnerabilities.
 */
export function validateOutboundUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "URL string is required" };
  }

  const trimmed = rawUrl.trim();

  // Enforce max length
  if (trimmed.length > 2048) {
    return { valid: false, error: "URL exceeds maximum permitted length (2048 characters)" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Malformed URL format" };
  }

  // Enforce HTTPS or HTTP (HTTPS strongly preferred in production)
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { valid: false, error: `Disallowed protocol: ${parsed.protocol}. Only http and https are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF check: Deny localhost and cloud metadata services
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, error: "Access to private or metadata hostnames is restricted" };
  }

  // SSRF check: Deny private subnet IPs
  for (const range of PRIVATE_IP_RANGES) {
    if (range.test(hostname)) {
      return { valid: false, error: "Access to private internal IP addresses is restricted" };
    }
  }

  return {
    valid: true,
    sanitizedUrl: parsed.toString(),
  };
}

/**
 * Checks external gig link reachability with a timeout.
 * Gracefully handles 404, 500, DNS failures, and slow timeouts.
 */
export async function checkUrlHealth(
  url: string,
  timeoutMs: number = 4000
): Promise<UrlHealthResult> {
  const validation = validateOutboundUrl(url);
  if (!validation.valid || !validation.sanitizedUrl) {
    return { healthy: false, error: validation.error || "Invalid URL" };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Attempt HEAD request first to save bandwidth
    let response = await fetch(validation.sanitizedUrl, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "AIGigMatcher-HealthCheck/1.0 (+https://aigigmatcher.com)",
      },
    });

    // If HEAD is disallowed (405 Method Not Allowed), retry with GET
    if (response.status === 405) {
      response = await fetch(validation.sanitizedUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "AIGigMatcher-HealthCheck/1.0 (+https://aigigmatcher.com)",
        },
      });
    }

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (response.ok || (response.status >= 200 && response.status < 400)) {
      return {
        healthy: true,
        statusCode: response.status,
        responseTimeMs,
      };
    } else {
      return {
        healthy: false,
        statusCode: response.status,
        responseTimeMs,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return {
          healthy: false,
          responseTimeMs,
          error: `Connection timed out after ${timeoutMs}ms`,
        };
      }
      return {
        healthy: false,
        responseTimeMs,
        error: err.message,
      };
    }

    return {
      healthy: false,
      responseTimeMs,
      error: "Unknown network error",
    };
  }
}
