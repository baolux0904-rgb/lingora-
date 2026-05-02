# GSAP ScrollTrigger — landing parallax + scroll reveal

GSAP for scroll-driven animations. Lingona uses GSAP ScrollTrigger **only for**: landing page parallax + scroll-reveal sections.

KHÔNG dùng GSAP cho component micro-interaction (Framer Motion handles that). KHÔNG dùng GSAP cho route transitions (Next.js + Framer handles).

GSAP scope: **landing page only** + **scroll-bound timeline animations**.

## Installation

```bash
npm install gsap
```

```tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

## When to use GSAP vs Framer

| Use case | Tool |
|----------|------|
| Component mount/unmount animation | Framer Motion |
| Button tap, card hover, modal | Framer Motion |
| List stagger reveal | Framer Motion |
| Number tick animation | Framer Motion `animate()` |
| Page route transition | Framer Motion `AnimatePresence` |
| **Landing parallax (background moves with scroll)** | **GSAP ScrollTrigger** |
| **Scroll-bound timeline (multi-element synced to scroll)** | **GSAP ScrollTrigger** |
| **Pinning element while scrolling past** | **GSAP ScrollTrigger** |
| **Hero-to-feature scroll transition** | **GSAP ScrollTrigger** |
| SVG path draw (Lintopus arm wave) | GSAP OR Framer (per `06-motion/svg-path.md`) |

GSAP = scroll-driven only. Framer = state-driven.

## Pattern 1 — Scroll reveal section

Element fades + slides up when entering viewport:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ScrollRevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',     // when top of element hits 80% viewport from top
          end: 'top 60%',       // when top hits 60% viewport
          toggleActions: 'play none none reverse',  // play on enter, reverse on leave
        },
      });
    }, ref);
    
    return () => ctx.revert();
  }, []);
  
  return <div ref={ref}>{children}</div>;
}
```

| Param | Value | Why |
|-------|-------|-----|
| `start` | `'top 80%'` | Trigger 20% before element enters viewport |
| `end` | `'top 60%'` | Animation completes by 40% scroll into viewport |
| `toggleActions` | `'play none none reverse'` | Play on scroll-in, reverse on scroll-out |
| `duration` | 0.8 | Slow enough to feel deliberate |
| `ease` | `'power2.out'` | GSAP equivalent of easeOut |

## Pattern 2 — Parallax background

Background image moves slower than scroll:

```tsx
function ParallaxBg() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,        // bind to scroll position (not playback)
        },
      });
    }, ref);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <div ref={ref} className="absolute inset-0 -z-10">
      <Image src="/landing-bg.webp" fill alt="" />
    </div>
  );
}
```

`scrub: true` = scroll-bound. Element position interpolates with scroll, not time.

`yPercent: -30` = bg moves 30% slower than foreground scroll → parallax depth.

## Pattern 3 — Hero pin + transition

Hero stays visible while user scrolls, transitions to feature section:

```tsx
function HeroPin() {
  const heroRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!heroRef.current) return;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: '+=600',         // pin for 600px scroll
        pin: true,
        pinSpacing: true,
      });
      
      // Mascot scale down as user scrolls
      gsap.to('.hero-mascot', {
        scale: 0.7,
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=400',
          scrub: 0.5,         // 0.5s lag for smoothness
        },
      });
    }, heroRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <section ref={heroRef} className="h-screen flex items-center">
      <div className="hero-mascot">
        <Mascot size={320} />
      </div>
    </section>
  );
}
```

Pin section = stays in viewport while user scrolls past. Hero mascot scales down to indicate transition.

## Pattern 4 — Stagger reveal (multiple cards entering)

Cards reveal in sequence as section enters viewport:

```tsx
function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,       // 80ms interval (matches Framer scale)
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <section ref={sectionRef} className="grid grid-cols-3 gap-6 py-24">
      <div className="feature-card">{/* card 1 */}</div>
      <div className="feature-card">{/* card 2 */}</div>
      <div className="feature-card">{/* card 3 */}</div>
    </section>
  );
}
```

Stagger 0.08 = matches Framer 80ms interval. Consistent across libraries.

## Pattern 5 — Counter animation on scroll

Number ticks up when scrolled into view (e.g., "2,000+ học viên"):

```tsx
function CounterStat() {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to({ value: 0 }, {
        value: 2000,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          setDisplay(Math.floor(this.targets()[0].value));
        },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 75%',
          toggleActions: 'play none none none',  // play once
        },
      });
    }, ref);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <span ref={ref} className="text-5xl font-display italic tabular-nums">
      {display.toLocaleString('vi-VN')}+
    </span>
  );
}
```

