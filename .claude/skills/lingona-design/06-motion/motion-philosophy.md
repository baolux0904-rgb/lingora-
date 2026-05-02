# Motion philosophy — calm, earned, never gimmicky

How Lingona moves. Motion principles + when to animate + when to stay still.

Per Wave 6 lock: **Path C code-only** (Framer Motion + GSAP + SVG path), KHÔNG Lottie / Rive / After Effects. Per `00-manifesto/what-we-are-not.md` — KHÔNG Duolingo cartoon physics.

## Core principles

### 1. Motion serves meaning, not entertainment

Every animation answers: **What does this motion communicate?**

| ✅ Earned motion | ❌ Gimmicky motion |
|-----------------|--------------------|
| Tap scale 0.97 → "your input registered" | Hover scale 1.1 → just "look at me" |
| Stagger reveal → "results arrive in order" | Bounce reveal → just "fun" |
| Smooth fade → "transition between states" | Confetti → "celebrate (forced)" |
| SVG path draw → "Lintopus arm waves on welcome" | Lintopus dancing constantly → noise |

If you can't articulate what motion communicates → skip motion.

### 2. Calm > energetic

Lingona = study app. User comes for IELTS focus, not entertainment. Motion stays calm:

- Smooth ease-out curves (NOT bouncy spring)
- Short durations (150-300ms typical)
- Subtle scale (0.97-1.03 range, NEVER 1.1+)
- Single direction (NOT zigzag, jiggle, wobble)
- No distraction during task (in-task pages have minimal motion)

```tsx
// ✅ Calm
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.15, ease: 'easeOut' }}
>

// ❌ Bouncy gimmick
<motion.button
  whileTap={{ scale: 0.85 }}
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: 'spring', stiffness: 800, damping: 10 }}
>
```

### 3. Earned moments only

Big motion = earned moment only. Result page band reveal, Battle VICTORY/DEFEAT, achievement unlock, level-up. NOT routine clicks/scrolls.

| Surface | Motion intensity |
|---------|------------------|
| In-task pages | Minimal — focus mode |
| Routine actions (button click, form submit) | Subtle — feedback only |
| Page transitions | Smooth fade-only |
| Result page reveal | Stagger reveal (earned moment) |
| Battle VICTORY/DEFEAT | Big drama reveal (signature moment) |
| Achievement unlock | Overlay celebration (rare) |
| Level-up | Overlay celebration (rare) |
| Streak milestone (7/30/100/365) | Overlay celebration (rare) |
| Error / loading | None or minimal spinner |

Big motion sparingly = remains special. Spam big motion → loses meaning.

### 4. Direction = meaning

Motion direction encodes information:

| Direction | Meaning |
|-----------|---------|
| Slide-up + fade | Element entering the conversation |
| Slide-down + fade | Element leaving / less prominent |
| Slide-left | Backward navigation |
| Slide-right | Forward navigation |
| Scale-up (0.95 → 1) | Element gaining focus |
| Scale-down (1 → 0.97) | Element pressed (tap feedback) |
| Fade only | Subtle state change |
| Stagger sequence | Sequential reveal (1, 2, 3 order) |

Random direction = noise. Consistent direction = system.

### 5. Reduced motion respect

Always honor `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from 'framer-motion';

function Card() {
  const reduce = useReducedMotion();
  
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.3 }}
    >
      {content}
    </motion.div>
  );
}
```

OR use CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

User with vestibular disorder, photosensitivity, or cognitive load preference can disable motion globally. Lingona must respect.

## Mode-aware motion

Per `04-modes/` — motion intensity differs per mode:

### Brand mode (default)

```
Page transitions:  smooth 300ms
Card hover:        150ms color shift
Button tap:        scale 0.97 + 150ms
Modal entry:       fade + slide-up 250ms
Result reveal:     stagger 80ms cascade
Mascot:            subtle breath / blink (rare)
Battle drama:      VICTORY/DEFEAT reveal 600ms ease-out-expo
```

Full animation system active.

### Brand-soft mode (Practice in-task)

```
Page enter:        single fade 200ms (no stagger)
Card reveal:       static (no animation)
Button tap:        scale 0.97 (same)
Modal entry:       fade only (no slide)
Mascot:            ABSENT (no animation)
```

Reduced animation = focus signal. Less chrome motion = user attention on task.

### IELTS-authentic mode (Full Test, Battle Ranked)

```
Page transitions:  instant (0s)
Card reveal:       instant
Button tap:        instant
Modal entry:       instant fade-in only
Mascot:            ABSENT entirely
Animations:        OFF
```

Cambridge feel = static UI. KHÔNG animation phá exam pressure.

```css
[data-mode="ielts-authentic"] * {
  transition-duration: 0s !important;
  animation: none !important;
}
```

CSS override at mode root. Tất cả motion off trong authentic.

## When to animate

Decision tree:

```
Q1: Is this an earned moment (result, achievement, milestone)?
  YES → big animation OK (stagger reveal, drama reveal)
  NO → continue

Q2: Is this user feedback (tap, focus, hover)?
  YES → subtle micro-interaction (150ms, scale 0.97, fade)
  NO → continue

Q3: Is this page navigation?
  YES → smooth transition (200-300ms fade or slide)
  NO → continue

Q4: Is this state change (modal open/close)?
  YES → entry/exit animation (200ms fade + slide-up)
  NO → continue

Q5: Is this loading/spinner?
  YES → minimal spinner (rotate 1s linear)
  NO → continue

Q6: Is this in-task focus mode (Practice/Full Test)?
  YES → NO animation (focus mode)
  NO → continue

Q7: Just decoration?
  YES → SKIP animation (no motion for noise)
```

