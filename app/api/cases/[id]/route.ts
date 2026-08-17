import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAuthedSupabase(getBearerToken(req));
    const token = getBearerToken(req);
    const { data: authData } = await supabase.auth.getUser(token || undefined);
    const userEmail = authData?.user?.email || "counsellor@sode-edu.in";

    // 1. Fetch metadata from Supabase
    const { data: metadata } = await supabase.from("case_sheets").select("*").eq("id", id).single();

    // 2. Load JSON data on-demand from Google Drive appDataFolder if token available
    const { getValidAccessToken, fetchFileFromAppDataFolder } = await import("@/lib/google-drive");
    const accessToken = await getValidAccessToken(userEmail, supabase);

    console.log("[Case GET] id:", id, "userEmail:", userEmail, "accessToken:", accessToken ? "OK" : "NULL");

    let driveData = null;

    if (accessToken) {
      driveData = await fetchFileFromAppDataFolder(accessToken, `${id}_data.json`);
      console.log("[Case GET] driveData:", JSON.stringify(driveData, null, 2));
    } else {
      console.log("[Case GET] Skipped Drive fetch — no access token (RLS blocked or not connected)");
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        studentName: metadata?.client_name || "Client",
        department: metadata?.department || "General",
        status: metadata?.is_draft ? "draft" : "submitted",
        createdDate: metadata?.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        lastUpdated: metadata?.updated_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        data: driveData || {
          clientName: metadata?.client_name || "Client",
          department: metadata?.department || "General",
          reasonForVisit: metadata?.reason_for_visit || "",
        },
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createAuthedSupabase(getBearerToken(req));
    const token = getBearerToken(req);
    const { data: authData } = await supabase.auth.getUser(token || undefined);
    const userEmail = authData?.user?.email || "counsellor@sode-edu.in";
    const userId = authData?.user?.id;

    const { getValidAccessToken, uploadFileToDriveFolder } = await import("@/lib/google-drive");
    const { generateCaseReportPDF } = await import("@/lib/pdf-generator");
    const accessToken = await getValidAccessToken(userEmail, supabase);

    let driveJsonId = null;
    let driveFileUrl = null;

    // 1. Upload JSON to appDataFolder & Report PDF to root folder
    if (accessToken) {
      const { createDriveFolder } = await import("@/lib/google-drive");
      const { data: connection } = await supabase
        .from("drive_connections")
        .select("folder_id")
        .eq("counsellor_email", userEmail)
        .maybeSingle();

      let folderId = connection?.folder_id && connection.folder_id !== "aasare_official_casesheet_folder"
        ? connection.folder_id
        : "";

      if (!folderId) {
        const newFolder = await createDriveFolder(accessToken, "AASARE Counselling Case Sheets");
        if (newFolder?.id) {
          folderId = newFolder.id;
          await supabase.from("drive_connections").upsert(
            {
              counsellor_email: userEmail,
              user_id: userId,
              folder_name: newFolder.name,
              folder_id: newFolder.id,
              folder_url: newFolder.webViewLink,
              is_connected: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "counsellor_email" }
          );
        }
      }

      // A. Save internal JSON state in Google Drive appDataFolder (hidden from user)
      const jsonBuffer = Buffer.from(JSON.stringify(body, null, 2));
      const jsonResult = await uploadFileToDriveFolder(
        accessToken,
        folderId,
        `${id}_data.json`,
        "application/json",
        jsonBuffer,
        true, // isAppData = true (requires drive.appdata scope)
      );

      if (jsonResult) {
        driveJsonId = jsonResult.id;
      }

      // B. Generate and upload official Case Report PDF to visible root folder
      try {
        const pdfBuffer = await generateCaseReportPDF(id, body);
        const pdfResult = await uploadFileToDriveFolder(
          accessToken,
          folderId,
          `${id}_report.pdf`,
          "application/pdf",
          pdfBuffer,
          false, // isAppData = false (Root folder)
        );

        if (pdfResult) {
          driveFileUrl = pdfResult.webViewLink;
        }
      } catch (pdfErr) {
        console.error("[PDF Error] Failed to generate PDF report:", pdfErr);
      }
    }

    // 2. Update ONLY METADATA in Supabase
    if (userId) {
      try {
        await supabase.from("case_sheets").upsert(
          {
            id,
            counsellor_id: userId,
            client_name: body.clientName || "Anonymous Client",
            department: body.department || "General",
            reason_for_visit: body.reasonForVisit || null,
            is_draft: Boolean(body.isDraft),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      } catch {
        // DB fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: `Case Report PDF ${id} updated in Drive & Supabase metadata`,
      data: {
        id,
        driveJsonId,
        driveFileUrl,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAuthedSupabase(getBearerToken(req));
    const token = getBearerToken(req);
    const { data: authData } = await supabase.auth.getUser(token || undefined);
    const userId = authData?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("case_sheets").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 },
      );
    }

    // Best-effort cleanup of the Drive files (JSON + PDF) for this case.
    try {
      const userEmail = authData?.user?.email || "counsellor@sode-edu.in";
      const { getValidAccessToken } = await import("@/lib/google-drive");
      const accessToken = await getValidAccessToken(userEmail, supabase);
      if (accessToken) {
        const deleteFile = async (fileId: string) => {
          await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        };

        // PDF lives in the visible Drive space
        const pdfQuery = encodeURIComponent(`name = '${id}_report.pdf'`);
        const pdfRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${pdfQuery}&fields=files(id,name)&spaces=drive`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (pdfRes.ok) {
          for (const file of (await pdfRes.json()).files || []) await deleteFile(file.id);
        }

        // JSON lives in the hidden appDataFolder
        const jsonQuery = encodeURIComponent(`name = '${id}_data.json'`);
        const jsonRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${jsonQuery}&fields=files(id,name)&spaces=appDataFolder`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (jsonRes.ok) {
          for (const file of (await jsonRes.json()).files || []) await deleteFile(file.id);
        }
      }
    } catch (driveErr) {
      console.error("[Case Delete] Failed to clean up Drive files:", driveErr);
    }

    return NextResponse.json({
      success: true,
      message: `Case ${id} deleted.`,
      data: { id },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
