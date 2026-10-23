-- Migration: chat_history rows can only be added to one of the caller's own chats
-- The old check only compared user_id, so a user could attach rows to someone else's chat_id.

DROP POLICY IF EXISTS "Users can insert own chats." ON public.chat_history;
CREATE POLICY "Users can insert own chats." ON public.chat_history FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.chats WHERE chats.id = chat_history.chat_id AND chats.user_id = auth.uid())
);
