import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export async function GET() {
  try {
    // We use the service role key to bypass RLS and fetch the public counsellor directory
    // We only expose necessary fields and strictly filter by role='counsellor'
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data: counsellors, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, department, designation, bio, specialties, image_url, is_coordinator")
      .eq("role", "counsellor");

    if (error) {
      throw error;
    }

    return NextResponse.json(counsellors || []);
  } catch (error: any) {
    console.error("Error fetching counsellors directory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
