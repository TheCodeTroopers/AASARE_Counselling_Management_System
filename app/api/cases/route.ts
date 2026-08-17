import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const searchQuery = searchParams.get("search");
    const limitParam = searchParams.get("limit");

    const supabase = createAuthedSupabase(getBearerToken(req));
    const { data: authData } = await supabase.auth.getUser(getBearerToken(req) || undefined);
    const userId = authData?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase
      .from("case_sheets")
      .select("id, client_name, department, is_draft, created_at, updated_at")
      .order("created_at", { ascending: false });

    // Filter directly at the database layer
    if (statusParam === "draft") {
      query = query.eq("is_draft", true);
    } else if (statusParam === "submitted" || statusParam === "completed") {
      query = query.eq("is_draft", false);
    }

    if (searchQuery) {
      query = query.ilike("client_name", `%${searchQuery}%`);
    }

    if (limitParam && !isNaN(Number(limitParam))) {
      query = query.limit(Number(limitParam));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: true, data: [] });
    }

    const formatted = (data || []).map((item) => ({
      id: item.id,
      studentName: item.client_name || "Client",
      department: item.department || "General",
      semester: "1st Year",
      status: item.is_draft ? "draft" : "submitted",
      createdDate: item.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      lastUpdated: item.updated_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message, data: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAuthedSupabase(getBearerToken(req));
    const token = getBearerToken(req);
    const { data: authData } = await supabase.auth.getUser(token || undefined);
    const userEmail = authData?.user?.email || "counsellor@sode-edu.in";
    const userId = authData?.user?.id;
    const userName =
      authData?.user?.user_metadata?.full_name ||
      authData?.user?.user_metadata?.name ||
      authData?.user?.email ||
      "";

    // Set signature name to the submitting account and date to today (server-side)
    body.iccSignatureName = userName;
    body.caseDate = new Date().toISOString().slice(0, 10);

    const newId = `CASE-${Date.now().toString().slice(-6)}`;

    // 1. Upload JSON to hidden appDataFolder & Report PDF to root folder
    const { getValidAccessToken, uploadFileToDriveFolder } = await import("@/lib/google-drive");
    const { generateCaseReportPDF } = await import("@/lib/pdf-generator");
    const accessToken = await getValidAccessToken(userEmail, supabase);

    let driveFileUrl = null;

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

      // A. Save internal form JSON in Google Drive appDataFolder (hidden from user)
      const jsonBuffer = Buffer.from(JSON.stringify(body, null, 2));
      await uploadFileToDriveFolder(
        accessToken,
        folderId,
        `${newId}_data.json`,
        "application/json",
        jsonBuffer,
        true, // isAppData = true (requires drive.appdata scope)
      );

      // B. Generate and upload official Case Report PDF to visible root folder
      try {
        const pdfBuffer = await generateCaseReportPDF(newId, body);
        console.log(
          `[Case POST] PDF generated: ${newId}_report.pdf (${pdfBuffer.length} bytes) -> folder ${folderId}`,
        );
        const pdfResult = await uploadFileToDriveFolder(
          accessToken,
          folderId,
          `${newId}_report.pdf`,
          "application/pdf",
          pdfBuffer,
          false, // isAppData = false (Root folder)
        );

        if (pdfResult) {
          driveFileUrl = pdfResult.webViewLink;
          console.log(`[Case POST] PDF uploaded: ${pdfResult.webViewLink}`);
        } else {
          console.error("[Case POST] PDF upload returned null (see Drive Upload Error log above)");
        }
      } catch (pdfErr) {
        console.error("[PDF Error] Failed to generate PDF report:", pdfErr);
      }
    }

    // 2. Save ONLY METADATA in Supabase
    if (userId) {
      try {
        await supabase.from("case_sheets").insert({
          id: newId,
          counsellor_id: userId,
          client_name: body.clientName || "Anonymous Client",
          department: body.department || "General",
          reason_for_visit: body.reasonForVisit || null,
          is_draft: Boolean(body.isDraft),
        });
      } catch {
        // Fallback
      }
    }

    const record = {
      id: newId,
      studentName: body.clientName || "Anonymous Client",
      department: body.department || "General",
      semester: body.yearSemester || "1st Year",
      status: body.isDraft ? "draft" : "submitted",
      createdDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      driveFileUrl,
    };

    return NextResponse.json({
      success: true,
      message: body.isDraft ? "Draft saved in Drive" : "Case PDF report created in Drive",
      data: record,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
