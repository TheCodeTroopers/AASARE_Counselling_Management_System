import { Search } from 'lucide-react';

export function SearchFilterBar({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] px-3 py-2.5 shadow-sm">
      <Search className="h-4 w-4 text-[#6E6E6E]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[#2F2F2F] outline-none placeholder:text-[#6E6E6E]"
      />
    </div>
  );
}
