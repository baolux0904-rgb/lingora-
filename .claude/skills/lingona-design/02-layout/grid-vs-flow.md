# Grid vs flow — choose the right layout primitive

Two layout primitives in Lingona:

- **Grid** = strict alignment, equal items, comparison/data context
- **Flow** = natural document flow, mixed sizes, narrative/utility context

Each page primarily uses ONE. Mixing reduces clarity.

## When to use Grid

### Grid signals

- Items are **comparable** (price tiers, leaderboard ranks, achievement badges)
- Items have **equal weight** (all are alternatives, not narrative steps)
- Items have **uniform structure** (each card has same fields)
- Layout requires **scanning** (eye jumps across to compare)
- Data has **inherent rows/columns** (table, calendar, schedule)

### Grid use cases in Lingona

| Page | Grid type | Pattern |
|------|-----------|---------|
| Pricing tier (Pro upgrade) | 4-column grid | Equal cards, "Most popular" highlighted |
| Lesson list (legacy /home-legacy) | 3-4 column responsive | Equal lesson cards |
| Achievement badge gallery | 4-6 column responsive | Badge tiles |
| Leaderboard | Table grid (rank/user/score) | Aligned rows |
| Friend list | 1-column scroll list (mobile) / 2-column (desktop) | Equal friend cards |
| Battle history | Table-like row grid | Match results aligned |
| Sub-skill feedback cards (Result page) | 3-column grid | Equal score cards |
| Onboarding option cards | 2x3 grid (6 options) | Equal choice cards |
| Reading exam tab (Practice + Full Test toggle) | 2-column grid | Equal mode cards |

```jsx
// Pricing 4-tier grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {tiers.map(tier => <PricingCard key={tier.id} {...tier} />)}
</div>

// Achievement gallery
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
  {badges.map(badge => <BadgeTile key={badge.id} {...badge} />)}
</div>

// Sub-skill feedback (result page)
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {subSkills.map(skill => <FeedbackCard {...skill} />)}
</div>
```

### Grid rules

