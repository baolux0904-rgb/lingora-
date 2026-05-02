# Duration language — timing scale

How long Lingona's animations last. Single timing scale across surface. KHÔNG random ms per component.

## Duration scale

```
instant:   0ms     — IELTS-authentic mode, accessibility reduced
quick:     100ms   — micro-interaction (tap, focus)
fast:      150ms   — default UI (button, hover, color)
medium:    250ms   — modal, card transition
moderate:  300ms   — page transition, drawer
slow:      500ms   — reveal sequence (single)
deliberate: 600ms  — Battle drama VICTORY/DEFEAT
extended:  1200ms  — band number tick animation
loop:      ∞        — spinner only (1s rotation linear)
```

CSS variables:

```css
:root {
  --duration-instant: 0ms;
  --duration-quick: 100ms;
  --duration-fast: 150ms;
  --duration-medium: 250ms;
  --duration-moderate: 300ms;
  --duration-slow: 500ms;
  --duration-deliberate: 600ms;
  --duration-extended: 1200ms;
}

[data-mode="ielts-authentic"] {
  --duration-fast: 0ms;
  --duration-medium: 0ms;
  /* ... all → 0 */
}
```

## Duration per use case

### Micro-interaction (100ms — quick)

```
- Button tap scale 0.97
- Toggle switch slide
- Checkbox check mark
- Radio dot reveal
- Focus ring fade
```

100ms = perceptible as instant feedback. Faster = imperceptible. Slower = sluggish.

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.1 }}
>
```

### UI default (150ms — fast)

```
- Button hover color shift
- Link underline appear
- Icon color change
- Border color shift
- Card hover border-color
- Tooltip fade-in
- Dropdown open
- Tab switch underline
- Form input focus border
```

150ms = standard UI feedback. Default for color/border transitions.

```tsx
<button className="
  transition-colors
  duration-150
  hover:bg-teal-light
  hover:border-teal
">
```

### Modal / Card transition (250ms — medium)

```
- Modal entry (fade + slide-up)
- Modal exit (fade + slide-down)
- Toast notification appear
- Bottom sheet drag-up
- Popover appear
- Card flip
```

250ms = enough to feel deliberate without dragging.

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.25 }}
>
```

### Page transition (300ms — moderate)

```
- Route change (fade out → fade in)
- Section change (slide horizontal)
- Drawer slide-in
- Sidebar collapse/expand
- Accordion expand
```

300ms = clearly intentional transition, but not slow.

```tsx
<motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Single reveal (500ms — slow)

```
- Empty state appear (mascot enter)
- Empty card placeholder fade-in
- Skeleton screen → real content
- Inline error message slide-down
- Hint message reveal
```

500ms = breathing space. User notices the reveal.

### Battle drama (600ms — deliberate)

```
- VICTORY/DEFEAT/DRAW headline reveal
- LP delta number tick
- Rank promotion overlay
```

600ms with ease-out-expo curve = dramatic but earned.

```tsx
<motion.h1
  initial={{ opacity: 0, y: 40, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1],  // ease-out-expo
  }}
>
  VICTORY
</motion.h1>
```

### Band number tick (1200ms — extended)

```
- Result page band 5.5 → 7.0 tick animation
- Streak count tick on save
- LP total tick on rank update
```

1200ms with linear or ease-out = number visibly counting up. Earned moment.

```tsx
import { animate } from 'framer-motion';

useEffect(() => {
  const controls = animate(prevBand, newBand, {
    duration: 1.2,
    ease: 'easeOut',
    onUpdate: (v) => setDisplayBand(v),
  });
  return controls.stop;
}, [newBand]);
```

### Loading spinner (∞ loop — 1s linear)

```
- Generic spinner (1 full rotation per second)
- Skeleton shimmer (1.2s linear)
```

```css
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Linear curve = perceived continuous motion. Easing on infinite loop = pulsing feel (anti).

## Stagger delay

When revealing multiple items in sequence (cards, list items, sub-skill cards):

```
Stagger interval:  80ms between each item
Total cascade:     (N items) × 80ms + base duration
Max recommended:   8 items (640ms total) — beyond → visually slow
```

```tsx
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,    // 80ms stagger
      duration: 0.3,       // 300ms each card
      ease: 'easeOut',
    },
  }),
};

{cards.map((card, i) => (
  <motion.div
    key={card.id}
    custom={i}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <Card {...card} />
  </motion.div>
))}
```

For 4 cards: total reveal = (4 × 80ms) + 300ms = 620ms. Feels deliberate, not slow.

For 8+ cards: consider grouped stagger (rows stagger, items within row instant).

## Mode override duration

IELTS-authentic mode: ALL → 0:

```css
[data-mode="ielts-authentic"] * {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
}
```

CSS rule trumps inline. Mode active = static UI guaranteed.

Brand-soft mode: reduce by ~30%:

```css
[data-mode="brand-soft"] {
  --duration-fast: 100ms;
  --duration-medium: 200ms;
  --duration-moderate: 250ms;
}
```

Faster = less chrome motion = focus signal.

## Reduced motion override

```tsx
import { useReducedMotion } from 'framer-motion';

const reduce = useReducedMotion();
const duration = reduce ? 0 : 0.3;

<motion.div transition={{ duration }}>
```

Or via CSS:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-quick: 0ms;
    --duration-fast: 0ms;
    --duration-medium: 0ms;
    --duration-moderate: 0ms;
    --duration-slow: 0ms;
    --duration-deliberate: 0ms;
    --duration-extended: 0ms;
  }
}
```

## Anti-duration patterns

❌ Random ms (e.g., `duration: 0.235`) — use scale
❌ Sub-100ms transitions (imperceptible, just remove)
❌ >1500ms transitions (drag, user wait)
❌ Linear easing on UI (use easeOut)
❌ Same duration for everything (static rhythm)
❌ Decreasing duration on subsequent reveals (inconsistent)
❌ Motion duration in IELTS-authentic mode (must be 0)
❌ Spring config without duration (unpredictable timing)

## Tailwind integration

`tailwind.config.ts`:

```ts
theme: {
  extend: {
    transitionDuration: {
      'quick': '100ms',
      'fast': '150ms',
      'medium': '250ms',
      'moderate': '300ms',
      'slow': '500ms',
      'deliberate': '600ms',
      'extended': '1200ms',
    },
  },
},
```

Usage:

```tsx
<button className="transition-colors duration-fast">
<motion.div transition={{ duration: 0.25 }} />  // 250ms medium
```

## Audit checklist duration

```
1. All durations from scale (NOT random)? ✓
2. Micro-interactions 100-150ms? ✓
3. Modals 250ms? ✓
4. Page transitions 300ms? ✓
5. Battle drama 600ms with ease-out-expo? ✓
6. Stagger interval 80ms (not random)? ✓
7. CSS variables override per mode? ✓
8. Reduced motion = 0 across? ✓
9. NO durations >1500ms? ✓
10. NO sub-100ms transitions? ✓
```

## See also

- `06-motion/motion-philosophy.md` — when to animate
- `06-motion/framer-variants.md` — Framer Motion library
- `06-motion/result-reveal.md` — stagger reveal sequences
- `06-motion/perf-budget.md` — performance constraints
- `04-modes/ielts-authentic.md` — duration → 0 in exam mode
