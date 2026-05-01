# Hierarchy stair — 3 levels max

## Core rule

Lingona caps **3 visual hierarchy levels** per page. KHÔNG 4. KHÔNG 5. **3 lock**.

Why: 4+ levels = cognitive load. User can't decide what to look at first. Decision paralysis. Page feels chaotic.

3 levels enforce: 1 thing primary → 1 thing supporting → 1 thing detail. Clean stair.

## The 3 levels

| Level | Role | Visual signal | Frequency per page |
|-------|------|---------------|---------------------|
| **L1 — Primary** | "Look here first" | Largest type + brightest color OR strongest contrast | 1 per viewport screen |
| **L2 — Supporting** | "Look here next" | Medium type + secondary color | 2-5 per viewport screen |
| **L3 — Detail** | "Read when needed" | Body type + muted color | unlimited |

## Encoding hierarchy through 4 channels

Hierarchy is signaled simultaneously across 4 visual channels. Each level pulls from each channel:

### Channel 1: Type size + weight

| Level | Type |
|-------|------|
| L1 | `text-4xl/5xl/6xl` Playfair Italic OR `text-3xl` DM Sans bold |
| L2 | `text-xl/2xl` DM Sans semibold |
| L3 | `text-base/sm` DM Sans regular |

### Channel 2: Color contrast

| Level | Color |
|-------|-------|
| L1 | `text-navy` (max contrast on cream bg) |
| L2 | `text-navy-light` or `text-gray-700` |
| L3 | `text-gray-500` or `text-gray-600` |

### Channel 3: Weight (visual mass)

| Level | Weight |
|-------|--------|
| L1 | Largest visual mass — biggest text, biggest visual element, biggest card |
| L2 | Medium mass — section headers, supporting cards |
| L3 | Light mass — body text, fine print, footer |

### Channel 4: Position + space

| Level | Position |
|-------|----------|
| L1 | Top of viewport / center of moment / largest space around |
| L2 | Mid-viewport / section starts |
| L3 | Throughout content body, footer |

## Examples per page

### Landing hero

```
L1 — Hero headline                    text-6xl Playfair Italic, navy, top of fold
   "Cùng luyện IELTS với mình"        ←── 1 thing primary
   
L2 — Sub copy + Primary CTA           text-lg DM Sans, gray-600 + button teal
   "{value prop 1-2 lines}"           ←── 2 supporting
   [Bắt đầu luyện]
   
L3 — Trust signals + Lintopus         text-sm DM Sans gray-500, mascot visual
   {Lintopus visual}
   "Miễn phí trong 88 ngày đầu"
```

3 levels. Pass.

### Result page (Reading)

```
L1 — Band number                       text-6xl Playfair Italic, navy, prominent
   "7.0"                               ←── 1 thing primary
   
L2 — Skill summary + Lintopus          text-2xl DM Sans semibold + mascot visual
   "Reading Practice — Cambridge 14"   ←── 2 supporting
   {Lintopus mood="happy"}
   
L3 — Feedback cards + history          text-base/sm DM Sans, gray-700/500
   [Coherence: 7.5]
   [Vocabulary: 7.0]
   [Grammar: 6.5]
   [Recommendation: ...]
   "Xem lịch sử →"
```

3 levels. Pass.

### Onboarding screen

```
L1 — Question                          text-3xl DM Sans semibold, navy
   "Bạn đang ở Band IELTS nào?"        ←── 1 thing primary
   
L2 — Options                           text-base DM Sans, navy on cream cards
   [3.0–4.5]  [5.0–5.5]  [6.0–6.5]    ←── 3-5 supporting
   [7.0–7.5]  [8.0+]  [Chưa biết]
   
L3 — Helper text + progress            text-sm DM Sans, gray-500
   "Bạn có thể đổi sau ở Settings"
   {progress: 3 / 6}
```

3 levels. Pass.

### Battle queue

```
L1 — Match countdown                   text-5xl DM Sans tabular-nums, navy
   "00:42"                             ←── 1 thing primary (drama)
   
L2 — Status + Lintopus                 text-xl DM Sans + mascot
   "Đang tìm đối thủ..."               ←── 2 supporting
   {Lintopus mood="thinking"}
   
L3 — Quick stats + cancel              text-sm DM Sans gray
   "Rank: Gold II — 1342 LP"
   [Hủy tìm trận]
```

3 levels. Pass.

## Anti — 4+ levels (over-stair)

```
❌ L1 Hero headline
❌ L2 Sub-headline
❌ L3 Sub-sub-headline
❌ L4 Section header
❌ L5 Body
❌ L6 Caption
❌ L7 Footer disclaimer
```

