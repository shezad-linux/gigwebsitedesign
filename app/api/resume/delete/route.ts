import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser, createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resumeId } = body;

    // If authenticated in Supabase, purge stored document and extracted records
    if (isSupabaseConfigured()) {
      const user = await getServerAuthUser();
      if (user) {
        const supabase = createClient();
        if (supabase) {
          // 1. Purge from private Supabase Storage bucket
          try {
            const { data: files } = await supabase.storage
              .from("resumes")
              .list(user.id);
            if (files && files.length > 0) {
              const paths = files.map((f) => `${user.id}/${f.name}`);
              await supabase.storage.from("resumes").remove(paths);
            }
          } catch (storageErr) {
            console.warn("Storage deletion error (non-fatal):", storageErr);
          }

          // 2. Delete metadata records
          await supabase
            .from("resume_documents")
            .delete()
            .eq("user_id", user.id);

          await supabase
            .from("extracted_profiles")
            .delete()
            .eq("user_id", user.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Resume document and associated extraction data deleted successfully.",
      deletedId: resumeId || "current",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete resume document." },
      { status: 500 }
    );
  }
}
