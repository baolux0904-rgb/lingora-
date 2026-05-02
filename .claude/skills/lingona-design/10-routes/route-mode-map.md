# Route → mode map — exhaustive page table

Single source of truth: every Lingona route + which mode it renders. Cross-reference for `04-modes/mode-switch-rules.md` `resolveModeFromPathname` helper.

When adding new route, update this file FIRST, then add regex to helper, then add unit test.

## Mode legend

| Mode | Visual signature |
|------|------------------|
| **brand** | Default — gamified, peer voice, Lintopus presence at moments, full palette, dual font |
| **brand-soft** | Practice in-task — Lintopus absent, reduced decoration, content-dominant |
| **ielts-authentic** | Cambridge faithful — parchment, Georgia/Arial, sharp, no teal, English UI |

## Public routes (no auth)

| Route | Mode | Notes |
|-------|------|-------|
| `/` | brand | Landing page hero |
| `/about` | brand | About Lingona + Louis founder note (post-launch) |
| `/pricing` | brand | Pricing tiers (Free / Pro 199k / Pro+ / Annual) |
| `/blog` | brand | Blog index |
| `/blog/[slug]` | brand | Blog post — narrow column max-w-prose for body |
| `/changelog` | brand | Product changelog list |
| `/help` | brand | Help center index |
| `/help/[topic]` | brand | Help article |
| `/faq` | brand | FAQ accordion |
| `/contact` | brand | Contact form (peer voice) |
| `/terms` | brand | Terms of Service — formal VN voice (per persona.md edge case) |
| `/privacy` | brand | Privacy policy — formal VN |
| `/refund` | brand | Refund policy — formal VN |
| `/404` | brand | Lintopus default mood + recovery copy |
| `/500` | brand | Lintopus sad mood + "Lintopus đang sửa! 🐙" |

## Auth routes

| Route | Mode | Notes |
|-------|------|-------|
| `/login` | brand | Email/password + Google OAuth |
| `/register` | brand | Email/password + Google OAuth + username (Wave 6 fix) |
| `/forgot-password` | brand | Email input form |
| `/reset-password/[token]` | brand | New password form |
| `/verify-email/[token]` | brand | Verify email link landing |

## Onboarding flow (post-register)

| Route | Mode | Notes |
|-------|------|-------|
| `/onboarding` | brand | Welcome screen — Lintopus 200px happy + arm wave |
| `/onboarding/band` | brand | Self-reported current band (pill grid, NOT native select) |
| `/onboarding/target` | brand | Target band selection (pill grid, validation: target > current) |
| `/onboarding/time` | brand | Daily time available |
| `/onboarding/exam-date` | brand | Exam date picker (optional, can skip) |
| `/onboarding/done` | brand | Completion — Lintopus 200px happy + "Sẵn sàng rồi — bắt đầu luyện thôi" |

## Main app routes (authenticated)

### Dashboard

| Route | Mode | Notes |
|-------|------|-------|
| `/home` | brand | Dashboard — greeting, streak, XP, level, skill grid 4-col |
| `/dashboard` | brand | Alias of /home (legacy redirect — Sprint 2 PR) |

### Speaking

| Route | Mode | Notes |
|-------|------|-------|
| `/exam/speaking` | brand | Speaking entry mode-select |
| `/exam/speaking/practice` | brand | Practice mode passage select |
| `/exam/speaking/practice/[passageId]/run` | **brand-soft** | Practice in-task — recording UI, timer, prompt |
| `/exam/speaking/practice/[passageId]/result` | brand | Result page — band, sub-skills, Lintopus mood from band |
| `/exam/speaking/full-test` | brand | Full Test mode passage select |
| `/exam/speaking/full-test/[testId]/run` | **ielts-authentic** | Full Test — Cambridge feel, no Lintopus, English UI |
| `/exam/speaking/full-test/[testId]/result` | brand | Result returns to brand mode |
| `/exam/speaking/history` | brand | Past speaking attempts list |

### Writing

| Route | Mode | Notes |
|-------|------|-------|
| `/exam/writing` | brand | Writing entry mode-select |
| `/exam/writing/practice` | brand | Practice topic select |
| `/exam/writing/practice/[topicId]/task-1/run` | **brand-soft** | Practice Task 1 in-task |
| `/exam/writing/practice/[topicId]/task-1/result` | brand | Task 1 result |
| `/exam/writing/practice/[topicId]/task-2/run` | **brand-soft** | Practice Task 2 in-task |
| `/exam/writing/practice/[topicId]/task-2/result` | brand | Task 2 result |
| `/exam/writing/full-test` | brand | Full Test select |
| `/exam/writing/full-test/[testId]/task-1/run` | **ielts-authentic** | Full Test Task 1 — Cambridge |
| `/exam/writing/full-test/[testId]/task-1/result` | brand | Result back to brand |
| `/exam/writing/full-test/[testId]/task-2/run` | **ielts-authentic** | Full Test Task 2 — Cambridge |
| `/exam/writing/full-test/[testId]/task-2/result` | brand | Result back to brand |
| `/exam/writing/history` | brand | Past writing attempts |

