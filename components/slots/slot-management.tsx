'use client';

import { useEffect, useState, useMemo } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, XCircle, CalendarDays, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { SectionCard } from '@/components/common/section-card';
import {
  fetchMySlots,
  upsertSlot,
  deleteSlot,
  getMyCounsellorSlug,
  fetchMyDateAvailability,
  toggleDateAvailability,
  type SlotRow,
  type DateAvailabilityRow,
} from '@/lib/slots';

export type SlotItem = {
  id: string;
  time: string;
  available: boolean;
};

function getNext7Days() {
  const days: { iso: string; dow: string; day: string; month: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      dow: d.toLocaleDateString(undefined, { weekday: 'short' }),
      day: String(d.getDate()),
      month: d.toLocaleDateString(undefined, { month: 'short' }),
    });
  }
  return days;
}

export function SlotManagement() {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [counsellorSlug, setCounsellorSlug] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('09:00');
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
          toast.error('Could not identify your counsellor profile. Please contact admin.');
          return;
        }

        const [slotRows, availabilityRows]: [SlotRow[], DateAvailabilityRow[]] = await Promise.all([
          fetchMySlots(),
          fetchMyDateAvailability(),
        ]);

        setSlots(slotRows.map((r) => ({ id: r.id, time: r.slot_time, available: r.available })));

        const map: Record<string, boolean> = {};
        for (const row of availabilityRows) {
          map[row.available_date] = row.is_available;
        }
        setDateOverrides(map);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load settings. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Format 24h string "14:30" → "02:30 PM"
  const formatTime12h = (time24: string) => {
    if (!time24) return '10:00 AM';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const formattedH = h < 10 ? `0${h}` : `${h}`;
    return `${formattedH}:${m} ${ampm}`;
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) { toast.error('Please pick a valid time.'); return; }
    if (!counsellorSlug) { toast.error('Counsellor profile not found.'); return; }

    const formatted = formatTime12h(newTime);
    const exists = slots.some((s) => s.time.toLowerCase() === formatted.toLowerCase());
    if (exists) { toast.error(`Slot ${formatted} already exists.`); return; }

    setSaving(true);
    try {
      const row = await upsertSlot(counsellorSlug, formatted, true);
      setSlots((prev) => [...prev, { id: row.id, time: row.slot_time, available: row.available }]);
      toast.success(`Created slot for ${formatted}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create slot. Please try again.');
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
      toast.success(`${target.time} marked as ${newAvailable ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      console.error(err);
      setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, available: target.available } : s)));
      toast.error('Failed to update slot.');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const target = slots.find((s) => s.id === id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSlot(id);
      if (target) toast('Slot removed.');
    } catch (err) {
      console.error(err);
      if (target) setSlots((prev) => [...prev, target]);
      toast.error('Failed to delete slot.');
    }
  };

  const handleToggleDateAvailability = async (dateISO: string) => {
    if (!counsellorSlug) return;
    const currentIsAvailable = dateOverrides[dateISO] !== false; // Default is true if un-set
    const newIsAvailable = !currentIsAvailable;

    // Optimistic UI update
    setDateOverrides((prev) => ({ ...prev, [dateISO]: newIsAvailable }));

    try {
      await toggleDateAvailability(counsellorSlug, dateISO, newIsAvailable);
      toast.success(
        newIsAvailable
          ? `Marked Available on ${dateISO}`
          : `Marked Day Off / Unavailable on ${dateISO}`
      );
    } catch (err) {
      console.error(err);
      setDateOverrides((prev) => ({ ...prev, [dateISO]: currentIsAvailable }));
      toast.error('Failed to update date availability.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading slot & date settings…</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Date Availability Control (Next 7 Days) */}
      <SectionCard
        title="7-Day Schedule & Leave Settings"
        subtitle="Click a date to mark yourself Available or Off. Students will not be able to request appointments on your off days."
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
                    ? 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md'
                    : 'border-rose-200 bg-rose-50/70 hover:border-rose-400 opacity-90'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {d.dow} · {d.month}
                </div>
                <div
                  className={`my-1 font-display text-2xl font-bold ${
                    isAvailable ? 'text-slate-800' : 'text-rose-600 line-through'
                  }`}
                >
                  {d.day}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
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

      {/* 2. Slot Setting Option (Create Slot) */}
      <SectionCard
        title="Slot Setting Option"
        subtitle="Create custom time slots for your daily student counselling schedule."
      >
        <form onSubmit={handleAddSlot} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6D214F]">
              Select Slot Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] py-3 pl-10 pr-4 text-sm font-medium text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
              />
            </div>
          </div>

          <div className="sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6D214F] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#581a3f] active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {saving ? 'Saving…' : 'Add Slot'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* 3. Listed Created Slots with Toggle */}
      <SectionCard
        title="Created Daily Slots"
        subtitle="Toggle slots on/off to mark them available or unavailable for student bookings."
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Slots ({slots.length}) · {slots.filter((s) => s.available).length} Available
          </span>
        </div>

        {slots.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#E8DDD5] bg-[#F8F3EE] p-8 text-center text-sm text-slate-500">
            No slots configured yet. Use the option above to create a time slot.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between rounded-[20px] border p-4 shadow-card transition-all duration-300 ${
                  slot.available
                    ? 'border-[#E8DDD5] bg-white'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl font-semibold text-xs ${
                      slot.available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{slot.time}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        slot.available ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {slot.available ? (
                        <><CheckCircle2 className="h-3 w-3" /> Available</>
                      ) : (
                        <><XCircle className="h-3 w-3" /> Unavailable</>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Toggle Switch */}
                  <label
                    title={slot.available ? 'Click to mark Unavailable' : 'Click to mark Available'}
                    className="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={slot.available}
                      onChange={() => handleToggleAvailable(slot.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6D214F]"></div>
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
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
