# project.md — Lingona System Context

## What Is Lingona

Lingona is an AI-powered English speaking coach for Vietnamese learners.
Core philosophy: **"Open → Speak → Improve → See it"** — user must be speaking within 10 seconds.

The product is **speaking-first**. Writing and grammar are future expansions.

---

## Core Components

### 1. Conversation Engine (`backend/src/services/scenarioService.js`)
- Handles IELTS speaking exam and free-form scenario conversations.
- IELTS uses an **explicit state machine** (not heuristics or turn counts).
- State is persisted in PostgreSQL (`session_meta` JSONB column).
- Each `submitTurn` call reads current state → processes → advances to next state.
- State transitions are logged in `transitionHistory` for auditability.

### 2. Voice System
- **TTS (Examiner voice):** `backend/src/providers/tts/` — factory pattern.
  - `TTS_PROVIDER=openai` → OpenAI Audio API → mp3 buffer → streamed to frontend.
  - `TTS_PROVIDER=mock` → silent no-op (dev default).
- **STT (User voice):** Web Speech API in browser (`hooks/useVoiceInput.ts`).
  - Chrome/Edge only. Falls back to text input gracefully.
- **Audio lifecycle in `IeltsConversation.tsx`:**
  - `playTTS(text, autoMic)` → fetch audio blob → `new Audio()` → play.
  - `audio.onended` → `setExaminerSpeaking(false)` → auto-start mic if `autoMic=true`.

### 3. State Management
- **Backend:** IELTS state in `session_meta` JSONB (PostgreSQL). Authoritative.
- **Frontend:** React `useState` mirrors backend phase. `IeltsConversation` reads `result.ieltsState` on every `submitTurn` response.
- **Auth:** Zustand store (`authStore.ts`) with access token in memory, refresh token in httpOnly cookie.
- **Guest system:** UUID in localStorage → migrates to real account on login/register.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| Backend | Node.js, Express, PostgreSQL |
| AI | OpenAI GPT-4o-mini (conversation) + OpenAI TTS (voice) |
| Speech input | Web Speech API (browser-native) |
| Speech scoring | Azure Speech REST API |
| Storage | Mock (dev) / Cloudflare R2 (prod) |
| Auth | JWT (access token in memory, refresh token in httpOnly cookie) |
| Migrations | node-pg-migrate |
| Deploy | Railway (backend + DB), Vercel or Railway (frontend) |

---

## Current Priorities

1. **UX realism** — the IELTS exam must feel like a real exam room, not a chat app.
2. **Smooth speaking flow** — TTS plays → mic auto-starts → user speaks → response appears. No stuck states.
3. **Reliability** — state machine must reach `complete` via every valid path without getting stuck.
4. **Auth correctness** — protected features must reject guests before they start (not mid-session).

---

## Key File Locations

| Path | What it does |
|---|---|
| `frontend/components/IeltsConversation.tsx` | IELTS UI — all 8 phases, TTS lifecycle, state machine mirroring |
| `frontend/components/IeltsTimer.tsx` | Countdown timer (60s prep / 120s speak) — no memory leaks |
| `frontend/components/ScenarioConversation.tsx` | Free-form scenario conversation (non-IELTS) |
| `frontend/components/ScenarioSummary.tsx` | Score summary screen with animated bars |
| `frontend/hooks/useVoiceInput.ts` | Web Speech API wrapper — mic start/stop/transcript |
| `frontend/lib/api.ts` | All HTTP calls — auth-aware, 401 retry, TTS blob fetch |
| `frontend/lib/stores/authStore.ts` | Zustand store — user, accessToken, loading state |
| `backend/src/services/scenarioService.js` | IELTS state machine + AI prompt builder + session lifecycle |
| `backend/src/providers/ai/openaiProvider.js` | OpenAI GPT-4o-mini — 5s timeout, mock fallback |
| `backend/src/providers/tts/openaiTts.js` | OpenAI TTS — mp3 buffer output |
| `backend/src/providers/tts/ttsProvider.js` | TTS factory — env-driven provider selection |
| `backend/src/repositories/scenarioRepository.js` | All DB queries for sessions and turns |

---

## What Is NOT Lingona's Focus Right Now

- Grammar correction (Phase 8 — delayed)
- Writing evaluation (Phase 8 — delayed)
- Classrooms / teacher dashboards (Phase 9 — delayed)
- Admin CMS (Phase 6 — not started)
- Monetization (Phase 7 — not started)
