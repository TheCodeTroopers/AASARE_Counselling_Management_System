import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(request));
    
    // Authenticate admin request
    const { data: { user }, error: authError } = await supabase.auth.getUser(getBearerToken(request) || undefined);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role" as any)
      .eq("id", user.id)
      .single() as any;

    if (profileError || profileData?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all counsellors from profiles
    const { data: counsellors, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*" as any)
      .eq("role" as any, "counsellor");

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({ counsellors });
  } catch (error: any) {
    console.error("Error fetching counsellors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch counsellors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(request));
    
    // Authenticate admin request
    const { data: { user }, error: authError } = await supabase.auth.getUser(getBearerToken(request) || undefined);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is an admin
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role" as any)
      .eq("id", user.id)
      .single() as any;

    if (profileError || profileData?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, department, phone, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Use admin client to create the user
    // This bypasses RLS and allows creation of a user without signing them in
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: "Counsellor@123", // Default password, user should change it later
      email_confirm: true,
      user_metadata: {
        role: "counsellor",
        full_name: name,
        department: department || "",
        phone: phone || "",
        status: status || "Active"
      }
    });

    if (createError) {
      throw createError;
    }

    // The trigger automatically creates a profile, but we can do a quick update to ensure fields are aligned.
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        department: department,
        full_name: name,
        role: "counsellor",
      } as any)
      .eq("id", newUser.user.id);

    if (updateError) {
      console.error("Error updating profile for new counsellor", updateError);
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser.user 
    });

  } catch (error: any) {
    console.error("Error creating counsellor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create counsellor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(request));

    const { data: { user }, error: authError } = await supabase.auth.getUser(getBearerToken(request) || undefined);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role" as any)
      .eq("id", user.id)
      .single() as any;

    if (profileError || profileData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Delete from Supabase Auth — this also removes the identity
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    // Explicitly delete profile row in case there is no cascade
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting counsellor:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete counsellor" },
      { status: 500 }
    );
  }
}
