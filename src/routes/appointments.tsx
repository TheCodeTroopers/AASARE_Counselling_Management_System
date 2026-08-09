import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock, MessageSquare, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CounsellorAvatar } from "@/components/counsellor-avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  cancelAppointment,
  fetchMyAppointments,
  statusLabel,
  statusStyles,
  type Appointment,
} from "@/lib/appointments";
import { getCounsellor } from "@/lib/counsellors";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPage,
  head: () => ({
    meta: [
      { title: "My Appointments — AASARE" },
      {
        name: "description",
        content: "Track the status of your counselling appointments at SMVITM.",
      },
    ],
  }),
});

function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await fetchMyAppointments();
        if (mounted) setItems(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const upcoming = items.filter((a) => a.status === "pending" || a.status === "approved");
  const past = items.filter((a) => a.status !== "pending" && a.status !== "approved");

  const onCancel = async (id: string) => {
    try {
      await cancelAppointment(id);
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
      toast("Appointment cancelled.");
    } catch (e) {
      toast.error((e as Error).message || "Couldn't cancel");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Your sessions
          </p>
          <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">My appointments</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Follow your requests as they move through pending, approved, completed, or cancelled.
          </p>
        </div>

        {!hydrated ? (
          <div className="mt-12 h-40 animate-pulse rounded-2xl bg-muted" />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-10 space-y-12">
            <Section title="Upcoming & pending" list={upcoming} onCancel={onCancel} />
            <Section title="Past" list={past} muted />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-14 text-center">
      <CalendarClock className="mx-auto h-10 w-10 text-primary/60" />
      <h2 className="mt-4 font-display text-3xl text-foreground">No appointments yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        When you book a session, you'll see it appear here with live status updates.
      </p>
      <Link
        to="/counsellors"
        className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20"
      >
        Find a counsellor
      </Link>
    </div>
  );
}

function Section({
  title,
  list,
  muted,
  onCancel,
}: {
  title: string;
  list: Appointment[];
  muted?: boolean;
  onCancel?: (id: string) => void;
}) {
  if (list.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">
        {list.map((a) => (
          <AppointmentCard key={a.id} a={a} muted={muted} onCancel={onCancel} />
        ))}
      </div>
    </section>
  );
}

function AppointmentCard({
  a,
  muted,
  onCancel,
}: {
  a: Appointment;
  muted?: boolean;
  onCancel?: (id: string) => void;
}) {
  const c = getCounsellor(a.counsellorId);
  if (!c) return null;
  const canCancel = a.status === "pending" || a.status === "approved";
  const dateLabel = new Date(a.date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <article
      className={
        "rounded-2xl border border-border bg-card p-6 shadow-sm transition " +
        (muted ? "opacity-90" : "hover:shadow-md")
      }
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <CounsellorAvatar counsellor={c} size="md" />
          <div>
            <p className="font-display text-xl text-foreground">{c.name}</p>
            <p className="text-sm text-muted-foreground">{c.department}</p>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <span
            className={
              "inline-flex w-max items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold " +
              statusStyles[a.status]
            }
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {statusLabel[a.status]}
          </span>
          <p className="mt-2 text-sm font-medium text-foreground">
            {dateLabel} · <span className="text-primary">{a.time}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-sm text-foreground/80">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>{a.reason}</p>
      </div>

      {a.status === "rejected" && a.rejectionReason && (
        <p className="mt-3 text-sm text-rose-800">
          <strong>Reason for rejection:</strong> {a.rejectionReason}
        </p>
      )}

      {canCancel && onCancel && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(a.id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
          >
            <XCircle className="h-3.5 w-3.5" /> Cancel request
          </button>
        </div>
      )}
    </article>
  );
}
