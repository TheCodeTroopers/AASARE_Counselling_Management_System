import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CounsellorAvatar } from "@/components/counsellor-avatar";
import { getCounsellor, getSlotsForCounsellor } from "@/lib/counsellors";
import { createAppointment, fetchBookedSlots } from "@/lib/appointments";

export const Route = createFileRoute("/counsellors/$id")({
  loader: ({ params }) => {
    const c = getCounsellor(params.id);
    if (!c) throw notFound();
    return { counsellor: c };
  },
  component: CounsellorDetail,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-primary">Counsellor not found</h1>
        <p className="mt-3 text-muted-foreground">Please head back to the directory.</p>
        <Link to="/counsellors" className="mt-8 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">
          Back to directory
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Something went wrong loading this profile.</div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.counsellor.name ?? "Counsellor"} — AASARE` },
      { name: "description", content: `Book an appointment with ${loaderData?.counsellor.name} at the AASARE Counselling Cell, SMVITM.` },
    ],
  }),
});

function getNext7Days() {
  const days: { iso: string; label: string; dow: string; day: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      dow: d.toLocaleDateString(undefined, { weekday: "short" }),
      day: String(d.getDate()),
    });
  }
  return days;
}

function CounsellorDetail() {
  const { counsellor } = Route.useLoaderData();
  const navigate = useNavigate();
  const days = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState(days[0].iso);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const localSlots = getSlotsForCounsellor(counsellor.id, selectedDate);
  const slots = localSlots.map((s) => ({
    time: s.time,
    booked: s.booked || bookedTimes.includes(s.time),
  }));

  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    fetchBookedSlots(counsellor.id, selectedDate)
      .then((list) => {
        if (!cancelled) setBookedTimes(list);
      })
      .catch(() => {
        if (!cancelled) setBookedTimes([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [counsellor.id, selectedDate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      toast.error("Please pick a time slot.");
      return;
    }
    if (reason.trim().length < 10) {
      toast.error("Please share a short reason (at least 10 characters).");
      return;
    }
    setSubmitting(true);
    const result = await createAppointment({
      counsellorId: counsellor.id,
      date: selectedDate,
      time: selectedTime,
      reason: reason.trim(),
    });
    setSubmitting(false);
    if (!result.ok) {
      if (result.error === "double_booking") {
        toast.error(result.message, { duration: 6000 });
        // Refresh booked slots so the taken time is greyed out immediately.
        fetchBookedSlots(counsellor.id, selectedDate).then(setBookedTimes).catch(() => {});
        setSelectedTime(null);
      } else {
        toast.error(result.message);
      }
      return;
    }
    toast.success("Request sent. Awaiting the counsellor's approval.");
    navigate({ to: "/appointments" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <Link
          to="/counsellors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All counsellors
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          {/* Profile */}
          <section>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <CounsellorAvatar counsellor={counsellor} size="xl" />
                <div>
                  {counsellor.isCoordinator && (
                    <span className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Coordinator
                    </span>
                  )}
                  <h1 className="mt-2 font-display text-4xl leading-tight text-primary md:text-5xl">
                    {counsellor.name}
                  </h1>
                  <p className="mt-1 text-muted-foreground">{counsellor.designation}</p>
                  <p className="text-sm text-primary/80">{counsellor.department}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {counsellor.email}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-foreground/90">{counsellor.bio}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {counsellor.specialties.map((s: string) => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  Anything you share here stays between you and {counsellor.name.split(" ")[0]}. Case notes are never
                  visible to administrators or other faculty.
                </p>
              </div>
            </div>
          </section>

          {/* Booking */}
          <section>
            <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <CalendarDays className="h-4 w-4" /> Request an appointment
              </div>
              <h2 className="mt-2 font-display text-3xl text-foreground">Pick a time that works</h2>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Day</p>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const active = d.iso === selectedDate;
                    return (
                      <button
                        type="button"
                        key={d.iso}
                        onClick={() => {
                          setSelectedDate(d.iso);
                          setSelectedTime(null);
                        }}
                        className={
                          "flex flex-col items-center rounded-xl border py-2 text-sm transition " +
                          (active
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "border-border bg-background hover:border-primary/40")
                        }
                      >
                        <span className="text-[10px] uppercase tracking-widest opacity-70">{d.dow}</span>
                        <span className="font-display text-xl font-semibold">{d.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Time slot</p>
                  {slotsLoading && <span className="text-[10px] text-muted-foreground">checking availability…</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s: { time: string; booked: boolean }) => {
                    const active = s.time === selectedTime;
                    const pendingApproval = bookedTimes.includes(s.time);
                    return (
                      <button
                        type="button"
                        key={s.time}
                        disabled={s.booked}
                        onClick={() => setSelectedTime(s.time)}
                        title={pendingApproval ? "Already booked · awaiting counsellor's approval" : undefined}
                        className={
                          "rounded-xl border py-2.5 text-sm font-medium transition " +
                          (s.booked
                            ? "cursor-not-allowed border-border/60 bg-muted text-muted-foreground/50 line-through"
                            : active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary/40")
                        }
                      >
                        {s.time}
                      </button>
                    );
                  })}
                </div>
                {bookedTimes.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                    Struck-through times are already booked and awaiting the counsellor's approval — please pick a different slot.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  What would you like to talk about?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="A few lines are enough. Only your counsellor will read this."
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">{reason.length}/500</p>
              </div>

              <button
                type="submit"
                disabled={submitting || !counsellor.available}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {counsellor.available ? (submitting ? "Sending…" : "Send request") : "Currently unavailable"}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                You'll see it under <Link to="/appointments" className="underline">My Appointments</Link> once submitted.
              </p>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}