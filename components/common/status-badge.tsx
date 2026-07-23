import { cn } from '@/utils/cn';

const toneMap = {
  pending: 'bg-[#FFF2E8] text-[#C97A2B] border-[#F4A261]/40',
  approved: 'bg-[#ECF8EE] text-[#4CAF50] border-[#4CAF50]/20',
  rejected: 'bg-[#FDECE8] text-[#E76F51] border-[#E76F51]/20',
  completed: 'bg-[#F8F3EE] text-[#6D214F] border-[#E8DDD5]',
  draft: 'bg-[#F8F3EE] text-[#6E6E6E] border-[#E8DDD5]',
  available: 'bg-[#ECF8EE] text-[#4CAF50] border-[#4CAF50]/20',
  unavailable: 'bg-[#FDECE8] text-[#E76F51] border-[#E76F51]/20',
};

export function StatusBadge({ status }: { status: keyof typeof toneMap }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', toneMap[status])}>
      {status}
    </span>
  );
}
