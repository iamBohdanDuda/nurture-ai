# Database Schema (Supabase)

## Tracking Tables
- `meal_logs`: `id`, `user_id`, `meal_name`, `description`, `calories`, `macros` (jsonb with protein, carbs, fat), `is_safe_for_pregnancy`, `safety_notes`, `logged_at`
- `symptom_logs`: `id`, `user_id`, `symptom_name`, `severity` (1-10), `notes`, `logged_at`
- `hydration_logs`: `id`, `user_id`, `amount_ml`, `daily_target_ml`, `logged_at`
- `kick_logs`: `id`, `user_id`, `duration_minutes`, `kick_count`, `logged_at`
- `vitamin_logs`: Logs vitamins taken, tracked per user and day.

## Users
- `profiles` / `users`: Stores pregnancy due date, subscription status (RevenueCat integration).

Note: Uses RLS policies. Client queries should use Anon Key.