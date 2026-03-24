# decisions.md — Architectural Decisions & Constraints

Key decisions that are **locked** — do not change without explicit discussion.

---

## State Machine Location

**Decision:** IELTS state lives in the backend (`session_meta` JSONB), not the frontend.

**Why:** The frontend can be refreshed, closed, or reconnected. If state lived only in React, resuming a session would be impossible. The backend is the single source of truth.

**Constraint:** The frontend must never derive phase from turn counts. It reads `result.ieltsState` from every `submitTurn` response and sets the UI phase accordingly.

---

## No Turn-Count Logic

**Decision:** State transitions are driven by explicit `advanceIeltsState()` calls, not by counting turns.

**Why:** Turn count approaches produce heuristic bugs — if a user submits a blank response, or if a request is retried, the count drifts. Explicit state is always correct.

**Constraint:** `questionIndex` in backend state is authoritative. `userTurnCount` in the frontend is for display only, not for logic.

---

## Provider Abstraction Pattern

**Decision:** All external services (AI, TTS, Speech, Storage) are accessed through factory functions (`aiProvider.js`, `ttsProvider.js`, etc.), never imported directly.

**Why:** Switching providers (e.g., OpenAI TTS → ElevenLabs) should require changing only one file. No controller or service should `require('openai')` directly.

**Constraint:** Every provider must implement the interface documented in its factory file. Mock providers must implement the same interface.

---

## Mock-First Development

**Decision:** Every external provider has a mock implementation. Development and tests use mocks by default.

**Why:** Enables offline development, avoids API costs during iteration, makes CI deterministic.

**Constraint:** Real provider is activated by env var (`TTS_PROVIDER=openai`, `AI_PROVIDER=openai`, etc.). Default is always mock.

---

## Audio Lifecycle — Browser Side

**Decision:** TTS audio is fetched as a blob, played via `new Audio()`, never via `<audio>` HTML element in the render tree.

**Why:** Avoids React re-render on audio state changes. Audio play/pause is imperative, not declarative.

**Constraint:** `audioRef.current` always holds the active Audio object. Must be paused and nulled on unmount, on phase change, and before a new TTS call. Memory leak risk if not done.

---

## Placeholder Turns for Auto-Advance

**Decision:** Phase transitions that require no user input (e.g., entering Part 2 or Part 3) use placeholder strings submitted to `submitTurn`: `"[READY FOR PART 2]"`, `"[READY FOR PART 3]"`, `"[PREP TIME COMPLETE — I AM READY TO SPEAK]"`.

**Why:** The backend state machine needs a `submitTurn` call to advance state. There is no separate "advance phase" endpoint. Placeholder strings serve as the trigger without requiring real user speech.

**Constraint:** The backend must not persist these placeholder strings as real conversation turns visible to the scoring rubric. They are internal signals only. If this is ever broken, the AI scoring will include nonsense turns.

**Known issue:** This is currently NOT enforced — placeholders go through the normal `conversation_turns` INSERT. This could skew scoring. Future fix: filter placeholder content from scoring input.

---

## JWT Auth — Token in Memory, Not localStorage

**Decision:** Access token is stored in Zustand (memory only). Refresh token is in an httpOnly cookie.

**Why:** localStorage is readable by any script — XSS vulnerability. Memory is cleared on tab close (forces re-auth, acceptable tradeoff). httpOnly cookies are not accessible to JavaScript.

**Constraint:** Never store the access token in localStorage or sessionStorage. Never log it.

---

## Layer Order — Route → Controller → Service → Repository

**Decision:** All backend code follows strict layering. No layer may skip another.

**Why:** Controllers that call repositories directly bypass all service-layer validation and make future caching or event emission impossible to add cleanly.

**Known violations to watch for:**
- Controller importing a repository directly.
- Service calling `db.query()` directly on a table it doesn't own.
- Component calling `fetch()` directly instead of using `lib/api.ts`.

---

## Monolith Until 50K DAU

**Decision:** No microservice extraction until Lingona reaches 50K daily active users.

