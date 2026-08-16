import { supabase } from "@/integrations/supabase/client";
import { counsellors } from "@/lib/counsellors";

export type SlotRow = {
  id: string;
  counsellor_id: string;
  slot_time: string;
  available: boolean;
};

// ─── Counsellor: fetch their own slots (all, including unavailable) ───────────
export async function fetchMySlots(): Promise<SlotRow[]> {
  const { data, error } = await supabase
    .from("counsellor_slots")
    .select("id, counsellor_id, slot_time, available")
    .order("slot_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Counsellor: upsert a slot (insert or update available flag) ─────────────
export async function upsertSlot(
  counsellorSlug: string,
  slot_time: string,
  available: boolean,
): Promise<SlotRow> {
  const { data, error } = await supabase
    .from("counsellor_slots")
    .upsert(
      { counsellor_id: counsellorSlug, slot_time, available },
      { onConflict: "counsellor_id,slot_time" },
    )
    .select("id, counsellor_id, slot_time, available")
    .single();
  if (error) throw error;
  return data;
}

// ─── Counsellor: delete a slot by id ─────────────────────────────────────────
export async function deleteSlot(id: string): Promise<void> {
  const { error } = await supabase.from("counsellor_slots").delete().eq("id", id);
  if (error) throw error;
}

// ─── Student: fetch available slots for a counsellor ─────────────────────────
export async function fetchAvailableSlots(counsellorId: string): Promise<SlotRow[]> {
  const { data, error } = await supabase.rpc("get_available_slots", {
    _counsellor_id: counsellorId,
  });
  if (error) throw error;
  return (data ?? []) as SlotRow[];
}

// ─── Helper: get the logged-in counsellor's slug by matching their email ──────
// Matches auth email against the counsellors list — no DB column needed.
export async function getMyCounsellorSlug(): Promise<string | null> {
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user?.email) return null;
  const email = userData.user.email.toLowerCase();
  const match = counsellors.find((c) => c.email.toLowerCase() === email);
  return match?.id ?? null;
}

export type DateAvailabilityRow = {
  id: string;
  counsellor_id: string;
  available_date: string;
  is_available: boolean;
};

// ─── Counsellor: fetch their date availability overrides ─────────────────────
export async function fetchMyDateAvailability(): Promise<DateAvailabilityRow[]> {
  const { data, error } = await supabase
    .from("counsellor_availability")
    .select("id, counsellor_id, available_date, is_available");
  if (error) throw error;
  return data ?? [];
}

// ─── Counsellor: toggle date availability ────────────────────────────────────
export async function toggleDateAvailability(
  counsellorSlug: string,
  dateISO: string,
  isAvailable: boolean,
): Promise<DateAvailabilityRow> {
  const { data, error } = await supabase
    .from("counsellor_availability")
    .upsert(
      { counsellor_id: counsellorSlug, available_date: dateISO, is_available: isAvailable },
      { onConflict: "counsellor_id,available_date" },
    )
    .select("id, counsellor_id, available_date, is_available")
    .single();
  if (error) throw error;
  return data;
}

// ─── Student: fetch dates marked as unavailable for a counsellor ─────────────
export async function fetchUnavailableDates(counsellorId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_unavailable_dates", {
    _counsellor_id: counsellorId,
  });
  if (error) throw error;
  return (data ?? []).map((r: { available_date: string }) => r.available_date);
}
