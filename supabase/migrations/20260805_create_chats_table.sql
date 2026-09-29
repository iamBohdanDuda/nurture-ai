-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Add chat_id to chat_history
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE;

-- Insert a default chat for existing messages
DO $$
DECLARE
    u_id UUID;
    c_id UUID;
BEGIN
    FOR u_id IN SELECT DISTINCT user_id FROM public.chat_history WHERE chat_id IS NULL LOOP
        INSERT INTO public.chats (user_id, title) VALUES (u_id, 'Legacy Chat') RETURNING id INTO c_id;
        UPDATE public.chat_history SET chat_id = c_id WHERE user_id = u_id AND chat_id IS NULL;
    END LOOP;
END $$;
