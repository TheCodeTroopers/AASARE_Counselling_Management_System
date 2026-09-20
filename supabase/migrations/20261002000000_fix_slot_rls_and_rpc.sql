-- Fix 1: Update get_my_counsellor_slug() to fall back to auth.uid()::text
-- when no counsellor_slug is set (new admin-created counsellors).
CREATE OR REPLACE FUNCTION public.get_my_counsellor_slug()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(counsellor_slug, id::text)
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Fix 2: Update handle_new_user trigger to auto-set counsellor_slug = id
-- for new counsellors so RLS works immediately after creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');
  INSERT INTO public.profiles (id, email, full_name, usn, department, year, role, counsellor_slug)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'usn', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'department', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'year', ''),
    v_role,
    -- For counsellors, set counsellor_slug to their UUID so RLS works immediately
    CASE WHEN v_role = 'counsellor' THEN NEW.id::text ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE
    SET counsellor_slug = CASE
      WHEN EXCLUDED.role = 'counsellor' AND public.profiles.counsellor_slug IS NULL
      THEN EXCLUDED.id::text
      ELSE public.profiles.counsellor_slug
    END;
  RETURN NEW;
END;
$$;

-- Fix 3: Backfill counsellor_slug = id for any existing counsellors
-- who were created via admin and don't have a slug yet.
UPDATE public.profiles
SET counsellor_slug = id::text
WHERE role = 'counsellor'
  AND counsellor_slug IS NULL;

-- Fix 4: Fix the get_available_slots RPC to return "slot_time" not "time"
-- so it matches the TypeScript SlotRow type used on the frontend.
DROP FUNCTION IF EXISTS public.get_available_slots(text);

CREATE OR REPLACE FUNCTION public.get_available_slots(_counsellor_id text)
RETURNS TABLE(id uuid, counsellor_id text, slot_time text, available boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.counsellor_id, s.slot_time, s.available
  FROM public.counsellor_slots s
  WHERE s.counsellor_id = _counsellor_id
    AND s.available = true
  ORDER BY s.slot_time;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_slots(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots(text) TO anon;

-- Fix 5: Also fix get_unavailable_dates to be accessible by anon (students not logged in)
GRANT EXECUTE ON FUNCTION public.get_unavailable_dates(text) TO anon;
