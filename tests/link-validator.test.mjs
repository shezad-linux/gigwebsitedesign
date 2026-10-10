import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Link Validator & SSRF Guard Suite", () => {
  // Test SSRF prevention logic
  const BLOCKED_HOSTNAMES = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "169.254.169.254",
    "metadata.google.internal",
    "instance-data",
  ]);

  const PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
  ];

  function validateUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return { valid: false, error: "Missing URL" };
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return { valid: false, error: "Invalid protocol" };
      }
      const host = parsed.hostname.toLowerCase();
      if (BLOCKED_HOSTNAMES.has(host)) return { valid: false, error: "Blocked hostname" };
      for (const range of PRIVATE_IP_RANGES) {
        if (range.test(host)) return { valid: false, error: "Private subnet" };
      }
      return { valid: true, sanitizedUrl: parsed.toString() };
    } catch {
      return { valid: false, error: "Malformed URL" };
    }
  }

  test("accepts valid HTTPS public URLs", () => {
    const validUrls = [
      "https://outlier.ai/careers",
      "https://www.dataannotation.tech/apply",
      "https://alignerr.com/experts",
      "https://mindrift.ai/jobs",
      "https://t.mercor.com/hYqU9",
      "https://agent.askethos.com/refer/i9tslep82zx4",
      "https://joinhandshake.com/move-program/referral?referralCode=6EE9DF&utm_source=referral",
    ];

    for (const url of validUrls) {
      const result = validateUrl(url);
      assert.equal(result.valid, true);
    }
  });

  test("rejects SSRF attempts targeting localhost or loopback", () => {
    const maliciousUrls = [
      "http://localhost:3000/admin",
      "http://127.0.0.1:8080/internal",
      "http://127.0.0.1/etc/passwd",
      "http://0.0.0.0:8000/",
    ];

    for (const url of maliciousUrls) {
      const result = validateUrl(url);
      assert.equal(result.valid, false);
      assert.equal(result.error, "Blocked hostname");
    }
  });

  test("rejects SSRF attempts targeting cloud metadata endpoints", () => {
    const metadataUrls = [
      "http://169.254.169.254/latest/meta-data/",
      "http://metadata.google.internal/computeMetadata/v1/",
      "http://instance-data/latest/meta-data/",
    ];

    for (const url of metadataUrls) {
      const result = validateUrl(url);
      assert.equal(result.valid, false);
    }
  });

  test("rejects private enterprise subnets (10.x, 192.168.x, 172.16.x)", () => {
    const privateUrls = [
      "http://10.0.0.1/api",
      "http://192.168.1.1/router",
      "http://172.16.0.5/secrets",
    ];

    for (const url of privateUrls) {
      const result = validateUrl(url);
      assert.equal(result.valid, false);
      assert.equal(result.error, "Private subnet");
    }
  });

  test("rejects dangerous non-HTTP schemes (javascript:, file:, data:)", () => {
    const dangerousUrls = [
      "javascript:alert(1)",
      "file:///etc/passwd",
      "data:text/html,<script>alert(1)</script>",
      "ftp://mirror.example.com",
    ];

    for (const url of dangerousUrls) {
      const result = validateUrl(url);
      assert.equal(result.valid, false);
    }
  });

  test("detects simulated 404 and timeout conditions gracefully", () => {
    const handleResponseStatus = (statusCode) => {
      if (statusCode === 404) {
        return { healthy: false, error: "HTTP 404 Not Found" };
      }
      if (statusCode >= 200 && statusCode < 400) {
        return { healthy: true };
      }
      return { healthy: false, error: `HTTP ${statusCode}` };
    };

    assert.deepEqual(handleResponseStatus(200), { healthy: true });
    assert.deepEqual(handleResponseStatus(301), { healthy: true });
    assert.deepEqual(handleResponseStatus(404), { healthy: false, error: "HTTP 404 Not Found" });
    assert.deepEqual(handleResponseStatus(500), { healthy: false, error: "HTTP 500" });
  });
});