Counter triggers when scrolled into view. `toggleActions: 'play none none none'` = play once, no reverse.

NOTE: KHÔNG fake stats (per `09-anti-patterns/fake-stats-ban.md` pending). Real stats only.

## ScrollTrigger config defaults

Lingona defaults for ScrollTrigger:

```ts
// frontend/lib/scrollDefaults.ts
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

export const scrollDefaults: Partial<ScrollTrigger.Vars> = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
  // markers: true,  // dev only — comment in production
};

export const scrubDefaults: Partial<ScrollTrigger.Vars> = {
  scrub: 0.5,
  start: 'top bottom',
  end: 'bottom top',
};
```

Use defaults to ensure consistency:

```tsx
gsap.from(ref.current, {
  opacity: 0,
  scrollTrigger: { trigger: ref.current, ...scrollDefaults },
});
```

## Cleanup mandatory

GSAP creates DOM listeners. Must cleanup on unmount:

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations
  }, ref);
  
  return () => ctx.revert();   // cleanup MANDATORY
}, []);
```

`gsap.context()` scopes animations to ref + provides `revert()` for cleanup. Without cleanup → memory leak + ScrollTrigger duplication on remount.

## Reduced motion

```tsx
useEffect(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reduce) return;  // skip animation entirely
  
  const ctx = gsap.context(() => {
    gsap.from(ref.current, { opacity: 0, y: 40, duration: 0.8 });
  }, ref);
  
  return () => ctx.revert();
}, []);
```

OR use GSAP's matchMedia:

```tsx
ScrollTrigger.matchMedia({
  '(prefers-reduced-motion: no-preference)': () => {
    gsap.from(ref.current, { opacity: 0, y: 40, scrollTrigger: {...} });
  },
});
```

ScrollTrigger.matchMedia auto-cleans on media query mismatch.

## Performance constraints

Per `06-motion/perf-budget.md`:

- Max 5 ScrollTrigger instances per page
- Avoid `scrub` on > 2 elements simultaneously (heavy)
- Use `will-change: transform` ONLY during active scroll
- Pin elements sparingly (forces layout calc)
- `markers: true` ONLY in dev (visual debug pin/start/end)

```tsx
// Dev only
scrollTrigger: {
  trigger: ref.current,
  start: 'top 80%',
  markers: process.env.NODE_ENV === 'development',
}
```

## Mode-aware GSAP

GSAP runs only in **brand mode landing page**. Other modes:

```tsx
import { useMode } from '@/lib/useMode';

function LandingHero() {
  const mode = useMode();
  const ref = useRef(null);
  
  useEffect(() => {
    if (mode !== 'brand') return;  // skip GSAP in brand-soft + ielts-authentic
    
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, scrollTrigger: {...} });
    }, ref);
    
    return () => ctx.revert();
  }, [mode]);
  
  return <section ref={ref}>...</section>;
}
```

Although landing only renders in brand mode (per route-mode-map), defensive check protects mode bleed.

## Anti-patterns GSAP

❌ GSAP for component mount animation (use Framer)
❌ GSAP for button tap (use Framer)
❌ Forgetting `gsap.context()` (no cleanup)
❌ Forgetting `ctx.revert()` in useEffect cleanup
❌ Using `gsap.to()` instead of `gsap.from()` for entry animation
❌ ScrollTrigger without cleanup (DOM listener leak)
❌ Scrub on >2 elements (perf hit)
❌ markers: true in production
❌ Pin spacing false on layout-critical sections (overlap)
❌ ScrollTrigger.refresh() spam (use only after major DOM changes)
❌ GSAP timelines for simple animations (overkill)
❌ Mixing GSAP + Framer on same element (conflict)

## Audit checklist GSAP

```
1. GSAP used ONLY for scroll animations (NOT component micro-interactions)? ✓
2. gsap.context() wraps all animations? ✓
3. Cleanup ctx.revert() in useEffect return? ✓
4. ScrollTrigger ≤ 5 per page? ✓
5. Scrub limited to ≤ 2 elements concurrent? ✓
6. Reduced motion check (matchMedia or env)? ✓
7. markers: process.env.NODE_ENV === 'development' (NOT true)? ✓
8. Stagger 0.08 (matches Framer scale)? ✓
9. Easing 'power2.out' default (NOT bouncy)? ✓
10. Mode check (brand only)? ✓
```

## See also

- `06-motion/motion-philosophy.md` — when to animate
- `06-motion/duration-language.md` — timing scale
- `06-motion/framer-variants.md` — Framer for component animations
- `06-motion/svg-path.md` — Lintopus SVG animation
- `06-motion/perf-budget.md` — GSAP perf constraints
- `04-modes/brand.md` — landing renders in brand mode
