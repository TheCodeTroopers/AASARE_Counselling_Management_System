import { cn } from "@/utils/cn";

const toneMap = {
  pending: "bg-warning-light text-[#C97A2B] border-warning/40",
  approved: "bg-success-light text-success border-success/20",
  rejected: "bg-danger-light text-danger border-danger/20",
  completed: "bg-secondary text-primary border-border",
  cancelled: "bg-secondary text-text-secondary border-border",
  submitted: "bg-success-light text-success border-success/20",
  draft: "bg-secondary text-text-secondary border-border",
  available: "bg-success-light text-success border-success/20",
  unavailable: "bg-danger-light text-danger border-danger/20",
};

export type StatusType = keyof typeof toneMap;

export function StatusBadge({ status }: { status: StatusType | (string & {}) }) {
  const tone = toneMap[status as StatusType] || toneMap.draft;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        tone,
      )}
    >
      {status}
    </span>
  );
}
