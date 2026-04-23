# Navigation + Dark Mode Research

Research-only pass before refactor. No code changed. All file paths verified with `ls`/`cat`.

---

## 1. File map

### Navigation / shell

| Path | Role |
|---|---|
| `frontend/components/AppShell.tsx` | Client wrapper that swaps `AppSidebar` (≥1024px) and `BottomNav` (<1024px) around `<main>`. Owns the `marginLeft: var(--sidebar-width)` offset and the `hideNav` escape hatch. |
| `frontend/components/AppSidebar.tsx` | Desktop sidebar. Holds the nav data (`NAV_ITEMS`, `LEARN_SKILLS`), renders the "Learn" accordion, XP bar, streak, rank, ThemeToggle, NotificationBell, avatar. |
| `frontend/components/BottomNav.tsx` | Mobile tab bar (5 items, Vietnamese labels). Uses its own hardcoded `NAV_ITEMS` — **not shared with sidebar**. |
| `frontend/components/Topbar.tsx` | Mobile-only topbar (streak badge). Sidebar replaces it on desktop via `lg:hidden` on the caller. |
| `frontend/components/ThemeToggle.tsx` | Sun/Moon button inside sidebar utility row. Uses `next-themes` `useTheme()`. |

### Layout + theme root

| Path | Role |
|---|---|
| `frontend/app/layout.tsx` | Root server layout. Loads `Playfair_Display` and `DM_Sans` via `next/font/google` (→ CSS vars `--font-playfair`, `--font-dm-sans`). Wraps children in `<ThemeProvider attribute="class" defaultTheme="dark">` (next-themes) → `AuthProvider` → `SplashScreen`. `<html suppressHydrationWarning>`. |
| `frontend/app/globals.css` | 1153 lines. All design tokens (see §3). Tailwind directives + `:root` light tokens + `.dark` overrides + section-level utilities (`.bg-home`, `.bg-exam`, sidebar tokens, IELTS exam-room tokens). |
| `frontend/tailwind.config.ts` | `darkMode: "class"`. Brand palette (`navy`, `teal`), typography scale, spacing, `font-display`/`font-sans` bound to the CSS-var names from layout.tsx. **No `dark:` variants are used anywhere in the JSX** (see §3 root-cause). |
| `frontend/postcss.config.mjs` | Standard Tailwind/PostCSS glue (not inspected further — no bearing on nav/theme). |

### Routes (actual Next.js App Router entries — **verified with `ls frontend/app/`**)

```
frontend/app/
  layout.tsx              root
  page.tsx                "/" landing (renders RootPageClient)
  home/page.tsx           "/home" — the SPA shell (all 4 skills live here as tabs)
  writing/progress/       "/writing/progress" (ProgressClient)
  leaderboard/page.tsx    "/leaderboard"
  lessons/page.tsx        "/lessons"
  u/[username]/           "/u/:username" public profile
  auth/google/            OAuth callback
  (auth)/login, register, google/
  (legal)/privacy, data-deletion/
  error.tsx not-found.tsx opengraph-image.tsx robots.ts sitemap.ts
```

**Key finding:** There is **no `/speaking`, `/writing`, `/reading`, `/listening`, `/grammar`** route. The sidebar's Learn sub-items (`learn-speaking`, `learn-writing`, …) are **tab state**, not routes. They mutate `activeTab` inside `frontend/app/home/page.tsx`, which then renders the right component inline. The only real sub-route that exists for any skill is `/writing/progress`.

### No breadcrumb component
`grep -rln "breadcrumb\|Breadcrumb" frontend/` → zero matches. Nothing to preserve or refactor.

### `frontend/styles/` does not exist
CLAUDE.md §6 references `frontend/styles/exam-authentic.css`. `ls frontend/styles/` returns "No such file or directory". The exam-authentic palette is not implemented yet — all "IELTS" tokens currently live inside `globals.css` under `--ielts-*` (see lines 80–121 of globals.css) and follow brand colors, not the authentic cream `#F5EFDC` / Georgia spec.

---

## 2. Current nav data structure

Both nav lists are **hardcoded arrays inside the component**, not shared config. This is the shape we have to refactor.

### Sidebar — `frontend/components/AppSidebar.tsx:25-39`

