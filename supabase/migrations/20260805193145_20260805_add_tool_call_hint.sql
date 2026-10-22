ALTER TABLE public.chat_history ADD COLUMN IF NOT EXISTS tool_call_hint TEXT;
