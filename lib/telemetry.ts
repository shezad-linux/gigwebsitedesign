/**
 * Privacy-Conscious Telemetry & Structured Logging
 *
 * Implements client & server-side error capturing with automated PII sanitization.
 * Scrubs:
 * - Email addresses
 * - Phone numbers
 * - Authentication tokens (JWT / Bearer / API keys)
 * - Raw resume document bodies & candidate contact info
 *
 * Designed to integrate with Sentry, LogRocket, or console sinks without data leakage.
 */

// Regex patterns for sensitive candidate PII
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const JWT_REGEX = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
const AUTH_HEADER_REGEX = /bearer\s+[a-zA-Z0-9_.-]+/gi;
const API_KEY_REGEX = /(?:key|secret|token|password|auth)[=:\s]+["']?([a-zA-Z0-9_-]{16,})["']?/gi;

/**
 * Recursively sanitizes any object, string, or array to strip PII before telemetry dispatch.
 */
export function sanitizeTelemetryPayload<T>(input: T): T {
  if (typeof input === "string") {
    let sanitized = input
      .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
      .replace(PHONE_REGEX, "[REDACTED_PHONE]")
      .replace(JWT_REGEX, "[REDACTED_JWT]")
      .replace(AUTH_HEADER_REGEX, "Bearer [REDACTED_TOKEN]")
      .replace(API_KEY_REGEX, "$1=[REDACTED_SECRET]");

    // Cap string length to prevent massive raw resume text dumps
    if (sanitized.length > 2000) {
      sanitized = sanitized.slice(0, 2000) + "... [TRUNCATED_FOR_PRIVACY]";
    }
    return sanitized as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeTelemetryPayload(item)) as unknown as T;
  }

  if (input !== null && typeof input === "object") {
    const output: Record<string, unknown> = {};
    const sensitiveKeys = new Set([
      "password",
      "secret",
      "token",
      "access_token",
      "refresh_token",
      "service_role_key",
      "anon_key",
      "resumeText",
      "rawText",
      "resume_text",
      "full_name",
      "phoneNumber",
    ]);

    for (const [key, value] of Object.entries(input)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        output[key] = "[REDACTED_SENSITIVE_FIELD]";
      } else {
        output[key] = sanitizeTelemetryPayload(value);
      }
    }
    return output as unknown as T;
  }

  return input;
}

export interface TelemetryContext {
  route?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

class TelemetryManager {
  private isProduction = process.env.NODE_ENV === "production";

  /**
   * Captures runtime exceptions with sanitized contextual metadata.
   */
  captureException(error: unknown, context?: TelemetryContext): void {
    const sanitizedContext = sanitizeTelemetryPayload(context || {});
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const sanitizedStack = errorStack ? sanitizeTelemetryPayload(errorStack) : undefined;

    const report = {
      level: "error",
      message: sanitizeTelemetryPayload(errorMessage),
      stack: sanitizedStack,
      timestamp: new Date().toISOString(),
      context: sanitizedContext,
    };

    if (this.isProduction) {
      // In production, outputs structured JSON suitable for Datadog, Sentry, or cloud logging drains
      console.error(JSON.stringify(report));
    } else {
      console.error("[Telemetry Error Captured]:", report.message, report.context);
    }
  }

  /**
   * Captures privacy-safe operational events (e.g. gig view, match calculation, report submitted).
   */
  captureEvent(eventName: string, properties?: Record<string, unknown>): void {
    const sanitizedProps = sanitizeTelemetryPayload(properties || {});
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties: sanitizedProps,
    };

    if (this.isProduction) {
      console.log(JSON.stringify(event));
    } else {
      console.log(`[Telemetry Event: ${eventName}]`, sanitizedProps);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, sanitizeTelemetryPayload(context || {}));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, sanitizeTelemetryPayload(context || {}));
  }
}

export const telemetry = new TelemetryManager();
