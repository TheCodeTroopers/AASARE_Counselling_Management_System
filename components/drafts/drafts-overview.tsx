'use client';

import { useQuery } from '@tanstack/react-query';
import { getDrafts } from '@/services/case.service';
import { Button } from '@/components/common/button';
import { SectionCard } from '@/components/common/section-card';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function DraftsOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['drafts'],
    queryFn: getDrafts,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load drafts.</div>;

  return (
    <SectionCard title="Draft Management" subtitle="Continue editing or delete saved intake drafts.">
      <div className="space-y-3">
        {data?.data.map((draft) => (
          <div key={draft.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{draft.name}</p>
              <p className="text-sm text-slate-500">Updated {draft.updatedAt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Continue Editing</Button>
              <Button variant="danger">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
