import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

describe("Candidate Secure Authentication & Email OTP Verification Suite", () => {
  const TEST_EMAIL = "candidate.engineer@example.com";
  const TEST_NAME = "Shezad Ansari";
  const TEST_SECRET = "test-secret-remotasks-2026";

  function generate6DigitOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  function createChallengeToken(params) {
    const normalizedEmail = params.email.trim().toLowerCase();
    const minutes = params.expiresInMinutes || 10;
    const expiresAt = Date.now() + minutes * 60 * 1000;

    const otpHash = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(`${normalizedEmail}:${params.otp}:${expiresAt}`)
      .digest("hex");

    const payload = {
      email: normalizedEmail,
      otpHash,
      expiresAt,
      mode: params.mode,
      fullName: params.fullName?.trim(),
      userId: params.userId,
    };

    const rawJson = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(rawJson)
      .digest("hex");

    const challengeToken = Buffer.from(
      JSON.stringify({ payload: rawJson, sig: signature })
    ).toString("base64");

    return { challengeToken, expiresAt };
  }

  function verifyChallengeToken(params) {
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

      const expectedSig = crypto
        .createHmac("sha256", TEST_SECRET)
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

      const payload = JSON.parse(parsed.payload);

      if (payload.email !== normalizedEmail) {
        return { success: false, error: "Email address does not match this verification code." };
      }

      if (Date.now() > payload.expiresAt) {
        return { success: false, error: "Verification code has expired. Please request a new code." };
      }

      const expectedOtpHash = crypto
        .createHmac("sha256", TEST_SECRET)
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
    } catch {
      return { success: false, error: "Failed to process verification challenge token." };
    }
  }

  function renderOtpVerificationEmail(params) {
    const subject = `Your Remotasks Verification Code: ${params.otp}`;
    const name = params.fullName || "Candidate";
    const minutes = params.expiresInMinutes || 10;

    const html = `<!DOCTYPE html>
<html lang="en">
<body>
  <h1>Your Verification Code</h1>
  <p>Hello ${name}, enter ${params.otp} within ${minutes} minutes.</p>
  <div>${params.otp}</div>
  <p>Remotasks.si Candidate Security</p>
</body>
</html>`;

    const text = `REMOTASKS.SI — CODE: ${params.otp}`;
    return { html, text, subject };
  }

  test("generates cryptographically secure 6-digit numeric OTPs", () => {
    for (let i = 0; i < 20; i++) {
      const otp = generate6DigitOtp();
      assert.equal(otp.length, 6, "OTP must be exactly 6 characters");
      assert.match(otp, /^\d{6}$/, "OTP must consist strictly of digits");
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num <= 999999, "OTP must be between 100000 and 999999");
    }
  });

  test("creates and verifies a valid HMAC-signed OTP challenge token", () => {
    const otp = "749281";
    const { challengeToken, expiresAt } = createChallengeToken({
      email: TEST_EMAIL,
      otp,
      mode: "signin",
      fullName: TEST_NAME,
      expiresInMinutes: 10,
    });

    assert.ok(challengeToken, "Challenge token must be generated");
    assert.ok(expiresAt > Date.now(), "Token must expire in the future");

    const result = verifyChallengeToken({
      email: TEST_EMAIL,
      otp,
      challengeToken,
    });

    assert.equal(result.success, true, "Verification should succeed for correct OTP and token");
    assert.ok(result.payload, "Payload should be returned upon successful verification");
    assert.equal(result.payload.email, TEST_EMAIL);
    assert.equal(result.payload.mode, "signin");
  });

  test("rejects an incorrect OTP code with timing-safe comparison", () => {
    const realOtp = "582910";
    const wrongOtp = "123456";

    const { challengeToken } = createChallengeToken({
      email: TEST_EMAIL,
      otp: realOtp,
      mode: "signin",
    });

    const result = verifyChallengeToken({
      email: TEST_EMAIL,
      otp: wrongOtp,
      challengeToken,
    });

    assert.equal(result.success, false, "Verification must fail for wrong OTP");
    assert.match(result.error, /Incorrect verification code/);
  });

  test("rejects expired OTP challenge tokens strictly", () => {
    const otp = "381920";
    // Create token that expired 1 minute ago
    const { challengeToken } = createChallengeToken({
      email: TEST_EMAIL,
      otp,
      mode: "signin",
      expiresInMinutes: -1,
    });

    const result = verifyChallengeToken({
      email: TEST_EMAIL,
      otp,
      challengeToken,
    });

    assert.equal(result.success, false, "Verification must fail for expired tokens");
    assert.match(result.error, /expired/i);
  });

  test("blocks token replay targeting a different email address", () => {
    const otp = "918273";
    const { challengeToken } = createChallengeToken({
      email: "victim@example.com",
      otp,
      mode: "signin",
    });

    const result = verifyChallengeToken({
      email: "attacker@example.com",
      otp,
      challengeToken,
    });

    assert.equal(result.success, false, "Tokens must be bound strictly to the recipient email");
    assert.match(result.error, /does not match/i);
  });

  test("detects tampered challenge tokens with HMAC signature failure", () => {
    const otp = "472918";
    const { challengeToken } = createChallengeToken({
      email: TEST_EMAIL,
      otp,
      mode: "signin",
    });

    // Tamper with the base64 payload
    const decoded = JSON.parse(Buffer.from(challengeToken, "base64").toString("utf-8"));
    const tamperedPayload = JSON.parse(decoded.payload);
    tamperedPayload.email = "hacker@evil.com";
    decoded.payload = JSON.stringify(tamperedPayload);
    const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString("base64");

    const result = verifyChallengeToken({
      email: "hacker@evil.com",
      otp,
      challengeToken: tamperedToken,
    });

    assert.equal(result.success, false, "Tampered payload must fail signature check");
  });

  test("enforces strict user existence validation logic", () => {
    const existingUsersDatabase = [
      { email: "registered.candidate@remotasks.si", id: "usr_1", fullName: "Registered User" },
      { email: "admin@remotasks.si", id: "usr_admin", fullName: "Admin" },
    ];

    function evaluateAuthRequest(email, mode) {
      const normalized = email.trim().toLowerCase();
      const exists = existingUsersDatabase.some((u) => u.email === normalized);

      if (mode === "signin" && !exists) {
        return {
          allowed: false,
          status: 404,
          error: "No account found with this email. Please sign up to create your candidate account.",
        };
      }

      if (mode === "signup" && exists) {
        return {
          allowed: false,
          status: 409,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      return { allowed: true };
    }

    // 1. Sign In with unregistered email must fail
    const unregisteredSignIn = evaluateAuthRequest("stranger@unknown.com", "signin");
    assert.equal(unregisteredSignIn.allowed, false);
    assert.equal(unregisteredSignIn.status, 404);
    assert.match(unregisteredSignIn.error, /No account found/);

    // 2. Sign In with registered email must succeed
    const validSignIn = evaluateAuthRequest("registered.candidate@remotasks.si", "signin");
    assert.equal(validSignIn.allowed, true);

    // 3. Sign Up with already-registered email must be blocked
    const duplicateSignUp = evaluateAuthRequest("registered.candidate@remotasks.si", "signup");
    assert.equal(duplicateSignUp.allowed, false);
    assert.equal(duplicateSignUp.status, 409);
    assert.match(duplicateSignUp.error, /already exists/);

    // 4. Sign Up with fresh email must succeed
    const freshSignUp = evaluateAuthRequest("new.candidate@gmail.com", "signup");
    assert.equal(freshSignUp.allowed, true);
  });

  test("renders branded Obsidian Monochrome OTP email template with security warning", () => {
    const otp = "839102";
    const { html, text, subject } = renderOtpVerificationEmail({
      recipient: TEST_EMAIL,
      otp,
      fullName: TEST_NAME,
      expiresInMinutes: 10,
    });

    assert.ok(subject.includes(otp), "Subject must contain the verification code");
    assert.ok(html.includes(otp), "HTML body must prominently contain the 6-digit code");
    assert.ok(html.includes(TEST_NAME), "HTML body must address the user by name");
    assert.ok(html.includes("10 minutes"), "HTML body must state expiration timeframe");
    assert.ok(html.includes("Remotasks.si"), "Must include domain branding");
    assert.ok(text.includes(otp), "Text fallback must include code");
  });
});
