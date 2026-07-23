export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 ? <span>/</span> : null}
          <span className={index === items.length - 1 ? 'font-semibold text-slate-900' : ''}>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
