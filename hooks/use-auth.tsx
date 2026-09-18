"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "student" | "counsellor" | "admin";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  usn?: string;
  department?: string;
  year?: string;
  role: UserRole;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  isStudent: boolean;
  isCounsellor: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(u: User) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, usn, department, year, role")
        .eq("id", u.id)
        .maybeSingle();

      console.log(`[Auth Debug] Querying profile for user (${u.email}, ID: ${u.id})...`);
      console.log(`[Auth Debug] Supabase response -> data:`, data, `error:`, error);

      const userMetaRole = u.user_metadata?.role;
      const dbRole = data?.role;
      const lowerEmail = u.email?.toLowerCase() || "";

      // Determine role with fallbacks
      let resolvedRole: UserRole = "student";
      if (dbRole && ["student", "counsellor", "admin"].includes(dbRole)) {
        resolvedRole = dbRole as UserRole;
      } else if (userMetaRole && ["student", "counsellor", "admin"].includes(userMetaRole)) {
        resolvedRole = userMetaRole as UserRole;
      } else if (
        lowerEmail.includes("counsellor") ||
        lowerEmail.includes("counselor") ||
        lowerEmail.includes("counselling")
      ) {
        resolvedRole = "counsellor";
      } else if (lowerEmail.includes("admin")) {
        resolvedRole = "admin";
      }

      console.log(
        `[Auth Debug] User: ${u.email} | DB Role: ${dbRole} | Meta Role: ${userMetaRole} => Resolved Role: ${resolvedRole}`,
      );

      const userProfileObj: UserProfile = {
        id: u.id,
        email: u.email || "",
        full_name:
          data?.full_name || u.user_metadata?.full_name || u.user_metadata?.name || u.email || "",
        usn: data?.usn || u.user_metadata?.usn,
        department: data?.department || u.user_metadata?.department,
        year: data?.year || u.user_metadata?.year,
        role: resolvedRole,
      };

      setProfile(userProfileObj);
      if (typeof window !== "undefined") {
        localStorage.setItem("aasare_user_profile", JSON.stringify(userProfileObj));
      }
      return resolvedRole;
    } catch (err) {
      console.error("[Auth Error] Profile fetch error:", err);
      // Fallback profile object so profile is never stuck as null
      const fallbackObj: UserProfile = {
        id: u.id,
        email: u.email || "",
        full_name: u.user_metadata?.full_name || u.email || "",
        role: "student",
      };
      setProfile(fallbackObj);
      if (typeof window !== "undefined") {
        localStorage.setItem("aasare_user_profile", JSON.stringify(fallbackObj));
      }
      return "student" as UserRole;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setLoading(true);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("aasare_user_profile");
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {
            // Ignore JSON parse errors
          }
        }
      }
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      if (mounted) {
        setSession(currentSession);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user);
        } else {
          setProfile(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("aasare_user_profile");
          }
        }
        setLoading(false);
      }
    }

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        await fetchProfile(s.user);
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("aasare_user_profile");
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role: UserRole =
    profile?.role || (session?.user?.user_metadata?.role as UserRole) || "student";

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    role,
    loading,
    isStudent: role === "student",
    isCounsellor: role === "counsellor",
    isAdmin: role === "admin",
    signOut: async () => {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_profile");
      }
      setProfile(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("aasare_user_profile");
      }
    },
    refreshProfile: async () => {
      if (session?.user) {
        await fetchProfile(session.user);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
