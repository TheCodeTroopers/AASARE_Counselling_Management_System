import { supabase } from "@/integrations/supabase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type UserProfile = {
  id: string;
  full_name: string | null;
  department: string | null;
  designation: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  image_url: string | null;
  specialties: string[] | null;
};

export async function getProfile() {
  const res = await fetch("/api/profile", { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json() as Promise<UserProfile>;
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders())
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}