7 levels. User overwhelmed. Refactor: collapse L2+L3 into 1 sub-headline, drop L4 sub-sub, merge L5/L6.

## Anti — 1-2 levels (flat)

```
❌ Page entire wall of text-base DM Sans
❌ All buttons same size, same weight
❌ No clear "look here first" element
```

Flat. User doesn't know where to start. Refactor: identify L1 primary anchor, elevate.

## Section vs Page hierarchy

Hierarchy applies **per visual viewport screen**, not entire page.

Long page = multiple viewport screens, each screen has own L1/L2/L3.

```
Viewport 1 (above-fold):
   L1: Hero headline
   L2: Sub copy + CTA
   L3: Lintopus visual

Viewport 2 (scroll 1):
   L1: "Why Lingona" section header
   L2: 3 feature cards
   L3: Card-internal body

Viewport 3 (scroll 2):
   L1: Pricing section header
   L2: 4 tier cards
   L3: Tier feature lists
```

Each viewport stands alone — refresh hierarchy per scroll position.

## Card-internal hierarchy

Card có thể có own 3-level inside, nhưng card là L2 trong page hierarchy:

```
Page level:                     Card-internal:
   L1 Section header            (no L1 inside card — card itself is L2)
   L2 [Card]  ─── card L1 ───>     L1 Card title (text-xl semibold)
              ─── card L2 ───>     L2 Card body (text-base)
              ─── card L3 ───>     L3 Card meta (text-sm gray)
   L3 Page detail
```

Card-internal hierarchy stays **subordinate** to page hierarchy. Card title size never exceeds page L2 baseline.

## Mode-specific hierarchy

### Brand mode

Standard 3-level stair as above.

### Brand-soft mode (Practice)

L1 emphasis reduced — Practice = doing-mode, not moment-mode. Headlines smaller.

```
L1 Practice in-task screen:
   Question prompt (text-3xl, not text-6xl — practice is task-focused)
   
L2 Answer options + timer
L3 Hint / progress
```

### IELTS-authentic (Full Test)

**Hierarchy reduced to 2 levels** — Cambridge UI uses minimal hierarchy.

```
L1 Question text (Georgia, 18-20px Cambridge size)
L2 Answer field + timer + flag/bookmark
(no L3 detail in exam — minimal chrome)
```

Cambridge faithful = monotone hierarchy. Lingona authentic mode mimic.

## Visual mass calibration

L1 element should have **largest visual mass** per viewport. Mass ≠ just type size.

Visual mass = type size × weight × color contrast × surface area.

Example: small bold colored badge can have HIGHER mass than large gray light text.

```
Element A: text-base font-bold bg-teal text-cream rounded-full px-3 py-1
   → Small but dense color → high mass

Element B: text-3xl font-light text-gray-300
   → Large but low contrast → lower mass

→ A is L1, B is L3 (despite size)
```

Use L1 for **the moment** — band number, hero CTA, win/loss. Not just biggest text.

## Anti — wrong L1 anchor

```
❌ Top of page is logo (logo = L3 brand presence, not L1)
❌ Top of page is breadcrumb / nav (L3 utility)
❌ L1 is page title "Settings" (utility — should be L2 supporting)
   → Real L1 = the setting user came to change
```

L1 = **what user wants from this page**, not metadata about the page.

## Audit checklist

```
1. Squint at viewport screenshot (blur eyes).
   - 1 element pops most? ✓ L1 identified
   - 2-5 elements pop next tier? ✓ L2 identified
   - Rest blurs together as background? ✓ L3 identified

2. Count distinct hierarchy levels:
   - 3 ✓ pass
   - 4+ ✗ collapse some
   - 1-2 ✗ elevate primary

3. L1 anchor check:
   - L1 element = the moment / answer / primary action user came for?
   - NOT logo / nav / utility / page title

4. Card vs page hierarchy:
   - Card title doesn't exceed page L2 baseline?
   - Card sits as L2 in page hierarchy?

5. Mode-specific:
   - IELTS-authentic page → 2-level reduced?
   - Brand-soft page → L1 reduced from text-6xl to text-3xl?
   - Brand page → full 3-level stair?

6. Per viewport screen:
   - Each scroll position has fresh L1/L2/L3?
   - No flat scrolling stretches with no anchor?
```

## See also

- `01-foundations/typography.md` — type scale per level
- `01-foundations/palette.md` — color contrast per level
- `02-layout/empty-space-philosophy.md` — whitespace separates levels
- `02-layout/result-page-anatomy.md` — hierarchy applied to result page
- `04-modes/ielts-authentic.md` — reduced hierarchy mode
