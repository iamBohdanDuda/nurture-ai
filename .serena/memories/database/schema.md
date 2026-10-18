# Database Schema (Supabase)

## Tracking Tables
- `meal_logs`: `id`, `user_id`, `meal_name`, `description`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `photo_url`, `is_pregnancy_safe`, `safety_analysis`, `logged_at`
- `symptom_logs`: `id`, `user_id`, `symptom_name`, `severity` (1-5), `pregnancy_week`, `notes`, `logged_at`
- `hydration_logs`: `id`, `user_id`, `amount_ml`, `daily_target_ml`, `logged_at`
- `kick_logs`: `id`, `user_id`, `duration_seconds`, `kick_count`, `logged_at`
- `vitamin_logs`: `id`, `user_id`, `vitamin_name`, `logged_at`
- `weight_logs`: `id`, `user_id`, `weight_kg`, `pregnancy_week`, `logged_at`

## Chat & Memory Tables
- `chats`: `id`, `user_id`, `title`, `created_at`, `updated_at`
- `chat_history`: `id`, `user_id`, `chat_id`, `role` (`user` | `assistant`), `content`, `image_url`, `tool_call_hint`, `created_at`
- `user_memory`: `id`, `user_id`, `markdown_summary`, `updated_at`

## Users & Profiles
- `users`: `id` (references auth.users), `email`, `name`, `pregnancy_start_date`, `due_date`, `blood_type`, `emergency_contact`, `tier`, `created_at`, `updated_at`

Note: RLS policies enforced on all tables (`auth.uid() = user_id`). Unauthenticated or guest requests are safely handled locally by the client.