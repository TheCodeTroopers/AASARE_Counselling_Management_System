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
          <div key={slot.id} className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#6D214F]">{slot.id === 'slot1' ? 'Slot 1' : 'Slot 2'}</p>
              <span className="rounded-full bg-[#F8F3EE] px-2.5 py-1 text-xs font-semibold text-[#6D214F]">{slot.status}</span>
            </div>
            <label className="mb-3 block text-sm text-[#6E6E6E]">
              Time picker
              <input
                type="time"
                value={slot.time}
                onChange={(event) => updateSlot(slot.id, 'time', event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
              />
            </label>
            <label className="block text-sm text-[#6E6E6E]">
              Status
              <select
                value={slot.status}
                onChange={(event) => updateSlot(slot.id, 'status', event.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
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
