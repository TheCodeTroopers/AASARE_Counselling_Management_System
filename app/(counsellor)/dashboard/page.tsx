import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { AppointmentTimeline } from '@/components/dashboard/appointment-timeline';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardOverview />
      <AppointmentTimeline />
    </div>
  );
}
