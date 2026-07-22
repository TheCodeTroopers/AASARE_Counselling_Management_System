
CREATE TYPE public.appointment_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counsellor_id text NOT NULL,
  date date NOT NULL,
  slot_time text NOT NULL,
  reason text NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;

CREATE UNIQUE INDEX appointments_no_double_booking
  ON public.appointments (counsellor_id, date, slot_time)
  WHERE status IN ('pending', 'approved');

CREATE INDEX appointments_user_idx ON public.appointments (user_id, created_at DESC);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.get_booked_slots(_counsellor_id text, _date date)
RETURNS TABLE(slot_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.slot_time
  FROM public.appointments a
  WHERE a.counsellor_id = _counsellor_id
    AND a.date = _date
    AND a.status IN ('pending', 'approved');
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(text, date) TO authenticated;