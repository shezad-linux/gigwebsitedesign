/**
 * Email Integration Service for AI Gig-Matcher
 * 
 * Provides transactional email dispatch via Resend REST API with zero external dependencies,
 * Obsidian Monochrome responsive HTML email templates, and graceful fail-soft simulation
 * for staging/development when API keys are not yet configured.
 */

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  simulated?: boolean;
}

export interface OrderEmailParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  originalPrice: number;
  discountAmount: number;
  couponCode?: string;
  finalPrice: number;
  currency: string;
  orderDate?: string;
  customerNotes?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

/**
 * Returns active email configuration from environment variables
 */
export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const isConfigured = Boolean(apiKey && apiKey.length > 5);
  const from = process.env.EMAIL_FROM?.trim() || "Remotasks <notifications@remotasks.si>";
  const supportEmail = process.env.SUPPORT_EMAIL?.trim() || "support@remotasks.si";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://remotasks.si";

  return {
    provider: isConfigured ? "Resend" : "Simulation (Local/Staging)",
    apiKey: isConfigured ? `${apiKey.slice(0, 5)}...` : undefined,
    isConfigured,
    from,
    supportEmail,
    appUrl: appUrl.replace(/\/+$/, ""),
  };
}

export function isEmailConfigured(): boolean {
  return getEmailConfig().isConfigured;
}

/**
 * Formats monetary amounts with appropriate currency symbol
 */
