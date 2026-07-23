export interface AppointmentItem {
  id: string;
  studentName: string;
  department: string;
  semester: string;
  appointmentDate: string;
  time: string;
  reasonPreview: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface AppointmentFilters {
  query: string;
  status: AppointmentItem['status'] | 'all';
}
