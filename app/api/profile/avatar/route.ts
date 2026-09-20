import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    const supabase = createAuthedSupabase(token);

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser(token || undefined);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload using admin client (bypasses RLS during upload)
    const { error: uploadError } = await supabaseAdmin.storage
      .from("counsellor-avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace existing avatar
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("counsellor-avatars")
      .getPublicUrl(filePath);

    // Add a cache-busting timestamp so browsers pick up the new image
    const imageUrl = `${publicUrl}?t=${Date.now()}`;

    // Save the URL to the profiles table
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() } as any)
      .eq("id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ image_url: imageUrl });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
