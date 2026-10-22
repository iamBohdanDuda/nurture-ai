# Database Schema (Supabase)

DDL lives in `supabase/migrations/`, and its versions match the remote history exactly (`20260327215359_00_init_schema.sql` creates users, user_memory, chat_history, reminders and domain_knowledge). Check with `npx supabase migration list` before adding migrations.

## Tracking Tables
- `meal_logs`: `id`, `user_id`, `meal_name`, `description`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `photo_url`, `is_pregnancy_safe`, `safety_analysis`, `logged_at` (safety fields come from the meal-scanner model)
- `symptom_logs`: `id`, `user_id`, `symptom_name`, `severity` (1-5), `pregnancy_week`, `notes`, `logged_at`
- `hydration_logs`: `id`, `user_id`, `amount_ml`, `daily_target_ml`, `logged_at`
- `kick_logs`: `id`, `user_id`, `duration_seconds`, `kick_count`, `pregnancy_week`, `notes`, `logged_at`
- `vitamin_logs`: `id`, `user_id`, `vitamin_name`, `notes`, `logged_at`
- `weight_logs`: `id`, `user_id`, `weight_kg`, `pregnancy_week`, `notes`, `logged_at`

## Chat & Memory Tables
- `chats`: `id`, `user_id`, `title`, `created_at`, `updated_at`
- `chat_history`: `id`, `user_id`, `chat_id`, `role` (`user` | `assistant`), `content`, `image_url`, `tool_call_hint`, `created_at`
- `user_memory`: `user_id` (PK), `markdown_summary`, `last_updated`. The AI appends via the `remember_fact` tool (sections: Profile, Medical & Safety, Preferences & Lifestyle, Ongoing Symptoms); users edit it in UserMemoryModal.
- `ai_usage`: `user_id`, `week_start` (Monday), `messages`. Users can read it but not write it; bumped by the `increment_ai_usage()` SECURITY DEFINER function, which chat-orchestrator calls to enforce the free weekly limit.

## Users & Profiles
- `users`: `id` (references auth.users), `email`, `first_name`, `pregnancy_start_date` (local `yyyy-MM-dd`), `blood_type`, `emergency_contact`, `subscription_tier`, `created_at`
- `subscription_tier` is not used for access decisions. RevenueCat entitlements are the source of truth (the client checks any active entitlement; the server checks via the REST API with `REVENUECAT_SECRET_KEY`).

Note: RLS is on for every table (`auth.uid() = user_id`, or `= id` for users); the only exception is `domain_knowledge`, which is public read-only by design. `user_memory` and `chat_history` reference `public.users`, which cascades from `auth.users`. Account deletion goes through the `delete-account` edge function (service role, `auth.admin.deleteUser`).
