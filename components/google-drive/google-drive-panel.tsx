"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HardDrive, FolderIcon, HardDriveIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getDriveStatus,
  getFolderConfig,
  updateFolderConfig,
  type DriveFolderConfig,
} from "@/services/googleDrive.service";
import { Button } from "@/components/common/button";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function GoogleDrivePanel() {
  const [editingFolder, setEditingFolder] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [folderIdInput, setFolderIdInput] = useState("");

  const {
    data: statusData,
    isLoading,
    isError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["drive-status"],
    queryFn: getDriveStatus,
  });

  const { data: folderData, refetch: refetchFolder } = useQuery({
    queryKey: ["drive-folder"],
    queryFn: getFolderConfig,
  });

  const isConnected = statusData?.connected ?? true;
  const currentFolder = {
    folderName:
      statusData?.folderName || folderData?.folderName || "AASARE Counselling Case Sheets",
    folderId: statusData?.folderId || folderData?.folderId || "",
    folderUrl:
      statusData?.folderUrl ||
      (folderData?.folderId && folderData.folderId.trim()
        ? `https://drive.google.com/drive/folders/${folderData.folderId.trim()}`
        : folderData?.folderUrl || "https://drive.google.com/drive/my-drive"),
  };

  useEffect(() => {
    if (folderData) {
      setFolderNameInput(folderData.folderName);
      setFolderIdInput(folderData.folderId);
    }
  }, [folderData]);

  useEffect(() => {
    async function markConnected() {
      await connectGoogleDrive();
      toast.success("Google Drive connected successfully!");
      await refetchStatus();
    }

    // Check URL query parameters if redirected directly
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "connected") {
        markConnected();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    function handleMessage(event: MessageEvent) {
      if (event.data === "gdrive_connected" || event.data?.type === "GOOGLE_DRIVE_AUTH_SUCCESS") {
        markConnected();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refetchStatus]);

  const handleConnect = async () => {
    try {
      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        "848778349319-khgc7haamhacdgguqs235gbgdvcg8dg1.apps.googleusercontent.com";
      const rawRedirectUri =
        process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/api/drive/callback`
          : "http://localhost:3000/api/drive/callback");
      const redirectUri = encodeURIComponent(rawRedirectUri);
      const scope = encodeURIComponent(
        "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata",
      );

      // The callback runs server-side where the supabase session (stored in
      // localStorage) is unavailable, so carry the user's access token + email
      // through OAuth `state` to identify the user on return.
      const { data: sessionData } = await supabase.auth.getSession();
      const statePayload = JSON.stringify({
        token: sessionData?.session?.access_token || "",
        email: sessionData?.session?.user?.email || "",
      });
      const state = btoa(encodeURIComponent(statePayload));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=select_account&state=${encodeURIComponent(state)}`;

      const popup = window.open(
        authUrl,
        "GoogleDriveOAuth",
        "width=600,height=700,status=yes,scrollbars=yes",
      );
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        toast.error(
          "Pop-up blocked! Please allow pop-ups for this site to select your Google Account.",
        );
        return;
      }
      toast.info("Please select your Google Account in the pop-up window...");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to connect Google Drive");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      toast("Google Drive disconnected.");
      await refetchStatus();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to disconnect Google Drive");
    }
  };

  const handleFolderSave = async () => {
    const newName = folderNameInput.trim() || "AASARE Counselling Case Sheets";
    const newId = folderIdInput.trim();
    const newUrl = newId
      ? `https://drive.google.com/drive/folders/${newId}`
      : "https://drive.google.com/drive/my-drive";

    const updatedConfig: DriveFolderConfig = {
      folderName: newName,
      folderId: newId,
      folderUrl: newUrl,
    };

    await updateFolderConfig(updatedConfig);
    toast.success(`Google Drive target folder set to "${newName}"`);
    setEditingFolder(false);
    await refetchFolder();
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
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
          <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Connection
              </span>
              <HardDriveIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <p
                className={`text-lg font-bold ${isConnected ? "text-emerald-700" : "text-rose-700"}`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Last Sync
            </span>
            <p className="mt-2 text-lg font-semibold text-primary">
              {statusData?.lastSync || "Just now"}
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-4 shadow-card flex items-center justify-end">
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

        {/* Dedicated Target Folder Box */}
        <div className="mt-6 rounded-3xl border border-primary/20 bg-linear-to-br from-secondary to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow">
                <FolderIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Target Google Drive Storage Folder
                </span>
                <h3 className="text-lg font-bold text-slate-900">{currentFolder.folderName}</h3>
                <p className="text-xs text-slate-500">
                  Folder ID:{" "}
                  <code className="font-mono text-slate-700">{currentFolder.folderId}</code>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={currentFolder.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-primary-hover transition cursor-pointer"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" /> Open Folder in Google Drive
              </a>
              <button
                type="button"
                onClick={() => setEditingFolder(!editingFolder)}
                className="inline-flex items-center gap-1 rounded-2xl border border-border bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {editingFolder ? "Cancel" : "Change Folder"}
              </button>
            </div>
          </div>

          {/* Edit Folder Settings Dropdown */}
          {editingFolder && (
            <div className="mt-4 border-t border-border pt-4 space-y-3">
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
                    className="w-full rounded-2xl border border-border bg-white p-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
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
                    className="w-full rounded-2xl border border-border bg-white p-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleFolderSave}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow hover:bg-primary-hover cursor-pointer"
                >
                  Save Target Folder
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
