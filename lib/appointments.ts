import { supabase } from "@/integrations/supabase/client";

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: string;
  counsellorId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  rejectionReason?: string | null;
  createdAt: string;
};

function fromRow(r: {
  id: string;
  counsellor_id: string;
  date: string;
  slot_time: string;
  reason: string;
  status: AppointmentStatus;
  rejection_reason: string | null;
  created_at: string;
}): Appointment {
  return {
    id: r.id,
    counsellorId: r.counsellor_id,
    date: r.date,
    time: r.slot_time,
    reason: r.reason,
    status: r.status,
    rejectionReason: r.rejection_reason,
    createdAt: r.created_at,
  };
}

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, counsellor_id, date, slot_time, reason, status, rejection_reason, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function fetchBookedSlots(counsellorId: string, dateISO: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_booked_slots", {
    _counsellor_id: counsellorId,
    _date: dateISO,
  });
  if (error) throw error;
  return (data ?? []).map((r: { slot_time: string }) => r.slot_time);
}

export type CreateAppointmentInput = {
  counsellorId: string;
  date: string;
  time: string;
  reason: string;
};

export type CreateAppointmentResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; error: "double_booking" | "unknown"; message: string };

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "unknown", message: "Please sign in to book an appointment." };
  }
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      user_id: userData.user.id,
      counsellor_id: input.counsellorId,
      date: input.date,
      slot_time: input.time,
      reason: input.reason,
    })
    .select("id, counsellor_id, date, slot_time, reason, status, rejection_reason, created_at")
    .single();
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "double_booking",
        message:
          "This slot is already booked with this counsellor. It's awaiting their approval — please pick a different time.",
      };
    }
    return { ok: false, error: "unknown", message: error.message };
  }
  return { ok: true, appointment: fromRow(data) };
}

export async function cancelAppointment(id: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
}

export const statusLabel: Record<AppointmentStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusStyles: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-900 border-amber-300",
  approved: "bg-emerald-100 text-emerald-900 border-emerald-300",
  rejected: "bg-rose-100 text-rose-900 border-rose-300",
  completed: "bg-stone-200 text-stone-800 border-stone-300",
  cancelled: "bg-stone-100 text-stone-600 border-stone-300",
};
