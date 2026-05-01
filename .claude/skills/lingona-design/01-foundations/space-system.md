# Space system — 8pt grid, breathing ratios, asymmetric layout

Lingona uses **8pt base grid** với 3-tier spacing system: component-internal / sub-section / section. Whitespace = confidence, KHÔNG laziness (per `00-manifesto/visual-vocabulary.md`).

## 8pt base grid

All spacing snaps to multiples of **4px** (Tailwind unit). Visual rhythm hits at **8px** consistently.

| Tailwind class | px | Use |
|----------------|----|-----|
| `0` | 0 | (rare — explicit zero) |
| `0.5` | 2 | (rare — micro adjustment) |
| `1` | 4 | Tight icon ↔ text gap |
| `2` | 8 | Component-internal small |
| `3` | 12 | Component-internal medium |
| `4` | 16 | Component-internal large / card padding |
| `5` | 20 | (rare) |
| `6` | 24 | Card-to-card gap, sub-section item spacing |
| `8` | 32 | Sub-section internal break |
| `10` | 40 | (rare) |
| `12` | 48 | Sub-section break |
| `16` | 64 | (rare) |
| `20` | 80 | Section partial break |
| `24` | 96 | **Section break** (canonical) |
| `32` | 128 | Hero / landing dramatic break |
| `40` | 160 | Side gutter (1440px desktop) |

## 3-tier spacing system

### Tier 1 — Component-internal (8 / 12 / 16px)

Spacing **inside** a component (button padding, card padding, list item gap, icon ↔ text gap).

```jsx
// Button: 8px y, 16px x
<button className="py-2 px-4">

// Card: 24px padding
<div className="p-6">

// List item gap: 12px
<ul className="space-y-3">

// Icon ↔ label: 8px
<div className="flex items-center gap-2">
```

### Tier 2 — Sub-section (24 / 32 / 48px)

Spacing **between** related elements within a section (card-to-card, related-group gap).

```jsx
// Card grid: 24px gap
<div className="grid grid-cols-3 gap-6">

// Stacked cards: 32px between
<div className="space-y-8">

// Sub-section header → content: 48px
<header className="mb-12">
```

### Tier 3 — Section (96 / 128px)

Spacing **between** major sections of a page (hero → features, features → testimonial, footer).

```jsx
// Section break: 96px
<section className="mb-24">

// Hero dramatic break: 128px
<section className="pb-32">
```

## Asymmetric desktop layout dimensions

**Lingona desktop signature** (per `00-manifesto/recognizable-from-100ft.md#5` Pattern C):

```
1440px viewport reference:
├── 160px left gutter
├── 1120px content max-width
│   ├── 45% text block (504px)
│   ├── ~5% breathing gap (56px)
│   └── 38% visual block (425px)
│   (12% remaining = right-side breath inside content)
└── 160px right gutter
```

```jsx
// Desktop landing hero pattern
<section className="px-40 py-24">  {/* 160px x 96px */}
  <div className="max-w-[1120px] mx-auto">
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-7">  {/* 45% + breath */}
        <h1 className="text-5xl font-display italic">...</h1>
        <p className="mt-6 text-base">...</p>
        <button className="mt-8 ...">...</button>
      </div>
      <div className="col-span-5 flex justify-end">  {/* 38% + right margin */}
        <Mascot size={320} />
      </div>
    </div>
  </div>
</section>
```

### Smaller desktop (1280px)

```
1280px viewport:
├── 96px left gutter (reduced from 160)
├── 1088px content max-width
└── 96px right gutter
```

Asymmetric ratio same (45% / 38% with gap).

### Tablet (768px)

```
768px viewport:
├── 32px left gutter
├── 704px content
└── 32px right gutter
```

Layout collapse to vertical stack (KHÔNG 2-column at tablet).

### Mobile (390px iPhone reference)

```
390px viewport:
├── 16px left gutter
├── 358px content
└── 16px right gutter
```

Single column, full-width content within gutter. Hero text top, Lintopus middle/bottom.

See `02-layout/mobile-rhythm.md` (pending) for mobile cadence detail.

## Breathing ratios

### Whitespace : content ratio per page type

