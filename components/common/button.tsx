import { cn } from '@/utils/cn';

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    secondary: 'bg-secondary text-white hover:bg-teal-600',
    ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-danger text-white hover:bg-rose-700',
  };

  return (
    <button className={cn('rounded-xl px-4 py-2 text-sm font-semibold transition', styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
