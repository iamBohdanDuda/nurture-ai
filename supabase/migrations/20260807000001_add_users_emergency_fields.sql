-- Migration: Store pregnancy-card fields on the profile
-- The app already reads/writes these (src/types/database.ts). Without the columns it kept them
-- only on the device, where the sign-out wipe now removes them.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
