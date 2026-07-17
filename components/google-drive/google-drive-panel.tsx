'use client';

import { useQuery } from '@tanstack/react-query';
import { connectGoogleDrive, disconnectGoogleDrive, getDriveFiles } from '@/services/googleDrive.service';
import { Button } from '@/components/common/button';
import { SectionCard } from '@/components/common/section-card';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function GoogleDrivePanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['drive-files'],
    queryFn: getDriveFiles,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load drive files.</div>;

  return (
    <SectionCard title="Google Drive Integration" subtitle="Frontend-only integration surface for attachment workflow preview.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Connection status</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">Connected</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Sync status</p>
          <p className="mt-2 text-lg font-semibold text-primary">Synced 5 mins ago</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Upload placeholder for recently attached files.
      </div>

      <div className="mt-4 space-y-3">
        {data?.data.map((file) => (
          <div key={file.name} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            {file.name} · {file.syncedAt}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => connectGoogleDrive()}>Connect</Button>
        <Button variant="danger" onClick={() => disconnectGoogleDrive()}>Disconnect</Button>
      </div>
    </SectionCard>
  );
}
