"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CounsellorAvatar } from "@/components/counsellor-avatar";
import { counsellors } from "@/lib/counsellors";

export default function CounsellorsPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(counsellors.map((c) => c.department)))],
    [],
  );

  const filtered = counsellors.filter((c) => {
    if (onlyAvailable && !c.available) return false;
    if (dept !== "All" && c.department !== dept) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.department.toLowerCase().includes(s) ||
        c.specialties.some((sp) => sp.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Directory</p>
          <h1 className="font-display text-5xl text-primary md:text-6xl">Meet our counsellors</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Nine faculty counsellors from across SMVITM departments. Pick anyone you feel
            comfortable with — sessions are entirely private.
          </p>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, department, or specialty…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground shrink-0">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Available only
            </label>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/counsellors/${c.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              {c.isCoordinator && (
                <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  Coordinator
                </span>
              )}
              <CounsellorAvatar counsellor={c} size="lg" />
              <h3 className="mt-5 font-display text-2xl leading-tight text-foreground">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.designation}</p>
              <p className="mt-0.5 text-sm text-primary/80">{c.department}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm gap-2">
                <span
                  className={
                    "inline-flex items-center gap-1.5 shrink-0 " +
                    (c.available ? "text-emerald-700" : "text-stone-500")
                  }
                >
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full shrink-0 " +
                      (c.available ? "bg-emerald-500" : "bg-stone-400")
                    }
                  />
                  {c.available ? "Accepting requests" : "Unavailable"}
                </span>
                <span className="inline-flex items-center shrink-0 gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  View Details
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-14 text-center text-muted-foreground">
              No counsellors match that filter yet.
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