### Reading

| Route | Mode | Notes |
|-------|------|-------|
| `/exam/reading` | brand | Reading entry — Practice + Full Test 2-card layout |
| `/exam/reading/practice` | brand | Practice passage list (56 seeded passages) |
| `/exam/reading/practice/[passageId]/run` | **brand-soft** | Practice in-task — split passage + questions |
| `/exam/reading/practice/[passageId]/result` | brand | Reading result |
| `/exam/reading/full-test` | brand | Full Test select (Cambridge 10/11/12/14) |
| `/exam/reading/full-test/[testId]/run` | **ielts-authentic** | Full Test — 50/50 Cambridge layout |
| `/exam/reading/full-test/[testId]/result` | brand | Result back to brand |
| `/exam/reading/history` | brand | Past reading attempts |

### Listening (Wave 6 in development)

| Route | Mode | Notes |
|-------|------|-------|
| `/exam/listening` | brand | Listening entry mode-select |
| `/exam/listening/practice` | brand | Practice section list |
| `/exam/listening/practice/[sectionId]/run` | **brand-soft** | Practice in-task — sticky audio player + questions |
| `/exam/listening/practice/[sectionId]/result` | brand | Listening result |
| `/exam/listening/full-test` | brand | Full Test select (Cam 10/11/12/14) |
| `/exam/listening/full-test/[testId]/run` | **ielts-authentic** | Full Test — Cambridge audio + answer sheet |
| `/exam/listening/full-test/[testId]/result` | brand | Result back to brand |
| `/exam/listening/history` | brand | Past listening attempts |

### Battle (gamification)

| Route | Mode | Notes |
|-------|------|-------|
| `/battle` | brand | Battle Arena home — queue button, history, rank |
| `/battle/casual` | brand | Casual battle mode select |
| `/battle/casual/queue` | brand | Casual queue waiting — Lintopus thinking + timer |
| `/battle/casual/match/[matchId]` | **brand-soft** | Casual match in-progress (Practice register) |
| `/battle/casual/match/[matchId]/result` | brand | Casual result — drama register |
| `/battle/ranked` | brand | Ranked battle mode select (gate: Iron tier+) |
| `/battle/ranked/queue` | brand | Ranked queue waiting |
| `/battle/ranked/match/[matchId]` | **ielts-authentic** | Ranked match — Cambridge pressure |
| `/battle/ranked/match/[matchId]/result` | brand | Ranked result — drama register VICTORY/DEFEAT/DRAW |
| `/battle/history` | brand | Battle history list |
| `/battle/leaderboard` | brand | Leaderboard top 100 |

### Profile + Social

| Route | Mode | Notes |
|-------|------|-------|
| `/profile` | brand | Profile main — avatar, bio, band journey, achievements |
| `/profile/[username]` | brand | Public profile of another user |
| `/friends` | brand | Friends list |
| `/friends/requests` | brand | Friend requests pending |
| `/friends/find` | brand | Find friends (search by username) |
| `/messages` | brand | Direct messages list |
| `/messages/[friendId]` | brand | DM thread (Socket.IO real-time) |
| `/achievements` | brand | Achievement gallery (45 badges, 8 categories) |

### Settings

| Route | Mode | Notes |
|-------|------|-------|
| `/settings` | brand | Settings index |
| `/settings/account` | brand | Username, email, password change |
| `/settings/profile` | brand | Bio, avatar, public profile toggle |
| `/settings/notifications` | brand | 4 notification toggles (custom Toggle component) |
| `/settings/appearance` | brand | Theme, font size |
| `/settings/learning` | brand | Daily XP goal, target band, exam date |
| `/settings/subscription` | brand | Pro tier, billing, refund (frozen logic) |
| `/settings/privacy` | brand | Privacy controls, data export |
| `/settings/danger` | brand | Delete account (typed XÓA confirm) |

### Pro / Billing

| Route | Mode | Notes |
|-------|------|-------|
| `/pro` | brand | Pro upgrade marketing page (post-launch) |
| `/pro/checkout` | brand | MoMo checkout flow |
| `/pro/success` | brand | Post-payment success |
| `/pro/billing` | brand | Billing history (Pro users only) |

### Legacy / deprecated (Wave 6 cleanup)

| Route | Mode | Notes |
|-------|------|-------|
| `/home-legacy` | brand | **DEPRECATED** — Sprint 2 PR5 port deletes this. Currently runtime host for ReadingTab/WritingTab/IeltsConversationV2/ScenarioConversation per audit Phase 1 finding. KILL after PR5 mounts components under `(app)/exam/<skill>/<mode>/run/` |

