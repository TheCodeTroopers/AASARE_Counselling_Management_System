import { BellRing } from 'lucide-react';

export function NotificationDrawer() {
  return (
    <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-[#6D214F]" />
        <h3 className="font-semibold text-[#6D214F]">Realtime Notifications</h3>
      </div>
      <div className="space-y-2 text-sm text-[#2F2F2F]">
        <div className="rounded-2xl bg-[#F8F3EE] p-3">Appointment approved</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">Appointment rejected</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">Upcoming appointment reminder</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">Case saved</div>
        <div className="rounded-2xl bg-[#F8F3EE] p-3">Connection successful</div>
      </div>
    </div>
  );
}