function formatCurrency(amount: number, currency: string = "INR"): string {
  const code = (currency || "INR").toUpperCase();
  if (code === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  if (code === "USD") {
    return `$${amount.toLocaleString("en-US")}`;
  }
  if (code === "EUR") {
    return `€${amount.toLocaleString("en-EU")}`;
  }
  if (code === "GBP") {
    return `£${amount.toLocaleString("en-GB")}`;
  }
  return `${code} ${amount.toLocaleString()}`;
}

/**
 * Renders an Obsidian Monochrome HTML email template for order confirmations & receipts
 */
export function renderOrderConfirmationEmail(params: OrderEmailParams): {
  html: string;
  text: string;
  subject: string;
} {
  const config = getEmailConfig();
  const formattedFinalPrice = formatCurrency(params.finalPrice, params.currency);
  const formattedOriginalPrice = formatCurrency(params.originalPrice, params.currency);
  const formattedDiscount = formatCurrency(params.discountAmount, params.currency);
  const orderDate = params.orderDate
    ? new Date(params.orderDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const subject = `Order Confirmed: ${params.serviceName} (#${params.orderId.slice(0, 8)})`;

  const discountRow =
    params.discountAmount > 0
      ? `<tr>
          <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">
            Discount (${params.couponCode || "Applied Coupon"})
          </td>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #16a34a; text-align: right; border-bottom: 1px solid #f4f4f5;">
            -${formattedDiscount}
          </td>
        </tr>`
      : "";

  const notesRow = params.customerNotes
    ? `<div style="margin-top: 20px; padding: 14px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e4e4e7;">
        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">Customer Notes</p>
        <p style="margin: 0; font-size: 13px; color: #27272a; line-height: 1.5;">${escapeHtml(params.customerNotes)}</p>
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #09090b;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #fafafa;
      padding: 40px 16px;
    }
    .main-card {
      max-width: 540px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 16px;
      padding: 36px 32px;
      text-align: left;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background-color: #000000;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #000000;
      margin: 0 0 10px 0;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #52525b;
      margin: 0 0 20px 0;
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .step-box {
      background-color: #fafafa;
      border-left: 3px solid #000000;
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }
    .step-title {
      font-size: 13px;
      font-weight: 700;
      color: #000000;
      margin: 0 0 6px 0;
    }
    .step-desc {
      font-size: 13px;
      color: #52525b;
      line-height: 1.5;
      margin: 0;
    }
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 10px;
      margin-top: 12px;
      margin-bottom: 20px;
    }
    .footer {
      max-width: 540px;
      margin: 24px auto 0 auto;
      text-align: center;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <span class="badge">Official Receipt & Order Confirmation</span>
      <h1>Thank you, ${escapeHtml(params.customerName)}.</h1>
      <p>
        Your order for <strong>${escapeHtml(params.serviceName)}</strong> has been confirmed.
        Our team of industry mentors and senior resume evaluators has been notified and is now assigned to your request.
      </p>

      <table class="receipt-table">
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Order ID</td>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #09090b; text-align: right; border-bottom: 1px solid #f4f4f5; font-family: monospace;">
            #${escapeHtml(params.orderId)}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Order Date</td>
          <td style="padding: 10px 0; font-size: 13px; color: #09090b; text-align: right; border-bottom: 1px solid #f4f4f5;">
            ${orderDate}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Service Tier</td>
          <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #09090b; text-align: right; border-bottom: 1px solid #f4f4f5;">
            ${escapeHtml(params.serviceName)}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #71717a; border-bottom: 1px solid #f4f4f5;">Base Amount</td>
          <td style="padding: 10px 0; font-size: 13px; color: #09090b; text-align: right; border-bottom: 1px solid #f4f4f5;">
            ${formattedOriginalPrice}
          </td>
        </tr>
        ${discountRow}
        <tr>
          <td style="padding: 14px 0 0 0; font-size: 15px; font-weight: 800; color: #000000;">Total Paid</td>
          <td style="padding: 14px 0 0 0; font-size: 18px; font-weight: 900; color: #000000; text-align: right;">
            ${formattedFinalPrice}
          </td>
        </tr>
      </table>

      ${notesRow}

      <div class="step-box">
        <p class="step-title">What happens next?</p>
        <p class="step-desc">
          1. A designated expert is reviewing your submitted profile notes and target gig roles.<br>
          2. You will receive personalized feedback, draft documents, or consultation invite via email within <strong>24 to 48 hours</strong>.<br>
          3. If additional materials (like links or draft files) are needed, you can reply directly to this email.
        </p>
      </div>

      <a href="${config.appUrl}/dashboard" class="button">Go to Candidate Dashboard</a>

      <p style="font-size: 12px; color: #71717a; margin-top: 24px; margin-bottom: 0;">
        Questions or need to update your target role? Reach out to our expert team at
        <a href="mailto:${config.supportEmail}" style="color: #000000; font-weight: 600; text-decoration: underline;">${config.supportEmail}</a>.
      </p>
    </div>

    <div class="footer">
      Remotasks.si — Transparent, verified AI freelancing & career accelerator.<br>
      © ${new Date().getFullYear()} Remotasks.si. All rights reserved.
    </div>
  </div>
</body>
</html>`;

  const text = `REMOTASKS — ORDER CONFIRMATION & RECEIPT
======================================================
Thank you, ${params.customerName}!

Your order for ${params.serviceName} has been received.

Order Details:
- Order ID: #${params.orderId}
- Date: ${orderDate}
- Service: ${params.serviceName}
- Base Price: ${formattedOriginalPrice}
${params.discountAmount > 0 ? `- Discount (${params.couponCode || "Coupon"}): -${formattedDiscount}\n` : ""}- Total Paid: ${formattedFinalPrice}

Customer Email: ${params.customerEmail}
${params.customerNotes ? `Notes: ${params.customerNotes}\n` : ""}

What happens next:
1. An industry expert is reviewing your request.
2. Expect your first review or draft within 24-48 hours.
3. Access your dashboard at ${config.appUrl}/dashboard

Support: ${config.supportEmail}
`;

  return { html, text, subject };
}

/**
 * Renders an Obsidian Monochrome Admin Test Email template
 */
export function renderAdminTestEmail(params: {
  recipient: string;
  serverTime: string;
  appUrl: string;
}): { html: string; text: string; subject: string } {
  const subject = `[Test Email] Remotasks Delivery Verification (${new Date().toLocaleTimeString()})`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .wrapper { padding: 40px 16px; background-color: #fafafa; }
    .card { max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 36px 32px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; background-color: #000000; color: #ffffff; padding: 4px 10px; border-radius: 9999px; }
    h1 { font-size: 20px; font-weight: 800; color: #000000; margin: 16px 0 8px 0; }
    p { font-size: 13px; color: #52525b; line-height: 1.6; margin: 0 0 16px 0; }
    .kv-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
    .kv-table td { padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <span class="badge">SMTP / API Diagnostic Check</span>
      <h1>Transactional Email Operational</h1>
      <p>
        This test message confirms that your transactional email provider (Resend / SMTP) is correctly configured,
        authorized, and successfully dispatching messages from your production domain.
      </p>

      <table class="kv-table">
        <tr>
          <td style="color: #71717a;">Recipient</td>
          <td style="text-align: right; font-weight: 600; color: #000000;">${escapeHtml(params.recipient)}</td>
        </tr>
        <tr>
          <td style="color: #71717a;">Server Timestamp</td>
          <td style="text-align: right; font-family: monospace;">${escapeHtml(params.serverTime)}</td>
        </tr>
        <tr>
          <td style="color: #71717a;">Canonical App URL</td>
          <td style="text-align: right; color: #000000;">${escapeHtml(params.appUrl)}</td>
        </tr>
        <tr>
          <td style="color: #71717a;">Status</td>
          <td style="text-align: right; font-weight: 700; color: #16a34a;">DELIVERED (HTTP 200)</td>
        </tr>
      </table>

      <p style="font-size: 11px; color: #a1a1aa; margin-top: 24px; margin-bottom: 0;">
        Remotasks Production Diagnostic Services • Automated Verification
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `REMOTASKS — EMAIL DIAGNOSTIC TEST
Recipient: ${params.recipient}
Server Timestamp: ${params.serverTime}
Canonical URL: ${params.appUrl}
Status: Transactional email subsystem operational.
`;

  return { html, text, subject };
}

/**
 * Universal email dispatcher:
 * - If RESEND_API_KEY is present: calls Resend REST API securely.
 * - If RESEND_API_KEY is missing: safely simulates the send, logs payload to console, and returns success without crashing checkout.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const fromAddress = options.from || config.from;

  // 1. Simulation fallback for development / staging / when keys are unset
  if (!apiKey || apiKey.length < 5) {
    const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.info(
      `📧 [EMAIL SIMULATION] Mode: Active | To: ${recipients.join(", ")} | From: ${fromAddress} | Subject: "${options.subject}" | ID: ${simulatedId}`
    );
    return {
      success: true,
      simulated: true,
      id: simulatedId,
    };
  }

  // 2. Real dispatch via Resend REST API
  try {
    const payload = {
      from: fromAddress,
      to: recipients,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo || config.supportEmail,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      const errorMsg = errorData?.message || `Resend API returned HTTP ${res.status}`;
      console.error(`❌ [EMAIL ERROR] Failed to send email via Resend:`, errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const data = await res.json();
    return {
      success: true,
      id: data.id,
      simulated: false,
    };
  } catch (err: any) {
    console.error(`❌ [EMAIL ERROR] Network exception during email dispatch:`, err);
    return {
      success: false,
      error: err?.message || "Failed to dispatch email",
    };
  }
}

export interface OtpEmailParams {
  recipient: string;
  otp: string;
  fullName?: string;
  expiresInMinutes?: number;
}

/**
 * Renders an Obsidian Monochrome HTML email template for 6-digit OTP verification codes
 */
export function renderOtpVerificationEmail(params: OtpEmailParams): {
  html: string;
  text: string;
  subject: string;
} {
  const subject = `Your Remotasks Verification Code: ${params.otp}`;
  const name = params.fullName || "Candidate";
  const minutes = params.expiresInMinutes || 10;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #09090b; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #fafafa; padding: 40px 16px; }
    .card { max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 36px 32px; text-align: left; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background-color: #000000; color: #ffffff; padding: 4px 10px; border-radius: 9999px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 800; color: #000000; margin: 0 0 10px 0; letter-spacing: -0.02em; }
    p { font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 20px 0; }
    .otp-box { background-color: #000000; color: #ffffff; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ffffff; margin: 0; }
    .warning { background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #71717a; line-height: 1.5; margin-top: 20px; }
    .footer { max-width: 500px; margin: 24px auto 0 auto; text-align: center; font-size: 12px; color: #a1a1aa; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <span class="badge">Security Verification</span>
      <h1>Your Verification Code</h1>
      <p>
        Hello <strong>${escapeHtml(name)}</strong>, enter the 6-digit one-time code below to complete your sign-in to Remotasks.si.
      </p>

      <div class="otp-box">
        <div class="otp-code">${escapeHtml(params.otp)}</div>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This code expires in ${minutes} minutes. Remotasks team members will never ask you for this code. If you did not request this code, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      © 2026 Remotasks.si · Verified AI Freelance Matcher<br>
      Enterprise Candidate Security
    </div>
  </div>
</body>
</html>`;

  const text = `REMOTASKS.SI — VERIFICATION CODE
Your 6-digit verification code is: ${params.otp}

This code expires in ${minutes} minutes. Never share this code with anyone.
If you did not request this code, please ignore this email.
`;

  return { html, text, subject };
}

/**
 * Convenience helper to send an OTP email to the candidate
 */
export async function sendOtpEmail(params: OtpEmailParams): Promise<EmailResult> {
  const { html, text, subject } = renderOtpVerificationEmail(params);
  return sendEmail({
    to: params.recipient,
    subject,
    html,
    text,
  });
}

/**
 * Convenience helper to send an order confirmation receipt to the customer
 */
export async function sendOrderConfirmation(params: OrderEmailParams): Promise<EmailResult> {
  const { html, text, subject } = renderOrderConfirmationEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject,
    html,
    text,
  });
}

/**
 * Convenience helper to send a test email for admin diagnostic verification
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  const config = getEmailConfig();
  const { html, text, subject } = renderAdminTestEmail({
    recipient: to,
    serverTime: new Date().toISOString(),
    appUrl: config.appUrl,
  });
  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
