import { cn } from '@/utils/cn';

export function SectionCard({
  title,
  subtitle,
  actions,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('glass-card rounded-[20px] border border-[#E8DDD5] bg-white p-5 shadow-card', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#6D214F]">{title}</h2>
          {subtitle ? <p className="text-sm text-[#6E6E6E]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
