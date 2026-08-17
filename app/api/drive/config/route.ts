import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const token = getBearerToken(req);
    const supabase = createAuthedSupabase(token);
    
    // Resolve user from auth token
    const { data: authData, error: authErr } = await supabase.auth.getUser(token || undefined);
    if (authErr || !authData?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized user session" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email || "counsellor@sode-edu.in";

    const body = await req.json();
    const { folderName, folderId } = body;

    const folderUrl = folderId && folderId.trim()
      ? `https://drive.google.com/drive/folders/${folderId.trim()}`
      : "https://drive.google.com/drive/my-drive";

    // Upsert folder configuration into drive_connections with valid user_id & email
    const { data, error } = await supabase
      .from("drive_connections")
      .upsert(
        {
          user_id: userId,
          counsellor_email: userEmail,
          folder_name: folderName || "AASARE Counselling Case Sheets",
          folder_id: folderId || null,
          folder_url: folderUrl,
          is_connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "counsellor_email" }
      )
      .select("folder_name, folder_id, folder_url")
      .single();

    if (error) {
      console.error("[Drive Config API Error]", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Drive folder configuration updated successfully",
      data: {
        folderName: data?.folder_name,
        folderId: data?.folder_id,
        folderUrl: data?.folder_url,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
