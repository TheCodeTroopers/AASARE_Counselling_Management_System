export async function connectGoogleDrive() {
  return { success: true, message: 'Google Drive connected', data: { connected: true } };
}

export async function disconnectGoogleDrive() {
  return { success: true, message: 'Google Drive disconnected', data: { connected: false } };
}

export async function getDriveFiles() {
  return { success: true, message: 'Drive files loaded', data: [{ name: 'Counselling Notes.pdf', syncedAt: 'Today' }] };
}
