# Future Plans

## Third-party agents reading user data (decided 2026-10-23)

Feature driver: external AI assistants (ChatGPT, Claude, custom agents) should be able to read users' NurtureAI log data.

Decision: **do NOT build MCP-first.** The in-app `chat-orchestrator` tool layer already covers internal AI reads; MCP adds a protocol, per-user OAuth and a deploy surface with no client to serve yet. Build bearer-token access first; wrap it in MCP later if a marketplace/partner needs it.

### What the feature requires (from the 2026-10-23 discussion)
1. Identity + consent — user explicitly grants one named external agent read access.
2. Scoped, revocable credential — the agent NEVER holds the user's real Supabase JWT.
3. Read-only, minimized surface — the 6 log tables only in v1; no memory, no chats, no writes/deletes.
4. Audit per read (doubles as the GDPR consent receipt). Health-grade data rules are non-negotiable: hash tokens, scopes, expiry, instant revoke, rate limit per token.

### V1 plan (~150 lines, follows existing patterns)
- Table `agent_tokens(id, user_id, token_hash, scopes, created_at, expires_at, revoked_at, last_used_at)` — RLS: users manage their own tokens. Token format `nai_live_...`, plaintext shown once, stored as SHA-256.
- Edge function `issue-agent-token` — creates a token from the app ("Connect an AI assistant" screen in settings); agent receives it by user copy/paste or QR.
- Edge function `agent-api` — bearer-token auth: verify hash → load user → mint a short-lived JWT for that user (HMAC with `GOTRUE_JWT_SECRET`) → serve reads as that user anon-key client, so **RLS stays the enforcement layer** (same pattern as `getCaller()` in `supabase/functions/_shared/auth.ts`).
- Expose the same read surface the chat tools use: `LOG_TABLES` columns in `chat-orchestrator/index.ts` (kicks, water, meals, symptoms, weight, vitamins) with date/recent params.
- Table `agent_access_log(token_id, tool, params, at)` — one row per request; also your audit/consent receipt.
- Defaults: scopes enum `logs:read` only; `expires_at` ≤ 90 days; instant revoke from the token list screen.

### Later — MCP wrapper (only when there is a real consumer)
- Deploy a second edge function implementing MCP over Streamable HTTP whose tools forward to the same read logic and the same token auth (token-authenticated MCP servers are a normal consumer pattern).
- Full OAuth 2.1 (consent screen, PKCE, dynamic client registration) only when an MCP marketplace or named partner client requires it — that is a product decision, not plumbing.
- Do not skip: agents must never get anything stronger than a scoped token; nothing with write or delete.
