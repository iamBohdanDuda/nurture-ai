CREATE EXTENSION IF NOT EXISTS vector;

-- 1. users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  pregnancy_start_date DATE NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. user_memory Table
CREATE TABLE IF NOT EXISTS public.user_memory (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  markdown_summary TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. chat_history Table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. health_metrics Table
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'calories', 'water', 'symptom', 'vitamin')),
  value NUMERIC NOT NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('medication', 'hydration', 'appointment')),
  cron_schedule TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- 6. domain_knowledge Table
CREATE TABLE IF NOT EXISTS public.domain_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT,
  content TEXT,
  embedding VECTOR(1536)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_knowledge ENABLE ROW LEVEL SECURITY;

-- Create Policies for Users
CREATE POLICY "Users can view own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create Policies for User Memory
CREATE POLICY "Users can view own memory." ON public.user_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory." ON public.user_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory." ON public.user_memory FOR UPDATE USING (auth.uid() = user_id);

-- Create Policies for Chat History
CREATE POLICY "Users can view own chats." ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats." ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats." ON public.chat_history FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Health Metrics
CREATE POLICY "Users can view own health metrics." ON public.health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health metrics." ON public.health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health metrics." ON public.health_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health metrics." ON public.health_metrics FOR DELETE USING (auth.uid() = user_id);

-- Create Policies for Reminders
CREATE POLICY "Users can view own reminders." ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders." ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders." ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders." ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- Domain Knowledge is read-only for users (populated securely)
CREATE POLICY "Public read access for domain knowledge" ON public.domain_knowledge FOR SELECT USING (true);
;
