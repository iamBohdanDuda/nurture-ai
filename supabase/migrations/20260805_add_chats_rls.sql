CREATE POLICY "Users can view own chat sessions." ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions." ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions." ON public.chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions." ON public.chats FOR DELETE USING (auth.uid() = user_id);
