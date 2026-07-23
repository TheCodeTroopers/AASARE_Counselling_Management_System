export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#E8DDD5] bg-[#F8F3EE] p-8 text-center">
      <p className="text-base font-semibold text-[#6D214F]">{title}</p>
      <p className="mt-1 text-sm text-[#6E6E6E]">{description}</p>
    </div>
  );
}
