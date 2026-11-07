import { NextRequest, NextResponse } from "next/server";
import {
  getAcquisitionEnquiries,
  saveAcquisitionEnquiry,
  updateAcquisitionStatus,
} from "@/lib/portfolio/storage";
import { acquisitionEnquirySchema } from "@/lib/portfolio/validation";
import { verifyAdminSession } from "@/lib/supabase/server";
import { sendEmail, getEmailConfig } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const enquiries = getAcquisitionEnquiries();
    return NextResponse.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch acquisition enquiries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = acquisitionEnquirySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const enquiry = saveAcquisitionEnquiry({
      ...data,
      status: "New",
    });

    // Send acknowledgement to prospect
    try {
      const config = getEmailConfig();
      await sendEmail({
        to: data.email,
        subject: `Acquisition Enquiry Received: ${data.appName} [ID: ${enquiry.id}]`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
            <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Remotasks Portfolio Acquisitions</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Confidential Enquiry Acknowledgement</p>
            </div>
            
            <p>Dear <strong>${data.fullName}</strong>,</p>
            <p>Thank you for your interest in acquiring <strong>${data.appName}</strong>. We have logged your enquiry under reference ID: <strong style="font-family: monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 4px;">${enquiry.id}</strong>.</p>
            
            <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; font-size: 15px;">Enquiry Details</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Target Asset:</strong> ${data.appName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Acquisition Type:</strong> ${data.acquisitionType}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Proposed Budget:</strong> ${data.proposedBudget}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Business / Org:</strong> ${data.businessName || "Individual / Private"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Country:</strong> ${data.country}</p>
            </div>

            <p style="font-size: 12px; color: #666; line-height: 1.6; border-left: 3px solid #999; padding-left: 12px; margin: 16px 0;">
              Notice: Submitting an acquisition enquiry does not constitute a legally binding agreement or transfer of ownership. All portfolio acquisitions are subject to due diligence, formal intellectual property assignment agreements, and applicable regulatory and app store guidelines.
            </p>

            <div style="border-top: 1px solid #eee; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #888;">
              <p style="margin: 0;">Remotasks Corporate Portfolios · <a href="${config.appUrl}" style="color: #000;">${config.appUrl}</a></p>
              <p style="margin: 4px 0 0;">Direct inquiries: <a href="mailto:${config.supportEmail}" style="color: #000;">${config.supportEmail}</a></p>
            </div>
          </div>
        `,
        text: `Hello ${data.fullName},\n\nWe received your acquisition enquiry for ${data.appName} (Reference: ${enquiry.id}).\nOur acquisitions lead will review your submission and connect within 1-2 business days.\n\nBest regards,\nRemotasks Portfolio Acquisitions`,
      });
    } catch (err) {
      console.warn("Failed sending acquisition acknowledgement email:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Acquisition enquiry sent successfully.",
      data: enquiry,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit acquisition enquiry" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Enquiry ID and status are required" },
        { status: 400 }
      );
    }

    const updated = updateAcquisitionStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update acquisition status" },
      { status: 500 }
    );
  }
}

