import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { recordStoredAffiliateClick } from "@/lib/monetization";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gigId,
      gigTitle,
      platformName,
      partnerId,
      destinationUrl,
      isAffiliate = false,
      userId,
      referrer,
    } = body;

    if (!gigId || !destinationUrl) {
      return NextResponse.json(
        { error: "gigId and destinationUrl are required." },
        { status: 400 }
      );
    }

    const clickRecord = {
      gigId,
      gigTitle: gigTitle || "AI Gig Opportunity",
      platformName: platformName || "Platform",
      partnerId: partnerId || undefined,
      destinationUrl,
      isAffiliate: Boolean(isAffiliate),
      userId: userId || undefined,
      referrer: referrer || req.headers.get("referer") || undefined,
    };

    // 1. Supabase persistence if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("affiliate_clicks").insert({
          id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          gig_id: clickRecord.gigId,
          gig_title: clickRecord.gigTitle,
          platform_name: clickRecord.platformName,
          partner_id: clickRecord.partnerId || null,
          destination_url: clickRecord.destinationUrl,
          is_affiliate: clickRecord.isAffiliate,
          user_id: clickRecord.userId || null,
          referrer: clickRecord.referrer || null,
        });
      } catch (err) {
        console.warn("Supabase click logging failed:", err);
      }
    }

    // 2. Local fallback storage
    const recorded = recordStoredAffiliateClick(clickRecord);

    return NextResponse.json({
      success: true,
      message: "Outbound click tracked successfully.",
      trackingId: recorded.id,
      destinationUrl: recorded.destinationUrl,
      isAffiliate: recorded.isAffiliate,
      disclosure: recorded.isAffiliate
        ? "Affiliate referral link: GigMatcher may receive a commission upon qualification at no cost to you."
        : "Direct official platform link.",
    });
  } catch (error: any) {
    console.error("Outbound click tracking error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to log outbound click." },
      { status: 500 }
    );
  }
}
