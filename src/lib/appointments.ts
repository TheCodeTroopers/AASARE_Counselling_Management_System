import { counsellors } from "./counsellors";

export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled";

export type Appointment = {
  id: string;
  counsellorId: string;
  date: string; // ISO date
  time: string;
  reason: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  createdAt: string;
};

const KEY = "aasare.appointments.v1";

function seed(): Appointment[] {
  const today = new Date();
  const iso = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: "seed-1",
      counsellorId: counsellors[0].id,
      date: iso(2),
      time: "10:30",
      reason: "Feeling overwhelmed with coursework and would like to talk.",
      status: "Approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-2",
      counsellorId: counsellors[4].id,
      date: iso(-3),
      time: "15:00",
      reason: "Placement anxiety",
      status: "Completed",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function loadAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Appointment[];
  } catch {
    return [];
  }
}

export function saveAppointments(list: Appointment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("aasare.appointments.changed"));
}

export function addAppointment(a: Omit<Appointment, "id" | "status" | "createdAt">): Appointment {
  const list = loadAppointments();
  const record: Appointment = {
    ...a,
    id: `apt-${Date.now()}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  saveAppointments([record, ...list]);
  return record;
}

export function cancelAppointment(id: string) {
  const list = loadAppointments().map((a) =>
    a.id === id ? { ...a, status: "Cancelled" as AppointmentStatus } : a,
  );
  saveAppointments(list);
}

export const statusStyles: Record<AppointmentStatus, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-300",
  Approved: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Rejected: "bg-rose-100 text-rose-900 border-rose-300",
  Completed: "bg-stone-200 text-stone-800 border-stone-300",
  Cancelled: "bg-stone-100 text-stone-600 border-stone-300",
};