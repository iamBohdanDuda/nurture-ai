-- Migration: Clients can't write subscription_tier (or id/created_at after insert)
-- RevenueCat is the source of truth for Pro; nothing reads subscription_tier today, but a
-- user-writable billing column is a trap. Postgres ignores a column REVOKE while a table-wide
-- grant exists, so replace the table-wide INSERT/UPDATE grants with the columns the app writes.

REVOKE INSERT, UPDATE ON public.users FROM anon, authenticated;

GRANT INSERT (id, email, first_name, pregnancy_start_date, blood_type, emergency_contact)
  ON public.users TO authenticated;
GRANT UPDATE (first_name, pregnancy_start_date, blood_type, emergency_contact)
  ON public.users TO authenticated;
