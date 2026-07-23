import type { AppointmentItem } from '@/types/appointment';
import type { CounsellingCase } from '@/types/case';

export const mockAppointments: AppointmentItem[] = [
  {
    id: 'APT-001',
    studentName: 'Aarav Nair',
    department: 'CSE',
    semester: '6',
    appointmentDate: '2026-07-16',
    time: '09:30 AM',
    reasonPreview: 'Academic stress and exam anxiety',
    status: 'pending',
  },
  {
    id: 'APT-002',
    studentName: 'Nisha Verma',
    department: 'ECE',
    semester: '4',
    appointmentDate: '2026-07-17',
    time: '11:00 AM',
    reasonPreview: 'Career confusion and adjustment issues',
    status: 'approved',
  },
  {
    id: 'APT-003',
    studentName: 'Karthik Roy',
    department: 'ME',
    semester: '8',
    appointmentDate: '2026-07-18',
    time: '02:30 PM',
    reasonPreview: 'Family pressure and emotional burnout',
    status: 'rejected',
  },
];

export const mockCases: CounsellingCase[] = [
  {
    id: 'CASE-1001',
    studentName: 'Riya S',
    createdDate: '2026-07-10',
    lastUpdated: '2026-07-14',
    status: 'draft',
    department: 'CSE',
    semester: '5',
  },
  {
    id: 'CASE-1002',
    studentName: 'Manav P',
    createdDate: '2026-07-09',
    lastUpdated: '2026-07-15',
    status: 'completed',
    department: 'IT',
    semester: '7',
  },
];

export const mockDrafts = [
  { id: 'DRAFT-001', name: 'Student intake summary', updatedAt: '2026-07-15' },
  { id: 'DRAFT-002', name: 'Follow-up notes', updatedAt: '2026-07-12' },
];
