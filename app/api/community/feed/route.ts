import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCommunityFeed } from "@/lib/community/queries";
import { feedQuerySchema } from "@/lib/community/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      search: searchParams.get("search") || undefined,
    };

    const validated = feedQuerySchema.safeParse(queryParams);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const result = await fetchCommunityFeed(supabase, validated.data);

    return NextResponse.json({
      success: true,
      data: result.posts,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  } catch (error: any) {
    console.error("Community feed API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch community feed" },
      { status: 500 }
    );
  }
}