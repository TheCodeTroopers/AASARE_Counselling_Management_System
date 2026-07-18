import Link from 'next/link';

const quickLinks = [
  { href: '/counsellors', label: 'Manage counsellors', description: 'Review active staff and permissions.' },
  { href: '/schedules', label: 'Manage schedules', description: 'Adjust availability and session blocks.' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the admin workspace to keep counsellor activity, schedules, and support operations organised.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">{item.label}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
