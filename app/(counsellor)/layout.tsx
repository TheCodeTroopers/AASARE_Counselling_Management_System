"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CounsellorShell } from "@/components/layout/counsellor-shell";
import { QueryProvider } from "@/components/providers/query-provider";
import { useAuth } from "@/hooks/use-auth";

function CounsellorGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.replace("/auth");
      return;
    }

    if (profile.role !== "counsellor") {
      // Redirect non-counsellors to their correct dashboard
      if (profile.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [loading, user, profile, router]);

  if (loading || !user || profile?.role !== "counsellor") {
    return null;
  }

  return <>{children}</>;
}

export default function CounsellorLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <CounsellorGuard>
        <CounsellorShell>{children}</CounsellorShell>
      </CounsellorGuard>
    </QueryProvider>
  );
}
