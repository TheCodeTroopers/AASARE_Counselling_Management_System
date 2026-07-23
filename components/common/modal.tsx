import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F2F2F]/40 p-4">
      <div className={cn('w-full max-w-lg rounded-[24px] border border-[#E8DDD5] bg-white p-5 shadow-card', className)}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#6D214F]">{title}</h3>
            {description ? <p className="text-sm text-[#6E6E6E]">{description}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-2xl p-2 text-[#6E6E6E] transition hover:bg-[#F8F3EE] hover:text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
