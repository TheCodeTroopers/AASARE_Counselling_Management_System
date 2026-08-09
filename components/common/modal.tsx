import { X } from "lucide-react";
import { cn } from "@/utils/cn";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 p-4">
      <div
        className={cn(
          "w-full max-w-lg rounded-[24px] border border-border bg-white p-5 shadow-card",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl p-2 text-text-secondary transition hover:bg-secondary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
