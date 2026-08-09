import { CounsellorShell } from "@/components/layout/counsellor-shell";
import { QueryProvider } from "@/components/providers/query-provider";

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <CounsellorShell>{children}</CounsellorShell>
    </QueryProvider>
  );
}
