import crypto from "crypto";
import { getAdminClient } from "./supabase/server";

const OTP_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.RESEND_API_KEY ||
  "remotasks-secure-auth-otp-secret-2026-obsidian";

export interface ChallengePayload {
  email: string;
  otpHash: string;
  expiresAt: number;
  mode: "signin" | "signup";
  fullName?: string;
  userId?: string;
}

/**
 * Generates a cryptographically secure 6-digit one-time password
 */
export function generate6DigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Creates a signed, tamper-proof challenge token for stateless verification
 */
export function createChallengeToken(params: {
  email: string;
  otp: string;
  mode: "signin" | "signup";
  fullName?: string;
  userId?: string;
  expiresInMinutes?: number;
}): { challengeToken: string; expiresAt: number } {
  const normalizedEmail = params.email.trim().toLowerCase();
  const minutes = params.expiresInMinutes || 10;
  const expiresAt = Date.now() + minutes * 60 * 1000;

  const otpHash = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${normalizedEmail}:${params.otp}:${expiresAt}`)
    .digest("hex");

  const payload: ChallengePayload = {
    email: normalizedEmail,
    otpHash,
    expiresAt,
    mode: params.mode,
    fullName: params.fullName?.trim(),
    userId: params.userId,
  };

  const rawJson = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(rawJson)
    .digest("hex");

  const challengeToken = Buffer.from(
    JSON.stringify({ payload: rawJson, sig: signature })
  ).toString("base64");

  return { challengeToken, expiresAt };
}

/**
 * Verifies a challenge token against the submitted OTP using timing-safe comparisons
 */
export function verifyChallengeToken(params: {
  email: string;
  otp: string;
  challengeToken: string;
}): {
  success: boolean;
  error?: string;
  payload?: ChallengePayload;
} {
  const normalizedEmail = params.email.trim().toLowerCase();
  const inputOtp = params.otp.trim();

  if (!/^\d{6}$/.test(inputOtp)) {
    return {
      success: false,
      error: "Verification code must be exactly 6 digits.",
    };
  }

  try {
    const raw = Buffer.from(params.challengeToken, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.payload || !parsed.sig) {
      return { success: false, error: "Invalid challenge token format." };
    }

    // Verify token signature against tampering
    const expectedSig = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(parsed.payload)
      .digest("hex");

    const sigBuf = Buffer.from(parsed.sig, "hex");
    const expectedSigBuf = Buffer.from(expectedSig, "hex");

    if (
      sigBuf.length !== expectedSigBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedSigBuf)
    ) {
      return { success: false, error: "Security challenge verification failed (invalid signature)." };
    }

    const payload: ChallengePayload = JSON.parse(parsed.payload);

    if (payload.email !== normalizedEmail) {
      return { success: false, error: "Email address does not match this verification code." };
    }

    if (Date.now() > payload.expiresAt) {
      return { success: false, error: "Verification code has expired. Please request a new code." };
    }

    // Recompute and verify OTP hash using timing-safe comparison
    const expectedOtpHash = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(`${normalizedEmail}:${inputOtp}:${payload.expiresAt}`)
      .digest("hex");

    const hashBuf = Buffer.from(payload.otpHash, "hex");
    const expectedHashBuf = Buffer.from(expectedOtpHash, "hex");

    if (
      hashBuf.length !== expectedHashBuf.length ||
      !crypto.timingSafeEqual(hashBuf, expectedHashBuf)
    ) {
      return { success: false, error: "Incorrect verification code. Please check your email and try again." };
    }

    return {
      success: true,
      payload,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to process verification challenge token." };
  }
}

/**
 * Strictly checks if a user account already exists in the system
 */
export async function checkUserExistence(email: string): Promise<{
  exists: boolean;
  userId?: string;
  fullName?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminClient = getAdminClient();

  if (!adminClient) {
    return { exists: false };
  }

  try {
    // 1. Check public.profiles table
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profile) {
      return {
        exists: true,
        userId: profile.id,
        fullName: profile.full_name,
      };
    }

    // 2. Check auth.users table via admin API
    const { data: usersData } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    const user = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (user) {
      return {
        exists: true,
        userId: user.id,
        fullName:
          (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Candidate",
      };
    }

    return { exists: false };
  } catch (err) {
    console.error("Error inspecting user existence:", err);
    return { exists: false };
  }
}
