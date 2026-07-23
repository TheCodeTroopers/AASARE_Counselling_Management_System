import { mockAppointments } from './mock-data';

export async function getDashboard() {
  return { success: true, message: 'Dashboard loaded', data: { stats: mockAppointments.slice(0, 5) } };
}

export async function getAppointments() {
  return { success: true, message: 'Appointments loaded', data: mockAppointments };
}

export async function acceptAppointment(id: string) {
  return { success: true, message: `Appointment ${id} approved`, data: { id } };
}

export async function rejectAppointment(id: string, reason?: string) {
  return { success: true, message: `Appointment ${id} rejected`, data: { id, reason } };
}

export async function updateAvailability(status: 'available' | 'unavailable') {
  return { success: true, message: 'Availability updated', data: { status } };
}
