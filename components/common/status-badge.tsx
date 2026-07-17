import { cn } from '@/utils/cn';

const toneMap = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-sky-50 text-sky-700 border-sky-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unavailable: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function StatusBadge({ status }: { status: keyof typeof toneMap }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', toneMap[status])}>
      {status}
    </span>
  );
}
