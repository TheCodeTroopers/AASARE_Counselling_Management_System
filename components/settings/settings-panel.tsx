"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/services/settings.service";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/common/button";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function SettingsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
        Unable to load settings.
      </div>
    );

  return (
    <SectionCard
      title="Settings"
      subtitle="Security and experience preferences for the counsellor panel."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="font-medium text-primary">Dark Mode</p>
          <p className="text-sm text-text-secondary">Enabled: {data?.darkMode ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="font-medium text-primary">Notification Preferences</p>
          <p className="text-sm text-text-secondary">{data?.notificationPreferences.join(", ")}</p>
        </div>
        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="font-medium text-primary">Language</p>
          <p className="text-sm text-text-secondary">{data?.language}</p>
        </div>
        <div className="rounded-[20px] border border-border bg-white p-4 shadow-card">
          <p className="font-medium text-primary">Security</p>
          <p className="text-sm text-text-secondary">{data?.security}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary">Update Preferences</Button>
        <Button variant="ghost">Manage Security</Button>
      </div>
    </SectionCard>
  );
}
