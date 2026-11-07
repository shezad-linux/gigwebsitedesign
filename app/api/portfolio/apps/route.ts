import { NextRequest, NextResponse } from "next/server";
import { getPortfolioApps, savePortfolioApp } from "@/lib/portfolio/storage";
import { verifyAdminSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const openSourceOnly = searchParams.get("openSource") === "true";
    const acquisitionOnly = searchParams.get("acquisition") === "true";

    let apps = getPortfolioApps();

    if (category && category !== "All") {
      apps = apps.filter((app) => app.category === category);
    }

    if (openSourceOnly) {
      apps = apps.filter((app) => app.isOpenSource);
    }

    if (acquisitionOnly) {
      apps = apps.filter((app) => app.acquisitionAvailable);
    }

    if (search) {
      apps = apps.filter(
        (app) =>
          app.name.toLowerCase().includes(search) ||
          app.shortDescription.toLowerCase().includes(search) ||
          app.category.toLowerCase().includes(search) ||
          app.techStack.some((t) => t.toLowerCase().includes(search)) ||
          app.keyFeatures.some((f) => f.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ success: true, count: apps.length, data: apps });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(["admin", "reviewer"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || "Unauthorized" },
        { status: auth.user ? 403 : 401 }
      );
    }

    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json(
        { error: "Application id and name are required." },
        { status: 400 }
      );
    }

    const updated = savePortfolioApp(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save application" },
      { status: 500 }
    );
  }
}