## resolveModeFromPathname implementation

Per `04-modes/mode-switch-rules.md`:

```ts
// frontend/lib/modeMap.ts
export type DesignMode = 'brand' | 'brand-soft' | 'ielts-authentic';

export function resolveModeFromPathname(pathname: string): DesignMode {
  // ielts-authentic — Full Test in-task + Battle Ranked match
  if (
    pathname.match(/^\/exam\/[^/]+\/full-test\/[^/]+(\/task-[12])?\/run\/?$/) ||
    pathname.match(/^\/battle\/ranked\/match\/[^/]+\/?$/)  // exclude /result
  ) {
    return 'ielts-authentic';
  }
  
  // brand-soft — Practice in-task + Casual battle match
  if (
    pathname.match(/^\/exam\/[^/]+\/practice\/[^/]+(\/task-[12])?\/run\/?$/) ||
    pathname.match(/^\/battle\/casual\/match\/[^/]+\/?$/)  // exclude /result
  ) {
    return 'brand-soft';
  }
  
  // brand — everything else (default)
  return 'brand';
}
```

KEY: `/result` suffix EXCLUDED from authentic/brand-soft regex → result page always returns to brand mode (Lintopus return moment).

## Unit test cases

`frontend/lib/__tests__/modeMap.test.ts`:

```ts
import { resolveModeFromPathname } from '../modeMap';

describe('resolveModeFromPathname', () => {
  // Public + auth — all brand
  test('landing → brand', () => expect(resolveModeFromPathname('/')).toBe('brand'));
  test('login → brand', () => expect(resolveModeFromPathname('/login')).toBe('brand'));
  test('register → brand', () => expect(resolveModeFromPathname('/register')).toBe('brand'));
  test('pricing → brand', () => expect(resolveModeFromPathname('/pricing')).toBe('brand'));
  test('terms → brand', () => expect(resolveModeFromPathname('/terms')).toBe('brand'));
  
  // Onboarding — all brand
  test('onboarding/band → brand', () => expect(resolveModeFromPathname('/onboarding/band')).toBe('brand'));
  test('onboarding/done → brand', () => expect(resolveModeFromPathname('/onboarding/done')).toBe('brand'));
  
  // Dashboard — brand
  test('home → brand', () => expect(resolveModeFromPathname('/home')).toBe('brand'));
  
  // Speaking — entry brand, practice run brand-soft, full-test run authentic, result brand
  test('speaking entry → brand', () => expect(resolveModeFromPathname('/exam/speaking')).toBe('brand'));
  test('speaking practice select → brand', () => expect(resolveModeFromPathname('/exam/speaking/practice')).toBe('brand'));
  test('speaking practice run → brand-soft', () => expect(resolveModeFromPathname('/exam/speaking/practice/p123/run')).toBe('brand-soft'));
  test('speaking practice result → brand', () => expect(resolveModeFromPathname('/exam/speaking/practice/p123/result')).toBe('brand'));
  test('speaking full-test select → brand', () => expect(resolveModeFromPathname('/exam/speaking/full-test')).toBe('brand'));
  test('speaking full-test run → ielts-authentic', () => expect(resolveModeFromPathname('/exam/speaking/full-test/t1/run')).toBe('ielts-authentic'));
  test('speaking full-test result → brand', () => expect(resolveModeFromPathname('/exam/speaking/full-test/t1/result')).toBe('brand'));
  
  // Writing — task-1 / task-2 sub-paths
  test('writing practice task-1 run → brand-soft', () => expect(resolveModeFromPathname('/exam/writing/practice/topic1/task-1/run')).toBe('brand-soft'));
  test('writing practice task-1 result → brand', () => expect(resolveModeFromPathname('/exam/writing/practice/topic1/task-1/result')).toBe('brand'));
  test('writing full-test task-2 run → ielts-authentic', () => expect(resolveModeFromPathname('/exam/writing/full-test/t1/task-2/run')).toBe('ielts-authentic'));
  test('writing full-test task-2 result → brand', () => expect(resolveModeFromPathname('/exam/writing/full-test/t1/task-2/result')).toBe('brand'));
  
  // Reading
  test('reading practice run → brand-soft', () => expect(resolveModeFromPathname('/exam/reading/practice/p1/run')).toBe('brand-soft'));
  test('reading full-test run → ielts-authentic', () => expect(resolveModeFromPathname('/exam/reading/full-test/cam14-t2/run')).toBe('ielts-authentic'));
  
  // Listening
  test('listening practice run → brand-soft', () => expect(resolveModeFromPathname('/exam/listening/practice/s1/run')).toBe('brand-soft'));
  test('listening full-test run → ielts-authentic', () => expect(resolveModeFromPathname('/exam/listening/full-test/cam14/run')).toBe('ielts-authentic'));
  
  // Battle
  test('battle home → brand', () => expect(resolveModeFromPathname('/battle')).toBe('brand'));
  test('battle casual queue → brand', () => expect(resolveModeFromPathname('/battle/casual/queue')).toBe('brand'));
  test('battle casual match → brand-soft', () => expect(resolveModeFromPathname('/battle/casual/match/m1')).toBe('brand-soft'));
  test('battle casual result → brand', () => expect(resolveModeFromPathname('/battle/casual/match/m1/result')).toBe('brand'));
  test('battle ranked queue → brand', () => expect(resolveModeFromPathname('/battle/ranked/queue')).toBe('brand'));
  test('battle ranked match → ielts-authentic', () => expect(resolveModeFromPathname('/battle/ranked/match/m1')).toBe('ielts-authentic'));
  test('battle ranked result → brand', () => expect(resolveModeFromPathname('/battle/ranked/match/m1/result')).toBe('brand'));
  
  // Profile + Settings — brand
  test('profile → brand', () => expect(resolveModeFromPathname('/profile')).toBe('brand'));
  test('settings → brand', () => expect(resolveModeFromPathname('/settings')).toBe('brand'));
  test('settings/account → brand', () => expect(resolveModeFromPathname('/settings/account')).toBe('brand'));
  
  // Edge cases
  test('trailing slash handled', () => expect(resolveModeFromPathname('/exam/speaking/practice/p1/run/')).toBe('brand-soft'));
  test('legacy /home-legacy → brand', () => expect(resolveModeFromPathname('/home-legacy')).toBe('brand'));
});
```

