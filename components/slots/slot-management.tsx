"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Ban,
  Copy,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/common/section-card";
import { cn } from "@/lib/utils";
import {
  fetchMySlots,
  upsertSlot,
  deleteSlot,
  getMyCounsellorSlug,
  fetchMyDateAvailability,
  toggleDateAvailability,
  type SlotRow,
  type DateAvailabilityRow,
} from "@/lib/slots";

export type SlotItem = {
  id: string;
  time: string;
  available: boolean;
};

const WEEKDAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
] as const;

function getNext7Days() {
  const days: { iso: string; dow: string; day: string; month: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      dow: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: String(d.getDate()),
      month: d.toLocaleDateString(undefined, { month: "short" }),
    });
  }
  return days;
}

export function SlotManagement() {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [counsellorSlug, setCounsellorSlug] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("Mon");
  const [newTime, setNewTime] = useState("09:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Date availability overrides map: dateISO -> is_available boolean
  const [dateOverrides, setDateOverrides] = useState<Record<string, boolean>>({});
  const days = useMemo(() => getNext7Days(), []);

  // Load counsellor slug + slots + date availability
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const slug = await getMyCounsellorSlug();
        setCounsellorSlug(slug);
        if (!slug) {
          toast.error("Could not identify your counsellor profile. Please contact admin.");
          return;
        }

        const [slotRows, availabilityRows]: [SlotRow[], DateAvailabilityRow[]] = await Promise.all([
          fetchMySlots(),
          fetchMyDateAvailability(),
        ]);

        // Auto-migrate legacy slots (un-prefixed, e.g. "09:00 AM") to weekday-specific slots
        // so deleting/editing a slot on one weekday will NOT affect other weekdays.
        const legacyRows = slotRows.filter((r) => !r.slot_time.includes("|"));
        if (legacyRows.length > 0 && slug) {
          for (const legacy of legacyRows) {
            for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
              await upsertSlot(slug, `${day} | ${legacy.slot_time}`, legacy.available);
            }
            await deleteSlot(legacy.id);
          }
          const updatedRows = await fetchMySlots();
          setSlots(updatedRows.map((r) => ({ id: r.id, time: r.slot_time, available: r.available })));
        } else {
          setSlots(slotRows.map((r) => ({ id: r.id, time: r.slot_time, available: r.available })));
        }

        const map: Record<string, boolean> = {};
        for (const row of availabilityRows) {
          map[row.available_date] = row.is_available;
        }
        setDateOverrides(map);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load settings. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Helper: Extract day prefix and clean time
  const parseSlotTime = (slotTime: string) => {
    if (slotTime.includes("|")) {
      const [day, time] = slotTime.split("|").map((s) => s.trim());
      return { day, time };
    }
    return { day: "ALL", time: slotTime };
  };

  // Format 24h string "14:30" → "02:30 PM"
  const formatTime12h = (time24: string) => {
    if (!time24) return "10:00 AM";
    const [hStr, mStr] = time24.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const formattedH = h < 10 ? `0${h}` : `${h}`;
    return `${formattedH}:${m} ${ampm}`;
  };

  // Add slot for the currently selected weekday tab
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) {
      toast.error("Please pick a valid time.");
      return;
    }
    if (!counsellorSlug) {
      toast.error("Counsellor profile not found.");
      return;
    }

    const formattedClean = formatTime12h(newTime);
    const fullTimeStr = `${activeDay} | ${formattedClean}`;

    const exists = slots.some(
      (s) => s.time.toLowerCase() === fullTimeStr.toLowerCase(),
    );
    if (exists) {
      toast.error(`Slot ${formattedClean} already exists for ${activeDay}.`);
      return;
    }

    setSaving(true);
    try {
      const row = await upsertSlot(counsellorSlug, fullTimeStr, true);
      setSlots((prev) => [...prev, { id: row.id, time: row.slot_time, available: row.available }]);
      toast.success(`Created ${activeDay} slot for ${formattedClean}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create slot. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Copy slots of the active weekday to all weekdays (Mon - Fri)
  const handleCopyToAllWeekdays = async () => {
    if (!counsellorSlug) return;
    const currentDaySlots = slots.filter((s) => {
      const parsed = parseSlotTime(s.time);
      return parsed.day === activeDay;
    });

    if (currentDaySlots.length === 0) {
      toast.error(`No slots configured for ${activeDay} to copy.`);
      return;
    }

    setSaving(true);
    try {
      const targetDays = ["Mon", "Tue", "Wed", "Thu", "Fri"].filter((d) => d !== activeDay);
      let addedCount = 0;

      for (const targetDay of targetDays) {
        for (const slot of currentDaySlots) {
          const parsed = parseSlotTime(slot.time);
          const targetSlotStr = `${targetDay} | ${parsed.time}`;
          const alreadyExists = slots.some(
            (s) => s.time.toLowerCase() === targetSlotStr.toLowerCase(),
          );
          if (!alreadyExists) {
            const row = await upsertSlot(counsellorSlug, targetSlotStr, slot.available);
            setSlots((prev) => [...prev, { id: row.id, time: row.slot_time, available: row.available }]);
            addedCount++;
          }
        }
      }

      toast.success(`Copied ${activeDay} slots to weekdays (added ${addedCount} new slots).`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy slots to weekdays.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (id: string) => {
    if (!counsellorSlug) return;
    const target = slots.find((s) => s.id === id);
    if (!target) return;

    const newAvailable = !target.available;
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, available: newAvailable } : s)));
    try {
      await upsertSlot(counsellorSlug, target.time, newAvailable);
      const parsed = parseSlotTime(target.time);
      toast.success(
        `${parsed.time} (${parsed.day}) marked as ${newAvailable ? "Available" : "Unavailable"}`,
      );
    } catch (err) {
      console.error(err);
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, available: target.available } : s)),
      );
      toast.error("Failed to update slot.");
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const target = slots.find((s) => s.id === id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSlot(id);
      if (target) toast("Slot removed.");
    } catch (err) {
      console.error(err);
      if (target) setSlots((prev) => [...prev, target]);
      toast.error("Failed to delete slot.");
    }
  };

  const handleToggleDateAvailability = async (dateISO: string) => {
    if (!counsellorSlug) return;
    const currentIsAvailable = dateOverrides[dateISO] !== false;
    const newIsAvailable = !currentIsAvailable;

    setDateOverrides((prev) => ({ ...prev, [dateISO]: newIsAvailable }));

    try {
      await toggleDateAvailability(counsellorSlug, dateISO, newIsAvailable);
      toast.success(
        newIsAvailable
          ? `Marked Available on ${dateISO}`
          : `Marked Day Off / Unavailable on ${dateISO}`,
      );
    } catch (err) {
      console.error(err);
      setDateOverrides((prev) => ({ ...prev, [dateISO]: currentIsAvailable }));
      toast.error("Failed to update date availability.");
    }
  };

  // Helper: Convert "09:30 AM" or "Mon | 09:30 AM" into minutes from midnight for chronological sorting
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const clean = timeStr.includes("|") ? timeStr.split("|")[1].trim() : timeStr.trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Filter and sort slots chronologically for the selected active weekday
  const activeDaySlots = useMemo(() => {
    const filtered = slots.filter((s) => {
      const parsed = parseSlotTime(s.time);
      return parsed.day === activeDay;
    });
    return filtered.sort(
      (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
    );
  }, [slots, activeDay]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">Loading slot & date settings…</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Date Availability Control (Next 7 Days) */}
      <SectionCard
        title="7-Day Leave & Specific Date Overrides"
        subtitle="Click a date to mark yourself Available or Off. Students cannot request appointments on your off days."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
          {days.map((d) => {
            const isAvailable = dateOverrides[d.iso] !== false;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => handleToggleDateAvailability(d.iso)}
                className={`flex flex-col items-center justify-between rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                  isAvailable
                    ? "border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md"
                    : "border-rose-200 bg-rose-50/70 hover:border-rose-400 opacity-90"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {d.dow} · {d.month}
                </div>
                <div
                  className={`my-1 font-display text-2xl font-bold ${
                    isAvailable ? "text-slate-800" : "text-rose-600 line-through"
                  }`}
                >
                  {d.day}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Available
                    </>
                  ) : (
                    <>
                      <Ban className="h-3 w-3" /> Day Off
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 2. Weekday Slots Manager */}
      <SectionCard
        title="Weekday-Based Slot Schedule"
        subtitle="Configure custom time slots individually for each weekday (Mon – Sun)."
      >
        {/* Weekday Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((w) => {
              const count = slots.filter((s) => {
                const parsed = parseSlotTime(s.time);
                return parsed.day === w.short;
              }).length;
              const isActive = activeDay === w.short;
              return (
                <button
                  key={w.short}
                  type="button"
                  onClick={() => setActiveDay(w.short)}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "bg-secondary text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{w.full}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Copy Weekday Quick Action */}
          <button
            type="button"
            onClick={handleCopyToAllWeekdays}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary cursor-pointer"
            title={`Copy ${activeDay} slots to Mon-Fri`}
          >
            <Copy className="h-3.5 w-3.5" /> Copy {activeDay} to Weekdays
          </button>
        </div>

        {/* Add Slot for Active Weekday Form */}
        <form onSubmit={handleAddSlot} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary">
              Add Slot Time for {WEEKDAYS.find((w) => w.short === activeDay)?.full}
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm font-medium text-text outline-none transition focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-hover active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {saving ? "Saving…" : `Add to ${activeDay}`}
            </button>
          </div>
        </form>

        {/* Configured Slots List for Active Weekday */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {WEEKDAYS.find((w) => w.short === activeDay)?.full} Slots ({activeDaySlots.length}) ·{" "}
              {activeDaySlots.filter((s) => s.available).length} Available
            </span>
          </div>

          {activeDaySlots.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-secondary p-8 text-center text-sm text-slate-500">
              No slots configured for {WEEKDAYS.find((w) => w.short === activeDay)?.full} yet. Add a time slot above.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeDaySlots.map((slot) => {
                const parsed = parseSlotTime(slot.time);
                return (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between rounded-[20px] border p-4 shadow-card transition-all duration-300 ${
                      slot.available
                        ? "border-border bg-white"
                        : "border-slate-200 bg-slate-50 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-xl font-semibold text-xs ${
                          slot.available
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-200 text-slate-600 border border-slate-300"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{parsed.time}</p>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            slot.available ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {slot.available ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Available ({parsed.day})
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Unavailable
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Toggle Switch */}
                      <label
                        title={slot.available ? "Click to mark Unavailable" : "Click to mark Available"}
                        className="relative inline-flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={slot.available}
                          onChange={() => handleToggleAvailable(slot.id)}
                          className="sr-only peer"
                        />
                        <div
                          className={cn(
                            "w-11 h-6 rounded-full peer-focus:outline-none transition-colors peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                            slot.available
                              ? "bg-primary after:border-white"
                              : "bg-slate-300 after:border-slate-300",
                          )}
                        />
                      </label>

                      {/* Delete Slot Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        title="Remove slot"
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
