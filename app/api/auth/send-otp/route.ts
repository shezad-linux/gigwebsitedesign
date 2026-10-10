import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  generate6DigitOtp,
  createChallengeToken,
  checkUserExistence,
} from "@/lib/auth-otp";
import { sendOtpEmail } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, mode = "signin", fullName } = body;

    // 1. Validate Email Input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: "Invalid email format. Please check for typos." },
        { status: 400 }
      );
    }

    // 2. Validate Full Name for Sign Up
    if (mode === "signup") {
      if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please provide your full name (minimum 2 characters)." },
          { status: 400 }
        );
      }
    }

    // 3. Strict Rate Limiting (max 3 OTP dispatches per 60s per email)
    const rateLimit = checkRateLimit(`send-otp:${normalizedEmail}`, {
      interval: 60_000,
      uniqueTokenPerInterval: 3,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification requests. Please wait 60 seconds before requesting another code.",
        },
        { status: 429 }
      );
    }

    // 4. Verify User Existence Against System Database
    const existence = await checkUserExistence(normalizedEmail);

    if (mode === "signin" && !existence.exists) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          error: "No account found with this email. Please sign up to create your candidate account.",
        },
        { status: 404 }
      );
    }

    if (mode === "signup" && existence.exists) {
      return NextResponse.json(
        {
          success: false,
          alreadyExists: true,
          error: "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // 5. Generate Cryptographic 6-Digit OTP
    const otp = generate6DigitOtp();

    // 6. Create Tamper-Proof Challenge Token
    const { challengeToken, expiresAt } = createChallengeToken({
      email: normalizedEmail,
      otp,
      mode,
      fullName: mode === "signup" ? fullName.trim() : existence.fullName,
      userId: existence.userId,
      expiresInMinutes: 10,
    });

    // 7. Dispatch Verification Email (Resend in production, simulation fallback in dev)
    const emailResult = await sendOtpEmail({
      recipient: normalizedEmail,
      otp,
      fullName: mode === "signup" ? fullName.trim() : existence.fullName,
      expiresInMinutes: 10,
    });

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to dispatch verification code email. Please try again shortly.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      challengeToken,
      expiresAt,
      email: normalizedEmail,
      simulated: emailResult.simulated,
      devCode: emailResult.simulated ? otp : undefined,
      emailError: emailResult.error,
    });
  } catch (err: any) {
    console.error("Unhandled error in send-otp route:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while sending verification code." },
      { status: 500 }
    );
  }
}
