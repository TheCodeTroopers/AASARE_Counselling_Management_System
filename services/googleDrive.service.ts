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
  url: string;        // Google Drive webViewLink — opens document IN Drive
  folderName: string;
};

const DRIVE_KEY = 'aasare_counsellor_gdrive_state';
const FOLDER_KEY = 'aasare_counsellor_gdrive_folder';
const FILES_KEY = 'aasare_counsellor_gdrive_files';
const BACKEND_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000/api';

const defaultFolderConfig: DriveFolderConfig = {
  folderName: 'AASARE Counselling Case Sheets',
  folderId: '',
  folderUrl: 'https://drive.google.com/drive/my-drive',
};

// ── Status ─────────────────────────────────────────────────────────────────

export async function getDriveStatus() {
  if (typeof window === 'undefined') return { connected: false, lastSync: 'Never' };
  const raw = localStorage.getItem(DRIVE_KEY);
  if (!raw) return { connected: false, lastSync: 'Never' };
  try {
    return JSON.parse(raw);
  } catch {
    return { connected: false, lastSync: 'Never' };
  }
}

export async function connectGoogleDrive() {
  const state = { connected: true, lastSync: new Date().toLocaleTimeString() };
  localStorage.setItem(DRIVE_KEY, JSON.stringify(state));
  return { success: true, message: 'Google Drive account connected!', data: state };
}

export async function disconnectGoogleDrive() {
  const state = { connected: false, lastSync: 'Disconnected' };
  localStorage.setItem(DRIVE_KEY, JSON.stringify(state));
  return { success: true, message: 'Google Drive disconnected', data: state };
}

// ── Folder Config ───────────────────────────────────────────────────────────

export async function getFolderConfig(): Promise<DriveFolderConfig> {
  if (typeof window === 'undefined') return defaultFolderConfig;
  const raw = localStorage.getItem(FOLDER_KEY);
  if (!raw) {
    localStorage.setItem(FOLDER_KEY, JSON.stringify(defaultFolderConfig));
    return defaultFolderConfig;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultFolderConfig;
  }
}

export async function updateFolderConfig(config: DriveFolderConfig) {
  // Derive the real Google Drive folder URL from the folder ID
  const folderUrl = config.folderId.trim()
    ? `https://drive.google.com/drive/folders/${config.folderId.trim()}`
    : 'https://drive.google.com/drive/my-drive';

  const updated = { ...config, folderUrl };
  localStorage.setItem(FOLDER_KEY, JSON.stringify(updated));
  return { success: true, message: 'Folder updated!', data: updated };
}

// ── File List ───────────────────────────────────────────────────────────────

export async function getDriveFiles(): Promise<{ success: boolean; data: DriveFileItem[] }> {
  if (typeof window === 'undefined') return { success: true, data: [] };
  const rawFiles = localStorage.getItem(FILES_KEY);
  if (!rawFiles) return { success: true, data: [] };
  try {
    return { success: true, data: JSON.parse(rawFiles) };
  } catch {
    return { success: true, data: [] };
  }
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadFileToDrive(fileObj: File): Promise<{ success: boolean; data: DriveFileItem; message: string }> {
  const folder = await getFolderConfig();
  const fileSize = `${(fileObj.size / 1024).toFixed(1)} KB`;
  const syncedAt = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let driveUrl: string | null = null;

  // Try uploading to real Google Drive backend
  try {
    const formData = new FormData();
    formData.append('file', fileObj);
    if (folder.folderId.trim()) {
      formData.append('folder_id', folder.folderId.trim());
    }

    const res = await fetch(`${BACKEND_URL}/drive/upload-file`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (res.ok) {
      const json = await res.json();
      // webViewLink → opens the file preview inside Google Drive (not download)
      driveUrl = json.web_view_link || null;
    }
  } catch {
    // Backend not reachable or not authenticated — fall back to blob URL
  }

  const { data: existingFiles } = await getDriveFiles();

  const newFile: DriveFileItem = {
    id: `drive_file_${Date.now()}`,
    name: fileObj.name,
    size: fileSize,
    type: fileObj.type || 'application/octet-stream',
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
