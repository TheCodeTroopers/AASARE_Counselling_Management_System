"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Lock, HeartHandshake, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CounsellorAvatar } from "@/components/counsellor-avatar";
import { fetchCounsellors, type Counsellor } from "@/lib/counsellors";
import { useState, useEffect } from "react";

export default function StudentHomePage() {
  const [featured, setFeatured] = useState<Counsellor[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCounsellors().then((list) => {
      setFeatured(list.slice(0, 4));
      setTotal(list.length);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-radial-warm">
          <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(1000px_500px_at_10%_-20%,oklch(0.9_0.06_75/0.55),transparent),radial-gradient(800px_400px_at_100%_0%,oklch(0.55_0.12_15/0.15),transparent)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 md:grid-cols-[1.15fr_1fr] md:px-8 md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> A safe space at SMVITM
              </span>
              <h1 className="mt-6 text-balance font-display text-5xl leading-[1.05] text-primary md:text-6xl lg:text-7xl">
                A quiet room, <em className="font-normal italic text-gold">whenever</em> you need
                one.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                AASARE is the Institutional Counselling Cell of SMVITM. Browse our faculty
                counsellors, view open slots, and book a private appointment — all in a few taps.
                Whatever you're carrying, you don't have to carry it alone.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/counsellors"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Find a counsellor
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
                >
                  How it works
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" /> Confidential
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-gold" /> Faculty-led
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-gold" /> Same-week slots
                </div>
              </div>
            </div>

            {/* Hero card stack */}
            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-gold/25 via-transparent to-primary/15 blur-2xl" />
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Today's availability
                  </p>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_oklch(0.9_0.15_150/0.35)]" />
                </div>
                <div className="mt-5 space-y-3">
                  {featured.map((c) => (
                    <Link
                      key={c.id}
                      href={`/counsellors/${c.id}`}
                      className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-border hover:bg-secondary/50"
                    >
                      <CounsellorAvatar counsellor={c} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.department}</p>
                      </div>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] font-medium " +
                          (c.available
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600")
                        }
                      >
                        {c.available ? "Available" : "Booked"}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/counsellors"
                  className="mt-5 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/10"
                >
                  See all {total > 0 ? total : "our"} counsellors
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Value pillars */}
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Strictly confidential",
                body: "Your case notes stay only with the counsellor you meet — never shared, never joined into any admin-facing view.",
              },
              {
                icon: HeartHandshake,
                title: "Faculty who listen",
                body: "Nine trained faculty counsellors from across departments — from Engineering to Business Administration.",
              },
              {
                icon: CalendarClock,
                title: "Book in seconds",
                body: "See real-time availability, pick a slot, and describe what's on your mind. Get status updates as it moves.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />
                <v.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-5 font-display text-2xl text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-2xl shadow-primary/20 md:px-16 md:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Ready when you are
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-primary-foreground md:text-5xl">
                Reaching out is the hardest step. We'll take it with you.
              </h2>
              <Link
                href="/counsellors"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white hover:shadow-md cursor-pointer"
              >
                Browse counsellors <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
