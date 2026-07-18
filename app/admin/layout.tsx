import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Panel | AASARE',
  description: 'Administration dashboard for managing counsellors and schedules.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Admin panel
          </p>
          <h1 className="mt-2 text-2xl font-semibold">AASARE Administration</h1>
        </header>
        {children}
      </div>
    </div>
  );
}
