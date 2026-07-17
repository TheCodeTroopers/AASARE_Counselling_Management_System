import { Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

export function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: typeof Activity;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={cn('rounded-xl p-3', accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
