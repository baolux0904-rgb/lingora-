# Desktop canvas — use the screen, KHÔNG corner-crowd

Lingona target = **70% desktop traffic** (per Wave 6 lock). Desktop layout PRIMARY, mobile responsive secondary. Most Vietnamese students use Lingona qua Chrome/Safari laptop.

Layout philosophy direct call-out từ Louis: *"bố cục logic theo kiểu người chứ KHÔNG nhét đống chữ vô góc rồi để trống screen"* — codify here.

## Reference viewport

| Viewport | Width | Use |
|----------|-------|-----|
| **Desktop primary** | 1440px | Design reference, screenshot benchmark |
| Desktop large | 1920px | Scale up via centered content (max-width clamp) |
| Desktop small | 1280px | Reduce gutter to 96px, content same |
| Tablet | 768–1023px | Layout collapse to 1-column, vertical stack |
| Mobile | 390px (iPhone) | Single column, touch-first |

**Design at 1440px**, scale up/down. KHÔNG design at 1920px (over-stretch on smaller). KHÔNG design at 1280px (cramped).

## 1440px canvas decomposition

```
┌─────────────────────────────────────────────────────────────┐ 1440px viewport
│                                                              │
│  ←─ 160px ─→  ←──────── 1120px content ────────→  ←─ 160px ─→
│   left gutter         max-width center            right gutter
│                                                              │
└─────────────────────────────────────────────────────────────┘

Total: 160 + 1120 + 160 = 1440 ✓
```

- **Side gutter**: 160px each side (≥160px MANDATORY at 1440px)
- **Content max-width**: 1120px center
- **Content density**: never edge-to-edge, never corner-pinned

```jsx
// Standard page wrapper
<div className="px-40 mx-auto max-w-[1120px]">
  {/* page content */}
</div>

// Or via Tailwind container
<div className="container mx-auto px-40 max-w-[1280px]">
  {/* with internal max-w-[1120px] for content */}
</div>
```

## 12-column grid inside content

1120px content split 12 columns × ~93.3px each, gutter 24px (Tailwind `gap-6`).

```jsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-7">  {/* 45% — primary text */}
  <div className="col-span-5">  {/* 38% — visual / supporting */}
</div>
```

Common column splits:

| Pattern | Split | Use |
|---------|-------|-----|
| Hero asymmetric | 7 / 5 | Landing, Onboarding, "moment" page |
| Article + sidebar | 8 / 4 | Settings, Profile detail |
| 3-column features | 4 / 4 / 4 | Pricing tiers, feature list |
| 2-column equal | 6 / 6 | Practice page (passage / questions in IELTS-authentic) |
| Full-width | 12 | Data table, leaderboard list |

## Pattern C — asymmetric balanced (signature)

Per `00-manifesto/recognizable-from-100ft.md#5`, Lingona desktop default = **asymmetric balanced**.

```
1440px viewport @ 100% scale:

│←160px gutter→│←──── 1120px content (12-col) ────→│←160px gutter→│

│              │←─── col 1-7 (text 45%) ────→│ gap │← col 8-12 (visual 38%) →│              │
│              │                              │     │                        │              │
│              │  Cùng luyện IELTS với mình   │     │      ╭─────────╮       │              │
│              │  ↑ text-5xl Playfair italic  │     │      │         │       │              │
│              │                              │     │      │ Lintopus │       │              │
│              │  [sub copy 1-2 lines DM Sans]│     │      │  visual │       │              │
│              │                              │     │      │  ~280px │       │              │
│              │  [Primary CTA teal rounded-md]│     │      ╰─────────╯       │              │
│              │                              │     │                        │              │
```

Asymmetric balance: text dense (45%) ↔ visual mass (38%). Visual weight cân về 2 phía dù tỉ lệ lệch.

```jsx
// Landing hero asymmetric
<section className="px-40 py-24">
  <div className="max-w-[1120px] mx-auto">
    <div className="grid grid-cols-12 gap-6 items-center">
      <div className="col-span-7">
        <h1 className="text-5xl md:text-6xl font-display italic leading-tight">
          Cùng luyện IELTS<br />với mình
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-md">
          {sub_copy_vietnamese_first_dm_sans}
        </p>
        <button className="mt-8 px-8 py-4 bg-teal text-cream rounded-md font-semibold">
          Bắt đầu luyện
        </button>
      </div>
      <div className="col-span-5 flex justify-end">
        <Mascot size={320} mood="happy" />
      </div>
    </div>
  </div>
</section>
```

## Pattern A — symmetric (avoid as default)

```
│←──── 1120px content ────→│
│                          │
│       ┌──────────┐       │
│       │ Hero text│       │  ← Centered headline
│       │  center  │       │
│       └──────────┘       │
│         [CTA center]     │
│                          │
│  ┌────┐ ┌────┐ ┌────┐    │  ← 3 features symmetric
│  │ F1 │ │ F2 │ │ F3 │    │
│  └────┘ └────┘ └────┘    │
```

❌ **AI-template smell**. v0/Lovable default. Generic.

OK only for:
- Form-only pages (login, register)
- Modal centered (small viewport)
- Tablet collapse (forced symmetric due to width)

## Pattern B — corner-crowd (BAN)

```
│←──── 1120px content ────→│
│                          │
│  Hero text dồn góc       │
│  trên trái (35% width)   │
│  [CTA]                   │
│                          │
│                          │
│         (65% empty)      │
│                          │
│                          │
```

❌ **Lazy mobile-port**. Louis call out anti-pattern. Refactor to Pattern C asymmetric.

