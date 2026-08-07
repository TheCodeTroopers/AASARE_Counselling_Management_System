import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/src/assets/smvitm-logo.jpg";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const nav = [
  { href: "/", label: "Home" },
  { href: "/counsellors", label: "Counsellors" },
  { href: "/my-appointments", label: "My Appointments" },
  { href: "/about", label: "About AASARE" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, profile, role, isCounsellor, isAdmin, signOut } = useAuth();
  
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
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="SMVITM"
            className="h-11 w-11 object-contain rounded-full"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-xl font-semibold tracking-tight text-primary">
              AASARE
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Institutional Counselling Cell · SMVITM
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as any}
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
                href={isAdmin ? "/admin/dashboard" : isCounsellor ? "/dashboard" : "/my-appointments"}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
                title={displayName}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials || "·"}
                </span>
                <span className="max-w-[9rem] truncate">{displayName.split(" ")[0] || "You"}</span>
                {(isCounsellor || isAdmin) && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {role}
                  </span>
                )}
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out");
                  router.push("/auth");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="ml-3 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 md:hidden text-foreground"
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
                key={item.href}
                href={item.href as any}
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
                  router.push("/auth");
                }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary w-full cursor-pointer"
              >
                Sign out ({displayName.split(" ")[0] || "you"})
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground text-center"
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
