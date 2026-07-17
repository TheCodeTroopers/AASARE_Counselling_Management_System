'use client';

import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/services/notification.service';
import { NotificationDrawer } from '@/components/notifications/notification-drawer';
import { SectionCard } from '@/components/common/section-card';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';

export function NotificationsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <div className="glass-card rounded-2xl p-5 text-sm text-rose-600">Unable to load notifications.</div>;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <SectionCard title="Notifications" subtitle="Realtime UI design for counsellor alerts and collaboration updates.">
        <div className="space-y-3">
          {data?.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {item.title} · {item.meta}
            </div>
          ))}
        </div>
      </SectionCard>

      <NotificationDrawer />
    </div>
  );
}
