"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Redirects admin/counsellor users away from student-facing routes
 * to their respective dashboards as soon as their profile is loaded.
 * AuthProvider is already mounted in the root layout.
 */
function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Pages inside (student) that admins/counsellors ARE allowed to visit
  const publicPrefixes = ["/auth", "/about", "/counsellors", "/reset-password"];
  const isPublicRoute = publicPrefixes.some((r) => pathname === r || pathname?.startsWith(r));

  useEffect(() => {
    // Wait until auth has fully loaded (profile fetched from DB)
    if (loading || !user || !profile) return;
    // Don't redirect on pages that all roles can view
    if (isPublicRoute) return;

    if (profile.role === "admin") {
      router.replace("/admin/dashboard");
    } else if (profile.role === "counsellor") {
      router.replace("/dashboard");
    }
    // Students stay on the page they requested
  }, [loading, user, profile, isPublicRoute, router]);

  return <>{children}</>;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
