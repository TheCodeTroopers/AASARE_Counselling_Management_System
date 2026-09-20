-- Migration: Unify counsellor slots and availability to use UUID instead of legacy slugs
-- This fixes the split-brain issue where counsellors saved slots under a slug (e.g. "deepika-bv")
-- but the student booking page queried them by UUID.

-- 1. Update counsellor_slots to use UUIDs instead of slugs
UPDATE public.counsellor_slots cs
SET counsellor_id = p.id::text
FROM public.profiles p
WHERE cs.counsellor_id = p.counsellor_slug
  AND cs.counsellor_id != p.id::text;

-- 2. Update counsellor_availability to use UUIDs instead of slugs
UPDATE public.counsellor_availability ca
SET counsellor_id = p.id::text
FROM public.profiles p
WHERE ca.counsellor_id = p.counsellor_slug
  AND ca.counsellor_id != p.id::text;

-- 3. Simplify the RLS function to just return the user's UUID
-- Since all slots now use the UUID, we don't need the slug mapping anymore
CREATE OR REPLACE FUNCTION public.get_my_counsellor_slug()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()::text;
$$;
