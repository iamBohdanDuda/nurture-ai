# Current Project Gaps & Known Issues

## 1. Meal Scanner AI Integration
- **[RESOLVED]** Mismatch in AI Response Schema, Hardcoded Macros, and Silent Failures have been fixed. The edge function now returns macros and meal_name, and throws proper errors.

## 2. API / Services
- **[RESOLVED]** Missing UI Error Handling in `VitaminChecklist` is fixed; an Alert is now shown.
- **[RESOLVED]** QueryClient retry storm suppressed on network/DNS errors (`src/services/api.ts`).
- **[RESOLVED]** Defensive `try/catch` and offline fallbacks added to `chatService.ts` for guest/offline operation.

## 3. Environment Config & AI Providers
- **[RESOLVED for local Expo development]** `EXPO_PUBLIC_GEMINI_API_KEY` and `EXPO_PUBLIC_GEMINI_MODEL` (`gemini-3.1-flash-lite`) are active in `.env`. `chatService` includes direct Gemini REST fallback with tool calling when edge functions or remote Supabase are unavailable.
- **[Production Note]** When deploying Supabase Edge Functions, set `OPENAI_API_KEY` / `GEMINI_API_KEY` in Supabase Secrets (`supabase secrets set`).

## 4. UI & Layout Visibility
- **[RESOLVED]** Chat screen header & `AIProviderSelector` low contrast fixed: elevated white pill with `#ED64A6` active badge, clear `#475569` inactive state, high-contrast header gradient, and boxed weekly message limit progress card.

## 5. Health Tracking Accuracy & Date Formatting
- **[RESOLVED]** Hydration yesterday synthetic log bug fixed in `trackingStore.ts`. Removed artificial yesterday log generation on day reset and sanitized legacy synthetic logs.
- **[RESOLVED]** Added `formatLogTimestamp` in `src/utils/date.ts` to display relative dates ("Yesterday, HH:MM" or "MMM DD, HH:MM") for older logs across `KickCounter`, `MealScanner`, and `SymptomLogger`.