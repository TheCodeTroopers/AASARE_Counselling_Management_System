import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Shield, User, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/smvitm-logo.jpg";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, profile, role, isCounsellor, isAdmin, signOut } = useAuth();

  const nav = [
    { to: "/", label: "Home" },
    { to: "/counsellors", label: "Counsellors" },
    ...(role === "student" ? [{ to: "/appointments", label: "My Appointments" }] : []),
    ...(isCounsellor ? [{ to: "/appointments", label: "Dashboard Sessions" }] : []),
    ...(isAdmin ? [{ to: "/appointments", label: "All Schedules" }] : []),
    { to: "/about", label: "About AASARE" },
  ];

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "";

  const initials = displayName
    ? displayName
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join("")
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="SMVITM"
            className="h-11 w-11 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl font-semibold tracking-tight text-primary flex items-center gap-1.5">
              AASARE
              {isAdmin && <span className="rounded bg-rose-500/10 text-rose-600 text-[10px] px-1.5 py-0.5 font-sans font-semibold border border-rose-500/20">ADMIN</span>}
              {isCounsellor && <span className="rounded bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0.5 font-sans font-semibold border border-amber-500/20">COUNSELLOR</span>}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Institutional Counselling Cell · SMVITM
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <Link
                to="/appointments"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                title={`${displayName} (${role})`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials || "·"}
                </span>
                <span className="max-w-[9rem] truncate">{displayName.split(" ")[0] || "You"}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">({role})</span>
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-3 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={async () => {
                  setOpen(false);
                  await signOut();
                  toast.success("Signed out");
                }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Sign out ({displayName.split(" ")[0] || "you"} - {role})
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}