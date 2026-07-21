import { mockAppointments, mockCases, mockDrafts } from './mock-data';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const mockApiStore: Record<string, unknown> = {
  '/dashboard': {
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
  },
  '/appointments': mockAppointments,
  '/cases': mockCases,
  '/drafts': mockDrafts,
  '/profile': {
    name: 'Dr. Deepika B V',
    department: 'Artificial Intelligence & Data Science',
    designation: 'Counselling Cell Coordinator',
    email: 'deepika.bv@sode-edu.in',
    phone: '+91 98450 12346',
  },
  '/notifications': [
    { id: '1', title: 'Appointment approved', meta: '2 mins ago' },
    { id: '2', title: 'Appointment rejected', meta: '12 mins ago' },
    { id: '3', title: 'Upcoming appointment reminder', meta: '25 mins ago' },
    { id: '4', title: 'Case saved successfully', meta: '46 mins ago' },
    { id: '5', title: 'Connection successful', meta: '1 hour ago' },
  ],
  '/settings': {
    darkMode: false,
    notificationPreferences: ['Appointments', 'Case Updates', 'Reminders'],
    language: 'English',
    security: 'Two-factor authentication enabled',
  },
  '/drive-files': [
    { name: 'Counselling Notes.pdf', syncedAt: 'Today' },
    { name: 'Student Follow-up Sheet.docx', syncedAt: 'Yesterday' },
  ],
};

export async function request<T>(url: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const response = mockApiStore[url] ?? (method === 'GET' ? [] : body ?? {});
  return Promise.resolve(response as T);
}

export const api = {
  get: <T>(url: string) => request<T>(url, 'GET'),
  post: <T>(url: string, body: unknown) => request<T>(url, 'POST', body),
  put: <T>(url: string, body: unknown) => request<T>(url, 'PUT', body),
  patch: <T>(url: string, body: unknown) => request<T>(url, 'PATCH', body),
  delete: <T>(url: string) => request<T>(url, 'DELETE'),
};
