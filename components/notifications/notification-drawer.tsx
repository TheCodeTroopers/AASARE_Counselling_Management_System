import { BellRing } from 'lucide-react';

export function NotificationDrawer() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <BellRing className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-slate-900">Realtime Notifications</h3>
      </div>
      <div className="space-y-2 text-sm text-slate-700">
        <div className="rounded-xl bg-slate-50 p-3">Appointment approved</div>
        <div className="rounded-xl bg-slate-50 p-3">Appointment rejected</div>
        <div className="rounded-xl bg-slate-50 p-3">Upcoming appointment reminder</div>
        <div className="rounded-xl bg-slate-50 p-3">Case saved</div>
        <div className="rounded-xl bg-slate-50 p-3">Connection successful</div>
      </div>
    </div>
  );
}