```tsx
/* ── Learn sub-skills ── */
const LEARN_SKILLS = [
  { id: "learn-speaking",  label: "Speaking",  Icon: IconMic },
  { id: "learn-grammar",   label: "Grammar",   Icon: IconPen },
  { id: "learn-reading",   label: "Reading",   Icon: IconOpenBook },
  { id: "learn-writing",   label: "Writing",   Icon: IconPen },
  { id: "learn-listening", label: "Listening", Icon: IconHeadphones },
] as const;

const NAV_ITEMS = [
  { id: "home",    label: "Home",    Icon: IconHome },
  { id: "learn",   label: "Learn",   Icon: IconBook },
  { id: "battle",  label: "Battle",  Icon: IconSwords },
  { id: "social",  label: "Friends", Icon: IconUsers },
  { id: "profile", label: "Profile", Icon: IconUser },
] as const;
```

Click handler (`AppSidebar.tsx:67-82`): clicking **Learn** toggles an accordion `learnOpen` and also fires `onChange("exam")` — so the top-level "Learn" item effectively means "go to ExamScreen". Sub-items emit e.g. `"learn-writing"`.

### BottomNav — `frontend/components/BottomNav.tsx:11-17`

```tsx
const NAV_ITEMS = [
  { id: "home",    label: "Trang chủ", Icon: IconHome },
  { id: "exam",    label: "Thi",       Icon: IconGraduationCap },
  { id: "battle",  label: "Đấu",       Icon: IconSwords },
  { id: "social",  label: "Bạn bè",    Icon: IconUsers },
  { id: "profile", label: "Hồ sơ",     Icon: IconUser },
] as const;
```

Mobile has no drilldown — tapping "Thi" just lands on the Exam Hub (`ExamScreen`). No path exists today to reach Grammar or the per-skill Writing/Reading tabs from mobile except via Home dashboard cards.

### Tab → content resolution — `frontend/app/home/page.tsx:52-69`

```ts
function resolveContentTab(activeTab: string): string {
  switch (activeTab) {
    case "learn":
    case "learn-speaking":
    case "exam":         return "exam";      // → ExamScreen
    case "learn-grammar":  return "grammar";  // → GrammarTab (overlay)
    case "learn-reading":  return "reading";  // → ReadingTab (full-screen overlay)
    case "learn-writing":  return "writing";  // → WritingTab (full-screen overlay)
    case "learn-listening":return "listening";// → "Coming soon" placeholder
    default: return activeTab;
  }
}
```

`handleTabChange` in `home/page.tsx:173-191` adds extra side-effects: `learn-writing` and `learn-reading` toggle `writingActive`/`readingActive` booleans that cause the parent to render those components **outside AppShell** as full-screen overlays (losing the sidebar entirely while a skill is active).

### Implication for the refactor

To split "IELTS Exam" (4 skills) from "Learn" (Grammar + Scenario Speaking):
- Sidebar + BottomNav need a shared config (single source of truth). Today they drift: BottomNav has no "Learn" drilldown, no Grammar entry at all.
- The proposed new structure will need new ids: e.g. `exam-hub`, `exam-speaking`, `exam-writing`, `exam-reading`, `exam-listening` vs `learn-grammar`, `learn-scenario`. `resolveContentTab` and `handleTabChange` in `home/page.tsx` must both be updated, or the whole `activeTab` switch should be replaced by real routes.
- Because skills currently render as overlays via the boolean `writingActive`/`readingActive` flags and `hideNav`, any Mode Selection screen (Full Test vs Practice) built inline will also need to decide: is it another overlay, a tab, or a real route?

---

## 3. Dark mode state

### Library
`next-themes` (`frontend/app/layout.tsx:3`). Configured with `attribute="class"` + `defaultTheme="dark"`, which means `next-themes` toggles `class="dark"` on `<html>`. `suppressHydrationWarning` is set on `<html>` — required by next-themes.

### Toggle logic
`frontend/components/ThemeToggle.tsx` — single source. `mounted` guard avoids SSR mismatch; `setTheme(theme === "dark" ? "light" : "dark")`. Rendered in one place: the sidebar utility row (`AppSidebar.tsx:285`). **No toggle on mobile.** BottomNav has no theme control and no topbar option either.

