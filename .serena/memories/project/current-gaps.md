# Current Project Gaps & Known Issues

Audits: 2026-10-22 (security, design, AI integration) and 2026-10-23 (code, cost, data safety, lean).
Most findings were resolved on 2026-10-23. What's left is listed under "Open".

## Open
- Not yet smoke-tested with a real signed-in user: chat send and meal scan against the new `get_ai_usage()`/`increment_ai_scans()`. Deployed 2026-10-23: migrations pushed first, then chat-orchestrator + meal-scanner. Both return 401 without a JWT.
- Removing native deps (bottom-sheet, chart-kit, nitro-modules, worklets-core, expo-sharing, view-shot) needs one new dev/release build to confirm.
- Paywall copy promises features that don't exist: "OB-GYN Reviewed", "doctor-vetted advice", "export charts for your OB-GYN", contraction logs. This is a product/legal call.
- Calendar dots (`PregnancyCalendarScreen.tsx` `logged_at?.startsWith(dateStr)`) compare a UTC ISO string to a local date, so late-evening logs land on the next day.
- On-device log history is capped at 500 per type (`trackingStore.ts` MAX_LOGS). The calendar and averages only see the device copy, never server history.
- Chat titles are fixed at creation (first 30 chars). The local title logic in `chatService.sendMessage` never reaches the server row.
- No test runner. Only `chat-orchestrator/helpers.test.ts` (run with `node`). Decided 2026-10-23: add jest-expo only when there's more logic worth covering.

## Kept on purpose (decisions)
- `reminders`/`domain_knowledge` tables, `src/config/notifications.ts`, `expo-notifications`: unused but kept for a planned reminders/RAG feature (user decision 2026-10-23).
- Chat is text-only. The attach button was removed because the model never received images. Meal photos go through the Meal Scanner, which has its own limit.
- Free limits are check-then-increment: count only after the model answered (chat: 10 messages/week, scans: 5/week incl. non-food photos). Parallel requests can overshoot by 1.
- RevenueCat fail-open (server) and keep-last-tier on SDK error (client). The server re-checks, so a stale client "premium" unlocks nothing.
- Ponytail-marked: UTC-offset day boundary in the date tool, SecureStore session chunking, append-only memory.
- Accepted risks (user confirmed 2026-10-23):
  - Red-flag triage is a keyword heuristic, so negations trigger it too. A false alarm is safer than a missed warning sign.
  - The cached profile (blood type, emergency contact) stays in plain AsyncStorage like all other caches. If encryption is needed later, encrypt all caches together, not just the profile.

## Resolved 2026-10-23
1. Meal scans metered server-side (`ai_usage.scans`, `increment_ai_scans`). The client shows an upgrade alert on `free_limit_reached`.
2. Failed/blocked AI calls no longer burn a free message. `weeklyUsage()` + `isPremium()` live in `_shared/auth.ts`. The client counter also bumps only on success.
3. Tracking log methods throw instead of returning synthetic rows. All callers alert. Water saves before counting locally, and a failed vitamin tick is undone. Home-screen water/prenatal taps now save too (they were local-only).
4. Chat photo attach removed (see decisions).
5. Onboarding retry: a duplicate profile row (23505) falls back to an update (upsert can't work: no UPDATE grant on id/email). Errors are shown. The dead "missing column" fallbacks were removed (all migrations confirmed applied remotely).
6. Weekly averages: water is grouped by date, and weight is labeled "Weight Today".
7. chat_history insert policy requires the chat to belong to the caller (pushed 2026-10-23).
8. Tracking log arrays capped at 500.
9/17. Duplicate local-chat save effect removed from `useChat`, so old chats no longer jump to the top.
10. RevenueCat SDK error keeps the last tier.
11-13, 16. Deleted OfflineBanner, LoadingOverlay, uiStore (+ STORAGE_KEYS.UI), darkTheme, subscriptionStore entitlements/checkAccess, MEMORY_CONDENSE_INTERVAL, queryKeys.metrics/reminders, mmkv_spec.txt, trackingStore.addHydrationLog.
15. Removed 6 unused deps (incl. react-native-view-shot, which the audit missed).
- Also: the AI context no longer double-counts water (local + server copies). `createChat` throws instead of making local-only `chat-<ts>` chats that never sync. Paywall prices, save % and trial come from RevenueCat offerings (hard-coded values are only the preview fallback).

Verified 2026-10-23: `npm run typecheck` clean; `deno check` clean on all edge functions (`DENO_NO_PACKAGE_JSON=1 npx deno@2 check --node-modules-dir=none ...` from `supabase/functions`); helpers test passes; `db push --dry-run` lists only the two new migrations. Not verified: device behavior, native build after dep removal.
