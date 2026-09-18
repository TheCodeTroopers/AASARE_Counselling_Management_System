"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock3,
  Download,
  Search,
  X,
  Trash2,
} from "lucide-react";

const days = ["Mon 22", "Tue 23", "Wed 24", "Thu 25", "Fri 26"];
const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

type Status = "Confirmed" | "Pending" | "Rescheduled";
type Slot = {
  day: number;
  hour: number;
  counsellor: string;
  student: string;
  status: Status;
};

const initialSlots: Slot[] = [
  { day: 0, hour: 1, counsellor: "Dr. Deepika B V", student: "Neha R.", status: "Confirmed" },
  { day: 0, hour: 4, counsellor: "Ms. Savitha A Shenoy", student: "Arjun P.", status: "Pending" },
  {
    day: 1,
    hour: 2,
    counsellor: "Dr. Subbulakshmi N Karanth",
    student: "Riya S.",
    status: "Confirmed",
  },
  { day: 2, hour: 3, counsellor: "Ms. Shashikala R", student: "Kiran M.", status: "Rescheduled" },
  { day: 3, hour: 0, counsellor: "Dr. Deepika B V", student: "Ishaan T.", status: "Confirmed" },
  { day: 4, hour: 5, counsellor: "Ms. Ashwitha C Thomas", student: "Aditi V.", status: "Pending" },
  { day: 2, hour: 6, counsellor: "Dr. Deepika B V", student: "Rohit K.", status: "Confirmed" },
];

const statusStyles: Record<Status, string> = {
  Confirmed: "bg-[#f4ecdc] border-[#e6cfa8] text-admin-text",
  Pending: "bg-admin-bg border-[#ecdcb0] text-[#8a6a1f]",
  Rescheduled: "bg-[#f5e8ea] border-[#e9c9ce] text-admin-primary",
};

const statusOptions: Array<Status | "All"> = ["All", "Confirmed", "Pending", "Rescheduled"];

