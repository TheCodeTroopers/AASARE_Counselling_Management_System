"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, UserRole } from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, profile, role } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      // Check current session
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        setHasValidSession(true);
        setIsCheckingSession(false);
      } else {
        // Also listen for auth state changes like PASSWORD_RECOVERY
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            if (event === "PASSWORD_RECOVERY" || session) {
              setHasValidSession(true);
            }
            setIsCheckingSession(false);
          },
        );

        // Fallback timeout to stop loader if no token exists
        const timer = setTimeout(() => {
          if (mounted) {
            setIsCheckingSession(false);
          }
        }, 2000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setBusy(false);

    if (error) {
      toast.error(error.message || "Failed to update password. Link may have expired.");
      return;
    }

    setIsSuccess(true);
    toast.success("Password updated successfully!");

    setTimeout(() => {
      const activeRole: UserRole = profile?.role || role || "student";
      if (activeRole === "admin") {
        router.push("/admin/dashboard");
      } else if (activeRole === "counsellor") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }, 2000);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <SiteHeader />
      <main className="relative overflow-hidden flex-1 flex items-center">
        <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(900px_500px_at_15%_-10%,oklch(0.9_0.06_75/0.55),transparent),radial-gradient(700px_400px_at_100%_10%,oklch(0.55_0.12_15/0.14),transparent)]" />
        <div className="mx-auto grid max-w-5xl w-full items-center gap-12 px-5 py-12 md:grid-cols-[1fr_1fr] md:px-8 md:py-20">
          {/* Left column */}
          <div className="hidden md:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Account Security
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.1] text-primary lg:text-5xl">
              Create your new <em className="font-normal italic text-gold">password</em>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Please enter a strong password with at least 8 characters to secure your AASARE counselling account.
            </p>
            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>Use a mix of letters, numbers, and symbols</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <span>Never share your password with anyone</span>
              </div>
            </div>
          </div>

          {/* Right column: Form Card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-xl backdrop-blur md:p-8">
              {isCheckingSession ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Verifying security token...</p>
                </div>
              ) : isSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Password Reset Complete</h2>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully updated. Redirecting you to your account...
                  </p>
                </div>
              ) : !hasValidSession && !user ? (
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Link Expired or Invalid</h2>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid or has expired. Please request a new one from the sign-in page.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/auth"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
                    >
                      Back to Sign in
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-semibold text-foreground">
                      Set new password
                    </h2>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Choose a secure password for your account
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        New Password
                      </span>
                      <span className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 transition focus-within:ring-2 focus-within:ring-primary/40">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter at least 8 characters"
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Confirm New Password
                      </span>
                      <span className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 transition focus-within:ring-2 focus-within:ring-primary/40">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                        />
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      Update password
                    </button>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      Remember your password?{" "}
                      <Link
                        href="/auth"
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
