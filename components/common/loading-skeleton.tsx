export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[20px] border border-[#E8DDD5] bg-white p-4 shadow-card">
          <div className="h-4 w-1/3 rounded bg-[#F8F3EE]" />
          <div className="mt-3 h-3 w-2/3 rounded bg-[#F8F3EE]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#F8F3EE]" />
        </div>
      ))}
    </div>
  );
}
