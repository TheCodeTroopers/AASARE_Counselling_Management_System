'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Check, XCircle, FileText } from 'lucide-react';
import { acceptAppointment, getAppointments, rejectAppointment } from '@/services/appointment.service';
import { Button } from '@/components/common/button';
import { SearchFilterBar } from '@/components/common/search-filter-bar';
import { SectionCard } from '@/components/common/section-card';
import { StatusBadge } from '@/components/common/status-badge';
import { Modal } from '@/components/common/modal';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import type { AppointmentItem } from '@/types/appointment';

const tabs = ['all', 'pending', 'approved', 'rejected', 'completed'] as const;

export function AppointmentManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof tabs)[number]>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const appointments = data?.data ?? [];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch = [appointment.studentName, appointment.department, appointment.reasonPreview]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleAccept = async (id: string) => {
    await acceptAppointment(id);
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;
    await rejectAppointment(selectedAppointment.id, rejectionReason);
    setSelectedAppointment(null);
    setRejectionReason('');
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 text-sm text-[#E76F51] shadow-card">Unable to load appointments.</div>;

  return (
    <div className="space-y-4">
      <SectionCard title="Appointment Management" subtitle=" Search, filter, accept or reject counselling requests.">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchFilterBar value={search} onChange={setSearch} placeholder="Search by student or department" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  statusFilter === tab ? 'bg-[#6D214F] text-white shadow-sm' : 'bg-[#F8F3EE] text-[#6E6E6E] hover:text-[#6D214F]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredAppointments.map((item) => (
            <div key={item.id} className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.studentName}</p>
                  <p className="text-sm text-slate-500">{item.department} · Semester {item.semester}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm text-slate-600">{item.appointmentDate} · {item.time}</p>
              <p className="mt-2 text-sm text-slate-700">{item.reasonPreview}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => handleAccept(item.id)}>
                  <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Accept</span>
                </Button>
                <Button variant="danger" onClick={() => setSelectedAppointment(item)}>
                  <span className="flex items-center gap-1"><XCircle className="h-4 w-4" /> Reject</span>
                </Button>
                <Button variant="ghost" onClick={() => setSelectedAppointment(item)}>
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> View</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-[#E8DDD5] bg-[#F8F3EE] p-8 text-center text-sm text-[#6E6E6E]">
            No appointments found for the selected filter.
          </div>
        ) : null}
      </SectionCard>

      <Modal
        open={Boolean(selectedAppointment)}
        title="Reject Appointment"
        description="Enter a concise rejection reason for the student record."
        onClose={() => {
          setSelectedAppointment(null);
          setRejectionReason('');
        }}
      >
        <div className="space-y-3">
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Reason for rejection"
            className="min-h-28 w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
