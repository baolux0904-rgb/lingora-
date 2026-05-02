# Framer Motion variants library

Reusable Framer Motion variants for Lingona. Single source of truth — components import these instead of inlining variants.

Per Wave 6: Framer Motion = primary animation library for components/UI. GSAP for ScrollTrigger only (per `06-motion/gsap-scroll.md`).

## Installation

```bash
npm install framer-motion
```

Use `motion`, `AnimatePresence`, `useReducedMotion`, `useInView`, `animate` (programmatic).

```tsx
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
```

## Variant library location

`frontend/lib/motionVariants.ts` — single file, all variants exported.

```ts
// frontend/lib/motionVariants.ts
import type { Variants, Transition } from 'framer-motion';

// === EASING CURVES ===

export const easings = {
  out: [0.16, 1, 0.3, 1] as const,        // ease-out-expo (default)
  inOut: [0.65, 0, 0.35, 1] as const,     // smooth tween
  drama: [0.16, 1, 0.3, 1] as const,      // Battle drama
} as const;

// === DURATIONS ===

export const durations = {
  quick: 0.1,
  fast: 0.15,
  medium: 0.25,
  moderate: 0.3,
  slow: 0.5,
  deliberate: 0.6,
  extended: 1.2,
} as const;
```

## Variants

### 1. Button tap (`buttonTap`)

```ts
export const buttonTap: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.97 },
};

export const buttonTransition: Transition = {
  duration: durations.quick,
  ease: easings.out,
};
```

Usage:

```tsx
<motion.button
  variants={buttonTap}
  initial="rest"
  whileTap="tap"
  transition={buttonTransition}
  className="primary-button"
>
  Bắt đầu luyện
</motion.button>
```

KHÔNG `whileHover` scale (anti per philosophy). Border/color shift only on hover via Tailwind.

### 2. Card hover (`cardHover`)

```ts
// Card hover: NO scale, color/border shift via CSS
// This variant just declares the spec — actual hover via Tailwind classes
```

Use Tailwind for card hover:

```tsx
<div className="
  bg-cream border border-gray-200 rounded-lg p-6 shadow-sm
  hover:border-teal hover:shadow-md
  transition-all duration-fast
">
```

NO motion.div for card hover — CSS transition is enough + lighter perf.

### 3. Page enter (`pageEnter`)

```ts
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const pageEnterTransition: Transition = {
  duration: durations.moderate,
  ease: easings.out,
};
```

Usage at route layout:

```tsx
<motion.main
  variants={pageEnter}
  initial="hidden"
  animate="visible"
  transition={pageEnterTransition}
>
  {children}
</motion.main>
```

Subtle slide-up + fade. KHÔNG dramatic slide-from-edge.

### 4. Modal enter/exit (`modalBackdrop` + `modalContent`)

```ts
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalBackdropTransition: Transition = {
  duration: durations.medium,
  ease: easings.out,
};

export const modalContent: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.98 },
};

export const modalContentTransition: Transition = {
  duration: durations.medium,
  ease: easings.out,
};
```

Usage:

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        className="fixed inset-0 z-modal-backdrop bg-navy/60"
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={modalBackdropTransition}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-modal flex items-center justify-center p-4"
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={modalContentTransition}
      >
        <ModalCard>{children}</ModalCard>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

`AnimatePresence` required for exit animation when component unmounts.

### 5. Toast (`toastEnter`)

```ts
export const toastEnter: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16, transition: { duration: durations.fast } },
};

export const toastTransition: Transition = {
  duration: durations.medium,
  ease: easings.out,
};
```

Slide-down from top + fade. Exit faster (less attention).

### 6. Stagger container (`staggerContainer`)

```ts
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,    // 80ms interval
      delayChildren: 0.1,        // 100ms initial delay
    },
  },
};
```

### 7. Stagger child (`staggerChild`)

```ts
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const staggerChildTransition: Transition = {
  duration: durations.moderate,
  ease: easings.out,
};
```

Usage (parent + children):

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-4 gap-4"
>
  {cards.map(card => (
    <motion.div
      key={card.id}
      variants={staggerChild}
      transition={staggerChildTransition}
    >
      <ResultCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

`staggerContainer` orchestrates. `staggerChild` defines per-child animation. Stagger interval 80ms.

### 8. Battle drama reveal (`battleHeading`)

```ts
export const battleHeading: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const battleHeadingTransition: Transition = {
  duration: durations.deliberate,
  ease: easings.drama,
};
```

Usage:

```tsx
<motion.h1
  variants={battleHeading}
  initial="hidden"
  animate="visible"
  transition={battleHeadingTransition}
  className="text-7xl font-display italic font-bold uppercase tracking-tight"
>
  VICTORY
</motion.h1>
```

600ms ease-out-expo = dramatic but earned.

### 9. Number tick (`useNumberTick` hook)

For band number, LP, XP tick animation:

```ts
import { animate } from 'framer-motion';
import { useEffect } from 'react';

export function useNumberTick(
  from: number,
  to: number,
  onUpdate: (v: number) => void,
  duration = durations.extended,
  ease: Transition['ease'] = 'easeOut',
) {
  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      ease,
      onUpdate,
    });
    return controls.stop;
  }, [from, to, duration, ease, onUpdate]);
}
```

Usage in component:

```tsx
import { useNumberTick } from '@/lib/motionVariants';

function BandReveal({ from, to }: { from: number; to: number }) {
  const [display, setDisplay] = useState(from);
  
  useNumberTick(from, to, setDisplay);
  
  return (
    <span className="text-6xl font-display italic">
      {display.toFixed(1)}
    </span>
  );
}
```

Smooth tick from old → new band over 1.2s.

### 10. Slide drawer (`drawerSlide`)

```ts
export const drawerSlideRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

export const drawerSlideLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

export const drawerTransition: Transition = {
  duration: durations.moderate,
  ease: easings.out,
};
```

Usage (mobile menu, side panel):

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.aside
      variants={drawerSlideRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={drawerTransition}
      className="fixed top-0 right-0 h-full w-80 bg-cream"
    >
      {content}
    </motion.aside>
  )}
</AnimatePresence>
```

### 11. Accordion expand/collapse (`accordionContent`)

```ts
export const accordionContent: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1 },
};

