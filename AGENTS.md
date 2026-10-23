# AGENTS — Universal Instructions for AI Coding Agents

This file (`AGENTS.md`) defines custom, persistent rules and instructions for **any** AI coding agent working in this repository (e.g., Claude Code, Codex, Cursor, Copilot, Gemini CLI, or others). Every agent should read and strictly follow these instructions across all conversations and tasks within this workspace.

## Custom Rules & Coding Standards
- **RESTRICT ACCESS TO .ENV**: The AI agent MUST NEVER read, open, view, grep, search, or print the contents of `.env` or any file containing secret API keys or credentials. Treat `.env` as strictly confidential and restricted. Never disclose or inspect secrets.
- **Never commit secrets**: API keys, tokens, and credentials must never appear in code, logs, commits, or migration files. Server-side logic (e.g., Supabase edge functions) should handle anything requiring elevated access.
- Example: "Ensure all React components use function declarations, not arrow functions."

## Working in This Repository
- Keep changes consistent with the existing structure, naming, and style of the codebase.
- Treat unfamiliar files or code as potential user work — investigate before modifying or deleting.
- Prefer small, focused changes with clear commit messages.

## Verification
- Run `npm run typecheck` before considering TypeScript/JavaScript changes complete.
- There are no dedicated test or lint scripts configured yet; report known unverified areas instead of assuming checks passed.
