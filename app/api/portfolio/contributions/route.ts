import { NextRequest, NextResponse } from "next/server";
import {
  getContributionProposals,
  saveContributionProposal,
  updateProposalStatus,
} from "@/lib/portfolio/storage";
import { contributionProposalSchema } from "@/lib/portfolio/validation";
import { verifyAdminSession } from "@/lib/supabase/server";
import { sendEmail, getEmailConfig } from "@/lib/email";
import { PORTFOLIO_APPS } from "@/data/portfolio-apps";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const contributionType = searchParams.get("contributionType");

    let proposals = getContributionProposals();

    if (projectId && projectId !== "all") {
      proposals = proposals.filter((p) => p.projectIds.includes(projectId));
    }

    if (status && status !== "all") {
      proposals = proposals.filter((p) => p.status === status);
    }

    if (contributionType && contributionType !== "all") {
      proposals = proposals.filter((p) =>
        p.contributionTypes.includes(contributionType as any)
      );
    }

    return NextResponse.json({ success: true, count: proposals.length, data: proposals });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = contributionProposalSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Resolve project names from project IDs
    const resolvedProjectNames = data.projectIds.map((id) => {
      const match = PORTFOLIO_APPS.find((a) => a.id === id);
      return match ? match.name : id;
    });

    const newProposal = saveContributionProposal({
      ...data,
      projectNames: resolvedProjectNames,
      contributionTypes: data.contributionTypes as any,
      status: "Submitted",
    });

    // Send acknowledgement email to contributor
    try {
      const config = getEmailConfig();
      await sendEmail({
        to: data.email,
        subject: `Contribution Proposal Received: ${data.proposalTitle} [ID: ${newProposal.id}]`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
            <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Remotasks Open-Source Engineering</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Proposal Acknowledgement & Workflow Tracking</p>
            </div>
            
            <p>Dear <strong>${data.fullName}</strong>,</p>
            <p>Thank you for submitting your open-source technical contribution proposal for our application portfolio. We have registered your proposal under reference ID: <strong style="font-family: monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 4px;">${newProposal.id}</strong>.</p>
            
            <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; font-size: 15px;">Proposal Summary</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Title:</strong> ${data.proposalTitle}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Target Project(s):</strong> ${resolvedProjectNames.join(", ")}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Contribution Type:</strong> ${data.contributionTypes.join(", ")}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Current Stage:</strong> <span style="background: #000; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">Submitted (Under Triage)</span></p>
            </div>

            <p style="font-size: 13px; color: #444; line-height: 1.6;">Our development review team inspects submissions based on code quality, architecture alignment, security considerations, and project roadmap priority. You will receive updates as your proposal progresses through the review stages.</p>

            <div style="border-top: 1px solid #eee; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #888;">
              <p style="margin: 0;">Remotasks Portfolio Portal · <a href="${config.appUrl}" style="color: #000;">${config.appUrl}</a></p>
              <p style="margin: 4px 0 0;">Questions? Contact us at <a href="mailto:${config.supportEmail}" style="color: #000;">${config.supportEmail}</a></p>
            </div>
          </div>
        `,
        text: `Hello ${data.fullName},\n\nWe received your contribution proposal "${data.proposalTitle}" for ${resolvedProjectNames.join(", ")}.\nProposal ID: ${newProposal.id}\nStatus: Submitted (Under Review).\n\nBest regards,\nRemotasks Engineering Team`,
      });
    } catch (emailErr) {
      console.warn("Failed sending proposal acknowledgement email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Proposal submitted successfully and acknowledgement queued.",
      data: newProposal,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit proposal" },
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
    const { id, status, adminFeedback, internshipConsideration } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Proposal ID and status are required" },
        { status: 400 }
      );
    }

    const updated = updateProposalStatus(id, status, adminFeedback, internshipConsideration);
    if (!updated) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update proposal status" },
      { status: 500 }
    );
  }
}

