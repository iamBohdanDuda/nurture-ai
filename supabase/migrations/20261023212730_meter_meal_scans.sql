-- Migration: Free-tier meal scan counter, and a way to read the counters without bumping them
-- The edge functions now check the count first and increment only after the model answered,
-- so a failed or blocked call doesn't use up a free message or scan.

ALTER TABLE public.ai_usage ADD COLUMN IF NOT EXISTS scans INTEGER NOT NULL DEFAULT 0;

-- Same week rule as increment_ai_usage(); RLS limits it to the caller's own row.
CREATE OR REPLACE FUNCTION public.get_ai_usage()
RETURNS TABLE (messages INTEGER, scans INTEGER)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT u.messages, u.scans FROM public.ai_usage u
  WHERE u.user_id = auth.uid() AND u.week_start = date_trunc('week', now())::date;
$$;

CREATE OR REPLACE FUNCTION public.increment_ai_scans()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.ai_usage (user_id, week_start, scans)
  VALUES (auth.uid(), date_trunc('week', now())::date, 1)
  ON CONFLICT (user_id, week_start) DO UPDATE SET scans = public.ai_usage.scans + 1
  RETURNING scans;
$$;

REVOKE EXECUTE ON FUNCTION public.get_ai_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ai_usage() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_ai_scans() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_ai_scans() TO authenticated;
