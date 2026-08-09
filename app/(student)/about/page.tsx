"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const steps = [
  {
    title: "Browse counsellors",
    body: "See faculty across every department, with their focus areas and current availability.",
  },
  {
    title: "Pick a slot",
    body: "Choose from open time slots in the next seven days — live availability, no back-and-forth.",
  },
  {
    title: "Share a few lines",
    body: "Tell your counsellor what's on your mind. Only they will read it.",
  },
  {
    title: "Get an update",
    body: "Your request moves through Pending → Approved, and you'll see status changes in real time.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> About AASARE
        </span>
        <h1 className="mt-6 font-display text-5xl leading-tight text-primary md:text-6xl">
          A counselling cell built around <em className="italic text-gold">student privacy</em>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          AASARE is the Institutional Counselling Cell of Shri Madhwa Vadiraja Institute of
          Technology & Management. Coordinated by Dr. Deepika B V (SWO), the cell brings together
          nine faculty counsellors from across the college's departments.
        </p>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-display text-xl text-foreground">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-gold/30 bg-gold/5 p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl text-primary">Our privacy promise</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/85">
            {[
              "Your reason for booking is visible only to the counsellor you chose.",
              "Case notes and personal conversations are never joined into any admin-facing view.",
              "You can cancel a pending or approved request at any time — no questions asked.",
              "Administrators can see aggregate schedules, not what any student shared.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col items-center rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground shadow-xl">
          <h2 className="font-display text-3xl text-primary-foreground md:text-4xl">
            Whenever you're ready.
          </h2>
          <p className="mt-3 max-w-lg text-primary-foreground/90 font-medium">
            A single conversation can change how a whole semester feels.
          </p>
          <Link
            href="/counsellors"
            className="mt-6 inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white hover:shadow-md cursor-pointer"
          >
            Meet the counsellors
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
