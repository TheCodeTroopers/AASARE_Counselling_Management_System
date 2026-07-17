'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Eye, PenSquare, Copy, Trash2 } from 'lucide-react';
import { getAllCases } from '@/services/case.service';
import { SearchFilterBar } from '@/components/common/search-filter-bar';
import { SectionCard } from '@/components/common/section-card';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/common/button';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function CaseManagementTable() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cases'],
    queryFn: getAllCases,
  });

  const cases = data?.data ?? [];

  const filteredCases = useMemo(() => {
    return cases.filter((item) => [item.id, item.studentName, item.department].join(' ').toLowerCase().includes(search.toLowerCase()));
  }, [cases, search]);

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load case records.</div>;

  return (
    <SectionCard title="Case Management" subtitle="Private counselling case directory; completely separate from appointment workflows.">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <SearchFilterBar value={search} onChange={setSearch} placeholder="Search case ID or student" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setViewMode('table')}>Table View</Button>
          <Button variant="secondary" onClick={() => setViewMode('cards')}>Card View</Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Case ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Created</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.studentName}</td>
                  <td className="p-3">{item.createdDate}</td>
                  <td className="p-3">{item.lastUpdated}</td>
                  <td className="p-3"><StatusBadge status={item.status} /></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/case/${item.id}`} className="rounded-lg bg-primary px-3 py-1 text-xs text-white">Open</Link>
                      <button className="rounded-lg bg-slate-100 px-3 py-1 text-xs">Edit</button>
                      <button className="rounded-lg bg-danger px-3 py-1 text-xs text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredCases.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.id}</p>
                  <p className="text-sm text-slate-500">{item.studentName}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Department: {item.department}</p>
                <p>Semester: {item.semester}</p>
                <p>Created: {item.createdDate}</p>
                <p>Last updated: {item.lastUpdated}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/case/${item.id}`} className="rounded-lg bg-primary px-3 py-2 text-xs text-white"><span className="flex gap-1 items-center"><Eye className="h-3 w-3" />Open</span></Link>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs"><span className="flex gap-1 items-center"><PenSquare className="h-3 w-3" />Edit</span></button>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs"><span className="flex gap-1 items-center"><Copy className="h-3 w-3" />Duplicate</span></button>
                <button className="rounded-lg bg-danger px-3 py-2 text-xs text-white"><span className="flex gap-1 items-center"><Trash2 className="h-3 w-3" />Delete</span></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
