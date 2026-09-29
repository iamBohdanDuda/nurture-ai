-- Migration: Create Tracking Tables for Pregnancy Helper
-- Date: 2026-08-04
-- Creates: hydration_logs, symptom_logs, meal_logs, vitamin_logs, weight_logs, kick_logs
-- Also: Adds tool_call_hint to chat_history if missing

-- ============================================================
-- 1. hydration_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  daily_target_ml INTEGER NOT NULL DEFAULT 2300,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hydration logs"
  ON public.hydration_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration logs"
  ON public.hydration_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration logs"
  ON public.hydration_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hydration logs"
  ON public.hydration_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_hydration_logs_user_date
  ON public.hydration_logs (user_id, logged_at DESC);

-- ============================================================
-- 2. symptom_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  pregnancy_week INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptom logs"
  ON public.symptom_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom logs"
  ON public.symptom_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom logs"
  ON public.symptom_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptom logs"
  ON public.symptom_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_symptom_logs_user_date
  ON public.symptom_logs (user_id, logged_at DESC);

-- ============================================================
-- 3. meal_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  photo_url TEXT,
  is_pregnancy_safe BOOLEAN NOT NULL DEFAULT true,
  safety_analysis TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs"
  ON public.meal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal logs"
  ON public.meal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal logs"
  ON public.meal_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal logs"
  ON public.meal_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_meal_logs_user_date
  ON public.meal_logs (user_id, logged_at DESC);

-- ============================================================
-- 4. vitamin_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vitamin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vitamin_name TEXT NOT NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vitamin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitamin logs"
  ON public.vitamin_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitamin logs"
  ON public.vitamin_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitamin logs"
  ON public.vitamin_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitamin logs"
  ON public.vitamin_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_vitamin_logs_user_date
  ON public.vitamin_logs (user_id, logged_at DESC);

-- ============================================================
-- 5. weight_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg REAL NOT NULL,
  pregnancy_week INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs"
  ON public.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON public.weight_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_weight_logs_user_date
  ON public.weight_logs (user_id, logged_at DESC);

-- ============================================================
-- 6. kick_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.kick_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kick_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  pregnancy_week INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kick_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kick logs"
  ON public.kick_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kick logs"
  ON public.kick_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kick logs"
  ON public.kick_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kick logs"
  ON public.kick_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_kick_logs_user_date
  ON public.kick_logs (user_id, logged_at DESC);

-- ============================================================
-- 7. Add tool_call_hint to chat_history (if missing)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_history'
      AND column_name = 'tool_call_hint'
  ) THEN
    ALTER TABLE public.chat_history ADD COLUMN tool_call_hint TEXT;
  END IF;
END
$$;
