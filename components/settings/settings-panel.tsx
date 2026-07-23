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
  if (isError) return <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 text-sm text-[#E76F51] shadow-card">Unable to load settings.</div>;

  return (
    <SectionCard title="Settings" subtitle="Security and experience preferences for the counsellor panel.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
          <p className="font-medium text-[#6D214F]">Dark Mode</p>
          <p className="text-sm text-[#6E6E6E]">Enabled: {data?.darkMode ? 'Yes' : 'No'}</p>
        </div>
        <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
          <p className="font-medium text-[#6D214F]">Notification Preferences</p>
          <p className="text-sm text-[#6E6E6E]">{data?.notificationPreferences.join(', ')}</p>
        </div>
        <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
          <p className="font-medium text-[#6D214F]">Language</p>
          <p className="text-sm text-[#6E6E6E]">{data?.language}</p>
        </div>
        <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
          <p className="font-medium text-[#6D214F]">Security</p>
          <p className="text-sm text-[#6E6E6E]">{data?.security}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary">Update Preferences</Button>
        <Button variant="ghost">Manage Security</Button>
      </div>
    </SectionCard>
  );
}
