import { Suspense } from "react";
import { CaseManagementTable } from "@/components/case/case-management-table";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function CaseManagementPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={5} />}>
      <CaseManagementTable />
    </Suspense>
  );
}
