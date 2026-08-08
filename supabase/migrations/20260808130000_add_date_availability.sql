-- Migration: Add counsellor_availability table for date-level availability
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.counsellor_availability (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id  text        NOT NULL,
  available_date date        NOT NULL,
  is_available   boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT counsellor_availability_unique UNIQUE (counsellor_id, available_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.counsellor_availability TO authenticated;
GRANT ALL ON public.counsellor_availability TO service_role;

CREATE TRIGGER counsellor_availability_set_updated_at
  BEFORE UPDATE ON public.counsellor_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.counsellor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counsellors can read own availability"
  ON public.counsellor_availability FOR SELECT
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug());

CREATE POLICY "Counsellors can insert own availability"
  ON public.counsellor_availability FOR INSERT
  TO authenticated
  WITH CHECK (counsellor_id = public.get_my_counsellor_slug());

CREATE POLICY "Counsellors can update own availability"
  ON public.counsellor_availability FOR UPDATE
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug())
  WITH CHECK (counsellor_id = public.get_my_counsellor_slug());

CREATE POLICY "Counsellors can delete own availability"
  ON public.counsellor_availability FOR DELETE
  TO authenticated
  USING (counsellor_id = public.get_my_counsellor_slug());

-- Public RPC function for student lookup (returns list of dates marked as unavailable)
CREATE OR REPLACE FUNCTION public.get_unavailable_dates(_counsellor_id text)
RETURNS TABLE(available_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.available_date
  FROM public.counsellor_availability a
  WHERE a.counsellor_id = _counsellor_id
    AND a.is_available = false;
$$;

GRANT EXECUTE ON FUNCTION public.get_unavailable_dates(text) TO authenticated;
