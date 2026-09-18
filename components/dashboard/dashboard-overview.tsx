"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheck2, Clock3, FileText, ShieldCheck, Users } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { getDashboardMock } from "@/services/dashboard.service";
import { StatCard } from "@/components/common/stat-card";
import { SectionCard } from "@/components/common/section-card";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";

const statIcons = {
  primary: CalendarCheck2,
  secondary: Clock3,
  warning: Users,
  success: ShieldCheck,
  danger: FileText,
};

export function DashboardOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardMock,
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (isError || !data?.data)
    return (
      <div className="rounded-[20px] border border-border bg-white p-5 text-sm text-danger shadow-card">
        Unable to load dashboard.
      </div>
    );

  const { stats, chartData, activityFeed } = data.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            accent={
              stat.tone === "primary"
                ? "bg-secondary text-primary"
                : stat.tone === "secondary"
                  ? "bg-secondary text-accent"
                  : stat.tone === "warning"
                    ? "bg-warning-light text-warning"
                    : stat.tone === "success"
                      ? "bg-success-light text-success"
                      : "bg-danger-light text-danger"
            }
            icon={statIcons[stat.tone as keyof typeof statIcons]}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Appointment Trend"
          subtitle="Weekly appointments and counselling load"
          className="xl:col-span-2"
        >
          <div className="h-56 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D214F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6D214F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#6D214F"
                  fill="url(#colorAppointments)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Status Distribution" subtitle="Case and appointment mix">
          <div className="h-56 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="status" radius={[6, 6, 0, 0]} fill="#C89B7B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Recent Activities" subtitle="Latest updates" className="lg:col-span-2">
          <div className="space-y-3">
            {activityFeed.map((activity) => (
              <div
                key={activity.id}
                className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm text-text"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{activity.title}</span>
                  <span className="text-xs text-slate-500">{activity.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Current Availability" subtitle="Live schedule readiness">
          <div className="rounded-2xl bg-success-light p-4 text-sm font-medium text-success">
            Available for new appointments
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-white p-4">
            <p className="text-sm text-slate-500">Today’s slot usage</p>
            <p className="mt-2 text-2xl font-semibold">68%</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