Diagnosis signs:
- Content cluster < 50% width on desktop
- Empty space concentrated on opposite corner (not intentional breathing)
- Hero text ends at 30-40% width while viewport is 1440px
- Mobile design mockup ported direct without desktop enhancement

Fix: rebalance — add visual mass (Lintopus / illustration / data viz / supporting card) on opposite side. Pattern C target.

## Layout templates per page type

### Landing

- Hero: Pattern C asymmetric (text 45% / Lintopus 38%)
- Features section: Pattern A 3-column OK (functional comparison) OR Pattern C alt (text + visual interleave)
- Pricing: Pattern A 4-column tier (functional comparison) — OK exception
- Final CTA: Pattern C asymmetric

### Onboarding

- Each screen: Pattern C asymmetric (illustrations big, text focused 45%)
- Progress indicator: top bar full-width
- Continue CTA: bottom-right or bottom-center

### /home dashboard

- Hero band stat: Pattern A center-card OR Pattern C with BandProgressCard left + quick-action buttons right
- Lesson grid: Pattern A 3-column / 4-column responsive
- Streak / XP / Badge inline: Pattern A horizontal row

### Practice (Speaking / Writing / Reading / Listening)

- Entry tab list: Pattern A grid
- In-task: Pattern 6/6 split (passage left, question/input right) OR full-width (Speaking record)
- Result: Pattern C asymmetric (band number left, Lintopus + feedback cards right)

### Battle

- BattleTab home: Pattern C (queue button left, Lintopus + battle history right)
- Match in-progress: Pattern 6/6 (your side / opponent side)
- Result: Pattern C (VICTORY/DEFEAT prominent + Lintopus + score breakdown)

### Profile / Settings

- Settings list: Pattern 8/4 (settings list left, contextual help right)
- Profile main: Pattern C asymmetric (avatar + bio left, achievement showcase right)

### Auth (login / register)

- Pattern A symmetric center form (exception OK — form-only is the content)

## Larger viewport scaling (1920px, 2560px)

```
@ 1920px:
- Side gutter: 400px each (1920 - 1120) / 2 = 400
- Content stays 1120px max-width center
- KHÔNG stretch content to fill

@ 2560px (4K):
- Side gutter: 720px each
- Content 1120px center
- KHÔNG add columns — keep 12-col grid

@ ultra-wide (3440px):
- Same — content 1120px center, gutter expand
```

Use `max-w-[1120px] mx-auto` to lock. Side gutter scales naturally via CSS `margin-inline: auto`.

## Smaller desktop scaling (1280px)

```
@ 1280px:
- Side gutter: 96px each (reduced from 160)
- Content: 1088px (1280 - 192)
- Same 12-col grid, columns slightly narrower
- Asymmetric ratio same (7/5)
```

```jsx
<section className="px-24 lg:px-40">
  <div className="max-w-[1120px] mx-auto">
    {/* 96px gutter <1440px, 160px gutter ≥1440px */}
  </div>
</section>
```

## Tablet collapse (768–1023px)

```
@ 768px:
- Side gutter: 32px
- Content: 704px
- LAYOUT COLLAPSE: 12-col → vertical stack
- Asymmetric Pattern C → text first, visual below
```

```jsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  <div className="md:col-span-7">{/* text */}</div>
  <div className="md:col-span-5">{/* visual */}</div>
</div>
```

## Anti-patterns

- ❌ Edge-to-edge content (no gutter) — looks like landing-page-builder template
- ❌ Side gutter < 96px on 1440px+ — cramped
- ❌ Content max-width > 1280px — line length too long, eye fatigue
- ❌ Content max-width < 720px on desktop — too narrow, looks mobile-port
- ❌ Pattern B corner-crowd — Louis-flagged anti
- ❌ Multiple max-widths nested (max-w-7xl > max-w-6xl > max-w-4xl) — pick one, propagate
- ❌ Asymmetric direction inconsistent — pick text-left always (left-leaning hero), KHÔNG mix
- ❌ `position: absolute` to fake desktop layout — use grid instead

## Audit checklist

```
1. Open page at 1440px viewport (Chrome DevTools).

2. Measure side gutter:
   - Left edge → first content pixel: ≥ 160px? ✓
   - Right edge → last content pixel: ≥ 160px? ✓

3. Measure content max-width:
   - Content cluster spans ≤ 1120px? ✓

4. Measure hero asymmetric ratio:
   - Text block width / viewport width ≈ 35%? ✓ (45% of 1120 = 504, 504/1440 = 35%)
   - Visual block width / viewport width ≈ 30%? ✓ (38% of 1120 = 425, 425/1440 = 30%)
   - Total content cluster ≈ 78% viewport, 22% gutter

5. Empty space distribution:
   - Whitespace evenly distributed (gutters + section breaks + intra-content breath)? ✓
   - Whitespace concentrated on opposite corner of content (Pattern B)? ✗ refactor

6. Resize to 1280px → layout still works? ✓
7. Resize to 768px → collapse to vertical? ✓
8. Resize to 390px → mobile single column? ✓

9. Run identity test (per `00-manifesto/recognizable-from-100ft.md`):
   - 5-signal check pass at 1440px? ✓
```

## See also

- `02-layout/empty-space-philosophy.md` — whitespace = confidence philosophy
- `02-layout/mobile-rhythm.md` — mobile cadence detail
- `02-layout/hierarchy-stair.md` — 3-level visual hierarchy
- `02-layout/result-page-anatomy.md` — signature result page layout
- `02-layout/grid-vs-flow.md` — when grid, when free flow
- `01-foundations/space-system.md` — spacing scale + asymmetric dimensions
- `00-manifesto/recognizable-from-100ft.md#5` — asymmetric Pattern C signal
