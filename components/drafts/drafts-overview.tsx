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
  if (isError) return <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 text-sm text-[#E76F51] shadow-card">Unable to load drafts.</div>;

  return (
    <SectionCard title="Draft Management" subtitle="Continue editing or delete saved intake drafts.">
      <div className="space-y-3">
        {data?.data.map((draft) => (
          <div key={draft.id} className="flex flex-col gap-3 rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[#6D214F]">{draft.name}</p>
              <p className="text-sm text-[#6E6E6E]">Updated {draft.updatedAt}</p>
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
