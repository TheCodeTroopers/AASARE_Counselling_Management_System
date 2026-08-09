export type DriveFolderConfig = {
  folderName: string;
  folderId: string;
  folderUrl: string;
};

export type DriveFileItem = {
  id: string;
  name: string;
  size: string;
  type: string;
  syncedAt: string;
  url: string; // Google Drive webViewLink — opens document IN Drive
  folderName: string;
};

const DRIVE_KEY = "aasare_counsellor_gdrive_state";
const FOLDER_KEY = "aasare_counsellor_gdrive_folder";
const FILES_KEY = "aasare_counsellor_gdrive_files";
const BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api";

const defaultFolderConfig: DriveFolderConfig = {
  folderName: "AASARE Counselling Case Sheets",
  folderId: "",
  folderUrl: "https://drive.google.com/drive/my-drive",
};

import { supabase } from "@/integrations/supabase/client";

// ── Status ─────────────────────────────────────────────────────────────────

export async function getDriveStatus() {
  if (typeof window === "undefined") return { connected: false, lastSync: "Never" };

  try {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;

    if (email) {
      const { data } = await supabase
        .from("drive_connections")
        .select("is_connected, updated_at")
        .eq("counsellor_email", email)
        .single();

      if (data) {
        return {
          connected: Boolean(data.is_connected),
          lastSync: new Date(data.updated_at).toLocaleTimeString(),
        };
      }
    }
  } catch {
    // Database fallback
  }

  const raw = localStorage.getItem(DRIVE_KEY);
  if (!raw) return { connected: false, lastSync: "Never" };
  try {
    return JSON.parse(raw);
  } catch {
    return { connected: false, lastSync: "Never" };
  }
}

export async function connectGoogleDrive() {
  const state = { connected: true, lastSync: new Date().toLocaleTimeString() };
  localStorage.setItem(DRIVE_KEY, JSON.stringify(state));

  try {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || "counsellor@sode-edu.in";
    await supabase.from("drive_connections").upsert(
      {
        counsellor_email: email,
        is_connected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "counsellor_email" },
    );
  } catch {
    // Fallback
  }

  return { success: true, message: "Google Drive account connected!", data: state };
}

export async function disconnectGoogleDrive() {
  const state = { connected: false, lastSync: "Disconnected" };
  localStorage.setItem(DRIVE_KEY, JSON.stringify(state));

  try {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email;
    if (email) {
      await supabase
        .from("drive_connections")
        .update({
          is_connected: false,
          encrypted_access_token: null,
          encrypted_refresh_token: null,
        })
        .eq("counsellor_email", email);
    }
  } catch {
    // Fallback
  }

  return { success: true, message: "Google Drive disconnected", data: state };
}

// ── Folder Config ───────────────────────────────────────────────────────────

export async function getFolderConfig(): Promise<DriveFolderConfig> {
  if (typeof window !== "undefined") {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email;
      if (email) {
        const { data } = await supabase
          .from("drive_connections")
          .select("folder_name, folder_id, folder_url")
          .eq("counsellor_email", email)
          .single();

        if (data && data.folder_name) {
          return {
            folderName: data.folder_name,
            folderId: data.folder_id || "",
            folderUrl:
              data.folder_url || `https://drive.google.com/drive/folders/${data.folder_id || ""}`,
          };
        }
      }
    } catch {
      // Fallback
    }

    const raw = localStorage.getItem(FOLDER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fallback
      }
    }
  }

  return defaultFolderConfig;
}

export async function updateFolderConfig(config: DriveFolderConfig) {
  const folderUrl = config.folderId.trim()
    ? `https://drive.google.com/drive/folders/${config.folderId.trim()}`
    : "https://drive.google.com/drive/my-drive";

  const updated = { ...config, folderUrl };
  localStorage.setItem(FOLDER_KEY, JSON.stringify(updated));

  try {
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || "counsellor@sode-edu.in";
    await supabase.from("drive_connections").upsert(
      {
        counsellor_email: email,
        folder_name: config.folderName,
        folder_id: config.folderId,
        folder_url: folderUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "counsellor_email" },
    );
  } catch {
    // Fallback
  }

  return { success: true, message: "Folder updated!", data: updated };
}

// ── File List ───────────────────────────────────────────────────────────────

export async function getDriveFiles(): Promise<{ success: boolean; data: DriveFileItem[] }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/drive/files");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return {
            success: true,
            data: json.data.map((f: any) => ({
              id: f.id,
              name: f.name,
              size: f.size,
              type: f.mimeType,
              syncedAt: f.createdTime
                ? new Date(f.createdTime).toLocaleDateString("en-IN")
                : "Today",
              url: f.webViewLink,
              folderName: "AASARE Counselling Case Sheets",
            })),
          };
        }
      }
    } catch {
      // Fallback
    }

    const rawFiles = localStorage.getItem(FILES_KEY);
    if (rawFiles) {
      try {
        return { success: true, data: JSON.parse(rawFiles) };
      } catch {
        // Fallback
      }
    }
  }

  return { success: true, data: [] };
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadFileToDrive(
  fileObj: File,
): Promise<{ success: boolean; data: DriveFileItem; message: string }> {
  const folder = await getFolderConfig();
  const fileSize = `${(fileObj.size / 1024).toFixed(1)} KB`;
  const syncedAt = new Date().toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let driveUrl: string | null = null;

  // Try uploading to Next.js API route
  try {
    const formData = new FormData();
    formData.append("file", fileObj);
    if (folder.folderId.trim()) {
      formData.append("folderId", folder.folderId.trim());
    }

    const res = await fetch("/api/drive/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      driveUrl = json.data?.webUrl || null;
    }
  } catch {
    // API route fallback
  }

  const { data: existingFiles } = await getDriveFiles();

  const newFile: DriveFileItem = {
    id: `drive_file_${Date.now()}`,
    name: fileObj.name,
    size: fileSize,
    type: fileObj.type || "application/octet-stream",
    syncedAt: `Today, ${syncedAt}`,
    // Use the real Drive webViewLink if we got one, else open root my-drive
    url: driveUrl || folder.folderUrl,
    folderName: folder.folderName,
  };

  const updated = [newFile, ...existingFiles];
  localStorage.setItem(FILES_KEY, JSON.stringify(updated));

  const statusState = { connected: true, lastSync: `Today, ${syncedAt}` };
  localStorage.setItem(DRIVE_KEY, JSON.stringify(statusState));

  return {
    success: true,
    message: driveUrl
      ? `File "${fileObj.name}" uploaded to Google Drive folder "${folder.folderName}"!`
      : `File "${fileObj.name}" queued — connect your Google Drive to sync.`,
    data: newFile,
  };
}