Run unit tests in CI to catch route → mode regression.

## Layout integration

Per route folder, apply mode wrapper at appropriate layout:

```tsx
// frontend/app/(app)/exam/[skill]/full-test/[testId]/run/layout.tsx
export default function FullTestRunLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="ielts-authentic" className="min-h-screen">
      {children}
    </div>
  );
}
```

```tsx
// frontend/app/(app)/exam/[skill]/practice/[passageId]/run/layout.tsx
export default function PracticeRunLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="brand-soft" className="min-h-screen">
      {children}
    </div>
  );
}
```

```tsx
// frontend/app/(app)/battle/ranked/match/[matchId]/layout.tsx
// NOTE: applies to match in-progress page only, NOT /result child route
export default function RankedMatchLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="ielts-authentic" className="min-h-screen">
      {children}
    </div>
  );
}
```

```tsx
// frontend/app/(app)/battle/ranked/match/[matchId]/result/layout.tsx
// Override parent layout — back to brand for result moment
export default function RankedMatchResultLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="brand" className="min-h-screen">
      {children}
    </div>
  );
}
```

Nested layouts inherit OR override `data-mode`. Most specific wins (CSS specificity).

## Mobile / desktop check

Mode applies regardless of viewport. Mobile/desktop differences handled per `02-layout/mobile-rhythm.md` + `02-layout/desktop-canvas.md`.

| Mode | Mobile behavior | Desktop behavior |
|------|----------------|------------------|
| brand | Single-column collapse, BottomNav | Pattern C asymmetric, sidebar nav |
| brand-soft | Stack vertical (passage above questions) | Split 50/50 |
| ielts-authentic | Single column compact | Cambridge 50/50 layout |

Mode = visual signature. Layout = responsive grid.

## Adding new route — checklist

When adding route:

```
1. Add row to this file (route + mode + notes)
2. Update resolveModeFromPathname regex if not brand
3. Add unit test case
4. Apply data-mode wrapper at route layout if not brand
5. Verify CSS variable resolution (mode-aware tokens)
6. Test mode transition into + out of route
7. Confirm Lintopus presence per `03-components/mascot.md` placement matrix
8. Confirm voice register per `05-voice/persona.md` (peer/English-authentic/legal)
```

## Audit checklist route map

```
1. Every Lingona route listed in this file? ✓
2. Mode column matches resolveModeFromPathname output? ✓
3. Unit tests cover each route family? ✓
4. data-mode wrapper at correct layout level? ✓
5. /result routes always return to brand mode? ✓
6. /home-legacy DEPRECATED noted (Sprint 2 PR5 kill)? ✓
7. Nested layouts override correctly? ✓
8. NO mode bleed (brand chrome in authentic, etc.)? ✓
```

## See also

- `04-modes/mode-switch-rules.md` — runtime hook + transition mechanism
- `04-modes/brand.md` — default mode spec
- `04-modes/brand-soft.md` — Practice mode spec
- `04-modes/ielts-authentic.md` — exam mode spec
- `02-layout/mobile-rhythm.md` — mobile collapse rules
- `02-layout/desktop-canvas.md` — desktop Pattern C
- `03-components/mascot.md` — placement matrix per route
- `05-voice/persona.md` — voice register per surface
