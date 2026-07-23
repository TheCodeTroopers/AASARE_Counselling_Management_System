import type { Counsellor } from "@/lib/counsellors";
import { cn } from "@/utils/cn"; // Next.js uses utils/cn for className merge

export function CounsellorAvatar({
  counsellor,
  size = "md",
  className,
}: {
  counsellor: Counsellor;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-3xl",
  };
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-semibold text-primary-foreground shadow-inner ring-1 ring-black/5",
        sizes[size],
        className,
      )}
      style={{
        background: `radial-gradient(circle at 30% 25%, oklch(0.85 0.05 80), ${counsellor.accent})`,
      }}
    >
      <span className="drop-shadow-sm">{counsellor.initials}</span>
    </div>
  );
}
