'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  HardDrive,
  Upload,
  Folder,
  FolderPlus,
  Edit2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Save,
  FolderIcon,
  HardDriveIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getDriveFiles,
  getDriveStatus,
  getFolderConfig,
  updateFolderConfig,
  uploadFileToDrive,
  type DriveFolderConfig,
} from '@/services/googleDrive.service';
import { Button } from '@/components/common/button';
import { SectionCard } from '@/components/common/section-card';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function GoogleDrivePanel() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editingFolder, setEditingFolder] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderIdInput, setFolderIdInput] = useState('');

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['drive-status'],
    queryFn: getDriveStatus,
  });

  const { data: folderData, refetch: refetchFolder } = useQuery({
    queryKey: ['drive-folder'],
    queryFn: getFolderConfig,
  });

  const { data: filesData, isLoading, isError, refetch: refetchFiles } = useQuery({
    queryKey: ['drive-files'],
    queryFn: getDriveFiles,
  });

  const isConnected = statusData?.connected ?? true;
  const currentFolder = folderData || {
    folderName: 'AASARE Counselling Case Sheets',
    folderId: 'aasare_official_casesheet_folder',
    folderUrl: 'https://drive.google.com/drive/u/0/my-drive',
  };

  useEffect(() => {
    if (folderData) {
      setFolderNameInput(folderData.folderName);
      setFolderIdInput(folderData.folderId);
    }
  }, [folderData]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data === 'gdrive_connected') {
        connectGoogleDrive().then(() => {
          toast.success('Google Drive connected successfully!');
          refetchStatus();
          refetchFiles();
        });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetchStatus, refetchFiles]);

  const handleConnect = async () => {
    try {
      const clientId = '848778349319-khgc7haamhacdgguqs235gbgdvcg8dg1.apps.googleusercontent.com';
      const redirectUri = encodeURIComponent('http://localhost:8000/api/drive/callback');
      const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;

      window.open(authUrl, '_blank', 'width=600,height=700');
      await connectGoogleDrive();
      toast.success('Opening Google Drive authentication window...');
      await refetchStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect Google Drive');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      toast('Google Drive disconnected.');
      await refetchStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to disconnect Google Drive');
    }
  };

  const handleFolderSave = async () => {
    const newName = folderNameInput.trim() || 'AASARE Counselling Case Sheets';
    const newId = folderIdInput.trim() || 'aasare_official_casesheet_folder';
    const newUrl = newId.startsWith('1')
      ? `https://drive.google.com/drive/folders/${newId}`
      : 'https://drive.google.com/drive/u/0/my-drive';

    const updatedConfig: DriveFolderConfig = {
      folderName: newName,
      folderId: newId,
      folderUrl: newUrl,
    };

    await updateFolderConfig(updatedConfig);
    toast.success(`Google Drive target folder set to "${newName}"`);
    setEditingFolder(false);
    await refetchFolder();
    await refetchFiles();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFileToDrive(file);
      toast.success(`Uploaded "${file.name}" into folder "${currentFolder.folderName}"!`);
      await refetchFiles();
      await refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['drive-files'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 text-sm text-[#E76F51] shadow-card">
        Unable to load Google Drive connection.
      </div>
    );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Google Drive Integration"
        subtitle="Configure target folder to automatically backup & organize all uploaded Case Sheets and documents."
      >
        {/* Dashboard Cards Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connection</span>
              <HardDriveIcon className="h-4 w-4 text-[#6D214F]" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className={`text-lg font-bold ${isConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last Sync</span>
            <p className="mt-2 text-lg font-semibold text-[#6D214F]">{statusData?.lastSync || 'Just now'}</p>
          </div>

          <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Backup Files</span>
              <p className="mt-1 text-2xl font-bold text-slate-900">{filesData?.data.length || 0}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {isConnected ? (
                <Button variant="danger" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button variant="primary" onClick={handleConnect}>
                  Connect Drive
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Target Folder Box */}
        <div className="mt-6 rounded-[24px] border border-[#6D214F]/20 bg-gradient-to-br from-[#F8F3EE] to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6D214F] text-white shadow">
                <FolderIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
                  Target Google Drive Storage Folder
                </span>
                <h3 className="text-lg font-bold text-slate-900">{currentFolder.folderName}</h3>
                <p className="text-xs text-slate-500">
                  Folder ID: <code className="font-mono text-slate-700">{currentFolder.folderId}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={currentFolder.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#6D214F] px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-[#581a3f] transition cursor-pointer"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" /> Open Folder in Google Drive
              </a>
              <button
                type="button"
                onClick={() => setEditingFolder(!editingFolder)}
                className="inline-flex items-center gap-1 rounded-2xl border border-[#E8DDD5] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {editingFolder ? 'Cancel' : 'Change Folder'}
              </button>
            </div>
          </div>

          {/* Edit Folder Settings Dropdown */}
          {editingFolder && (
            <div className="mt-4 border-t border-[#E8DDD5] pt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Drive Folder Name
                  </label>
                  <input
                    type="text"
                    value={folderNameInput}
                    onChange={(e) => setFolderNameInput(e.target.value)}
                    placeholder="e.g. AASARE Counselling Case Sheets"
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#6D214F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Drive Folder ID or URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={folderIdInput}
                    onChange={(e) => setFolderIdInput(e.target.value)}
                    placeholder="e.g. 1A2b3c4D5e6F_Folder_ID"
                    className="w-full rounded-2xl border border-[#E8DDD5] bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#6D214F]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFolderSave}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#6D214F] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#581a3f] cursor-pointer"
                >
                  Save Target Folder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload File to Drive Zone */}
        {isConnected && (
          <div className="mt-6 rounded-[20px] border border-dashed border-[#6D214F]/40 bg-[#F8F3EE] p-6 text-center shadow-sm">
            <Upload className="mx-auto h-8 w-8 text-[#6D214F]" />
            <p className="mt-2 text-sm font-semibold text-slate-800">
              Upload Case Sheet PDF or Document to folder: <span className="text-[#6D214F]">{currentFolder.folderName}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Supported formats: PDF, DOCX, Images (Max 25MB)</p>
            <label className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#6D214F] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#581a3f] transition cursor-pointer">
              <span>{uploading ? 'Uploading to Drive Folder...' : 'Choose File to Upload'}</span>
              <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
          </div>
        )}

        {/* List of Synced Files */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#6D214F]">
              Uploaded Case Documents in "{currentFolder.folderName}"
            </h3>
            <span className="text-xs text-slate-500">{filesData?.data.length || 0} Files</span>
          </div>

          {filesData?.data.length === 0 ? (
            <p className="text-xs text-slate-500">No documents uploaded to this folder yet.</p>
          ) : (
            <div className="space-y-2">
              {filesData?.data.map((file) => (
                <div
                  key={file.id || file.name}
                  className="flex items-center justify-between rounded-2xl border border-[#E8DDD5] bg-white p-3.5 shadow-sm transition hover:bg-[#F8F3EE]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {file.size} · Synced {file.syncedAt} · <span className="font-medium text-[#6D214F]">Folder: {file.folderName || currentFolder.folderName}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-[#F8F3EE] px-3 py-1.5 text-xs font-semibold text-[#6D214F] hover:bg-slate-200 transition cursor-pointer"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" /> View Document
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
