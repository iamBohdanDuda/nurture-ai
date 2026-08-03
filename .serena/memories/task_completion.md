# NurtureAI — Task Completion Checklist

When a task is completed, check:

1. **TypeScript**: Run `npm run typecheck` (or `npx tsc --noEmit`) — no errors
2. **Naming**: Files follow conventions per `architecture/conventions` memory
3. **No direct imports**: Features use `@/` path aliases, not relative `../../`
4. **Store changes**: If Zustand stores were modified, check `partialize` for persistence
5. **Theme tokens**: No inline hex colors — use semantic theme color names
6. **Component size**: Screens < ~200 lines, components < ~150 lines
7. **Feature isolation**: New code in the right `src/features/*/` module
8. **Services layer**: All Supabase calls go through feature `/services/` files
9. **Route files thin**: `app/` route files only re-export from `src/features/`