### Brand tokens — CSS custom properties, NOT Tailwind utilities

All theming is via CSS variables defined in `globals.css`. The `.dark` class on `<html>` swaps them. Tailwind's `dark:` modifier is **never used in the JSX** (`grep -rn "dark:" frontend/components/*.tsx` → 0 matches). That is the theming contract.

**Current values — `globals.css` `:root` (light) and `.dark` (dark):**

| Token | Light (`:root`) | Dark (`.dark`) |
|---|---|---|
| `--color-bg` | `#F8F7F4` warm off-white | `#0F1E33` navy |
| `--color-bg-secondary` | `#F0EFEC` | `#162740` |
| `--color-bg-card` | `#FFFFFF` | `#1B2B4B` |
| `--color-bg-card-hover` | `#FAFAF8` | `#213358` |
| `--color-text` | `#1A1A1A` | `#E8EDF5` |
| `--color-text-secondary` | `#555555` | `#A3B7D1` |
| `--color-text-tertiary` | `#767676` | `#6B7280` |
| `--color-border` | `#E8E8E4` | `rgba(255,255,255,0.08)` |
| `--color-accent` | `#00A896` (teal) | `#00C4B0` (teal-light) |

Plus large families: `--surface-*`, `--dash-*`, `--ielts-*`, and a sidebar group at line 964:

**Sidebar tokens — `globals.css:964-984`:**

```css
:root {
  --sidebar-width: 240px;
  --sidebar-bg: #FFFFFF;
  --sidebar-border: #E8E8E4;
  --sidebar-item-hover: rgba(0, 0, 0, 0.03);
  --sidebar-item-active-bg: #F0FAFA;
  --sidebar-active-indicator: #00A896;
  --sidebar-xp-track: #E8E8E4;
  --sidebar-xp-fill: linear-gradient(90deg, #00A896, #00C4B0);
}
.dark {
  --sidebar-bg: rgba(255, 255, 255, 0.03);      /* glassmorphism */
  --sidebar-border: rgba(255, 255, 255, 0.06);
  --sidebar-item-hover: rgba(255, 255, 255, 0.05);
  --sidebar-item-active-bg: rgba(0, 196, 176, 0.10);
  --sidebar-active-indicator: #00C4B0;
  --sidebar-xp-track: rgba(255, 255, 255, 0.06);
  --sidebar-xp-fill: linear-gradient(90deg, #00A896, #00C4B0);
}
```

### `dark:` variants per component (quick sample)

Because the whole codebase uses CSS vars, **no component has `dark:` classes** — not `AppSidebar`, `BottomNav`, `Topbar`, `HomeDashboard`, `ExamScreen`, `WritingTab`, `ReadingTab`, `ProfileScreen`, nor anything in `components/ui/*`. They all read `var(--color-*)` via inline `style={}`.

### Root-cause hypothesis — "sidebar lost dark theme"

Three plausible causes, ranked by evidence:

1. **Bottom-section hardcoded navy gradient ignores theme.** `AppSidebar.tsx:304-307` hardcodes the avatar background as `linear-gradient(135deg, #1B2B4B, #2D4A7A)` regardless of theme. In light mode this dark navy chip against the white sidebar is a visible inconsistency. It is not "lost dark theme" but it looks exactly like the sidebar "didn't get the memo" that we're in light mode.

2. **`ThemeToggle` uses `--color-primary-soft` as its background.** In `.dark`, `--color-primary-soft = rgba(0, 196, 176, 0.12)` (teal tint). In light, it's `rgba(26, 26, 26, 0.05)` (near-black tint). On the sidebar light background this produces a dark grey pill that looks out of place — the toggle itself appears to be stuck in the old dark palette. Candidate symptom source.

