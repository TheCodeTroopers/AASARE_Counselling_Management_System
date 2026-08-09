export type AppointmentStatus = "pending" | "approved" | "rejected" | "completed" | "cancelled";

export interface AppointmentItem {
  id: string;
  studentName: string;
  studentEmail?: string;
  studentUsn?: string;
  department: string;
  semester?: string;
  appointmentDate: string;
  time: string;
  reasonPreview: string;
  status: AppointmentStatus | (string & {});
  rejectionReason?: string | null;
  counsellorId?: string;
}

export interface AppointmentFilters {
  query: string;
  status: AppointmentItem["status"] | "all";
}
