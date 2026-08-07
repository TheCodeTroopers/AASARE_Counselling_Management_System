'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Check, XCircle, FileText, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'reject'>('reject');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const appointments = data?.data ?? [];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment: any) => {
      const matchesSearch = [
        appointment.studentName,
        appointment.studentEmail,
        appointment.department,
        appointment.reasonPreview,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const openRejectModal = (item: any) => {
    setSelectedAppointment(item);
    setRejectionReason(item.rejectionReason || '');
    setModalMode('reject');
  };

  const openViewModal = (item: any) => {
    setSelectedAppointment(item);
    setModalMode('view');
  };

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await acceptAppointment(id);
      toast.success('Appointment approved successfully!');
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(null);
      }
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve appointment.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedAppointment) return;
    const finalReason = rejectionReason.trim() || 'Slot unavailable';
    setProcessingId(selectedAppointment.id);
    try {
      await rejectAppointment(selectedAppointment.id, finalReason);
      toast.success('Appointment rejected with note.');
      setSelectedAppointment(null);
      setRejectionReason('');
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject appointment.');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError)
    return (
      <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-5 text-sm text-[#E76F51] shadow-card">
        Unable to load appointments.
      </div>
    );

  return (
    <div className="space-y-4">
      <SectionCard title="Appointment Management" subtitle="Search, filter, accept or reject counselling requests.">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchFilterBar value={search} onChange={setSearch} placeholder="Search by student, email or department" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-300 capitalize ${
                  statusFilter === tab
                    ? 'bg-[#6D214F] text-white shadow-sm'
                    : 'bg-[#F8F3EE] text-[#6E6E6E] hover:text-[#6D214F]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredAppointments.map((item: any) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.studentName}</p>
                  <p className="text-sm text-slate-500">
                    {item.department} · {item.studentEmail}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-sm font-medium text-[#6D214F]">
                {item.appointmentDate} at {item.time}
              </p>
              <p className="mt-2 text-sm text-slate-700">{item.reasonPreview}</p>

              {item.status === 'rejected' && item.rejectionReason && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold">Rejection Note:</span> {item.rejectionReason}
                  </div>
                  <button
                    type="button"
                    onClick={() => openRejectModal(item)}
                    title="Edit rejection note"
                    className="flex items-center gap-1 shrink-0 rounded-lg border border-rose-300 bg-white px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === 'pending' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleAccept(item.id)}
                      disabled={processingId === item.id}
                    >
                      <span className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-emerald-700" /> Accept
                      </span>
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => openRejectModal(item)}
                      disabled={processingId === item.id}
                    >
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Reject
                      </span>
                    </Button>
                  </>
                )}

                {item.status === 'approved' && (
                  <Button
                    variant="danger"
                    onClick={() => openRejectModal(item)}
                    disabled={processingId === item.id}
                  >
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> Reject Request
                    </span>
                  </Button>
                )}



                <Button variant="ghost" onClick={() => openViewModal(item)}>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> View Details
                  </span>
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
        title={modalMode === 'reject' ? 'Reject Appointment Note' : 'Appointment Details'}
        description={
          modalMode === 'reject'
            ? 'Enter the reason for rejection (this will be visible to the student).'
            : 'Complete details of the counselling request.'
        }
        onClose={() => {
          setSelectedAppointment(null);
          setRejectionReason('');
        }}
      >
        {modalMode === 'reject' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="e.g. Busy with department meeting / Please reschedule for another slot."
                autoFocus
                className="min-h-28 w-full rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] p-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#6D214F] focus:ring-2 focus:ring-[#E8DDD5]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={Boolean(processingId)}>
                Submit Rejection Note
              </Button>
            </div>
          </div>
        ) : (
          selectedAppointment && (
            <div className="space-y-4 text-sm text-slate-800">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="font-semibold text-slate-500 uppercase text-xs">Student:</span>
                <p className="text-base font-semibold text-[#6D214F]">{selectedAppointment.studentName}</p>
                <p className="text-xs text-slate-600">{selectedAppointment.studentEmail} · {selectedAppointment.department}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase text-xs">Session Time:</span>
                <p className="font-medium">{selectedAppointment.appointmentDate} at {selectedAppointment.time}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 uppercase text-xs">Student's Request Reason:</span>
                <p className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700 border border-slate-200">
                  {selectedAppointment.reasonPreview}
                </p>
              </div>

              {selectedAppointment.rejectionReason && (
                <div>
                  <span className="font-semibold text-rose-600 uppercase text-xs">Current Rejection Note:</span>
                  <p className="mt-1 rounded-xl bg-rose-50 p-3 text-rose-700 border border-rose-200">
                    {selectedAppointment.rejectionReason}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <Button
                  variant="danger"
                  onClick={() => {
                    setRejectionReason(selectedAppointment.rejectionReason || '');
                    setModalMode('reject');
                  }}
                >
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Reject / Edit Note
                  </span>
                </Button>
                <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
