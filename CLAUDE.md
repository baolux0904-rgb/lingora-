# Lingora – Claude Code Instructions

## Project Overview
Lingora is an English-learning app for kids. Monorepo: `frontend/` (Next.js 14 + TS) and `backend/` (Node.js + Express + PostgreSQL).

**Full technical roadmap:** `docs/technical-roadmap.md`

---

## Current Status

| Area | Status |
|---|---|
| Monorepo scaffold | ✅ Done |
| PostgreSQL schema + seed data | ✅ Done |
| Backend API (lessons, courses, progress) | ✅ Done |
| Lesson modal flow (vocab → quiz → speaking → completion) | ✅ Done |
| Guest-UUID progress tracking | ✅ Done |
| Dashboard stats + Daily Missions (real data) | ✅ Done |
| DB migrations (node-pg-migrate) | ✅ Done — `backend/migrations/` |
| JWT Authentication (backend) | ✅ Done — register, login, refresh, logout + verifyToken middleware |
| JWT Authentication (frontend) | ✅ Done — authStore, AuthProvider, api.ts auth-aware fetch + 401 retry |
| Login + Register pages | ✅ Done — /login, /register pages + ProtectedRoute component |
| XP ledger + gamification | ❌ Not started |
| Audio upload + speaking scoring | ❌ Not started |
| Classrooms + teacher dashboard | ❌ Not started |

---

## Active Phase: Phase 1 — Auth & Infrastructure

**Goal:** Secure, deployable foundation. Guest system migrates to real accounts.

Tasks in order:
1. ✅ Set up `node-pg-migrate` + migrations `0001_auth` + `0002_content_meta`
2. ✅ Backend: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
3. ✅ Backend: `verifyToken` + `requireRole` middleware, progress routes protected
4. ✅ Frontend: Zustand `authStore`, `AuthProvider`, token refresh on 401, `useCurrentUserId`
5. ✅ Frontend: `/login` + `/register` pages, `ProtectedRoute` component
6. ⬅️ **NEXT** Frontend: guest UUID → real account migration on login
7. Deploy to Railway (backend) + Vercel (frontend), add Sentry

**Exit criteria:** A real user can create an account, log in, complete a lesson, and see their progress on page refresh.

---

## Architecture Decisions (locked — do not change without discussion)

| Decision | Choice | Reason |
|---|---|---|
| JWT storage | `httpOnly` SameSite=Strict cookie for refresh token; access token in Zustand memory | Kids app — safest against XSS, no localStorage |
| XP system | Append-only `xp_ledger` table (never mutate `users.xp`) | Audit trail, retroactive awards, time-window leaderboards |
| DB migrations | `node-pg-migrate` | Needed from Phase 1 onward — no raw SQL files |
| Audio upload | Pre-signed S3/R2 URL — browser uploads directly, API only receives metadata | Never proxy large files through API server |
| Pronunciation scoring | Azure Speech API (pronunciation assessment) | Best phoneme-level feedback; abstracted behind `pronunciationService.js` |
| State management | Zustand (add in Phase 1 for auth) | Lightweight, works with Next.js App Router |
| Multi-tenancy | Row-level isolation via `school_id` FK on classrooms | No per-school PostgreSQL schemas needed |
| Monolith vs services | Stay monolith until 50K+ DAU. Exception: media never goes through API server | Premature extraction adds ops overhead |
| COPPA | `users.dob` required; `age < 13` triggers parental email consent flow | Legal requirement for US kids' apps |

---

## Phase Roadmap Summary

| Phase | Goal | Status |
|---|---|---|
| 0 – Foundation | Monorepo + docs | ✅ Done |
| 1 – Auth + Infra | JWT auth, migrations, CI/CD, deploy | 🔄 Next |
| 2 – Gamification | XP ledger, streaks, badges, leaderboard | ⬜ |
| 3 – Speaking | Audio upload, AI pronunciation scoring | ⬜ |
| 4 – Classrooms | Teacher dashboard, assignments, parent view | ⬜ |
| 5 – Admin CMS | Lesson/vocab/quiz editor in browser | ⬜ |
| 6 – Dialogues | Turn-based conversation exercises | ⬜ |
| 7 – Monetization | Stripe subscriptions (free/pro/school) | ⬜ |
| 8 – Hardening | Load testing, WCAG AA, observability | ⬜ |

---

## Code Patterns & Conventions

### Backend
- Layer order: `route → controller → service → repository` — no skipping layers
- All responses use the envelope: `{ success, message, data }`
- UUID validation in every controller before passing to service
- Repositories return plain objects only — no business logic
- Errors thrown as `{ status, message }` objects; caught by `errorMiddleware.js`
- Use `Promise.all()` for parallel DB queries in services

### Frontend
- API calls go through `lib/api.ts` only — no raw `fetch` in components
- Data fetching in custom hooks (`hooks/`) — never in components directly
- Types defined in `lib/types.ts` — keep in sync with API shapes
- Tailwind for all styling — no inline styles, no CSS modules
- Component files: PascalCase. Hook files: camelCase with `use` prefix

### Database
- All PKs are UUIDs
- All tables get `created_at TIMESTAMPTZ DEFAULT now()`
- Mutable tables get `updated_at` + trigger
- Soft deletes via `deleted_at TIMESTAMPTZ NULLABLE`
- Every schema change is a numbered `node-pg-migrate` migration file

---

## Key File Locations

| Path | Purpose |
|---|---|
| `frontend/app/` | Next.js App Router pages |
| `frontend/components/` | All UI components |
| `frontend/hooks/` | Data-fetching hooks |
| `frontend/lib/api.ts` | HTTP client |
| `frontend/lib/types.ts` | Shared TypeScript types |
| `backend/src/routes/` | URL registration |
| `backend/src/controllers/` | HTTP parsing |
| `backend/src/services/` | Business logic |
| `backend/src/repositories/` | SQL queries |
| `backend/src/middleware/` | Auth, error, logging |
| `backend/sql/` | Schema + seed SQL |
| `backend/migrations/` | node-pg-migrate files (`0001_auth`, `0002_content_meta`) |
| `backend/src/routes/authRoutes.js` | Auth route declarations + rate limiter |
| `backend/src/controllers/authController.js` | Auth HTTP layer (cookies, validation) |
| `backend/src/services/authService.js` | Auth business logic (bcrypt, JWT, token rotation) |
| `backend/src/repositories/authRepository.js` | Auth SQL queries |
| `backend/src/middleware/auth.js` | `verifyToken` + `requireRole` middleware |
| `frontend/lib/stores/authStore.ts` | Zustand store: user, accessToken, isLoading |
| `frontend/lib/api.ts` | HTTP client — public + auth-aware helpers, 401 mutex, all auth functions |
| `frontend/providers/AuthProvider.tsx` | Session restore on mount via POST /auth/refresh |
| `frontend/hooks/useCurrentUserId.ts` | Unified auth-user-id / guest-id hook |
| `frontend/app/(auth)/layout.tsx` | Shared background for /login and /register |
| `frontend/app/(auth)/login/page.tsx` | Login form — email + password |
| `frontend/app/(auth)/register/page.tsx` | Register form — name, email, password, role, dob |
| `frontend/components/ProtectedRoute.tsx` | Auth guard — redirects to /login, shows spinner while loading |
| `docs/technical-roadmap.md` | Full architecture + phase plan |