## Motion vocab — what we use

Allowed primitives:

| Primitive | Use |
|-----------|-----|
| **opacity fade** | State change, enter/exit |
| **translateY (slide-up/down)** | Hierarchical entry |
| **translateX (slide-left/right)** | Page nav direction |
| **scale (subtle)** | Tap feedback, focus |
| **rotate** | Loading spinner only |
| **stroke-dashoffset** | SVG path draw |
| **stagger (sequence delay)** | Multiple items reveal |
| **color/border transition** | Hover state shift |
| **height auto (collapse/expand)** | Accordion, dropdown |
| **blur** | Backdrop, focus shift |

Motion vocab NOT used:

| Anti-primitive | Why |
|----------------|-----|
| **bounce/spring** | Cartoon physics |
| **wobble/jiggle** | Distract |
| **flash/strobe** | Photosensitivity hazard |
| **rotation 360°** | Gimmicky |
| **scale > 1.1 or < 0.85** | Aggressive |
| **multiple simultaneous transforms** | Visual noise |
| **infinite repeat (non-spinner)** | Annoying |
| **parallax 3D** | Performance + tacky |
| **glitch effects** | Out of register |
| **typewriter text reveal** | Slow/annoying |

## Easing curves

| Curve | Use |
|-------|-----|
| `easeOut` | Default for entry (decelerates into place) |
| `easeIn` | Default for exit (accelerates out) |
| `easeInOut` | Page transitions (smooth both sides) |
| `linear` | Loading spinner only |
| `cubic-bezier(0.16, 1, 0.3, 1)` | Battle drama reveal (ease-out-expo dramatic) |
| `cubic-bezier(0.65, 0, 0.35, 1)` | Smooth tween |
| `spring` | NEVER (anti per philosophy) |
| `bounce` | NEVER |

Default: `easeOut` for 90% of cases.

## Concurrent animation rule

**Max 3 simultaneous animations per viewport**.

| OK | Anti |
|----|------|
| Card stagger reveal (sequential 80ms apart, only 1 active at a time per card) | Card grid all-at-once with each card spinning + scaling + sliding |
| Button tap + tooltip fade-in | Page transition + modal open + stagger reveal + mascot bounce |
| Loading spinner + skeleton shimmer | Multiple decorative parallax + 3D tilt + magnetic cursor |

Concurrent animations beyond 3 = visual noise + performance hit.

## Lintopus motion rules

Per `06-motion/svg-path.md` (next file):

- Subtle breath (chest scale 1 → 1.02 → 1, 4s loop) — rare, hero only
- Blink (eye scaleY 1 → 0.1 → 1, 0.2s, every 6-10s) — rare
- Arm wave on welcome (single pass, 1s) — onboarding hero only
- NO constant dancing, NO spinning, NO rotating

Mascot motion = breathing-quiet, NOT performing.

## Anti-patterns motion philosophy

❌ Animation everywhere = noise (cartoon app feel)
❌ Bouncy spring on everything = not Lingona (per `00-manifesto/what-we-are-not.md#1`)
❌ Hover scale 1.1+ = aggressive (use border/shadow shift)
❌ Page transitions slide-left/right always = jarring (use fade + subtle slide)
❌ Loading spinner spinning forever = no perceived progress (use skeleton + spinner combo)
❌ Mascot rotating dance loop = caricature
❌ Concurrent 5+ animations = noise + perf
❌ Animation without `prefers-reduced-motion` respect = a11y fail
❌ Motion in IELTS-authentic mode = phá exam feel
❌ Lottie/Rive complex animation = Path C lock violation (Wave 6 mandate code-only)

## Audit checklist motion philosophy

```
1. Each animation answers "what does this communicate"? ✓
2. Curves are easeOut default (NOT spring/bounce)? ✓
3. Duration scale (per duration-language.md)? ✓
4. Scale range 0.95-1.03 only (NEVER 1.1+)? ✓
5. Direction encodes meaning (consistent slide-up/right/etc.)? ✓
6. Reduced motion respected? ✓
7. Mode-aware (off in ielts-authentic)? ✓
8. Concurrent ≤ 3 simultaneous? ✓
9. Earned moments get big motion, routine = subtle? ✓
10. NO Lottie/Rive (Path C code-only)? ✓
11. Mascot motion subtle (breath/blink), NOT dancing? ✓
12. In-task pages minimal motion (focus mode)? ✓
```

## See also

- `00-manifesto/what-we-are-not.md#1` — NOT Duolingo cartoon
- `06-motion/duration-language.md` — timing scale
- `06-motion/framer-variants.md` — Framer Motion library
- `06-motion/gsap-scroll.md` — GSAP ScrollTrigger
- `06-motion/svg-path.md` — Lintopus subtle motion
- `06-motion/result-reveal.md` — earned moment reveal
- `06-motion/perf-budget.md` — performance constraints
- `04-modes/ielts-authentic.md` — motion off in exam
- `03-components/primary-button.md` — tap micro-interaction
