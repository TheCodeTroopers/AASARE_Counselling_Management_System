'use client';

import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
