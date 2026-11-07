import { NextRequest, NextResponse } from "next/server";
import { saveGeneralContactMessage } from "@/lib/portfolio/storage";
import { generalContactSchema } from "@/lib/portfolio/validation";
import { sendEmail, getEmailConfig } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = generalContactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const msg = saveGeneralContactMessage(data);

    try {
      const config = getEmailConfig();
      await sendEmail({
        to: data.email,
        subject: `Message Received: ${data.subjectCategory} [Ref: ${msg.id}]`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
            <h2 style="margin: 0 0 12px; font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 8px;">Remotasks Developer & Business Partnerships</h2>
            <p>Hello <strong>${data.fullName}</strong>,</p>
            <p>Thank you for reaching out regarding <strong>${data.subjectCategory}</strong>. We have logged your message under ID <code>${msg.id}</code> and our team will get back to you shortly.</p>
            <div style="background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 13px;">
              <strong>Your message:</strong>
              <p style="margin: 6px 0 0; color: #444;">${data.message}</p>
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 20px;">Direct business support: <a href="mailto:${config.supportEmail}">${config.supportEmail}</a></p>
          </div>
        `,
        text: `Hello ${data.fullName},\n\nWe received your message regarding ${data.subjectCategory} (Ref: ${msg.id}). We will reply shortly.\n\nRemotasks Team`,
      });
    } catch (err) {
      console.warn("Failed sending contact autoresponder:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Message received. Our team will contact you shortly.",
      data: msg,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process message" },
      { status: 500 }
    );
  }
}

