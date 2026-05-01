# Empty space philosophy — whitespace = confidence

## Core thesis

**Empty space ≠ wasted space.** Empty space ≠ "we don't have content yet". Empty space = **intentional breathing**, **focus signal**, **confidence**.

Pre-Wave-6 audit found Lingona pages có 2 anti:
1. **Cramped** (Pattern B per `02-layout/desktop-canvas.md`) — text dồn 1 góc, 65% screen empty
2. **Cluttered** — 13+ icons per screen (Duolingo critique applied to Lingona drift)

Both anti say "we don't trust whitespace". Wave 6 fix: **trust whitespace**.

## Why whitespace matters for Lingona target

Vietnamese teen 16–25 daily exposure:

- Facebook feed (cluttered)
- TikTok (full-bleed dense)
- Zalo chat (cluttered)
- Trung tâm IELTS landing pages (banner-heavy, cluttered)
- Study4 dashboard (table-heavy)

→ Whitespace is **counterintuitive** for VN target. They DON'T expect it.

→ Whitespace becomes **distinctive signal**. "App này khác. Sạch hơn. Có không gian thở."

Per `00-manifesto/recognizable-from-100ft.md` test: whitespace is signal #5. KHÔNG có whitespace = fail 100ft test.

## Ratio targets per page type

| Page | Whitespace : Content | Notes |
|------|----------------------|-------|
| Landing | 50:50 | Most generous, signature first impression |
| Onboarding | 45:55 | Focus on choice + Lintopus presence |
| /home dashboard | 35:65 | Information-dense but breath visible |
| Practice (in-task) | 25:75 | Focus mode, content dominant |
| Reading split | 20:80 | Cambridge-like density (passage + Q text-heavy) |
| Result page | 45:55 | Moment + Lintopus + feedback breathing |
| Settings / Profile | 30:70 | Functional list, density OK |
| Battle in-progress | 30:70 | Match focus, drama register |
| Battle Result | 45:55 | VICTORY/DEFEAT moment + Lintopus + breakdown |
| Error / 404 | 60:40 | Heavy whitespace + Lintopus moment |
| Empty state | 70:30 | Most whitespace, encourage prompt-to-action focus |
| Achievement unlock | 55:45 | Moment + Lintopus + earned weight |

**Off-target tolerance**: ±10%. Off ≥10% → refactor.

**How to measure**:
1. Screenshot page at 1440×900 desktop reference
2. Pixel-pick: count "content" pixels (text + images + UI controls + colored backgrounds intentional)
3. Calculate whitespace = 100 - content
4. Compare to table

**OR rough estimate**:
- Squint at screenshot (blur eyes)
- Estimate "filled" % vs "empty" %
- Compare to target

## Where whitespace lives

Whitespace is composed of:

1. **Side gutter** (left + right) — 160px each on 1440px desktop
2. **Section break** (vertical) — 96px between major sections
3. **Sub-section break** — 48px between related groups
4. **Card-internal padding** — 24px standard
5. **Card-to-card gap** — 24px standard
6. **Inline element spacing** — 8/12/16px
7. **Line-height (leading)** — 1.5–1.7 body
8. **Letter-spacing (tracking)** — preset per type scale
9. **Above hero text** — 96–128px page top breath
10. **Around hero visual** (Lintopus) — 24–48px breathing each side
11. **Between hero text and CTA** — 32–48px
12. **Above footer** — 96–128px breath before footer

Sum each component → total whitespace. Each individual component small, total whitespace adds up to 35–60% of viewport.

## Anti-patterns

### ❌ "Filling the screen" trap

Designer instinct: "screen empty = wasteful, add more content / decoration / illustration".

❌ Add background pattern (mesh / gradient / dots) "to make page interesting"
❌ Add decoration SVG floating in empty space (random)
❌ Add testimonial carousel (fake stats / fake quotes)
❌ Add "trusted by 1.5M users" section (Lingona = no fake numbers)
❌ Add 4-column features just to fill bottom
❌ Stretch hero to 100vh empty (lazy version)

### ❌ "Blog-feel" overstretch

Long pages with infinite scroll, each section narrow content width 600px center, side gutter 800px each side.

✅ Lingona content width 1120px center, gutter 160px — **wider than blog**, focused.

### ❌ Edge-to-edge content

```jsx
// ❌ Fills viewport edge-to-edge
<section className="px-0 ...">
  <div className="grid grid-cols-3 ...">
```

```jsx
// ✅ Always has gutter
<section className="px-40 ...">
  <div className="max-w-[1120px] mx-auto grid grid-cols-3 ...">
```

