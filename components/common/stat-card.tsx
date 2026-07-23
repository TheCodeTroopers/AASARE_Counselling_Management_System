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
    <div className="rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#6E6E6E]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#2F2F2F]">{value}</p>
        </div>
        <div className={cn('rounded-2xl p-3', accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