const VIEW_MODES = ["Day", "Week", "Month"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

export default function ViewSchedulesPage() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const [editing, setEditing] = useState<{ slot: Slot | null; day: number; hour: number } | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("Week");
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute the displayed week label based on weekOffset
  const getWeekLabel = () => {
    const base = new Date(2025, 8, 22); // Mon 22 Sep 2025 as base week
    base.setDate(base.getDate() + weekOffset * 7);
    const end = new Date(base);
    end.setDate(base.getDate() + 4);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${base.getDate()} – ${fmt(end)}`;
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return slots.filter((s) => {
      const matchesQ =
        !q || s.counsellor.toLowerCase().includes(q) || s.student.toLowerCase().includes(q);
      const matchesS = statusFilter === "All" || s.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [slots, query, statusFilter]);

  const visibleKey = useMemo(() => new Set(visible.map((s) => `${s.day}-${s.hour}`)), [visible]);

  function openSlot(day: number, hour: number) {
    const existing = slots.find((s) => s.day === day && s.hour === hour) ?? null;
    setEditing({ slot: existing, day, hour });
  }

  function saveSlot(next: Slot) {
    setSlots((prev) => {
      const others = prev.filter((s) => !(s.day === next.day && s.hour === next.hour));
      return [...others, next];
    });
    setEditing(null);
  }

  function deleteSlot(day: number, hour: number) {
    setSlots((prev) => prev.filter((s) => !(s.day === day && s.hour === hour)));
    setEditing(null);
  }

  function exportCsv() {
    const header = ["Day", "Time", "Counsellor", "Student", "Status"];
    const rows = visible
      .slice()
      .sort((a, b) => a.day - b.day || a.hour - b.hour)
      .map((s) => [days[s.day], hours[s.hour], s.counsellor, s.student, s.status]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedules-22-26-sep-2025.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Row 1: view toggle + week nav + export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-admin-border bg-white p-1">
            {VIEW_MODES.map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={[
                  "px-3 py-1.5 text-xs rounded-full transition-colors",
                  viewMode === v ? "bg-admin-primary text-admin-bg" : "text-[#4a2b30] hover:bg-admin-bg",
                ].join(" ")}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-white px-3 py-1.5">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-admin-bg"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4 text-admin-primary" />
            </button>
            <span className="text-xs font-medium text-admin-text flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-admin-muted" />
              {getWeekLabel()}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-admin-bg"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4 text-admin-primary" />
            </button>
          </div>

          <button
            onClick={exportCsv}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-admin-primary px-4 py-1.5 text-xs font-medium text-admin-bg hover:bg-admin-primary-hover"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>

        {/* Row 2: search + status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-admin-border bg-white px-3 py-1.5 min-w-[180px]">
            <Search className="h-4 w-4 text-admin-subtle shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search counsellor or student…"
              className="w-full bg-transparent text-xs text-admin-text placeholder:text-[#b39c86] outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as (typeof statusOptions)[number])}
            className="rounded-full border border-admin-border bg-white px-3 py-1.5 text-xs text-admin-text"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid — horizontally scrollable on mobile */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-admin-border-dark bg-white shadow-sm">
        <div className="overflow-x-auto">
        <div className="grid min-w-[540px]" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
          <div className="bg-admin-bg border-b border-[#f0e5d3]" />
          {days.map((d) => (
            <div
              key={d}
              className="bg-admin-bg border-b border-l border-[#f0e5d3] px-3 py-2 text-xs font-medium text-admin-text"
            >
              {d}
            </div>
          ))}

          {hours.map((h, rowIdx) => (
            <Fragment key={`row-${h}`}>
              <div className="border-b border-[#f4ebd9] px-3 py-6 text-[11px] text-admin-muted flex items-start gap-1">
                <Clock3 className="h-3 w-3 mt-0.5" />
                {h}
              </div>
              {days.map((_, colIdx) => {
                const slot = slots.find((s) => s.day === colIdx && s.hour === rowIdx);
                const isVisible = slot ? visibleKey.has(`${colIdx}-${rowIdx}`) : true;
                return (
                  <button
                    type="button"
                    onClick={() => openSlot(colIdx, rowIdx)}
                    key={`c-${rowIdx}-${colIdx}`}
                    className="relative text-left border-b border-l border-[#f4ebd9] min-h-[64px] p-1.5 hover:bg-[#fdfaf3]"
                  >
                    {slot && isVisible && (
                      <div
                        className={`h-full rounded-lg border px-2 py-1.5 text-[11px] leading-tight ${statusStyles[slot.status]}`}
                      >
                        <div className="font-semibold truncate">{slot.student}</div>
                        <div className="opacity-80 truncate">{slot.counsellor}</div>
                      </div>
                    )}
                    {slot && !isVisible && (
                      <div className="h-full rounded-lg border border-dashed border-admin-border opacity-40" />
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: String(slots.length) },
          {
            label: "Utilisation",
            value: `${Math.round((slots.length / (days.length * hours.length)) * 100)}%`,
          },
          { label: "Free Slots", value: String(days.length * hours.length - slots.length) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-admin-border-dark bg-white p-5 shadow-sm"
          >
            <div className="text-xs tracking-wide uppercase text-admin-subtle">{s.label}</div>
            <div className="mt-2 font-serif text-2xl text-admin-text">{s.value}</div>
          </div>
        ))}
      </div>

      {editing && (
        <EditSlotModal
          key={`${editing.day}-${editing.hour}`}
          day={editing.day}
          hour={editing.hour}
          slot={editing.slot}
          onClose={() => setEditing(null)}
          onSave={saveSlot}
          onDelete={() => deleteSlot(editing.day, editing.hour)}
        />
      )}
    </>
  );
}

function EditSlotModal({
  day,
  hour,
  slot,
  onClose,
  onSave,
  onDelete,
}: {
  day: number;
  hour: number;
  slot: Slot | null;
  onClose: () => void;
  onSave: (s: Slot) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Slot>(
    slot ?? { day, hour, counsellor: "", student: "", status: "Pending" },
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.counsellor || !form.student) return;
    onSave({ ...form, day, hour });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-admin-text/40 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-admin-border-dark bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e5d3]">
          <div>
            <h3 className="font-serif text-xl text-admin-text">
              {slot ? "Edit Slot" : "Add Slot"}
            </h3>
            <p className="text-xs text-admin-muted">
              {days[day]} · {hours[hour]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-admin-bg text-admin-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="block text-[11px] tracking-[0.14em] uppercase text-admin-muted mb-1.5">
              Counsellor *
            </span>
            <input
              required
              value={form.counsellor}
              onChange={(e) => setForm({ ...form, counsellor: e.target.value })}
              placeholder="Dr. Deepika B V"
              className="w-full border border-admin-border bg-white rounded-xl px-3 py-2 text-sm outline-none focus:border-admin-primary"
            />
          </label>
          <label className="block">
            <span className="block text-[11px] tracking-[0.14em] uppercase text-admin-muted mb-1.5">
              Student *
            </span>
            <input
              required
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              placeholder="Neha R."
              className="w-full border border-admin-border bg-white rounded-xl px-3 py-2 text-sm outline-none focus:border-admin-primary"
            />
          </label>
          <label className="block">
            <span className="block text-[11px] tracking-[0.14em] uppercase text-admin-muted mb-1.5">
              Status
            </span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="w-full border border-admin-border bg-white rounded-xl px-3 py-2 text-sm outline-none focus:border-admin-primary"
            >
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Rescheduled</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-[#f0e5d3] bg-[#fdfaf3]">
          <div>
            {slot && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e9c9ce] bg-white px-3 py-2 text-xs text-admin-primary hover:bg-[#f5e8ea]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-admin-border bg-white px-4 py-2 text-sm text-admin-text hover:bg-admin-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-admin-primary px-4 py-2 text-sm font-medium text-admin-bg hover:bg-admin-primary-hover"
            >
              Save Slot
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
