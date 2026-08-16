import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET() {
  try {
    const [appointmentsRes, profilesRes, casesRes, slotsRes] = await Promise.all([
      supabase.from("appointments").select("id, status"),
      supabase.from("profiles").select("id, role"),
      supabase.from("case_sheets").select("id"),
      supabase.from("counsellor_slots").select("id, available"),
    ]);

    const appointments = appointmentsRes.data || [];
    const profiles = profilesRes.data || [];
    const cases = casesRes.data || [];
    const slots = slotsRes.data || [];

    const totalCounsellors = profiles.filter((p) => p.role === "counsellor").length || 9;
    const totalStudents = profiles.filter((p) => p.role === "student").length;
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter((a) => a.status === "pending").length;
    const approvedAppointments = appointments.filter((a) => a.status === "approved").length;
    const rejectedAppointments = appointments.filter((a) => a.status === "rejected").length;
    const completedAppointments = appointments.filter((a) => a.status === "completed").length;
    const totalSlotsAvailable = slots.filter((s) => s.available).length;

    const metrics = {
      totalCounsellors,
      totalStudents,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments,
      completedAppointments,
      totalCases: cases.length,
      totalSlotsAvailable,
      statsCards: [
        { label: "Total Counsellors", value: String(totalCounsellors), tone: "primary" },
        { label: "Pending Requests", value: String(pendingAppointments), tone: "warning" },
        { label: "Approved Sessions", value: String(approvedAppointments), tone: "success" },
        { label: "Rejected Requests", value: String(rejectedAppointments), tone: "danger" },
        { label: "Completed Sessions", value: String(completedAppointments), tone: "secondary" },
      ],
    };

    return NextResponse.json({ success: true, data: metrics });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 });
  }
}