**Why:** Premature extraction adds deployment complexity, distributed tracing burden, and network latency with zero benefit at current scale.

**Exception:** Media (audio uploads) never proxies through the API server. Pre-signed URLs go directly from browser to R2.

---

## Retention System — Frontend-First Daily Goal

**Decision:** Daily XP goal progress is computed entirely on the frontend from existing progress data. No new backend endpoints, no localStorage, no new database tables.

**Why:** The backend already returns everything needed:
- `completeLesson` API returns `ApiCompleteResult` with `xpEarned`, `streak`, `level`, `newBadges`
- `useProgress` hook provides all completion records with `completedAt` timestamps and `score`
- Filtering progress by today's date + summing XP per lesson gives accurate daily totals

Adding a backend daily-goal endpoint would duplicate data already available client-side and add unnecessary API calls on every page load.

**Implementation:**
- `useDailyGoal(progress)` — pure `useMemo` computation, recomputes when progress changes
- `DailyGoalBar` — renders in PracticeTab between ContinueLearningCard and LessonsPage
- `CompletionScreen` — receives pre-completion `dailyXp` + `completionResult.xpEarned` from LessonModal to show post-completion daily progress immediately (before progress refresh completes)
- XP constants: `XP_PER_LESSON = 10`, `PERFECT_BONUS = 5`, `DAILY_XP_GOAL = 20`

**Constraint:** These XP constants are frontend estimates for display purposes only. The authoritative XP value comes from the backend `xp_ledger`. If backend XP rules change, update the frontend constants to match.

**Known limitation:** Daily reset uses `new Date()` local timezone via `dateKey()`. Users crossing timezones mid-day may see inconsistent daily totals. Acceptable tradeoff — no user has reported this.

---

## User Identity Hook Rule

**Decision:** All frontend data-fetching hooks that need the effective user ID must use `useCurrentUserId()`, never `useGuestUser()` directly.

**Why:** `useGuestUser()` always returns the guest UUID from localStorage — even when the user is authenticated. After guest migration, progress rows belong to the real user ID, not the guest UUID. Using `useGuestUser()` for an authenticated user returns empty/wrong data.

**Constraint:** `useGuestUser()` may only be used inside `useCurrentUserId()` or in contexts that explicitly need the guest UUID (e.g., the migration call itself). For `useProgress`, `useCourses`, `completeLesson`, and any other user-specific data, always use `useCurrentUserId()`.

**Known violations:** None remaining. `PracticeTab.tsx` and `LessonsPage.tsx` were fixed to use `useCurrentUserId()`.

---

## Known Limitations

| Limitation | Impact | Planned Fix |
|---|---|---|
| Placeholder turns included in scoring | Slight AI scoring noise from `[READY FOR PART 2]` etc. | Filter in `buildScoringPrompt` before sending to AI |
| No retry on stuck `part2_intro` / `transition_to_part3` | User stuck if auto-advance call fails | Add retry with exponential backoff |
| TTS has no timeout on frontend | `examinerSpeaking = true` forever if API hangs | Add 10s AbortController timeout to `synthesizeSpeech` |
| Web Speech API is Chrome/Edge only | Safari users must use text input | No fix planned — text fallback is acceptable |
| R2 storage not wired | Audio files use mock storage in all envs | Wire when user provides R2 credentials |
| ~~`PracticeTab` + `LessonsPage` use `useGuestUser()`~~ | ~~Authenticated users see wrong progress~~ | **FIXED** — changed to `useCurrentUserId()` |
| ~~`LessonsPage` has hardcoded `SKILL_XP` data~~ | ~~Fake per-skill XP shown to all users~~ | **FIXED** — `SkillXpCard` removed |
| ~~`DailyMission` + `DailyGoalBar` both render in Practice~~ | ~~Confusing duplicate daily display~~ | **FIXED** — `DailyMission` removed from LessonsPage |
| ~~`LessonsSection.tsx` is dead code~~ | ~~Unused file adds noise~~ | **FIXED** — file deleted |
| `dateKey()` duplicated in `useDailyGoal` and `useUserStats` | Maintenance risk — could diverge | Import from single location |