export const accordionTransition: Transition = {
  duration: durations.medium,
  ease: easings.out,
};
```

Usage:

```tsx
<motion.div
  variants={accordionContent}
  initial="collapsed"
  animate={isOpen ? 'expanded' : 'collapsed'}
  transition={accordionTransition}
  className="overflow-hidden"
>
  {content}
</motion.div>
```

`overflow-hidden` mandatory — height 0 doesn't hide content otherwise.

### 12. Skeleton shimmer (`skeletonShimmer`)

```ts
export const skeletonShimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: {
    duration: 1.2,
    ease: 'linear',
    repeat: Infinity,
  },
};
```

CSS-only alternative preferred (lighter):

```css
.skeleton {
  background: linear-gradient(90deg, #E5E7EB 0%, #F3F4F6 50%, #E5E7EB 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Reduced motion handling

Wrap all motion components with reduced motion check:

```tsx
import { useReducedMotion } from 'framer-motion';

function Card() {
  const reduce = useReducedMotion();
  
  if (reduce) {
    return <div>{content}</div>;  // no motion wrapper
  }
  
  return (
    <motion.div
      variants={pageEnter}
      initial="hidden"
      animate="visible"
      transition={pageEnterTransition}
    >
      {content}
    </motion.div>
  );
}
```

OR use conditional initial:

```tsx
<motion.div
  initial={reduce ? false : 'hidden'}
  animate="visible"
  transition={reduce ? { duration: 0 } : pageEnterTransition}
>
```

## AnimatePresence usage

For mount/unmount animations (modals, toasts, dropdowns):

```tsx
<AnimatePresence mode="wait">
  {showItem && (
    <motion.div
      key="item"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={...}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

`mode="wait"` ensures exit completes before enter (prevents overlap).

For lists with item add/remove:

```tsx
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}    // KEY MANDATORY for AnimatePresence to track
      layout            // smooth layout shift on remove
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

`key` mandatory on each child. `layout` prop = auto-animate position shifts.

## Anti-patterns Framer

❌ Inline variants object every render (wraps in `useMemo` or move to module scope)
❌ Spring transitions (use easeOut tween only per philosophy)
❌ `whileHover={{ scale: 1.05 }}` (no hover scale anti)
❌ Multiple `motion.*` per component (add only where needed)
❌ Forgetting `AnimatePresence` for exit animations
❌ Forgetting `key` prop in AnimatePresence list
❌ Animating layout properties without `layout` prop (jank)
❌ `repeat: Infinity` on non-spinner animations (annoying)
❌ Stagger interval ≠ 80ms (use scale)
❌ Easing `[0.5, 0.5, 0.5, 0.5]` (no curve, just linear — use easings constants)

## Audit checklist Framer

```
1. Variants imported from motionVariants.ts (NOT inlined)? ✓
2. Easing from easings constants (NOT raw cubic-bezier)? ✓
3. Duration from durations constants (NOT random ms)? ✓
4. AnimatePresence wraps mount/unmount? ✓
5. AnimatePresence children have key prop? ✓
6. useReducedMotion check or CSS @media query? ✓
7. NO whileHover scale (use Tailwind hover:* color/border)? ✓
8. NO spring transitions? ✓
9. Stagger interval = 0.08 (80ms)? ✓
10. Layout animations use `layout` prop? ✓
11. NO inline variants every render (memo or scope)? ✓
12. Mode-aware (variants null in ielts-authentic if needed)? ✓
```

## See also

- `06-motion/motion-philosophy.md` — when to animate
- `06-motion/duration-language.md` — timing scale
- `06-motion/result-reveal.md` — stagger reveal sequence
- `06-motion/svg-path.md` — Lintopus SVG animation
- `06-motion/perf-budget.md` — perf constraints
- `03-components/primary-button.md` — button tap variant usage
- `03-components/modal-frozen.md` — modal motion usage
- `03-components/result-card.md` — sub-skill stagger usage
- `03-components/battle-card.md` — VICTORY/DEFEAT drama usage
