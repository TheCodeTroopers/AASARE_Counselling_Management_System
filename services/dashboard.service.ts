import { api } from './api-client';
import { mockAppointments, mockCases, mockDrafts } from './mock-data';

export async function getDashboard() {
  return api.get<{
    stats: Array<{ label: string; value: string; tone: string }>;
    chartData: Array<{ name: string; appointments: number; status: number }>;
    activityFeed: Array<{ id: string; title: string; meta: string }>;
  }>('/dashboard');
}

export async function getDashboardMock() {
  return {
    success: true,
    message: 'Dashboard loaded',
    data: {
      stats: [
        { label: "Today's Appointments", value: '18', tone: 'primary' },
        { label: 'Upcoming Appointments', value: '42', tone: 'secondary' },
        { label: 'Pending Requests', value: '07', tone: 'warning' },
        { label: 'Approved', value: '11', tone: 'success' },
        { label: 'Rejected', value: '02', tone: 'danger' },
      ],
      chartData: [
        { name: 'Mon', appointments: 12, status: 8 },
        { name: 'Tue', appointments: 14, status: 10 },
        { name: 'Wed', appointments: 18, status: 12 },
        { name: 'Thu', appointments: 17, status: 11 },
        { name: 'Fri', appointments: 21, status: 14 },
      ],
      activityFeed: [
        { id: '1', title: 'Appointment approved for Aarav Nair', meta: '2 mins ago' },
        { id: '2', title: 'New case saved for Riya S', meta: '18 mins ago' },
        { id: '3', title: 'Google Drive sync successful', meta: '36 mins ago' },
        { id: '4', title: 'Availability updated for today', meta: '1 hour ago' },
      ],
      appointments: mockAppointments,
      cases: mockCases,
      drafts: mockDrafts,
    },
  };
}