3. **`:root .bg-deep-gradient` vs `.dark .bg-deep-gradient` specificity at `globals.css:987-995`.**
   ```css
   .bg-deep-gradient         { background: linear-gradient(180deg, #0c0f1a…); }
   :root .bg-deep-gradient   { background: #F8F7F4; }          /* light */
   .dark .bg-deep-gradient   { background: linear-gradient(180deg, #0c0f1a…); }
   ```
   Both `:root .bg-deep-gradient` and `.dark .bg-deep-gradient` are specificity (0,2,0). Dark wins only by source order. **But `.dark` lives on `<html>`, and `:root` is also `<html>` — so they select the same element**, and `:root .bg-deep-gradient` actually requires `.bg-deep-gradient` to be a descendant of `<html>` (always true). Source order currently puts `.dark` last → dark wins when dark is active. If any future edit reorders this or wraps `.dark` scope differently, the light rule could bleed into dark. Not the current bug but a fragile pattern worth flagging.

4. **Sidebar is `position: fixed` with `z-50` and `backgroundColor: var(--sidebar-bg)`** — dark value is a low-alpha `rgba(255,255,255,0.03)`. When the body's `.bg-deep-gradient` is absent or a child wrapper covers it (e.g. a full-screen overlay with its own solid background), the near-transparent sidebar reads as whatever is *behind* it — which, if behind is white, looks like "sidebar forgot to go dark." This matches scenarios where a WritingTab/ReadingTab overlay renders without the `.bg-deep-gradient` shell.

**Recommended verification path** (during the fix phase, not now): (a) confirm `<html class="dark">` is actually applied when the bug is seen — rule out next-themes hydration; (b) check the Mascot/ThemeToggle/avatar tokens specifically; (c) audit whether any full-screen overlay (Writing/Reading) loses the `.dark` ancestor via portaling or a different root.

---

## 4. New screens gap

### Exam Hub (4-skill grid)
**Exists in a limited form.** `frontend/components/ExamScreen.tsx` (258 lines) is an exam hub with a `EXAM_MODULES` list containing Speaking, Listening, Reading, Writing — already laid out as a card grid. It renders inline inside `/home` when `activeTab === "exam"`.

What's missing vs. the new design intent:
- It is **not a route**, it's a tab. To become "a screen you navigate to", it either stays a tab with a clearer sidebar entry point, or gets promoted to `/exam` (App Router convention → new folder `frontend/app/exam/page.tsx`).
- It currently couples to `onStartIelts`/`onStartWriting`/`onStartReading` callbacks passed from `home/page.tsx`. Converting to a route will require switching to `router.push()` and moving the overlay state (`ieltsScenario`, `writingActive`, `readingActive`) somewhere else (Zustand or nested route).

### Mode Selection (Full Test vs Practice) per skill
**Does not exist as a dedicated screen.** Current situation:
- **Reading:** `frontend/components/Reading/ReadingTab.tsx` + `FullTestLauncher.tsx` + `FullTestRunner.tsx` exist; user enters a test list directly. There is no "choose your mode" intermediate step.
- **Writing:** `WritingTab.tsx` and friends exist; no Full Test launcher, no mode picker.
- **Speaking:** `IeltsConversationV2.tsx` + `ExamScreen.tsx` — Practice is implicit via scenario picker; Full Test is implicit via selecting an IELTS scenario.
- **Listening:** placeholder only ("Coming soon" text in `home/page.tsx:279`).

If Mode Selection becomes a screen, the natural path in the current convention is another tab (not a route) — e.g. `exam-writing-mode` — or new routes under the exam hub. Following the existing app-router convention, new pages would live under something like:

```
frontend/app/exam/page.tsx                 (hub — 4 skills)
frontend/app/exam/[skill]/page.tsx         (mode select)
frontend/app/exam/[skill]/[mode]/page.tsx  (actual test)
```

But that is a bigger architectural move — today almost nothing lives outside `/home`.

---

## 5. Risks + dependencies

### Sidebar ↔ layout coupling
- `AppShell.tsx:65` applies `marginLeft: var(--sidebar-width)` on the main container. Any responsive change to sidebar (collapsed mode, hide on exam, etc.) must update that inline style or switch to CSS-driven layout.
- The sidebar is `position: fixed` and sized entirely via the `--sidebar-width` var — relatively safe to extend, but changing width needs to update both the var and any hardcoded `240px` references (none found on grep).
- `hideNav` (AppShell.tsx:50, 76) is toggled by a single parent flag (`grammarOverlayOpen`). If we add more overlays (Mode Select, Full Test), they will either need to set this flag or become routes that bypass AppShell.

