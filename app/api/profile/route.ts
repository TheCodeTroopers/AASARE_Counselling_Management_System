import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(request));
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(getBearerToken(request) || undefined);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(request));
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(getBearerToken(request) || undefined);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, department, designation, phone, bio, image_url, specialties } = body;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name,
        department,
        designation,
        phone,
        bio,
        image_url,
        specialties,
        updated_at: new Date().toISOString()
      } as any)
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
