"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  Ban,
  LogIn,
} from "lucide-react";
import { useEffect, useMemo, useState, use } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CounsellorAvatar } from "@/components/counsellor-avatar";
import { getCounsellor } from "@/lib/counsellors";
import { createAppointment, fetchBookedSlots } from "@/lib/appointments";
import { fetchAvailableSlots, fetchUnavailableDates, type SlotRow } from "@/lib/slots";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";

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

export default function CounsellorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const counsellorId = resolvedParams.id;
  const counsellor = getCounsellor(counsellorId);

  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const days = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState(days[0].iso);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<SlotRow[]>([]);
  const [slotsFetchLoading, setSlotsFetchLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);

  // Load real slots & date unavailability from Supabase
  useEffect(() => {
    if (!counsellor) return;
    setSlotsFetchLoading(true);
    Promise.all([fetchAvailableSlots(counsellor.id), fetchUnavailableDates(counsellor.id)])
      .then(([rows, dates]) => {
        setAvailableSlots(rows);
        setUnavailableDates(dates);
      })
      .catch(() => {
        setAvailableSlots([]);
        setUnavailableDates([]);
      })
      .finally(() => setSlotsFetchLoading(false));
  }, [counsellor]);

  const isSelectedDateUnavailable = unavailableDates.includes(selectedDate);

  // Determine weekday short code for selected date (e.g. "Mon", "Tue")
  const selectedWeekday = useMemo(() => {
    if (!selectedDate) return "Mon";
    const [year, month, day] = selectedDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }, [selectedDate]);

  // Filter and sort available slots chronologically for the selected date's weekday
  const slots = useMemo(() => {
    const parseTimeToMinutes = (timeStr: string) => {
      if (!timeStr) return 0;
      const clean = timeStr.includes("|") ? timeStr.split("|")[1].trim() : timeStr.trim();
      const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const dayFiltered = availableSlots.filter((s) => {
      if (s.slot_time.includes("|")) {
        const [dayPrefix] = s.slot_time.split("|").map((x) => x.trim());
        return dayPrefix.toLowerCase() === selectedWeekday.toLowerCase();
      }
      return true; // legacy format fallback
    });

    const mapped = dayFiltered.map((s) => {
      const cleanTime = s.slot_time.includes("|")
        ? s.slot_time.split("|")[1].trim()
        : s.slot_time;
      return {
        time: cleanTime,
        booked: bookedTimes.includes(cleanTime),
      };
    });

    return mapped.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  }, [availableSlots, selectedWeekday, bookedTimes]);

  useEffect(() => {
    if (!counsellor) return;
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
  }, [counsellor, selectedDate]);

  if (!counsellor) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl text-primary">Counsellor not found</h1>
          <p className="mt-3 text-muted-foreground">Please head back to the directory.</p>
          <Link
            href="/counsellors"
            className="mt-8 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelectedDateUnavailable) {
      toast.error("Counsellor is not available on this date.");
      return;
    }
    if (!selectedTime) {
      toast.error("Please pick a time slot.");
      return;
    }
    if (reason.trim().length > 0 && reason.trim().length < 3) {
      toast.error("If you add a reason, please write at least a few characters.");
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
        fetchBookedSlots(counsellor.id, selectedDate)
          .then(setBookedTimes)
          .catch(() => {});
        setSelectedTime(null);
      } else {
        toast.error(result.message);
      }
      return;
    }
    toast.success("Request sent. Awaiting the counsellor's approval.");
    addNotification({
      title: "Appointment Requested",
      message: `Session request sent to ${counsellor.name} for ${selectedDate} at ${selectedTime}.`,
      type: "appointment",
      link: "/my-appointments",
    });
    router.push("/my-appointments");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/counsellors"
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

              <p className="mt-6 text-[15px] leading-relaxed text-foreground/90">
                {counsellor.bio}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {counsellor.specialties.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  Anything you share here stays between you and {counsellor.name.split(" ")[0]}.
                  Case notes are never visible to administrators or other faculty.
                </p>
              </div>
            </div>
          </section>

          {/* Booking */}
          <section>
            <form
              onSubmit={onSubmit}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <CalendarDays className="h-4 w-4" /> Request an appointment
              </div>
              <h2 className="mt-2 font-display text-3xl text-foreground">Pick a time that works</h2>

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Day
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const active = d.iso === selectedDate;
                    const isUnavailable = unavailableDates.includes(d.iso);
                    return (
                      <button
                        type="button"
                        key={d.iso}
                        onClick={() => {
                          setSelectedDate(d.iso);
                          setSelectedTime(null);
                        }}
                        className={
                          "relative flex flex-col items-center rounded-xl border py-2 text-sm transition " +
                          (isUnavailable
                            ? "border-rose-200 bg-rose-50/50 text-rose-700"
                            : active
                              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "border-border bg-background hover:border-primary/40")
                        }
                      >
                        <span className="text-[10px] uppercase tracking-widest opacity-70">
                          {d.dow}
                        </span>
                        <span
                          className={
                            "font-display text-xl font-semibold " +
                            (isUnavailable ? "line-through opacity-80" : "")
                          }
                        >
                          {d.day}
                        </span>
                        {isUnavailable && (
                          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-tight text-rose-600">
                            Off
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Time slot
                  </p>
                  {(slotsLoading || slotsFetchLoading) && (
                    <span className="text-[10px] text-muted-foreground">
                      checking availability…
                    </span>
                  )}
                </div>
                {isSelectedDateUnavailable ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-center">
                    <Ban className="h-6 w-6 text-rose-500" />
                    <p className="text-sm font-semibold text-rose-800">
                      Counsellor is not available on this date (Day Off)
                    </p>
                    <p className="text-xs text-rose-600/80">
                      Please select a different date above to view available time slots.
                    </p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 py-8 text-center">
                    <Clock className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No time slots available yet.</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      The counsellor hasn't added any slots for booking.
                    </p>
                  </div>
                ) : (
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
                          title={
                            pendingApproval
                              ? "Already booked · awaiting counsellor's approval"
                              : undefined
                          }
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
                )}
                {!isSelectedDateUnavailable && bookedTimes.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                    Struck-through times are already booked and awaiting the counsellor's approval —
                    please pick a different slot.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  What would you like to talk about?{" "}
                  <span className="normal-case font-normal opacity-60">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="A few lines are enough — or leave blank if you prefer."
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {reason.length}/500
                </p>
              </div>

              {!user ? (
                <Link
                  href="/auth"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to send request
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !counsellor.available || isSelectedDateUnavailable}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSelectedDateUnavailable
                    ? "Counsellor Off on Selected Date"
                    : counsellor.available
                      ? submitting
                        ? "Sending…"
                        : "Send request"
                      : "Currently unavailable"}
                </button>
              )}
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                You'll see it under{" "}
                <Link href="/my-appointments" className="underline">
                  My Appointments
                </Link>{" "}
                once submitted.
              </p>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