### ❌ Cluttered card content

```jsx
// ❌ 8 elements crammed in card
<div className="p-3 flex flex-wrap gap-1">
  <Avatar /> <Name /> <Badge /> <Stats /> <Action /> <Action /> <More /> <Time />
</div>
```

```jsx
// ✅ Focused card (3-4 elements)
<div className="p-6 flex flex-col gap-3">
  <div className="flex items-center gap-3">
    <Avatar /> <Name />
  </div>
  <Stats />
  <Action />
</div>
```

### ❌ Decorative whitespace (faux)

Section labeled "WHITESPACE" với background solid gray block — KHÔNG, đó không phải whitespace, đó là nội dung trống. Whitespace = page background visible.

## Patterns of intentional whitespace

### Pattern: Above-headline breath

```jsx
<section className="pt-32 pb-24">  {/* 128px top, 96px bottom */}
  <h1 className="text-6xl">...</h1>
  <p className="mt-6 ...">...</p>
</section>
```

128px top breath → reader takes 1 second to "land", scan, then read. Hero feels confident.

### Pattern: Card surrounding breath

```jsx
<section className="py-24">
  <div className="max-w-[1120px] mx-auto">
    {/* Card has its own 32px breath top/bottom */}
    <div className="rounded-xl p-8 bg-cream-secondary">
      ...
    </div>
  </div>
</section>
```

Card breathes inside larger section breathing → nested whitespace.

### Pattern: Visual asymmetric breath

```jsx
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-7">
    {/* Text 45% width */}
  </div>
  <div className="col-span-5 flex justify-end">
    {/* Visual 38% width, right-aligned */}
    {/* Right side breath = right gutter 160px */}
  </div>
</div>
```

Visual sits 38% width but right-aligned → breath between visual and right edge of content (not just outer gutter).

### Pattern: Pre-CTA breath

```jsx
<h1>Headline</h1>
<p className="mt-6 ...">{sub_copy}</p>
<button className="mt-12 ...">  {/* 48px before CTA */}
  Bắt đầu luyện
</button>
```

48px between sub-copy and CTA = reader pause, decide, then click. CTA feels earned, not pushy.

## Audit checklist

```
1. Open page screenshot 1440×900.

2. Squint test:
   - Identify "content blobs" (text clusters, images, UI groups)
   - Identify "empty regions"
   - Estimate ratio
   - Compare to per-page-type table above
   - Off ≥10% → refactor

3. Measure side gutter:
   - 1440px viewport: ≥160px each side ✓
   - 1280px: ≥96px each side ✓

4. Measure section breaks:
   - Major sections: ≥96px ✓
   - Sub-section: ≥48px ✓

5. Card density:
   - Card has 3-5 child elements? ✓ (8+ = cluttered)
   - Card padding ≥24px? ✓

6. Decoration count:
   - Decorative elements (icons, illustrations) <5 per viewport screen? ✓ (Duolingo anti = 13+)
   - All elements have semantic purpose? ✓ (decorative-only flagged)

7. Background patterns:
   - Solid bg-cream/bg-card? ✓
   - Gradient / mesh / noise? ✗ ban (per `09-anti-patterns/ai-generated-smell.md`)

8. Hero breath:
   - ≥96px top breath before h1? ✓
   - ≥48px before primary CTA? ✓

9. Page bottom breath:
   - ≥96px before footer? ✓

10. 100ft test (per `00-manifesto/recognizable-from-100ft.md`):
    - Signal #5 (asymmetric layout + breathing) pass? ✓
```

## Counter-question for designer

Khi feel "page looks empty, add something":

1. **Tại sao feel empty?** Có specific element thiếu, hay just tổng thể airy?
2. **Specific thiếu** → add specific (Lintopus / illustration / supporting card với purpose)
3. **Tổng thể airy** → đó là whitespace philosophy. Trust nó. Pass 100ft test.

KHÔNG add decoration "to fill". KHÔNG add testimonial "to legitimize". Whitespace tự legitimize.

## See also

- `02-layout/desktop-canvas.md` — gutter + max-width specs
- `02-layout/mobile-rhythm.md` — mobile reduced breath
- `02-layout/hierarchy-stair.md` — 3-level visual hierarchy (whitespace separates levels)
- `01-foundations/space-system.md` — spacing scale (raw numbers)
- `00-manifesto/recognizable-from-100ft.md#5` — asymmetric layout signal includes whitespace
- `09-anti-patterns/desktop-waste.md` — corner-crowd anti
- `09-anti-patterns/ai-generated-smell.md` — gradient-fill / decoration anti
