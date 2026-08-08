-- Migration: Add counsellor_slots table for real-time slot management
-- Run this in the Supabase SQL Editor for project: vgsyirselvakpjcfwfgi

-- ─── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.counsellor_slots (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id text        NOT NULL,  -- slug, e.g. "savitha-shenoy"
  time          text        NOT NULL,  -- e.g. "09:30 AM"
  available     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT counsellor_slots_unique UNIQUE (counsellor_id, time)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.counsellor_slots TO authenticated;
GRANT ALL ON public.counsellor_slots TO service_role;

-- updated_at trigger (reuses existing set_updated_at function)
CREATE TRIGGER counsellor_slots_set_updated_at
  BEFORE UPDATE ON public.counsellor_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Helper: map auth.uid() → counsellor slug ────────────────────────────────

-- Add counsellor_slug column to profiles (nullable — only set for counsellors)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS counsellor_slug TEXT;

-- Helper function: returns the counsellor slug for the currently signed-in user
CREATE OR REPLACE FUNCTION public.get_my_counsellor_slug()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT counsellor_slug FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.counsellor_slots ENABLE ROW LEVEL SECURITY;

-- Counsellors can read ALL their own slots (including unavailable ones)
CREATE POLICY "Counsellors can read own slots"
  ON public.counsellor_slots FOR SELECT
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug());

-- Counsellors can insert their own slots
CREATE POLICY "Counsellors can insert own slots"
  ON public.counsellor_slots FOR INSERT
  TO authenticated
  WITH CHECK (counsellor_id = public.get_my_counsellor_slug());

-- Counsellors can update their own slots
CREATE POLICY "Counsellors can update own slots"
  ON public.counsellor_slots FOR UPDATE
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug())
  WITH CHECK (counsellor_id = public.get_my_counsellor_slug());

-- Counsellors can delete their own slots
CREATE POLICY "Counsellors can delete own slots"
  ON public.counsellor_slots FOR DELETE
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug());

-- ─── Seed: set counsellor_slug on existing counsellor profiles ────────────────

UPDATE public.profiles SET counsellor_slug = 'deepika-bv'          WHERE email = 'deepika.civil@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'subbulakshmi-karanth' WHERE email = 'snkaranth.chemistry@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'reshma-nayak'         WHERE email = 'reshma.maths@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'shashikala-r'         WHERE email = 'shashikala.ec@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'savitha-shenoy'       WHERE email = 'savitha.cs@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'ashwitha-thota'       WHERE email = 'ashwithac.cs@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'mamatha'              WHERE email = 'mamathas.ml@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'karthik-v'            WHERE email = 'karthik.mech@sode-edu.in';
UPDATE public.profiles SET counsellor_slug = 'neha-lakhotia'        WHERE email = 'nehal.mba@sode-edu.in';

-- ─── Public read function for students ───────────────────────────────────────
-- Bypasses RLS so students can read available slots for any counsellor

CREATE OR REPLACE FUNCTION public.get_available_slots(_counsellor_id text)
RETURNS TABLE(id uuid, counsellor_id text, time text, available boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.counsellor_id, s.time, s.available
  FROM public.counsellor_slots s
  WHERE s.counsellor_id = _counsellor_id
    AND s.available = true
  ORDER BY s.time;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_slots(text) TO authenticated;
