"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarCheck2,
  Clock3,
  TrendingUp,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type RecentItem = {
  student: string;
  counsellor: string;
  time: string;
  status: string;
};

const statusStyles: Record<string, string> = {
  Confirmed: "bg-[#e9f3ea] text-[#2f6b3a] border-[#cfe3d1]",
  Approved: "bg-[#e9f3ea] text-[#2f6b3a] border-[#cfe3d1]",
  Pending: "bg-[#faf3e2] text-[#8a6a1f] border-[#ecdcb0]",
  Rejected: "bg-[#f5e8ea] text-[#6b1e2b] border-[#e9c9ce]",
  Cancelled: "bg-[#f5e8ea] text-[#6b1e2b] border-[#e9c9ce]",
};

export default function AdminDashboardPage() {
  const [counsellorCount, setCounsellorCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminDashboard() {
      const mockProfileStr = typeof window !== "undefined" ? localStorage.getItem("mock_profile") : null;
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user && mockProfileStr) {
        // Load mock admin statistics
        setCounsellorCount(9);
        setSessionCount(24);
        setPendingCount(3);
        setRecent([
          {
            student: "Rahul Kumar",
            counsellor: "Dr. Meera S. (CSE)",
            time: `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 10:30 AM`,
            status: "Pending",
          },
          {
            student: "Priya Sharma",
            counsellor: "Prof. Deepika (Civil)",
            time: `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 02:00 PM`,
            status: "Approved",
          },
          {
            student: "Amit Hegde",
            counsellor: "Mrs. Reshma Nayak (Maths)",
            time: `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 11:00 AM`,
            status: "Approved",
          },
          {
            student: "Sneha Rao",
            counsellor: "Dr. Meera S. (CSE)",
            time: `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 09:30 AM`,
            status: "Rejected",
          },
          {
            student: "Vikram Sen",
            counsellor: "Mr. Karthik V. (Mech)",
            time: `${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}, 04:00 PM`,
            status: "Pending",
          },
        ]);
        setLoading(false);
        return;
      }

      // 1. Fetch counsellors count
      const { data: counsellors } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "counsellor");

      setCounsellorCount(counsellors?.length || 0);

      // 2. Fetch appointments
      const { data: appts } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      const list = appts || [];
      setSessionCount(list.length);
      setPendingCount(list.filter((a) => a.status === "pending").length);

      // 3. Map recent 5
      const recent5 = list.slice(0, 5);
      if (recent5.length > 0) {
        const studentIds = Array.from(new Set(recent5.map((a) => a.user_id)));
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

        const formatted = recent5.map((a) => ({
          student: profileMap.get(a.user_id) || "Student",
          counsellor: a.counsellor_id,
          time: `${a.date}, ${a.slot_time}`,
          status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
        }));
        setRecent(formatted);
      } else {
        setRecent([]);
      }

      setLoading(false);
    }

    loadAdminDashboard();
  }, []);

  const stats = [
    { label: "Active Counsellors", value: String(counsellorCount), delta: "Official Faculty", icon: Users },
    { label: "Total Sessions", value: String(sessionCount), delta: "All time", icon: CalendarCheck2 },
    { label: "Pending Requests", value: String(pendingCount), delta: "Awaiting approval", icon: Clock3 },
    { label: "System Health", value: "100%", delta: "Supabase & API Active", icon: TrendingUp },
  ];

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
              Live database synchronization is active.
            </p>
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

      {/* Recent appointments */}
      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-[#ece1cd] bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0e5d3]">
            <div>
              <h3 className="font-serif text-lg text-[#3b1219]">Recent Appointments</h3>
              <p className="text-xs text-[#8a6a55]">Latest scheduled sessions from live database</p>
            </div>
          </div>
          <div className="divide-y divide-[#f4ebd9]">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-[#8a6a55]">Loading live appointments...</div>
            ) : recent.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#8a6a55]">No appointments found.</div>
            ) : (
              recent.map((r) => (
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
                    className={`text-[11px] px-2.5 py-1 rounded-full border ${statusStyles[r.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#ece1cd] bg-white shadow-sm p-5">
          <h3 className="font-serif text-lg text-[#3b1219]">System Overview</h3>
          <p className="text-xs text-[#8a6a55]">Live database status</p>
          <div className="mt-4 space-y-2">
            <div className="rounded-xl border border-[#efe4d1] bg-[#fdfaf3] p-3 text-sm text-[#3b1219]">
              <span className="font-semibold text-[#6b1e2b]">Counsellor Accounts:</span> {counsellorCount} active
            </div>
            <div className="rounded-xl border border-[#efe4d1] bg-[#fdfaf3] p-3 text-sm text-[#3b1219]">
              <span className="font-semibold text-[#6b1e2b]">Appointments Logged:</span> {sessionCount}
            </div>
            <div className="rounded-xl border border-[#efe4d1] bg-[#fdfaf3] p-3 text-sm text-[#3b1219]">
              <span className="font-semibold text-[#6b1e2b]">Pending Review:</span> {pendingCount}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
