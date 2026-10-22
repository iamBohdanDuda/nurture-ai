# Current Project Gaps & Known Issues

Last full audit: 2026-10-22 (security, design and AI integration). Fixed in that pass:
- LLM keys removed from the client bundle; all AI calls go through edge functions
- Edge functions authenticate via JWT (`_shared/auth.ts`); body `user_id` ignored; PostgREST URL building replaced with supabase-js
- Model allowlist, history caps, image size cap, server-side free limit (`ai_usage`)
- Meal scanner returns a real `is_pregnancy_safe`/`safety_analysis`; no more fabricated meals, water totals or mock AI replies
- Paywall buys through RevenueCat (`purchasePackage`/`restorePurchases`); `__DEV__` bypass only when RevenueCat isn't configured
- Full account deletion via the `delete-account` function; sign-out wipes local caches
- Repo migrations replaced with the real remote history (fetched with `supabase migration fetch`); new: `ai_usage`, users `blood_type`/`emergency_contact`
- Tool loop handles multiple rounds and parallel calls; date tool reads all 6 tables in the user's timezone
- AI context includes pregnancy week, trimester, due date and local datetime
- Append-only memory (`remember_fact`); `<update_notes>` tag protocol removed
- Red-flag keyword triage prepends a fixed urgent-care notice

## Open / deploy steps
- Rotate any Gemini/Groq/OpenAI key that was ever in `EXPO_PUBLIC_*`; set `GEMINI_API_KEY`, `GROQ_API_KEY` (optional), `REVENUECAT_SECRET_KEY` via `supabase secrets set`
- Done 2026-10-22: keys rotated, secrets set, functions deployed (all three return 401 without a user JWT), live RLS checked (clean)
- Run `npx supabase db push` to apply 20260807000000 (ai_usage), 20260807000001 (users fields) and 20260807000002 (clients can't write subscription_tier). Chat returns 502 until ai_usage exists.
- Without `REVENUECAT_SECRET_KEY`, the server allows unlimited messages (fail open), and also fails open during RevenueCat outages
- Paywall prices are hard-coded text; they should come from `pkg.product.priceString`
- Offline-created chats (`chat-<ts>` ids) never sync to Supabase
- `authStore.user` (blood type, emergency contact) is still persisted in plain AsyncStorage
- Red-flag triage is a keyword heuristic (negations trigger it too)
