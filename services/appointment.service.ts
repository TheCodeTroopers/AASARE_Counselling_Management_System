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
  "ashwithac.cs@sode-edu.in": "ashwitha-thomas",
  "karthik.mech@sode-edu.in": "karthik-v",
  "mamathas.ml@sode-edu.in": "mamatha",
  "snkaranth.chemistry@sode-edu.in": "subbulakshmi-karanth",
  "reshma.maths@sode-edu.in": "reshma-nayak",
  "nehal.mba@sode-edu.in": "neha-lakhotia",
};

export async function getAppointments() {
  const { data: authData } = await supabase.auth.getUser();
  const mockProfileStr = typeof window !== "undefined" ? localStorage.getItem("mock_profile") : null;

  if (!authData?.user) {
    if (mockProfileStr) {
      try {
        const mockProfile = JSON.parse(mockProfileStr);
        const isCounsellor = mockProfile.role === "counsellor";
        const isMeera = mockProfile.email?.includes("meera");
        const isDeepika = mockProfile.email?.includes("deepika");
        const namePrefix = isMeera ? "Dr. Meera S." : isDeepika ? "Prof. Deepika" : "Faculty Counsellor";

        const mockAppointments = [
          {
            id: "mock-1",
            studentName: "Rahul Kumar",
            studentEmail: "rahul.21cs@sode-edu.in",
            studentUsn: "4SO21CS045",
            department: "Computer Science & Engineering",
            semester: "3rd Year",
            appointmentDate: new Date().toISOString().split("T")[0],
            time: "10:30 AM",
            status: "pending",
            reasonPreview: "Need guidance on academic stress and balancing exam preparations.",
            rejectionReason: null,
            counsellorId: "mock-counsellor-id",
          },
          {
            id: "mock-2",
            studentName: "Priya Sharma",
            studentEmail: "priya.22ec@sode-edu.in",
            studentUsn: "4SO22EC012",
            department: "Electronics & Communication Engineering",
            semester: "2nd Year",
            appointmentDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            time: "02:00 PM",
            status: "approved",
            reasonPreview: "Discussing personal anxiety issues regarding campus placements.",
            rejectionReason: null,
            counsellorId: "mock-counsellor-id",
          },
          {
            id: "mock-3",
            studentName: "Amit Hegde",
            studentEmail: "amit.20me@sode-edu.in",
            studentUsn: "4SO20ME008",
            department: "Mechanical Engineering",
            semester: "4th Year",
            appointmentDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
            time: "11:00 AM",
            status: "completed",
            reasonPreview: "Career counseling and options for higher studies.",
            rejectionReason: null,
            counsellorId: "mock-counsellor-id",
          },
          {
            id: "mock-4",
            studentName: "Sneha Rao",
            studentEmail: "sneha.23is@sode-edu.in",
            studentUsn: "4SO23IS088",
            department: "Computer Science & Engineering",
            semester: "1st Year",
            appointmentDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
            time: "09:30 AM",
            status: "rejected",
            reasonPreview: "Feeling homesick and unable to focus on lectures.",
            rejectionReason: "Counsellor is on leave. Please book for next Tuesday.",
            counsellorId: "mock-counsellor-id",
          },
        ];

        return { success: true, message: "Mock appointments loaded", data: mockAppointments };
      } catch (e) {
        console.error("Failed to parse mock profile in service:", e);
      }
    }
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
  if (id.startsWith("mock-")) {
    return { success: true, message: `Appointment ${id} approved`, data: { id } };
  }
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
  if (id.startsWith("mock-")) {
    return { success: true, message: `Appointment ${id} rejected`, data: { id, reason } };
  }
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
