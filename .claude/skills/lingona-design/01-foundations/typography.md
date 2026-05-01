# Typography — DM Sans + Playfair pairing playbook

## ⚠ Decision flag

Original Wave 6 handoff Q lock said *"Font: DM Sans only (drop Playfair)"*. This file assumes **KEEP Playfair as display-only** (codebase has 137 active uses, drop = regression + lose dual-font signature).

Recommend Louis confirm KEEP option here:

- **(a) KEEP** — DM Sans body + Playfair Display Italic accent (recommend, current codebase, signature 100ft test #3 in `00-manifesto/recognizable-from-100ft.md`)
- **(b) DROP** — DM Sans only, weight variation alone (per original handoff)

Below assumes (a). If (b) locked, Louis flag → tao revise file.

## Font stack

### DM Sans (body, UI, microcopy)

- **Family**: `DM Sans` (Google Fonts, variable weight 100–1000)
- **Tailwind class**: `font-sans` (DEFAULT) + `font-dm`
- **Weights used**: 400 regular, 500 medium, 600 semibold, 700 bold
- **Why**: humanist proportion (warm), geometric base (clean), Vietnamese diacritics solid, free Google Font.
- **Codebase hits**: 232 `font-sans` + 72 `font-dm` (consistent)

### Playfair Display (display, headlines, "moment" text)

- **Family**: `Playfair Display` (Google Fonts, regular + italic, weight 400–900)
- **Tailwind class**: `font-display` + `font-playfair`
- **Weights used**: 400 regular italic, 700 bold (rare — italic dominates)
- **Why**: serif italic = WARM signal (per `00-manifesto/visual-vocabulary.md`), distinctive (KHÔNG generic Inter), pair classic with sans body.
- **Codebase hits**: 507 `font-display` + 137 `font-playfair` (active)

### Fallback stack

```css
font-sans: "DM Sans", system-ui, -apple-system, sans-serif;
font-display: "Playfair Display", Georgia, serif;
```

If web font fails to load → graceful fallback to system-ui + Georgia. Vietnamese diacritics still render OK.

## Pairing playbook (when DM Sans, when Playfair)

### Use Playfair Display Italic (`font-display italic`) for:

- **Hero headline** on Landing — "Cùng luyện IELTS với mình" (italic adds warmth, distinct from generic SaaS hero)
- **Section headlines** "moment" pages (Result page band number, Achievement unlock, Level Up)
- **Quote / blockquote** rare editorial
- **Number display in BandProgressCard** — band number `7.0` rendered Playfair Italic (signature look)

### Use DM Sans for:

- **All body text** (paragraphs, descriptions, microcopy)
- **All UI labels** (buttons, form labels, nav, toast, tooltip)
- **All microcopy** (loading, empty, error)
- **All numerical UI display** EXCEPT band number (timer, XP count, streak count, leaderboard rank)
- **Code / monospace / passage exam content** (with explicit `font-mono` if code; Cambridge passage uses Georgia in IELTS-authentic mode — see below)

### Anti

- ❌ Playfair for body text — too decorative, hurt readability
- ❌ Playfair non-italic in headlines — Lingona signature is **italic**, not regular Playfair
- ❌ Mix 3+ font families in 1 page (Playfair + DM Sans + system-ui sneak in)
- ❌ Playfair < 24px — italic at small size hurts legibility
- ❌ DM Sans display weight (700+ bold) at headline — use Playfair instead

## Type scale (codebase locked — `tailwind.config.ts`)

Lingona has **complete custom type scale** with letter-spacing + line-height per step. KHÔNG dùng Tailwind default — use these:

| Tailwind class | Size | Letter-spacing | Line-height | Use |
|----------------|------|----------------|-------------|-----|
| `text-xs` | 12px | wider | 1.4 | Caption, badge label, micro hint |
| `text-sm` | 14px | wider | 1.5 | Body small, dense list item |
| `text-base` | 16px | normal | 1.6 | Body default |
| `text-lg` | 20px | normal | 1.4 | Sub-headline, lead paragraph |
| `text-xl` | 28px | tighter | 1.3 | Section headline (h3) |
| `text-2xl` | 40px | tight | 1.2 | Page headline (h2) |
| `text-3xl` | (defined) | tight | 1.1 | Big page headline (h1) |
| `text-4xl` | (defined) | tightest | 1.0 | Hero headline |
| `text-5xl` | (defined) | tightest | 1.0 | Display moment (rare) |
| `text-6xl` | (defined) | tightest | 1.0 | Landing hero (rare) |

**Codebase frequency** (Apr 30 grep):
- `text-sm` 2372 hits + `text-xs` 2169 = 4500+ small-text occurrences (Vietnamese-heavy UI ✅)
- `text-base` 425, `text-lg` 243, `text-xl` 384, `text-2xl` 152, `text-3xl` 146, `text-4xl` 117, `text-5xl` 35, `text-6xl` 9
- Arbitrary `text-[Npx]` rare (<10) ✅ minimal drift

### Type scale anti

- ❌ Arbitrary `text-[Npx]` for one-off — use `text-sm` / `text-base` etc.
- ❌ `text-7xl` or beyond — not in scale, drift
- ❌ Override line-height inline (`leading-[1.234]`) — use Tailwind preset `leading-tight/snug/normal/relaxed/loose` if needed
- ❌ Custom letter-spacing inline (`tracking-[0.123em]`) — preset `tracking-tighter/tight/normal/wide` if needed

## Hierarchy patterns (3-level stair max)

Per `02-layout/hierarchy-stair.md` (pending), Lingona caps **3 visual hierarchy levels** per page. Type pattern:

```
Level 1 (page primary) — text-4xl/5xl/6xl Playfair Italic OR text-3xl DM Sans bold
Level 2 (section)      — text-xl/2xl DM Sans semibold
Level 3 (item / body)  — text-base/sm DM Sans regular
```

Use Playfair Italic at Level 1 for "moment" pages (Landing hero, Result page band number, Level-up overlay). Use DM Sans bold Level 1 for utility pages (Settings, Profile main).

### Concrete examples

**Landing hero**:
```
Cùng luyện IELTS                    ← Level 1: text-6xl font-display italic
   với mình
[sub copy 1-2 lines]                ← Level 3: text-base font-sans
[Primary CTA teal]                  ← Level 3: button text-sm font-sans semibold
```

**Result page (Reading)**:
```
Band 7.0                            ← Level 1: text-5xl font-display italic
                                       (band number signature Playfair display)
Reading Practice — Cambridge 14     ← Level 2: text-lg font-sans medium
[feedback cards]                    ← Level 3: text-sm/base font-sans
[Lintopus visual + bubble text]     ← Lintopus side-by-side
```

**Onboarding screen**:
```
Bạn đang ở đâu trong hành trình     ← Level 2: text-2xl font-display italic OR
   IELTS?                              text-xl font-sans semibold
[options]                           ← Level 3: text-base font-sans
[CTA "Tiếp tục"]                    ← Level 3: button
```

## Mode-specific font swap

### Brand mode (default)

DM Sans body + Playfair Italic display (per pairing playbook above).

### Brand-soft mode (Practice)

DM Sans body + Playfair Italic display **occasional** (less moment-driven than brand mode). Practice = doing-mode, less ceremony.

### IELTS-authentic mode (Full Test + Battle Ranked)

**Font swap to Cambridge faithful**:

```
Body:        Georgia, serif         (NOT DM Sans)
UI label:    Arial, sans-serif      (NOT DM Sans)
Headline:    Georgia bold           (NOT Playfair Italic — Cambridge no italic display)
Numerical:   Arial                  (Cambridge timer/score Arial)
```

Why swap: IELTS-authentic mode = **Cambridge UI exact mimic**. Cambridge official paper test + computer-delivered IELTS use Georgia/Arial. DM Sans gamified = phá feel "thi thật".

Where: any page rendering inside Full Test wrapper or Battle Ranked match. Mode boundary controlled via `EXAM_UX[mode].fontFamily` runtime hook.

```jsx
// pseudo-code mode wrapper
<ExamModeProvider mode="full-test">  {/* applies Georgia + Arial CSS scope */}
  <ReadingExam>...</ReadingExam>
</ExamModeProvider>
```

KHÔNG hardcode Georgia/Arial trong component — use mode wrapper. KHÔNG mix DM Sans into Cambridge mode.

See `04-modes/ielts-authentic.md` for full mode spec.

## Vietnamese diacritics handling

Lingona = Vietnamese-first. Type rules:

- ✅ DM Sans + Playfair Display **đều support Vietnamese diacritics** (verified — both Google Fonts have full Latin Extended)
- ✅ Test rendering: `ấ ầ ậ ẩ ẫ ơ ộ ợ ỡ ữ ử ừ ụ ũ ý ỳ ỹ ỷ ỵ` — must render clean, no missing glyph
- ❌ Avoid fonts without Vietnamese diacritics support (Feather Bold Duolingo — no Vietnamese)
- ❌ Avoid `font-stretch: condensed` — distorts diacritics readability

## Numbers + numeric display

| Context | Font | Style |
|---------|------|-------|
| Band number (Result, BandProgressCard) | Playfair Italic | `text-5xl/6xl font-display italic` (signature moment) |
| Streak count (dashboard, daily) | DM Sans Medium | `text-2xl font-sans font-medium` |
| XP count | DM Sans Bold | `text-xl font-sans font-bold` |
| Leaderboard rank | DM Sans | `text-base/lg font-sans font-semibold` |
| Timer countdown | DM Sans tabular-nums | `text-2xl font-mono` or `font-sans tabular-nums` (KHÔNG jiggle khi digit change) |
| Achievement count | DM Sans | regular hierarchy |
| Price (Pro upgrade) | DM Sans | `text-3xl font-sans font-bold` |

**Rule**: tabular figures (`tabular-nums` or `font-mono`) for any number that **animates / counts up / countdown**. Else proportional figures default OK.

## Anti-patterns

- ❌ Inter font sneaked in (cool geometric, generic) — drop, use DM Sans
- ❌ Single-font-only setup (drop Playfair completely) — kill dual-font signature
- ❌ System-ui font fallback as primary — use DM Sans first
- ❌ Custom font upload that's not DM Sans / Playfair — flag Louis
- ❌ Playfair non-italic dominant — italic is the Lingona signature
- ❌ Heavy weights on small text (`font-bold text-xs`) — illegible Vietnamese
- ❌ Type scale inflate (text-9xl on landing) — caps at text-6xl
- ❌ Letter-spacing custom inline — use scale presets

## Audit checklist

```
Touch a page? Run:
1. grep "font-" src/<file>.tsx
   → Only font-sans / font-display / font-playfair / font-dm / font-mono allowed
   → No "font-inter" / "font-feather" / etc.

2. grep "text-\[" src/<file>.tsx
   → Should be 0 (use scale)

3. grep "leading-\[\|tracking-\[" src/<file>.tsx
   → Should be 0 (use presets)

4. Mode-specific check:
   - Page renders inside <ExamModeProvider mode="full-test"|"battle-ranked">?
   - If yes → DM Sans / Playfair MUST swap to Georgia / Arial via mode wrapper
   - If no → DM Sans + Playfair canon
```

## See also

- `01-foundations/palette.md` — color system
- `01-foundations/space-system.md` — vertical rhythm + spacing
- `02-layout/hierarchy-stair.md` — 3-level hierarchy rule (pending)
- `04-modes/ielts-authentic.md` — Cambridge font swap detail (pending)
- `00-manifesto/recognizable-from-100ft.md#3` — dual font signature 100ft test
- `00-manifesto/visual-vocabulary.md` — typography mapping per WARM/RIGOROUS axis
