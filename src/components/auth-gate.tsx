"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthRoute) {
      router.replace("/auth");
    }
  }, [loading, user, isAuthRoute, router]);

  if (loading) {
    return <Spinner />;
  }

  if (!user && !isAuthRoute) {
    return <Spinner />;
  }

  return <>{children}</>;
}