### Route change → bookmark/redirect risk
- Currently only `/writing/progress` exists outside `/home`. No `/speaking`, `/writing`, etc. are indexed. The risk of breaking external bookmarks is **low** — nothing to redirect from.
- However, `robots.ts` and `sitemap.ts` exist (not inspected). If we add new routes, they should be surfaced there, and canonical URLs (`layout.tsx:48` `canonical: "https://lingona.app"`) should be reviewed for per-page canonical tags.
- `home/page.tsx` uses `useSearchParams` for an `experimental` flag. Not affected but worth knowing.

### Dark mode refactor blast radius
- **Every component uses `var(--color-*)` via inline `style={}`**, not Tailwind classes. Refactoring dark mode means editing the `.dark { … }` block in `globals.css` (one place), not touching JSX. Cheap.
- Exceptions (hardcoded colors that ignore theme — will need per-file fixes):
  - `AppSidebar.tsx:306` avatar gradient `linear-gradient(135deg, #1B2B4B, #2D4A7A)`
  - `AppSidebar.tsx:219-251` streak/rank colors `#F59E0B`, `#60A5FA`, rank color literals — intentionally theme-independent brand colors, OK to leave.
  - `BottomNav.tsx:46,48,56` `rgba(0,168,150,…)` and `#00A896` — brand teal, fine both themes.
  - `ThemeToggle.tsx` uses `--color-primary-soft` which may be too close to `--color-bg` in light mode; watch this when validating the "sidebar lost dark theme" symptom.
- `.dark` currently lives on `<html>`. `next-themes` owns that — do not write to `document.documentElement` directly.
- Section-level backgrounds (`.bg-home`, `.bg-speak`, `.bg-exam`, `.bg-practice`) have separate `.dark` counterparts (lines 423–451 of globals.css). Any new section class must follow the same `:root .xxx` + `.dark .xxx` pattern or it will default to whatever Tailwind gives.

### Fonts
- `Playfair_Display` + `DM_Sans` loaded via `next/font/google` in `layout.tsx:8-18`. Bound to Tailwind `fontFamily.display`/`fontFamily.sans`/`fontFamily.playfair` in `tailwind.config.ts:94-100`. **Do not touch** — any nav refactor can reuse `font-display`/`font-sans` classes directly.
- CLAUDE.md §6 says the authentic exam palette should use **Georgia + Arial** (not Playfair + DM Sans). That palette isn't implemented yet (`frontend/styles/` doesn't exist). If the nav refactor is meant to support Full Test mode fidelity, we'll need to introduce the exam-authentic font stack at the same time — that is out of scope for the nav-only refactor but worth flagging.

### Missing but referenced in CLAUDE.md
- `frontend/styles/exam-authentic.css` — referenced in §6, doesn't exist. Either create it in this refactor or update CLAUDE.md to delete the mention.
- `frontend/lib/domain/ielts/` mirror — not verified; CLAUDE.md implies it exists. Out of scope here.

### Drift between sidebar and bottom nav
Single biggest refactor risk. Sidebar has 5 top-level items + Learn accordion with 5 sub-items. BottomNav has 5 flat items with no Grammar/Writing/Reading/Listening entry at all. The IELTS-Exam / Learn split will deepen that drift unless the two navs share one config module (new file, e.g. `frontend/lib/nav/config.ts`). Recommended to introduce this in the refactor.

---

## Summary of items to resolve before implementation

1. Decide: tabs-in-`/home` vs real App Router routes for the new Exam Hub + Mode Select. Existing code leans tabs; "screens" language suggests routes.
2. Decide: will Sidebar + BottomNav share a config (strongly recommended) and where does it live?
3. Fix the hardcoded avatar gradient and the `--color-primary-soft` toggle background while in the neighborhood — best guesses for "sidebar lost dark theme".
4. Resolve `frontend/styles/exam-authentic.css` drift in CLAUDE.md — create it, or delete the reference.
5. When `learn-writing`/`learn-reading` stop being full-screen overlays (because they become routes or proper tabs under Exam), the `writingActive`/`readingActive` + `hideNav` machinery in `home/page.tsx` should be collapsed too.
