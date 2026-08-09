import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";
import { getValidAccessToken, listDriveFolderFiles } from "@/lib/google-drive";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAuthedSupabase(getBearerToken(req));
    const { data: userData } = await supabase.auth.getUser(getBearerToken(req) || undefined);
    const userEmail = userData?.user?.email || "counsellor@sode-edu.in";

    const { data: connection } = await supabase
      .from("drive_connections")
      .select("folder_id, is_connected")
      .eq("counsellor_email", userEmail)
      .single();

    if (!connection || !connection.is_connected || !connection.folder_id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const accessToken = await getValidAccessToken(userEmail, supabase);
    if (!accessToken) {
      return NextResponse.json({ success: true, data: [] });
    }

    const files = await listDriveFolderFiles(accessToken, connection.folder_id);

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message, data: [] },
      { status: 500 },
    );
  }
}
