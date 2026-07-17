'use client';

import { useState } from 'react';
import { updateSlots } from '@/services/slot.service';
import { Button } from '@/components/common/button';
import { SectionCard } from '@/components/common/section-card';

const initialSlots = [
  { id: 'slot1', time: '09:00 AM', status: 'available' },
  { id: 'slot2', time: '01:00 PM', status: 'pending' },
];

export function SlotManagement() {
  const [slotState, setSlotState] = useState(initialSlots);

  const updateSlot = (id: string, field: 'time' | 'status', value: string) => {
    setSlotState((current) => current.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const handleSave = async () => {
    await updateSlots(slotState);
  };

  return (
    <SectionCard title="Daily Slot Management" subtitle="Manage up to two daily slots for incoming appointments.">
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        {slotState.map((slot) => (
          <div key={slot.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{slot.id === 'slot1' ? 'Slot 1' : 'Slot 2'}</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{slot.status}</span>
            </div>
            <label className="mb-3 block text-sm text-slate-500">
              Time picker
              <input
                type="time"
                value={slot.time}
                onChange={(event) => updateSlot(slot.id, 'time', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3"
              />
            </label>
            <label className="block text-sm text-slate-500">
              Status
              <select
                value={slot.status}
                onChange={(event) => updateSlot(slot.id, 'status', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="booked">Booked</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={handleSave}>Save</Button>
        <Button variant="ghost" onClick={() => setSlotState(initialSlots)}>Reset</Button>
        <Button variant="secondary" onClick={() => setSlotState(initialSlots)}>Edit</Button>
      </div>
    </SectionCard>
  );
}