| Page type | WS : content | Why |
|-----------|--------------|-----|
| Landing | **50:50** | Generous, confidence, KHÔNG cramped |
| Onboarding | **45:55** | Focused intent — content slightly dominant |
| /home dashboard | **35:65** | Information-dense but breathing |
| Practice (in-task) | **25:75** | Focus mode, content dominant |
| Result page | **45:55** | Moment + breathing + Lintopus visual |
| Settings / Profile | **30:70** | Functional, dense list |
| Battle in-progress | **30:70** | Match focus, content dominant |
| Error / 404 | **60:40** | Heavy whitespace + Lintopus center moment |

**Rule**: WS includes side gutter + section break + intra-paragraph leading + empty space around visual elements. Content = text + image + UI control area.

Measure: pixel-pick screenshot, calculate. Off by ≥10% → refactor.

### Anti — cramped (Pattern B per 100ft #5)

❌ Form 360px wide trong 1440px viewport (mobile-port lazy)
❌ Hero text 100% width edge-to-edge
❌ 3-column grid edge-to-edge (gutter < 24px)
❌ Section break 0 (sections butted)
❌ Card padding < 16px (claustrophobic)

### Anti — over-spaced

❌ Hero 100vh empty (lazy "we don't have content yet")
❌ Section break > 200px (parallax fatigue)
❌ Card padding > 48px (waste, content swims)
❌ Line-height > 2.0 body (illegible)

## Vertical rhythm

Standard rhythm cho text-heavy page (Settings, blog, legal):

```
section break:     96px / mt-24
sub-section break: 48px / mt-12
paragraph break:   24px / mt-6
inline gap:        16px / mt-4
list item:         12px / mt-3
component gap:     8px  / mt-2
inline tight:      4px  / mt-1
```

Rhythm consistent across page = visual calm. Random spacing = chaos.

## Padding rules per component

### Card

| Card type | Padding | Why |
|-----------|---------|-----|
| Tight (sidebar item, list row) | `p-3` (12px) | Compact list density |
| Default (BandProgressCard, feature card) | `p-6` (24px) | Standard breathing |
| Hero card (Result page, Pro upgrade) | `p-8` (32px) | Moment, dramatic |
| Modal | `p-6 sm:p-8` | Default + larger sm breakpoint |

### Button

| Button size | Padding | Use |
|-------------|---------|-----|
| Small | `px-3 py-1.5` (12 / 6) | Inline, badge-like |
| Default | `px-4 py-2` (16 / 8) | Standard CTA |
| Large | `px-6 py-3` (24 / 12) | Hero CTA |
| XL hero | `px-8 py-4` (32 / 16) | Landing primary |

### Input

| Input type | Padding | Use |
|------------|---------|-----|
| Text input | `px-4 py-2.5` (16 / 10) | Standard form field |
| Search | `pl-10 pr-4 py-2` (40 / 16 / 8) | Icon left + text |
| Textarea | `p-4` (16) | Multi-line form |

## Anti-patterns

- ❌ Arbitrary spacing `pt-[37px]` — use scale
- ❌ Inconsistent vertical rhythm (24 / 32 / 24 / 48 random) — pick rhythm, lock
- ❌ `space-x-*` and `space-y-*` mix in same flex — pick one
- ❌ Negative margins to "fix" spacing — refactor parent instead
- ❌ Zero spacing between sections (butt sections) — always 96px section break
- ❌ Cram all content into top-third of viewport on desktop (Pattern B per 100ft #5)

## Audit checklist

```
Touch page layout?

1. grep arbitrary spacing:
   grep -E "(p|m|gap|space)-\[" src/<file>.tsx
   → Should be 0 hits

2. Side gutter check (desktop pages):
   - Landing / hero pages → px-40 (160px) at 1440px ref
   - App pages → px-24 or px-16
   - Mobile → px-4

3. Section break check:
   - Major sections → mb-24 (96px) standard
   - KHÔNG 0 between major sections

4. WS:content ratio:
   - Pixel-pick screenshot, measure
   - Compare to per-page-type table above
   - Off >10% → flag

5. Vertical rhythm consistency:
   - Sample 3 spacing values per page
   - All multiples of 8px? → pass
   - Random? → refactor
```

## See also

- `02-layout/desktop-canvas.md` — desktop canvas detail (pending)
- `02-layout/empty-space-philosophy.md` — whitespace as confidence (pending)
- `02-layout/hierarchy-stair.md` — 3-level hierarchy (pending)
- `02-layout/mobile-rhythm.md` — mobile cadence (pending)
- `00-manifesto/recognizable-from-100ft.md#5` — asymmetric layout signal
- `01-foundations/typography.md` — type scale tied to vertical rhythm
