"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/use-auth";

function AdminGuard({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.replace("/auth");
      return;
    }

    if (profile.role !== "admin") {
      // Redirect non-admins to their correct dashboard
      if (profile.role === "counsellor") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [loading, user, profile, router]);

  // Optionally show nothing (or a loader) while checking auth
  if (loading || !user || profile?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
