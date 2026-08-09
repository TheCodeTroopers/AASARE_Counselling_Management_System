"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAllCases, deleteCase, type CaseSheetRecord } from "@/services/case.service";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { SectionCard } from "@/components/common/section-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/common/button";
import { Modal } from "@/components/common/modal";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export function CaseManagementTable() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [pendingDelete, setPendingDelete] = useState<CaseSheetRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const q = searchParams?.get("search");
    if (q !== null && q !== undefined) {
      setSearch(q);
    }
  }, [searchParams]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cases"],
    queryFn: () => getAllCases(),
  });

  const casesData = data?.data as CaseSheetRecord[] | undefined;

  const filteredCases = useMemo(() => {
    const list = casesData ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item: CaseSheetRecord) =>
      [item.id, item.studentName, item.department, item.semester, item.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [casesData, search]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCase(pendingDelete.id);
      toast.success(`Case ${pendingDelete.id} deleted.`);
      setPendingDelete(null);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to delete case.");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
        Unable to load case records.
      </div>
    );

  return (
    <SectionCard
      title="Case Directory"
      subtitle="Search, view, update, or archive counsellor case sheet records."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder="Search by Case ID, student name or department"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-2xl bg-secondary p-1 text-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-text-secondary"
              }`}
            >
              Grid View
            </button>
          </div>
          <Link
            href="/new-case"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Create Case
          </Link>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="p-3">Case ID</th>
                <th className="p-3">Client / Student Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Created</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((item: CaseSheetRecord) => (
                <tr
                  key={item.id}
                  className="border-t border-border bg-white transition hover:bg-secondary"
                >
                  <td className="p-3 font-mono text-xs text-primary font-semibold">{item.id}</td>
                  <td className="p-3 font-medium">{item.studentName}</td>
                  <td className="p-3 text-slate-600">{item.department}</td>
                  <td className="p-3 text-slate-600">{item.createdDate}</td>
                  <td className="p-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/case/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-hover shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> Open Sheet
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer shadow-xs"
                        title="Delete Case"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                    No case records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredCases.map((item: CaseSheetRecord) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-border bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-primary">{item.id}</p>
                  <p className="font-semibold text-slate-900">{item.studentName}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>Department: {item.department}</p>
                <p>Semester: {item.semester}</p>
                <p>Created: {item.createdDate}</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/case/${item.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-hover shadow-xs"
                >
                  <Eye className="h-3.5 w-3.5" /> Open Sheet
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(pendingDelete)}
        title="Delete Case Record"
        description={
          pendingDelete
            ? `This will permanently delete Case ${pendingDelete.id} and its Google Drive backup.`
            : undefined
        }
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
      >
        {pendingDelete ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="text-sm text-rose-800">
                <p className="font-semibold">
                  {pendingDelete.studentName} · {pendingDelete.id}
                </p>
                <p className="mt-0.5">
                  This action cannot be undone. The case sheet and its Drive backup will be removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Case"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </SectionCard>
  );
}
