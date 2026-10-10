/**
 * Production Rate Limiter Utility
 * Implements a memory-safe sliding-window rate limiter per client IP.
 * Protects serverless and Node.js routes from resource exhaustion, brute force, and abuse.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    });
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitOptions {
  interval: number; // in milliseconds (e.g. 60_000 for 1 minute)
  uniqueTokenPerInterval: number; // max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { interval: 60_000, uniqueTokenPerInterval: 10 }
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(identifier);

  if (!existing || now > existing.resetAt) {
    // New or expired window
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + options.interval,
    };
    memoryStore.set(identifier, record);

    return {
      success: true,
      limit: options.uniqueTokenPerInterval,
      remaining: options.uniqueTokenPerInterval - 1,
      reset: Math.ceil(record.resetAt / 1000),
    };
  }

  if (existing.count < options.uniqueTokenPerInterval) {
    existing.count += 1;
    return {
      success: true,
      limit: options.uniqueTokenPerInterval,
      remaining: options.uniqueTokenPerInterval - existing.count,
      reset: Math.ceil(existing.resetAt / 1000),
    };
  }

  // Limit exceeded
  return {
    success: false,
    limit: options.uniqueTokenPerInterval,
    remaining: 0,
    reset: Math.ceil(existing.resetAt / 1000),
  };
}

/**
 * Extracts a dependable client identifier from standard reverse-proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "anonymous-client";
}
