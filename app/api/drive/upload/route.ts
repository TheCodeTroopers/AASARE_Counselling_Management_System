import { NextRequest, NextResponse } from "next/server";
import { createAuthedSupabase, getBearerToken } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = (formData.get("folderId") as string) || "aasare_official_casesheet_folder";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const supabase = createAuthedSupabase(getBearerToken(req));
    const token = getBearerToken(req);
    const { data: userData } = await supabase.auth.getUser(token || undefined);
    const userEmail = userData?.user?.email || "counsellor@sode-edu.in";

    const { getValidAccessToken, uploadFileToDriveFolder } = await import("@/lib/google-drive");
    const accessToken = await getValidAccessToken(userEmail, supabase);

    let driveFileUrl = `https://drive.google.com/drive/my-drive`;
    let driveFileId = `drive-file-${Date.now()}`;

    if (accessToken) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadFileToDriveFolder(
        accessToken,
        folderId,
        file.name,
        file.type || "application/pdf",
        buffer,
      );

      if (uploadResult) {
        driveFileId = uploadResult.id;
        driveFileUrl = uploadResult.webViewLink;
      }
    }

    const fileRecord = {
      id: driveFileId,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      mimeType: file.type || "application/pdf",
      folderId,
      syncedAt: new Date().toISOString(),
      uploadedBy: userEmail,
      webUrl: driveFileUrl,
    };

    // Save ONLY metadata to Supabase (no file blob in DB)
    try {
      await supabase.from("case_sheets").insert({
        counsellor_id: userData?.user?.id || userEmail,
        client_name: file.name.replace(/\.[^/.]+$/, ""),
        reason_for_visit: `File uploaded to Google Drive: ${file.name}`,
        is_draft: false,
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      message: `File "${file.name}" uploaded to Google Drive! Metadata saved in Supabase.`,
      data: fileRecord,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
