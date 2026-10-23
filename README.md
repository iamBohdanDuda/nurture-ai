# NurtureAI

An AI-powered pregnancy companion. NurtureAI helps expectant mothers understand their day-to-day health: it chats with them like a caring medical ally, remembers what matters about them, and turns a photo of a meal into a nutrition and pregnancy-safety check — always nudging them toward real medical care when something sounds dangerous.

> Not a medical device. The app offers supportive guidance and always recommends consulting a healthcare provider for anything serious.

---

## About

Pregnancy tracking apps usually give you checkboxes. NurtureAI adds a voice: a private assistant that knows your week, your history, and your worries, and answers in plain language at any hour of the night — the hours a doctor can't answer, but questions of course still come.

**What a user can do:**

- **Talk to a personal pregnancy assistant** — a chat that knows your current pregnancy week, trimester, due date, and everything you've asked it to remember (allergies, conditions, diet, family context), with a week-by-week fruit-size comparison, a prenatal-calendar of checkups, and a shareable digital pregnancy card.
- **Log the small vital signs daily** — water intake, meals & calories, symptoms with severity, vitamins, weight, and fetal kick-count sessions. Data survives offline, syncs to the cloud when you sign in, and is theirs alone.
- **Point the camera at a meal** — the app estimates calories and macros, and specifically checks the finished dish against real pregnancy risks (listeria, raw fish, high-mercury fish, alcohol, caffeine) and explains the concern in one sentence.
- **Own their data end-to-end** — one-tap account deletion that removes the account *and* every stored record, server-side.

**Why the medically-cautious design matters:** the assistant is deliberately built to warn early rather than diagnose. Certain phrases in a user's message ("bleeding", "baby isn't moving", "water broke"…) always trigger a fixed urgent-care notice appended on top of whatever the AI said — a deterministic safety net that no model hallucination can override.

---

## The AI (the heart of the project)

The interesting engineering of this app is *how* AI is wired in — everything sensitive lives server-side, and the model is treated as an untrusted collaborator, not a database.

- **A server-side orchestrator** ("chat-orchestrator", a Supabase Edge Function) stands between the app and the AI. The client never touches a model API key; it can only talk to the orchestrator, which authenticates every request with the user's session. Keys, quotas, model switching and logging all live on the server.
- **Model-agnostic by design.** The orchestrator speaks two dialects: Google Gemini (default) and any OpenAI-compatible chat API (Groq, OpenAI) — same conversation, same tools, translated on the fly. Client picks from a server-enforced allowlist; anything unknown silently falls back to the default model.
- **The assistant can actually do things, not just answer.** It uses tool calls (function calling) to:
  - **read the user's real health data** — any log category, for a given day or "the last N entries, sorted however" — so questions like *"am I drinking enough water this week?"* are answered from the user's actual records, not invented ones;
  - **add to a persistent, structured memory** (due date, conditions, allergies, preferences) stored as markdown under plain-language sections, and appended — never overwritten — so one bad model call can't rewrite or wipe a user's history.
- **Safety by layering.** A keyword-based red-flag detector runs *outside* the model and prepends an urgent-care warning for danger signs — the "fail safe" path doesn't depend on the model behaving.
- **Fair, metered usage.** Free users get a weekly chat allowance counted in the database by a function users can't write — reinstalling or deleting chats can't reset it. Pro subscribers (real app-store purchases via RevenueCat) are verified server-side, and the app fails *open* on billing outages so paying users are never locked out.
- **Photo understanding for meal safety.** A second AI pipeline ("meal-scanner") takes the photo, returns a strictly-validated structured result (name, calories, macros, safety verdict, safety explanation), and refuses non-food images. The app additionally validates the response before trusting it.
- **Privacy as the security model.** Health data lives in per-user, row-protected tables — the database itself enforces "you can only ever see your own rows", even for server requests. Users can read and edit their memory notes; the free-usage counter is the only thing they can't touch.

---

## Installation

**Prerequisites:** Node.js, npm, the [Expo CLI](https://docs.expo.dev/get-started/installation/), and a free [Supabase](https://supabase.com) project.

```bash
git clone <repo-url>
cd pregnancy-helper
npm install
```

Create a `.env` file in the project root (never commit it):

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# optional, for testing in-app purchases in Expo Go:
EXPO_PUBLIC_RC_TEST_STORE_KEY=...
```

On the Supabase side, apply the database migrations and set the server-side secrets for the edge functions:

```bash
npx supabase db push
npx supabase functions deploy chat-orchestrator meal-scanner delete-account
npx supabase secrets set GEMINI_API_KEY=...           # required for AI chat & meal scanning
npx supabase secrets set REVENUECAT_SECRET_KEY=...    # required to enforce the free-tier limit
```

Start the app:

```bash
npm start           # Expo dev server — open in Expo Go (Android/iOS), or:
npm run ios         # iOS simulator
npm run android     # Android emulator
```

Type checks run with:

```bash
npm run typecheck
```

---

## What this project demonstrates

- Shipping a production-track AI feature: server-side orchestration, multi-provider model support, tool calling over real user data, and usage metering.
- Treating AI output as untrusted: schema validation, deterministic safety nets, append-only persistence, and database-level access control.
- Local-first mobile architecture that keeps working offline and never silently loses user data.
