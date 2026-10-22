# NurtureAI — Coding Conventions

## Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Screens | PascalCase + Screen suffix | ChatScreen.tsx |
| Components | PascalCase | ChatBubble.tsx |
| Hooks | camelCase + use prefix | useChat.ts |
| Services | camelCase + Service suffix | chatService.ts |
| Stores | camelCase + Store suffix | chatStore.ts |
| Types | PascalCase | ChatMessage |
| Constants | UPPER_SNAKE_CASE | FREE_MESSAGE_LIMIT |

## File Size Guidelines
- Screens: Max ~200 lines
- Components: Max ~150 lines
- Hooks: Max ~100 lines
- Services: Max ~100 lines
- Stores: Max ~80 lines

## State Management Rules
- Server state → TanStack Query (hooks in features/*/hooks/)
- Client state → Zustand stores (src/stores/)
- Persist via AsyncStorage (`src/stores/middleware/asyncStorage.ts`), use partialize for selective persistence
- Export custom hooks from stores, not raw useStore

## Supabase Integration Rules
- Client initialized in src/config/supabase.ts; session stored in expo-secure-store (AsyncStorage on web)
- All DB calls go through feature-specific services/ files
- Query keys follow factory pattern in src/services/api.ts
- RLS enforced, client only uses anon key
- Never put LLM/provider keys in `EXPO_PUBLIC_*` (they get inlined into the bundle). All model calls go through edge functions.
- Edge functions authenticate with `getCaller(req)` from `supabase/functions/_shared/auth.ts` and use the caller-scoped client (RLS applies); never trust a `user_id` from the request body.
- Migrations need unique 14-digit timestamps (`YYYYMMDDHHMMSS_name.sql`), created with `npx supabase migration new` and applied with `npx supabase db push`, never by hand in the dashboard, so the repo and remote histories stay identical.

## Theme Rules
- All styling through @shopify/restyle theme tokens
- No inline hex colors — use semantic color names
- Border radius minimum: 'l' (16px) for cards
- Font: Inter family from @expo-google-fonts/inter
