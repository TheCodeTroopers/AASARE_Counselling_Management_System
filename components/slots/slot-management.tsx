'use client';

import { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/common/button';

export type SlotItem = {
  id: string;
  time: string; // e.g. "09:30 AM"
  available: boolean;
};

const defaultSlots: SlotItem[] = [
  { id: 'slot-1', time: '09:30 AM', available: true },
  { id: 'slot-2', time: '10:30 AM', available: true },
  { id: 'slot-3', time: '11:30 AM', available: true },
  { id: 'slot-4', time: '02:00 PM', available: true },
  { id: 'slot-5', time: '03:00 PM', available: false },
  { id: 'slot-6', time: '04:00 PM', available: true },
];

export function SlotManagement() {
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [newTime, setNewTime] = useState('09:00');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aasare_counsellor_daily_slots');
    if (saved) {
      try {
        setSlots(JSON.parse(saved));
      } catch {
        setSlots(defaultSlots);
      }
    } else {
      setSlots(defaultSlots);
    }
    setHydrated(true);
  }, []);

  const saveToStorage = (updated: SlotItem[]) => {
    setSlots(updated);
    localStorage.setItem('aasare_counsellor_daily_slots', JSON.stringify(updated));
  };

  // Convert 24h input time string "14:30" to formatted "02:30 PM"
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

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) {
      toast.error('Please pick a valid time.');
      return;
    }

    const formatted = formatTime12h(newTime);
    const exists = slots.some((s) => s.time.toLowerCase() === formatted.toLowerCase());
    if (exists) {
      toast.error(`Slot ${formatted} already exists.`);
      return;
    }

    const newSlot: SlotItem = {
      id: `slot-${Date.now()}`,
      time: formatted,
      available: true,
    };

    const updated = [...slots, newSlot];
    saveToStorage(updated);
    toast.success(`Created slot for ${formatted}`);
  };

  const handleToggleAvailable = (id: string) => {
    const updated = slots.map((s) => (s.id === id ? { ...s, available: !s.available } : s));
    saveToStorage(updated);
    const target = updated.find((s) => s.id === id);
    if (target) {
      toast.success(`${target.time} marked as ${target.available ? 'Available' : 'Unavailable'}`);
    }
  };

  const handleDeleteSlot = (id: string) => {
    const target = slots.find((s) => s.id === id);
    const updated = slots.filter((s) => s.id !== id);
    saveToStorage(updated);
    if (target) {
      toast('Slot removed.');
    }
  };

  const handleResetDefault = () => {
    saveToStorage(defaultSlots);
    toast.success('Reset to default slots');
  };

  if (!hydrated) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading slot settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. Slot Setting Option (Create Slot) */}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6D214F] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#581a3f] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Slot
            </button>
          </div>
        </form>
      </SectionCard>

      {/* 2. Listed Created Slots with Toggle */}
      <SectionCard
        title="Created Daily Slots"
        subtitle="Toggle slots on/off to mark them available or unavailable for student bookings."
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Slots ({slots.length}) · {slots.filter((s) => s.available).length} Available
          </span>
          <Button variant="ghost" onClick={handleResetDefault}>
            Reset Defaults
          </Button>
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
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Available
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
