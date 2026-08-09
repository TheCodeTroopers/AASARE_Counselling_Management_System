import { supabase } from "@/integrations/supabase/client";

export type AppointmentStatus =
  "all" | "pending" | "approved" | "rejected" | "completed" | "cancelled";

export interface AppointmentItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentUsn?: string;
  department: string;
  semester?: string;
  appointmentDate: string;
  time: string;
  status: string;
  reasonPreview: string;
  rejectionReason?: string | null;
  counsellorId: string;
}

const slugMap: Record<string, string> = {
  "deepika.civil@sode-edu.in": "deepika-bv",
  "shashikala.ec@sode-edu.in": "shashikala-r",
  "savitha.cs@sode-edu.in": "savitha-shenoy",
  "ashwithac.cs@sode-edu.in": "ashwitha-thota",
  "karthik.mech@sode-edu.in": "karthik-v",
  "mamathas.ml@sode-edu.in": "mamatha",
  "snkaranth.chemistry@sode-edu.in": "subbulakshmi-karanth",
  "reshma.maths@sode-edu.in": "reshma-nayak",
  "nehal.mba@sode-edu.in": "neha-lakhotia",
};

export async function getAppointments() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return { success: true, message: "No authenticated user", data: [] };
  }

  const user = authData.user;

  // Get logged in user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "student";
  const userEmail = profile?.email || user.email || "";

  let query = supabase.from("appointments").select("*");

  // Filter if user is a counsellor
  if (userRole === "counsellor") {
    const staticSlug = slugMap[userEmail];
    const matchIds = [user.id, userEmail];
    if (staticSlug) matchIds.push(staticSlug);

    query = query.in("counsellor_id", matchIds);
  }

  const { data: appointmentsData, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching appointments:", error);
    return { success: false, message: error.message, data: [] };
  }

  const appts = appointmentsData || [];
  if (appts.length === 0) {
    return { success: true, message: "Appointments loaded", data: [] };
  }

  // Fetch profiles for all student user_ids
  const studentUserIds = Array.from(new Set(appts.map((a) => a.user_id)));
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, full_name, department, year, email, usn")
    .in("id", studentUserIds);

  const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

  const formatted = appts.map((item) => {
    const studentProfile = profileMap.get(item.user_id);
    return {
      id: item.id,
      studentName: studentProfile?.full_name || "Student",
      studentEmail: studentProfile?.email || "",
      studentUsn: studentProfile?.usn || "",
      department: studentProfile?.department || "General",
      semester: studentProfile?.year || "1st Year",
      appointmentDate: item.date,
      time: item.slot_time,
      status: item.status,
      reasonPreview: item.reason,
      rejectionReason: item.rejection_reason,
      counsellorId: item.counsellor_id,
    };
  });

  return { success: true, message: "Appointments loaded", data: formatted };
}

export async function acceptAppointment(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Permission denied or appointment not found in database.");
  }
  return { success: true, message: `Appointment ${id} approved`, data: { id } };
}

export async function rejectAppointment(id: string, reason?: string) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "rejected", rejection_reason: reason || null })
    .eq("id", id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Permission denied or appointment not found in database.");
  }
  return { success: true, message: `Appointment ${id} rejected`, data: { id, reason } };
}

export async function updateAvailability(status: "available" | "unavailable") {
  return { success: true, message: "Availability updated", data: { status } };
}
