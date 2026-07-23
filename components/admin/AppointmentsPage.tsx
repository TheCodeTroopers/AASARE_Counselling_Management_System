"use client";

import { useMemo, useState } from "react";
import { Search, Download, X, Calendar, Clock, User, Mail, Phone, FileText } from "lucide-react";

type Status = "Pending" | "Approved" | "Completed" | "Cancelled";

type Appointment = {
  id: string;
  student: string;
  studentEmail: string;
  studentPhone: string;
  counsellor: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: Status;
  reason: string;
  notes?: string;
};

const seed: Appointment[] = [
  { id: "AP-1042", student: "Neha R.", studentEmail: "neha.r@college.edu", studentPhone: "+91 98xxxxxx01", counsellor: "Dr. Deepika B V", date: "2026-07-20", time: "03:00 PM", status: "Approved", reason: "Academic stress", notes: "Follow-up from last week." },
  { id: "AP-1043", student: "Arjun P.", studentEmail: "arjun.p@college.edu", studentPhone: "+91 98xxxxxx02", counsellor: "Ms. Savitha A Shenoy", date: "2026-07-20", time: "04:30 PM", status: "Pending", reason: "Career guidance" },
  { id: "AP-1044", student: "Riya S.", studentEmail: "riya.s@college.edu", studentPhone: "+91 98xxxxxx03", counsellor: "Dr. Deepika B V", date: "2026-07-21", time: "10:00 AM", status: "Approved", reason: "Anxiety management" },
  { id: "AP-1045", student: "Kiran M.", studentEmail: "kiran.m@college.edu", studentPhone: "+91 98xxxxxx04", counsellor: "Dr. Subbulakshmi N Karanth", date: "2026-07-21", time: "01:15 PM", status: "Cancelled", reason: "Family concerns", notes: "Rescheduled to next week." },
  { id: "AP-1046", student: "Ishaan T.", studentEmail: "ishaan.t@college.edu", studentPhone: "+91 98xxxxxx05", counsellor: "Ms. Shashikala R", date: "2026-07-18", time: "11:00 AM", status: "Completed", reason: "Peer relationships" },
  { id: "AP-1047", student: "Ananya K.", studentEmail: "ananya.k@college.edu", studentPhone: "+91 98xxxxxx06", counsellor: "Dr. Deepika B V", date: "2026-07-15", time: "02:00 PM", status: "Completed", reason: "Exam preparation" },
  { id: "AP-1048", student: "Rohan D.", studentEmail: "rohan.d@college.edu", studentPhone: "+91 98xxxxxx07", counsellor: "Dr. Neha Lakhotia", date: "2026-07-22", time: "09:30 AM", status: "Pending", reason: "Sleep issues" },
];

const statusStyles: Record<Status, string> = {
  Pending: "bg-[#faf3e2] text-[#8a6a1f] border-[#ecdcb0]",
  Approved: "bg-[#e9f3ea] text-[#2f6b3a] border-[#cfe3d1]",
  Completed: "bg-[#e6ecf5] text-[#2b3f6b] border-[#c9d5ec]",
  Cancelled: "bg-[#f5e8ea] text-[#6b1e2b] border-[#e9c9ce]",
};

export default function AppointmentsPage() {
  const [items] = useState<Appointment[]>(seed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    return items.filter((a) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        a.student.toLowerCase().includes(q) ||
        a.counsellor.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);
      const matchesS = status === "All" || a.status === status;
      const matchesD = !date || a.date === date;
      return matchesQ && matchesS && matchesD;
    });
  }, [items, query, status, date]);

  const exportCsv = () => {
    const rows = [
      ["ID", "Student", "Email", "Counsellor", "Date", "Time", "Status", "Reason"],
      ...filtered.map((a) => [a.id, a.student, a.studentEmail, a.counsellor, a.date, a.time, a.status, a.reason]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appointments.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Filter bar */}
      <section className="rounded-2xl border border-[#ece1cd] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a08a76]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student, counsellor or ID"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e9dfd0] bg-[#fdfaf3] text-sm text-[#3b1219] placeholder:text-[#a08a76] focus:outline-none focus:border-[#c9a24a]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "All" | Status)}
            className="rounded-xl border border-[#e9dfd0] bg-[#fdfaf3] px-3 py-2.5 text-sm text-[#3b1219] focus:outline-none focus:border-[#c9a24a]"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-[#e9dfd0] bg-[#fdfaf3] px-3 py-2.5 text-sm text-[#3b1219] focus:outline-none focus:border-[#c9a24a]"
          />
          {date && (
            <button
              onClick={() => setDate("")}
              className="text-xs text-[#6b1e2b] hover:underline"
            >
              Clear date
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-[#e9dfd0] bg-white px-4 py-2 text-sm font-medium text-[#3b1219] hover:bg-[#faf3e2]"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="mt-4 rounded-2xl border border-[#ece1cd] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#fbf6ee] text-[#8a6a55] text-[11px] uppercase tracking-[0.14em]">
              <tr>
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Counsellor</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Time</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4ebd9]">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#fdfaf3]">
                  <td className="px-5 py-3 font-mono text-xs text-[#6b4a3a]">{a.id}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#3b1219]">{a.student}</div>
                    <div className="text-xs text-[#8a6a55]">{a.studentEmail}</div>
                  </td>
                  <td className="px-5 py-3 text-[#3b1219]">{a.counsellor}</td>
                  <td className="px-5 py-3 text-[#3b1219]">{a.date}</td>
                  <td className="px-5 py-3 text-[#3b1219]">{a.time}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setSelected(a)}
                      className="text-xs font-medium text-[#6b1e2b] hover:underline"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#8a6a55]">
                    No appointments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-[#3b1219]/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <aside className="w-full max-w-md h-full bg-[#fdfaf3] border-l border-[#ece1cd] shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ece1cd]">
              <div>
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8a6a55]">
                  Appointment
                </div>
                <div className="font-serif text-xl text-[#3b1219]">{selected.id}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center rounded-full border border-[#e9dfd0] bg-white text-[#6b1e2b] hover:bg-[#faf3e2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <div className="rounded-2xl border border-[#ece1cd] bg-white p-4">
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8a6a55] mb-2">
                  Student
                </div>
                <div className="space-y-2 text-sm text-[#3b1219]">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-[#8a6a55]" /> {selected.student}</div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#8a6a55]" /> {selected.studentEmail}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#8a6a55]" /> {selected.studentPhone}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ece1cd] bg-white p-4">
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8a6a55] mb-2">
                  Session
                </div>
                <div className="space-y-2 text-sm text-[#3b1219]">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-[#8a6a55]" /> {selected.counsellor}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#8a6a55]" /> {selected.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#8a6a55]" /> {selected.time}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ece1cd] bg-white p-4">
                <div className="text-[11px] tracking-[0.18em] uppercase text-[#8a6a55] mb-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" /> Reason
                </div>
                <p className="text-sm text-[#3b1219]">{selected.reason}</p>
                {selected.notes && (
                  <>
                    <div className="mt-4 text-[11px] tracking-[0.18em] uppercase text-[#8a6a55] mb-2">
                      Notes
                    </div>
                    <p className="text-sm text-[#6b4a3a]">{selected.notes}</p>
                  </>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 rounded-full bg-[#6b1e2b] px-4 py-2 text-sm font-medium text-[#faf3e2] hover:bg-[#5a1723]">
                  Approve
                </button>
                <button className="flex-1 rounded-full border border-[#e9dfd0] bg-white px-4 py-2 text-sm font-medium text-[#3b1219] hover:bg-[#faf3e2]">
                  Reschedule
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
