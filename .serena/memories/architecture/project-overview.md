# NurtureAI — Project Architecture Overview

## Project Type
AI-driven pregnancy assistant mobile app.

## Tech Stack
- **Framework:** Expo SDK 55 (React Native, latest stable Feb 2026)
- **Routing:** expo-router v4 (file-based)
- **UI/Styling:** @shopify/restyle (type-safe theme tokens)
- **State Management:** Zustand 5.x (slice pattern, persisted via MMKV)
- **Local Cache:** react-native-mmkv 3.x (synchronous, C++ JSI)
- **Data Fetching:** @tanstack/react-query 5.x (server state)
- **Chat UI:** react-native-gifted-chat v3.3.2 (full TS rewrite)
- **Animations:** react-native-reanimated v3 (custom animations, NO Lottie)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Monetization:** RevenueCat (react-native-purchases)
- **AI:** LLM via Supabase Edge Functions (GPT-4o-mini / Gemini Flash)

## Architecture Pattern
- Feature-based module organization in `src/features/`
- Thin routing layer in `app/` (expo-router re-exports feature screens)
- Domain-isolated Zustand stores in `src/stores/`
- TanStack Query for server state, Zustand for client state
- MMKV for persistence (30-100x faster than AsyncStorage)

## Key Features
1. Auth + Onboarding (pregnancy date capture)
2. AI Chat with dual-memory system (RAG + user MD summary)
3. Meal photo → AI nutrition extraction
4. Health tracking (weight, water, vitamins, symptoms)
5. Push notification reminders
6. Freemium paywall (10 msgs/week free)
7. Shareable pregnancy card (UI-to-image export)

## Design Language
- Pastels: blush pink, sage green, soft lavender
- High whitespace, rounded corners (16px+)
- Inter font family
- Lottie animations for milestones

## Key Directories
- `app/` — expo-router routes only
- `src/features/` — isolated feature modules (auth, chat, tracking, etc.)
- `src/stores/` — Zustand global stores
- `src/theme/` — @shopify/restyle theme definition
- `src/components/` — shared design system components
- `src/config/` — Supabase, RevenueCat, notification setup
