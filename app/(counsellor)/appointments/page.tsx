import { Suspense } from "react";
import { AppointmentManagement } from "@/components/appointments/appointment-management";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={5} />}>
      <AppointmentManagement />
    </Suspense>
  );
}
