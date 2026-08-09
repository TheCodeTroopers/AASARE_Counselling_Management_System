import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    const userEmail = authData?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ success: true, data: null });
    }

    // Fetch only this user's drive connection row using both email and user_id
    const { data, error } = await supabase
      .from("drive_connections")
      .select(
        "is_connected, updated_at, folder_name, folder_id, folder_url"
      )
      .eq("counsellor_email", userEmail)
      .eq("user_id", userId ?? "")
      .single();

    if (error || !data) {
      // Try by email only as fallback (for rows created before user_id was set)
      const { data: fallback } = await supabase
        .from("drive_connections")
        .select(
          "is_connected, updated_at, folder_name, folder_id, folder_url"
        )
        .eq("counsellor_email", userEmail)
        .single();

      if (fallback) {
        return NextResponse.json({
          success: true,
          data: {
            connected: Boolean(fallback.is_connected),
            lastSync: fallback.updated_at
              ? new Date(fallback.updated_at).toLocaleTimeString()
              : "Never",
            folderName: fallback.folder_name || "AASARE Counselling Case Sheets",
            folderId: fallback.folder_id || "",
            folderUrl:
              fallback.folder_id
                ? `https://drive.google.com/drive/folders/${fallback.folder_id}`
                : fallback.folder_url || "https://drive.google.com/drive/my-drive",
          },
        });
      }

      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: Boolean(data.is_connected),
        lastSync: data.updated_at
          ? new Date(data.updated_at).toLocaleTimeString()
          : "Never",
        folderName: data.folder_name || "AASARE Counselling Case Sheets",
        folderId: data.folder_id || "",
        folderUrl:
          data.folder_id
            ? `https://drive.google.com/drive/folders/${data.folder_id}`
            : data.folder_url || "https://drive.google.com/drive/my-drive",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
