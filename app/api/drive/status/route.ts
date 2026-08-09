import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function GET(req: NextRequest) {
  try {
    // The session lives in the browser's localStorage, so the server must use
    // the user's access token (sent as `Authorization: Bearer ...`) to resolve
    // the authenticated user AND satisfy RLS on drive_connections.
    const authHeader = req.headers.get("authorization");
    const token =
      authHeader?.startsWith("Bearer ") && authHeader.length > 7
        ? authHeader.slice(7)
        : null;

    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://vgsyirselvakpjcfwfgi.supabase.co";
    const SUPABASE_KEY =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable_OhN4Zj3bW8Z6gv-SeHH2xw_3lF7RPyW";

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData } = token
      ? await supabase.auth.getUser(token)
      : { data: { user: null } };
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
