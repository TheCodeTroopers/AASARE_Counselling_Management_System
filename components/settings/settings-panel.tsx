'use client';

import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/services/settings.service';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/common/button';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function SettingsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load settings.</div>;

  return (
    <SectionCard title="Settings" subtitle="Security and experience preferences for the counsellor panel.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium">Dark Mode</p>
          <p className="text-sm text-slate-500">Enabled: {data?.darkMode ? 'Yes' : 'No'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium">Notification Preferences</p>
          <p className="text-sm text-slate-500">{data?.notificationPreferences.join(', ')}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium">Language</p>
          <p className="text-sm text-slate-500">{data?.language}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-medium">Security</p>
          <p className="text-sm text-slate-500">{data?.security}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary">Update Preferences</Button>
        <Button variant="ghost">Manage Security</Button>
      </div>
    </SectionCard>
  );
}
