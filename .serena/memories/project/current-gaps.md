# Current Project Gaps & Known Issues

## 1. Meal Scanner AI Integration
- **[RESOLVED]** Mismatch in AI Response Schema, Hardcoded Macros, and Silent Failures have been fixed. The edge function now returns macros and meal_name, and throws proper errors.

## 2. API / Services
- **[RESOLVED]** Missing UI Error Handling in `VitaminChecklist` is fixed; an Alert is now shown.

## 3. Environment Config
- `OPENAI_API_KEY` and `GEMINI_API_KEY` need to be correctly set in the Supabase edge function environment.