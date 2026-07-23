"use client";

import {
  Users,
  CalendarCheck2,
  Clock3,
  TrendingUp,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";


const stats = [
  { label: "Active Counsellors", value: "24", delta: "+2 this month", icon: Users },
  { label: "Sessions This Week", value: "128", delta: "+18%", icon: CalendarCheck2 },
  { label: "Pending Requests", value: "9", delta: "3 urgent", icon: Clock3 },
  { label: "Avg. Response Time", value: "2.4h", delta: "-12%", icon: TrendingUp },
];

const recent = [
  { student: "Neha R.", counsellor: "Dr. Deepika B V", time: "Today, 3:00 PM", status: "Confirmed" },
  { student: "Arjun P.", counsellor: "Ms. Savitha A Shenoy", time: "Today, 4:30 PM", status: "Pending" },
  { student: "Riya S.", counsellor: "Dr. Deepika B V", time: "Tomorrow, 10:00 AM", status: "Confirmed" },
  { student: "Kiran M.", counsellor: "Dr. Subbulakshmi N Karanth", time: "Tomorrow, 1:15 PM", status: "Rescheduled" },
  { student: "Ishaan T.", counsellor: "Ms. Shashikala R", time: "Fri, 11:00 AM", status: "Confirmed" },
];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-[#e9f3ea] text-[#2f6b3a] border-[#cfe3d1]",
  Pending: "bg-[#faf3e2] text-[#8a6a1f] border-[#ecdcb0]",
  Rescheduled: "bg-[#f5e8ea] text-[#6b1e2b] border-[#e9c9ce]",
};

export default function AdminDashboardPage() {
  return (
  <>
      {/* Hero card */}
      <section className="rounded-3xl border border-[#ece1cd] bg-gradient-to-br from-[#fbf1de] via-[#faeede] to-[#f7dfd9] p-6 md:p-8 shadow-sm">
        <div className="flex flex-wrap items-start gap-6 justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cfa8] bg-white/70 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-[#8a6a1f]">
              <CircleDot className="h-3 w-3 text-[#c9a24a]" />
              Private & Confidential
            </div>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl text-[#3b1219] leading-tight">
              Welcome back to your <span className="italic text-[#c9a24a]">AASARE</span> console.
            </h2>
            <p className="mt-2 text-sm text-[#6b4a3a] max-w-md">
              Manage counsellors, review schedules, and keep the cell running smoothly.
              Every action here is logged for accountability.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#6b1e2b] px-4 py-2 text-sm font-medium text-[#faf3e2] hover:bg-[#5a1723]">
              Add Counsellor
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#e9dfd0] bg-white px-4 py-2 text-sm font-medium text-[#3b1219] hover:bg-[#faf3e2]">
              View Schedules
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#ece1cd] bg-white p-5 shadow-sm shadow-[#6b1e2b]/[0.03]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wide uppercase text-[#a08a76]">{label}</span>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#faf3e2] text-[#6b1e2b]">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 font-serif text-3xl text-[#3b1219]">{value}</div>
            <div className="mt-1 text-xs text-[#7a5a4a]">{delta}</div>
          </div>
        ))}
      </section>

      {/* Recent appointments + quick actions */}
      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-[#ece1cd] bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e5d3]">
            <div>
              <h3 className="font-serif text-lg text-[#3b1219]">Upcoming Appointments</h3>
              <p className="text-xs text-[#8a6a55]">Next five scheduled sessions</p>
            </div>
            <button className="text-xs font-medium text-[#6b1e2b] hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-[#f4ebd9]">
            {recent.map((r) => (
              <div key={r.student + r.time} className="flex items-center gap-4 px-5 py-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#faf3e2] text-[#6b1e2b] text-xs font-semibold">
                  {r.student
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#3b1219] truncate">{r.student}</div>
                  <div className="text-xs text-[#8a6a55] truncate">with {r.counsellor}</div>
                </div>
                <div className="text-xs text-[#6b4a3a] hidden sm:block">{r.time}</div>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[r.status]}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece1cd] bg-white shadow-sm p-5">
          <h3 className="font-serif text-lg text-[#3b1219]">Quick Actions</h3>
          <p className="text-xs text-[#8a6a55]">Common admin tasks</p>
          <div className="mt-4 space-y-2">
            {[
              "Invite a new counsellor",
              "Publish weekly schedule",
              "Export appointment report",
              "Broadcast announcement",
            ].map((a) => (
              <button
                key={a}
                className="w-full text-left rounded-xl border border-[#efe4d1] bg-[#fdfaf3] px-4 py-3 text-sm text-[#3b1219] hover:bg-[#faf3e2] flex items-center justify-between"
              >
                {a}
                <ArrowUpRight className="h-4 w-4 text-[#a08a76]" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
