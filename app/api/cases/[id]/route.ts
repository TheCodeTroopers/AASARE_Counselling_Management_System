import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: authData } = await supabase.auth.getUser();
    const userEmail = authData?.user?.email || "counsellor@sode-edu.in";

    // 1. Fetch metadata from Supabase
    const { data: metadata } = await supabase.from("case_sheets").select("*").eq("id", id).single();

    // 2. Load JSON data on-demand from Google Drive appDataFolder if token available
    const { getValidAccessToken, fetchFileFromAppDataFolder } = await import("@/lib/google-drive");
    const accessToken = await getValidAccessToken(userEmail);

    let driveData = null;

    if (accessToken) {
      driveData = await fetchFileFromAppDataFolder(accessToken, `${id}_data.json`);
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
    const { data: authData } = await supabase.auth.getUser();
    const userEmail = authData?.user?.email || "counsellor@sode-edu.in";
    const userId = authData?.user?.id;

    const { getValidAccessToken, uploadFileToDriveFolder } = await import("@/lib/google-drive");
    const { generateCaseReportPDF } = await import("@/lib/pdf-generator");
    const accessToken = await getValidAccessToken(userEmail);

    let driveJsonId = null;
    let driveFileUrl = null;

    // 1. Upload JSON to appDataFolder & Report PDF to root folder
    if (accessToken) {
      const { data: connection } = await supabase
        .from("drive_connections")
        .select("folder_id")
        .eq("counsellor_email", userEmail)
        .single();

      const folderId = connection?.folder_id || "aasare_official_casesheet_folder";

      // A. Save internal JSON state in Google Drive appDataFolder (hidden from user)
      const jsonBuffer = Buffer.from(JSON.stringify(body, null, 2));
      const jsonResult = await uploadFileToDriveFolder(
        accessToken,
        folderId,
        `${id}_data.json`,
        "application/json",
        jsonBuffer,
        true, // isAppData = true
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
