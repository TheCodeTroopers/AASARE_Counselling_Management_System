import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { decryptPayload, encryptPayload } from "@/lib/crypto";

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  createdTime: string;
  webViewLink: string;
}

/**
 * Retrieves a valid Google Drive Access Token for a counsellor.
 * Automatically handles token decryption and refresh token grant if needed.
 *
 * Pass an authenticated Supabase client (e.g. `createAuthedSupabase(token)`)
 * when running server-side so RLS on `drive_connections` passes. Falls back to
 * the shared client when omitted.
 */
export async function getValidAccessToken(
  counsellorEmail: string,
  client: SupabaseClient<Database> = supabase,
): Promise<string | null> {
  try {
    const { data, error } = await client
      .from("drive_connections")
      .select("encrypted_access_token, encrypted_refresh_token, is_connected")
      .eq("counsellor_email", counsellorEmail)
      .single();

    if (error || !data || !data.is_connected || !data.encrypted_access_token) {
      return null;
    }

    const decryptedAccess = decryptPayload(data.encrypted_access_token);
    if (decryptedAccess?.token && typeof decryptedAccess.token === "string") {
      return decryptedAccess.token;
    }

    // Attempt token refresh if access token expired
    if (data.encrypted_refresh_token) {
      const decryptedRefresh = decryptPayload(data.encrypted_refresh_token);
      const refreshToken = decryptedRefresh?.token as string;
      const clientId = process.env.GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

      if (refreshToken && clientId && clientSecret) {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          }),
        });

        if (tokenRes.ok) {
          const newTokenData = await tokenRes.json();
          const newAccessToken = newTokenData.access_token;
          const encNewAccessToken = encryptPayload({ token: newAccessToken });

          await client
            .from("drive_connections")
            .update({
              encrypted_access_token: encNewAccessToken,
              updated_at: new Date().toISOString(),
            })
            .eq("counsellor_email", counsellorEmail);

          return newAccessToken;
        }
      }
    }
  } catch (err) {
    console.error("[Drive Token Error] Failed to retrieve valid access token:", err);
  }

  return null;
}

/**
 * Creates a dedicated folder in Google Drive for saving counselling case sheets.
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string = "AASARE Counselling Case Sheets",
): Promise<DriveFolderInfo | null> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        webViewLink: data.webViewLink || `https://drive.google.com/drive/folders/${data.id}`,
      };
    }
  } catch (err) {
    console.error("[Drive Folder Error] Failed to create Google Drive folder:", err);
  }

  return null;
}

/**
 * Uploads a file directly into Google Drive (either root folderId or hidden appDataFolder).
 */
export async function uploadFileToDriveFolder(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  isAppData: boolean = false,
): Promise<DriveFileInfo | null> {
  try {
    const metadata = {
      name: fileName,
      parents: isAppData ? ["appDataFolder"] : [folderId],
    };

    const boundary = "---------------------------" + Date.now().toString(16);
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    const body = Buffer.concat([
      Buffer.from(
        delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType || "application/pdf"}\r\n\r\n`,
      ),
      buffer,
      Buffer.from(closeDelimiter),
    ]);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType,createdTime,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );

    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
        size: data.size ? `${(Number(data.size) / 1024).toFixed(1)} KB` : "0 KB",
        mimeType: data.mimeType || mimeType,
        createdTime: data.createdTime || new Date().toISOString(),
        webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
      };
    }

    const errBody = await res.text();
    console.error(
      `[Drive Upload Error] ${fileName} -> HTTP ${res.status} (isAppData=${isAppData}):`,
      errBody,
    );
  } catch (err) {
    console.error("[Drive Upload Error] Failed to upload file to Google Drive:", err);
  }

  return null;
}

/**
 * Searches and retrieves file content from appDataFolder by name.
 */
export async function fetchFileFromAppDataFolder(
  accessToken: string,
  fileName: string,
): Promise<any | null> {
  try {
    const query = encodeURIComponent(
      `name = '${fileName}' and 'appDataFolder' in parents and trashed = false`,
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (res.ok) {
      const data = await res.json();
      const file = data.files?.[0];
      if (file?.id) {
        const fileRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (fileRes.ok) {
          return await fileRes.json();
        }
      }
    } else {
      console.error(`[Drive AppData Fetch Error] ${fileName} -> HTTP ${res.status}:`, await res.text());
    }
  } catch (err) {
    console.error("[Drive AppData Fetch Error] Failed to fetch file from appDataFolder:", err);
  }

  return null;
}

/**
 * Retrieves list of files from the dedicated Google Drive folder.
 */
export async function listDriveFolderFiles(
  accessToken: string,
  folderId: string,
): Promise<DriveFileInfo[]> {
  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,createdTime,webViewLink)&orderBy=createdTime%20desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      const data = await res.json();
      return (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        size: f.size ? `${(Number(f.size) / 1024).toFixed(1)} KB` : "0 KB",
        mimeType: f.mimeType || "application/octet-stream",
        createdTime: f.createdTime || new Date().toISOString(),
        webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      }));
    }
  } catch (err) {
    console.error("[Drive List Error] Failed to list folder files:", err);
  }

  return [];
}
