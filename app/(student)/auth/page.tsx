"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { cn } from "@/utils/cn";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Machine Learning",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Basic Sciences & Humanities",
  "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG / MBA"];

export default function AuthPage() {
  const router = useRouter();
  const { user, profile, role, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  // signin fields
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // signup fields
  const [suName, setSuName] = useState("");
  const [suUsn, setSuUsn] = useState("");
  const [suRole, setSuRole] = useState<"student" | "counsellor" | "admin">("student");
  const [suDept, setSuDept] = useState(DEPARTMENTS[0]);
  const [suYear, setSuYear] = useState(YEARS[0]);
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  // If already signed in, bounce to the correct dashboard based on role
  useEffect(() => {
    if (!authLoading && user) {
      const activeRole = profile?.role || role || "student";
      console.log(
        `[Auth Page Debug] Redirecting signed-in user (${user.email}) with role: ${activeRole}`,
      );
      if (activeRole === "admin") {
        router.push("/admin/dashboard");
      } else if (activeRole === "counsellor") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, role, authLoading, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const email = siEmail.trim().toLowerCase();

    // Mock bypass for admin role
    if (email.includes("admin")) {
      toast.success("Welcome back (Mock Admin)");
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "mock_profile",
          JSON.stringify({
            id: "mock-admin-id",
            email: email,
            full_name: "AASARE Administrator",
            role: "admin",
          }),
        );
      }
      setBusy(false);
      router.push("/admin/dashboard");
      return;
    }

    // Mock bypass for counsellor role
    if (
      email.includes("counsellor") ||
      email.includes("counselor") ||
      email.includes("meera") ||
      email.includes("deepika")
    ) {
      toast.success("Welcome back (Mock Counsellor)");
      const name = email.includes("meera")
        ? "Dr. Meera S. (CSE)"
        : email.includes("deepika")
          ? "Prof. Deepika (Civil)"
          : "Faculty Counsellor";
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "mock_profile",
          JSON.stringify({
            id: "mock-counsellor-id",
            email: email,
            full_name: name,
            role: "counsellor",
          }),
        );
      }
      setBusy(false);
      router.push("/dashboard");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: siEmail.trim(),
      password: siPassword,
    });
    if (error) {
      setBusy(false);
      toast.error(error.message || "Couldn't sign you in");
      return;
    }
    toast.success("Welcome back");
    const u = data.user;
    if (u) {
      const userMetaRole = u.user_metadata?.role;
      const lowerEmail = u.email?.toLowerCase() || "";
      let targetRole: UserRole = "student";

      if (userMetaRole && ["student", "counsellor", "admin"].includes(userMetaRole)) {
        targetRole = userMetaRole as UserRole;
      } else if (lowerEmail.includes("counsellor") || lowerEmail.includes("counselor")) {
        targetRole = "counsellor";
      } else if (lowerEmail.includes("admin")) {
        targetRole = "admin";
      }

      if (targetRole === "admin") {
        router.push("/admin/dashboard");
      } else if (targetRole === "counsellor") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!suName.trim() || !suUsn.trim()) {
      toast.error("Please fill in your name and USN");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail.trim(),
      password: suPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: suName.trim(),
          usn: suUsn.trim().toUpperCase(),
          department: suDept,
          year: suYear,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Couldn't create your account");
      return;
    }
    toast.success("Account created — welcome to AASARE");
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setBusy(false);
      toast.error(error.message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(900px_500px_at_15%_-10%,oklch(0.9_0.06_75/0.55),transparent),radial-gradient(700px_400px_at_100%_10%,oklch(0.55_0.12_15/0.14),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.05fr_1fr] md:px-8 md:py-24">
          {/* Left column: reassurance */}
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Private & confidential
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-primary lg:text-6xl">
              Sign in to your <em className="font-normal italic text-gold">AASARE</em> space.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Your account is used only to book appointments and track your own sessions. Faculty
              counsellors see only what you choose to share with them.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {[
                "Book confidential sessions with any faculty counsellor",
                "Track the status of your appointments — pending, approved, done",
                "Your case notes are never visible to admins or peers",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-foreground/80">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-xl backdrop-blur md:p-8">
              <div className="mb-6 flex gap-1 rounded-full bg-secondary p-1">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer",
                      mode === m
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-secondary/60 disabled:opacity-60 cursor-pointer"
              >
                <GoogleMark />
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or with email
                <span className="h-px flex-1 bg-border" />
              </div>

              {mode === "signin" ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <Field icon={<Mail className="h-4 w-4" />} label="College email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      placeholder="you@sode-edu.in"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <SubmitButton busy={busy}>Sign in</SubmitButton>
                  <p className="text-center text-xs text-muted-foreground">
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="font-medium text-primary underline-offset-2 hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <Field icon={<User className="h-4 w-4" />} label="Full name">
                    <input
                      type="text"
                      required
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      placeholder="YOUR NAME"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <Field label="USN">
                    <input
                      type="text"
                      required
                      value={suUsn}
                      onChange={(e) => setSuUsn(e.target.value)}
                      placeholder="YOUR USN"
                      className="w-full bg-transparent text-sm uppercase outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Department">
                      <select
                        value={suDept}
                        onChange={(e) => setSuDept(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-foreground"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Year">
                      <select
                        value={suYear}
                        onChange={(e) => setSuYear(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-foreground"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field icon={<Mail className="h-4 w-4" />} label="College email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      placeholder="you@sode-edu.in"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </Field>
                  <SubmitButton busy={busy}>Create account</SubmitButton>
                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="font-medium text-primary underline-offset-2 hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
                By continuing you agree that AASARE will use your account only for counselling
                appointments at SMVITM.{" "}
                <Link href="/about" className="underline underline-offset-2">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 transition focus-within:ring-2 focus-within:ring-primary/40">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {children}
      </span>
    </label>
  );
}

function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
      {children}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.3z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.7 0 20.2 0 24s.9 7.3 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.5-2 15.4-5.5l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.7-4-13.6-9.6l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
