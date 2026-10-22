-- Migration: Server-side AI message counter for the free tier
-- Users can read their own count but never write it; the chat-orchestrator edge function
-- bumps it through increment_ai_usage(), so deleting chats or reinstalling doesn't reset it.

CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  messages INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, week_start)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai usage" ON public.ai_usage;
CREATE POLICY "Users can view own ai usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);

-- Weeks start on Monday, matching getWeekStart() in src/stores/chatStore.ts.
CREATE OR REPLACE FUNCTION public.increment_ai_usage()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.ai_usage (user_id, week_start, messages)
  VALUES (auth.uid(), date_trunc('week', now())::date, 1)
  ON CONFLICT (user_id, week_start) DO UPDATE SET messages = public.ai_usage.messages + 1
  RETURNING messages;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_ai_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage() TO authenticated;
