import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { NextRequest } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://vgsyirselvakpjcfwfgi.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_OhN4Zj3bW8Z6gv-SeHH2xw_3lF7RPyW";

export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") && authHeader.length > 7
    ? authHeader.slice(7)
    : null;
}

/**
 * Creates a Supabase client authenticated with the user's access token (sent
 * as `Authorization: Bearer <token>`). The app stores its session in the
 * browser's localStorage, so server-side route handlers must use the token to
 * resolve the user AND satisfy RLS.
 */
export function createAuthedSupabase(token: string | null): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
