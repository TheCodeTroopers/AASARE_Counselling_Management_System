import { Search } from "lucide-react";

export function SearchFilterBar({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-2.5 shadow-sm">
      <Search className="h-4 w-4 text-text-secondary" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
      />
    </div>
  );
}
