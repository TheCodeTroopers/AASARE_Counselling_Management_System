'use client';

import { useQuery } from '@tanstack/react-query';
import { getCase } from '@/services/case.service';
import { SectionCard } from '@/components/common/section-card';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function CaseDetailsView({ caseId }: { caseId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => getCase(caseId),
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load case details.</div>;

  const item = data?.data;

  return (
    <SectionCard title="Case Details" subtitle={`Viewing confidential case record ${item?.id ?? caseId}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Student</p>
          <p className="mt-1 text-lg font-semibold">{item?.studentName}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-1 text-lg font-semibold capitalize">{item?.status}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Department</p>
          <p className="mt-1 text-lg font-semibold">{item?.department}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Semester</p>
          <p className="mt-1 text-lg font-semibold">{item?.semester}</p>
        </div>
      </div>
    </SectionCard>
  );
}
