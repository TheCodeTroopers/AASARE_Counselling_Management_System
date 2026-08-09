"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/profile.service";
import { Button } from "@/components/common/button";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function ProfilePanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
        Unable to load profile.
      </div>
    );

  return (
    <SectionCard
      title="Profile"
      subtitle="Editable counsellor details for panel identity and contact records."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-text-secondary">
          Name
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            defaultValue={data?.name}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Department
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            defaultValue={data?.department}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Designation
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            defaultValue={data?.designation}
          />
        </label>
        <label className="text-sm text-text-secondary">
          Email
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            defaultValue={data?.email}
          />
        </label>
        <label className="text-sm text-text-secondary md:col-span-2">
          Phone
          <input
            className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-text outline-none transition focus:ring-2 focus:ring-primary/40"
            defaultValue={data?.phone}
          />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary">Save Changes</Button>
        <Button variant="ghost">Reset</Button>
      </div>
    </SectionCard>
  );
}
