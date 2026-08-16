"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal, X } from "lucide-react";

type Counsellor = {
  name: string;
  dept: string;
  email: string;
  phone: string;
  sessions: number;
  status: "Active" | "On leave" | "Pending";
};

const initialCounsellors: Counsellor[] = [
  {
    name: "Dr. Subbulakshmi N Karanth",
    dept: "Basic Sciences and Humanities",
    email: "subbulakshmi.karanth@sode-edu.in",
    phone: "+91 98450 12341",
    sessions: 28,
    status: "Active",
  },
  {
    name: "Ms. Reshma Nayak",
    dept: "Basic Sciences and Humanities",
    email: "reshma.nayak@sode-edu.in",
    phone: "+91 98450 12342",
    sessions: 24,
    status: "Active",
  },
  {
    name: "Ms. Shashikala R",
    dept: "Electronics and Communication Engineering",
    email: "shashikala.r@sode-edu.in",
    phone: "+91 98450 12343",
    sessions: 31,
    status: "Active",
  },
  {
    name: "Ms. Savitha A Shenoy",
    dept: "Computer Science and Engineering",
    email: "savitha.shenoy@sode-edu.in",
    phone: "+91 98450 12344",
    sessions: 35,
    status: "Active",
  },
  {
    name: "Ms. Ashwitha C Thomas",
    dept: "Computer Science and Engineering",
    email: "ashwitha.thomas@sode-edu.in",
    phone: "+91 98450 12345",
    sessions: 32,
    status: "Active",
  },
  {
    name: "Dr. Deepika B V",
    dept: "Artificial Intelligence & Data Science",
    email: "deepika.bv@sode-edu.in",
    phone: "+91 98450 12346",
    sessions: 42,
    status: "Active",
  },
  {
    name: "Ms. Mamatha",
    dept: "Artificial Intelligence & Machine Learning",
    email: "mamatha@sode-edu.in",
    phone: "+91 98450 12347",
    sessions: 26,
    status: "Active",
  },
  {
    name: "Mr. Karthik V",
    dept: "Mechanical Engineering",
    email: "karthik.v@sode-edu.in",
    phone: "+91 98450 12348",
    sessions: 19,
    status: "Active",
  },
  {
    name: "Dr. Neha Lakhotia",
    dept: "Business Administration",
    email: "neha.lakhotia@sode-edu.in",
    phone: "+91 98450 12349",
    sessions: 29,
    status: "Active",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-[#e9f3ea] text-admin-success border-[#cfe3d1]",
  "On leave": "bg-[#f5e8ea] text-admin-primary border-[#e9c9ce]",
  Pending: "bg-admin-bg text-[#8a6a1f] border-[#ecdcb0]",
};

const statusOptions: Array<Counsellor["status"] | "All"> = ["All", "Active", "On leave", "Pending"];

export default function ManageCounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>(initialCounsellors);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<Counsellor>({
    name: "",
    dept: "",
    email: "",
    phone: "",
    sessions: 0,
    status: "Active",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return counsellors.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesS = statusFilter === "All" || c.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [counsellors, query, statusFilter]);

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setCounsellors((prev) => [{ ...form, sessions: Number(form.sessions) || 0 }, ...prev]);
    setForm({ name: "", dept: "", email: "", phone: "", sessions: 0, status: "Active" });
    setAddOpen(false);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-admin-border bg-white px-3 py-2 w-full md:w-80">
          <Search className="h-4 w-4 text-admin-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, department, email…"
            className="w-full bg-transparent text-sm text-admin-text placeholder:text-[#b39c86] outline-none"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-white px-4 py-2 text-sm text-admin-text hover:bg-admin-bg"
          >
            <Filter className="h-4 w-4 text-admin-muted" />
            Filter{statusFilter !== "All" ? `: ${statusFilter}` : ""}
          </button>
          {filterOpen && (
            <div className="absolute z-10 mt-2 w-44 rounded-xl border border-admin-border bg-white p-1 shadow-lg">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setFilterOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg ${
                    statusFilter === s
                      ? "bg-admin-bg text-admin-primary"
                      : "text-admin-text hover:bg-admin-bg"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-admin-primary px-4 py-2 text-sm font-medium text-admin-bg hover:bg-admin-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Counsellor
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-admin-border-dark bg-white shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-admin-bg text-[11px] tracking-[0.14em] uppercase text-admin-muted">
          <div className="col-span-4">Counsellor</div>
          <div className="col-span-3">Contact</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-1">Sessions</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#f4ebd9]">
          {filtered.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-admin-muted">
              No counsellors match your filters.
            </div>
          )}
          {filtered.map((c) => (
            <div key={c.email} className="grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-admin-bg text-admin-primary font-semibold">
                  {c.name
                    .replace(/(Dr\.|Prof\.|Ms\.|Mr\.)/g, "")
                    .trim()
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-admin-text truncate">{c.name}</div>
                  <div className="text-xs text-admin-muted truncate">{c.dept}</div>
                </div>
              </div>
              <div className="md:col-span-3 text-sm text-[#4a2b30] space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-admin-subtle" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-admin-subtle" />
                  {c.phone}
                </div>
              </div>
              <div className="md:col-span-2 text-sm text-admin-text">{c.dept}</div>
              <div className="md:col-span-1 text-sm font-medium text-admin-text">{c.sessions}</div>
              <div className="md:col-span-1">
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
              <div className="md:col-span-1 flex justify-end gap-2">
                <button className="text-xs font-medium text-admin-primary hover:underline">
                  Edit
                </button>
                <button className="grid h-7 w-7 place-items-center rounded-full hover:bg-admin-bg text-admin-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#f0e5d3] text-xs text-admin-muted">
          <span>
            Showing {filtered.length} of {counsellors.length}
          </span>
        </div>
      </div>

      {/* Add Counsellor Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-admin-text/40 px-4">
          <form
            onSubmit={submitAdd}
            className="w-full max-w-lg rounded-2xl border border-admin-border-dark bg-white shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e5d3]">
              <div>
                <h3 className="font-serif text-xl text-admin-text">Add Counsellor</h3>
                <p className="text-xs text-admin-muted">
                  Invite a faculty member to the counselling panel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-admin-bg text-admin-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-5">
              <Field label="Full name" required>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Deepika B V"
                  className="fld"
                />
              </Field>
              <Field label="Department">
                <input
                  value={form.dept}
                  onChange={(e) => setForm({ ...form, dept: e.target.value })}
                  placeholder="Psychology"
                  className="fld"
                />
              </Field>
              <Field label="Email" required>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@sode-edu.in"
                  className="fld"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 …"
                  className="fld"
                />
              </Field>
              <Field label="Sessions">
                <input
                  type="number"
                  min={0}
                  value={form.sessions}
                  onChange={(e) => setForm({ ...form, sessions: Number(e.target.value) })}
                  className="fld"
                />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as Counsellor["status"] })
                  }
                  className="fld"
                >
                  <option>Active</option>
                  <option>On leave</option>
                  <option>Pending</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#f0e5d3] bg-[#fdfaf3]">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-full border border-admin-border bg-white px-4 py-2 text-sm text-admin-text hover:bg-admin-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-admin-primary px-4 py-2 text-sm font-medium text-admin-bg hover:bg-admin-primary-hover"
              >
                Save Counsellor
              </button>
            </div>
          </form>
          <style>{`.fld{width:100%;border:1px solid #e9dfd0;background:#fff;border-radius:12px;padding:8px 12px;font-size:14px;color:#3b1219;outline:none}.fld:focus{border-color:#6b1e2b}`}</style>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.14em] uppercase text-admin-muted mb-1.5">
        {label}
        {required && <span className="text-admin-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}
