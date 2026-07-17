export async function updateSlots(payload: unknown) {
  return { success: true, message: 'Slots updated', data: payload };
}

export async function getSlots() {
  return { success: true, message: 'Slots loaded', data: [{ day: 'Today', slot1: '09:00 AM', slot2: '01:00 PM' }] };
}