- Use Tailwind `grid grid-cols-{N}` with `gap-{4|6|8}` (16/24/32px)
- Mobile collapse: `grid-cols-1 md:grid-cols-2 lg:grid-cols-{N}`
- Equal `min-height` items if content varies (use `auto-rows-fr` for uniform row heights)
- `gap-6` (24px) standard for card grid
- KHÔNG mix grid sizes within row (don't have col-span-3 next to col-span-9 in 12-col grid unless intentional asymmetric pattern)

## When to use Flow

### Flow signals

- Content is **sequential** (read top-to-bottom)
- Items have **different weights** (h1 then paragraph then quote then h2 then list)
- Layout follows **narrative** or **task progression**
- Items have **varied structure** (some have images, some don't)
- User reads, doesn't scan

### Flow use cases in Lingona

| Page | Flow type |
|------|-----------|
| Landing (hero → features → testimonial → CTA) | Vertical scroll narrative |
| Onboarding screen (single screen has narrative, even if options below are grid) | Heading + body + grid + CTA flow |
| Settings list | Vertical group flow with section breaks |
| Profile main (avatar + bio + stats + achievements) | Mixed-size vertical flow |
| Speaking practice in-task | Linear flow: prompt → record → feedback |
| Writing practice in-task | Linear flow: task brief → editor → submit |
| Detailed feedback (result page bottom) | Article-like flow (heading + paragraph + bullet list) |
| Legal pages (Privacy, Terms, Refund) | Long-form prose flow |
| Email change flow | Step-by-step flow |

```jsx
// Landing flow
<main>
  <HeroSection />          {/* Pattern C asymmetric */}
  <FeaturesSection />      {/* Could contain INSIDE a grid */}
  <PricingSection />       {/* Contains a grid */}
  <FinalCTASection />      {/* Pattern C asymmetric */}
</main>

// Settings flow
<main className="max-w-2xl mx-auto py-12">
  <h1 className="text-3xl">Settings</h1>
  <section className="mt-12 space-y-6">
    <SettingItem ... />
    <SettingItem ... />
    <SettingItem ... />
  </section>
  <section className="mt-16">
    <h2 className="text-xl mb-4">Tài khoản</h2>
    <SettingItem ... />
    <SettingItem ... />
  </section>
</main>
```

### Flow rules

- Use semantic HTML (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`)
- Vertical rhythm via `space-y-{N}` or per-element `mt-{N}` / `mb-{N}`
- Single column max-width (480–720px for prose, 1120px for app pages)
- KHÔNG center-align long prose (left-align readable, center hurts scan)
- Section breaks via `<section className="mb-24">` (96px standard)

## Hybrid: Grid INSIDE Flow

Most pages = flow with grid sections inside.

```jsx
<main>
  {/* Flow */}
  <section className="mb-24">
    <h2>Pricing</h2>
    <p>Sub copy</p>
    {/* Grid inside flow */}
    <div className="grid grid-cols-4 gap-6 mt-8">
      {tiers.map(...)}
    </div>
  </section>
  
  {/* Flow */}
  <section className="mb-24">
    <h2>Why Lingona</h2>
    {/* Another grid inside flow */}
    <div className="grid grid-cols-3 gap-6 mt-8">
      {features.map(...)}
    </div>
  </section>
</main>
```

OK pattern. Flow controls page-level rhythm, grid controls section-level alignment.

## When to AVOID Grid

❌ Items are narrative steps (use flow)
❌ Items have mixed importance (use flow with hierarchy)
❌ User reads top-to-bottom (use flow)
❌ Long prose / paragraph (use flow, max-width 720px)
❌ Force-fitting different content into uniform tiles (lose information)
❌ 3 cards on a settings page just to "fill space" (use flow list)

## When to AVOID Flow

❌ 8+ similar cards stacked vertically (use grid for scan)
❌ Comparison-by-design (price tiers, feature comparison) — grid signals comparison
❌ Calendar / schedule (grid is semantic)
❌ Leaderboard (table grid signals ranking)

## Grid asymmetric (Pattern C in result/landing context)

Special case: **2-column grid with intentional ratio mismatch** (not equal columns).

```jsx
// Pattern C asymmetric — not pure grid (uniform), not pure flow
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-7">{/* text 45% */}</div>
  <div className="col-span-5">{/* visual 38% */}</div>
</div>
```

This is grid mechanically, but feels like flow visually. OK pattern for hero, result page top, onboarding screens.

## Mode-specific layout primitive

### Brand mode

- Landing: Flow with grid sections
- Dashboard: Flow with grid sections (lesson grid, achievement grid)
- Profile: Flow with grid sections (achievement showcase grid)
- Result page: Pattern C asymmetric (grid asymmetric) + flow below for feedback

### Brand-soft mode (Practice)

- Practice entry: Grid (skill list)
- Practice in-task: Flow (linear task)
- Practice result: Pattern C asymmetric + flow

### IELTS-authentic mode (Full Test)

- Full Test entry: Flow (instructions read-through)
- Reading split: 2-column grid (passage left 50%, questions right 50%) — Cambridge UI
- Writing exam: Flow (task brief on top, editor below)
- Listening: Flow (audio at top, questions below)
- Speaking exam: Flow (prompt + record button)

## Anti-patterns

- ❌ Forcing grid layout for narrative content (sections lose hierarchy, all look equal)
- ❌ Forcing flow layout for comparable items (loss of scanning ability)
- ❌ Grid with 1 column (just use flow)
- ❌ 7+ column grid on desktop (each item too narrow to be useful)
- ❌ Mixed grid + flow in same row (visual noise)
- ❌ Asymmetric grid that looks like alignment error (col-span-3 next to col-span-9 randomly)
- ❌ Card grid where each card has different height (use `auto-rows-fr` or pad shorter cards)

## Decision tree: grid or flow?

```
Q1: Are items comparable / alternatives / equal weight?
   YES → Grid
   NO  → Flow

Q2: Does user scan or read?
   SCAN → Grid
   READ → Flow

Q3: Do items have uniform structure?
   YES → Grid
   NO  → Flow

Q4: Is content narrative / sequential?
   YES → Flow
   NO  → may be Grid

Q5: Is content data (table-shape inherent)?
   YES → Grid
   NO  → Flow
```

## Audit checklist

```
1. Page primary primitive identified?
   - Flow primary (most pages) ✓
   - Grid primary (pricing, leaderboard, gallery) ✓

2. Grids inside flow (allowed) — check uniform structure?
   - All items in grid have same fields? ✓
   - Grid columns responsive (collapse on mobile)? ✓
   - Gap 16/24px standard? ✓

3. Flow rhythm consistent?
   - Vertical rhythm via space-y-* or mb-*? ✓
   - Section breaks 96px? ✓
   - No random vertical spacing? ✓

4. Asymmetric Pattern C used appropriately?
   - Hero / result / onboarding ✓
   - NOT in middle of long flow (jarring) ✓

5. Mode-specific:
   - IELTS Reading 2-column grid ✓
   - Settings flow (no force-grid) ✓
```

## See also

- `02-layout/desktop-canvas.md` — 12-column grid system + Pattern C asymmetric
- `02-layout/hierarchy-stair.md` — hierarchy works in both grid and flow
- `02-layout/empty-space-philosophy.md` — whitespace logic
- `02-layout/result-page-anatomy.md` — grid + flow hybrid example
- `01-foundations/space-system.md` — gap + spacing scale
