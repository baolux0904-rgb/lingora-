# Performance budget — animation perf rules

Animation must not hurt UX. Lingona's perf budget for motion = **60fps target on mid-tier mobile** (e.g., iPhone 8, mid-range Android 2020).

If animation drops below 60fps → simplify or skip. KHÔNG ship janky motion just to add visual flair.

## Core perf rules

### 1. Animate transform + opacity only

```css
/* ✅ GPU-accelerated — fast */
transform: translateY(20px);
transform: scale(0.97);
transform: rotate(45deg);
opacity: 0.5;

/* ❌ CPU repaint — slow */
top: 20px;          /* triggers layout */
width: 200px;        /* triggers layout */
margin-left: 10px;   /* triggers layout */
left: 0;             /* triggers layout */
height: auto;        /* triggers layout */
background-color: red;  /* triggers paint */
```

Animating layout properties (`width`, `height`, `top`, `left`, `margin`) → forces browser layout recalc → janky.

Animating `transform` + `opacity` → composited on GPU → smooth.

### 2. will-change: opt-in only during active animation

```css
/* ❌ Persistent will-change — wastes GPU memory */
.card {
  will-change: transform;  /* always promoted */
}

/* ✅ Active will-change — promotes only during animation */
.card.is-animating {
  will-change: transform;
}

.card {
  /* default state — no will-change */
}
```

Use `will-change` only where animation actively runs. Apply via data attribute or class toggle:

```tsx
<motion.div
  style={{ willChange: isAnimating ? 'transform' : 'auto' }}
>
```

OR via Framer Motion's auto handling (Framer applies `will-change` only during animate phase by default).

### 3. Avoid layout thrashing

Reading + writing layout in same frame = forced reflow:

```js
// ❌ Layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight;  // READ — triggers reflow
  el.style.height = `${height + 10}px`;  // WRITE
});

// ✅ Batch reads + writes
const heights = elements.map(el => el.offsetHeight);  // READ phase
elements.forEach((el, i) => {
  el.style.height = `${heights[i] + 10}px`;  // WRITE phase
});
```

GSAP / Framer handle batching internally. KHÔNG manual DOM measurement during animation.

### 4. Concurrent animation limit

**Max 3 simultaneous animations per viewport** (per `06-motion/motion-philosophy.md`).

| Concurrent count | Perf risk |
|-----------------|-----------|
| 1-3 | OK |
| 4-6 | Watch on mobile |
| 7+ | Will drop frames on mid-tier mobile |

Stagger reveal counts as 1 if cards are visible (cards offscreen don't count). 4-card stagger = OK. 16-card stagger across viewport = anti.

### 5. Composited layers count

Each animated element becomes a composited layer. Too many layers = GPU memory pressure.

```
Recommended max:  20 composited layers per page
Mobile limit:      ~15 layers safely
```

Check in DevTools → Layers panel.

Animations create implicit layers:
- `transform: translateZ(0)` → layer
- `will-change: transform` → layer
- `position: fixed` → layer
- 3D transform → layer

KHÔNG promote everything. Promote only animated elements.

## Per-page motion budget

| Page | Concurrent animations | Total layers |
|------|----------------------|--------------|
| Landing (brand) | 4-6 (hero parallax + section reveal stagger) | 12-15 |
| Dashboard (brand) | 1-2 (subtle widget enter) | 8-10 |
| Practice in-task (brand-soft) | 0-1 (timer tick only) | 5-8 |
| Full Test in-task (ielts-authentic) | 0 | 5-7 |
| Result page (brand) | 4-5 (band tick + Lintopus + 4 cards + CTA) | 12-15 |
| Battle queue | 1 (Lintopus thinking + timer tick) | 6-8 |
| Battle in-progress | 0 | 5-7 |
| Battle result | 5-6 (drama headline + LP tick + Lintopus + 2 cards + CTA) | 12-14 |
| Achievement overlay | 3 (modal + Lintopus + content) | 10-12 |

Per-page budget = monitor + adjust if mobile drops frames.

## Mobile-specific constraints

Mobile devices (especially older Android, iPhone <12) have lower GPU power. Tighten constraints:

### 1. Reduce stagger count on mobile

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

const staggerInterval = isMobile ? 0.05 : 0.08;  // faster stagger mobile
const cardSubset = isMobile ? cards.slice(0, 4) : cards;  // limit visible
```

### 2. Skip parallax on mobile

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

if (!isMobile) {
  // GSAP parallax — desktop only
  gsap.to(bgRef.current, { yPercent: -30, scrollTrigger: {...} });
}
```

Parallax on mobile = often janky + battery drain.

### 3. Disable hero breath idle animation on mobile

```css
@media (max-width: 768px) {
  .mascot-breath {
    animation: none;  /* save GPU on mobile */
  }
}
```

Breath idle = decoration. Mobile users get static Lintopus.

### 4. Lower-resolution SVG fallback for very old devices

If device GPU is weak, use static PNG fallback instead of complex SVG:

```tsx
<picture>
  <source srcSet="/mascot.svg" type="image/svg+xml" />
  <img src="/mascot-static.png" alt="Lintopus" />
</picture>
```

Wave 6: skip PNG fallback (SVG perf is fine for 99% of devices). Keep in mind for future.

## Animation FPS monitoring

Wave 6 dev — monitor FPS during animation:

```tsx
import { useEffect, useState } from 'react';

function FpsMonitor() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frame: number;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const tick = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      
      frame = requestAnimationFrame(tick);
    };
    
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 px-2 py-1 bg-navy text-cream text-xs font-mono">
      {fps} FPS
    </div>
  );
}
```

Dev-only widget. Show in development to detect drops.

## CLS (Cumulative Layout Shift) prevention

Animation-related layout shifts hurt CLS web vital:

### 1. Reserve space for animated content

```tsx
// ❌ Causes CLS — content shifts when image loads
<img src="..." />

// ✅ No CLS — explicit dimensions
<img src="..." width={200} height={200} />
```

### 2. Use transform instead of size animation

```css
/* ❌ Causes layout shift on hover */
.card:hover { padding: 32px; }  /* expands element */

/* ✅ No shift */
.card:hover { transform: scale(1.02); }
```

### 3. Skeleton placeholders match real content size

```tsx
{isLoading ? (
  <div className="h-[400px] bg-gray-100" />  /* same height as real result */
) : (
  <ResultPage />
)}
```

### 4. AnimatePresence with `layout` prop for safe layout shifts

```tsx
<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout  /* smooth layout shift on item add/remove */
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

`layout` prop = Framer detects layout change, animates smoothly instead of snap.

## Bundle size budget

Animation libraries add bundle weight:

| Library | Bundle (gzipped) | Decision |
|---------|------------------|----------|
| Framer Motion | ~30KB (with tree-shaking ~15-20KB) | ✅ Use |
| GSAP core | ~25KB | ✅ Use (landing only) |
| GSAP ScrollTrigger | ~15KB | ✅ Use (landing only) |
| Lottie-react | ~50KB+ | ❌ Banned (Path C lock) |
| Rive React | ~80KB+ | ❌ Banned (Path C lock) |

Total animation bundle: ~50-60KB gzipped. Acceptable for landing page (LCP impact minor).

For non-landing pages (dashboard, in-task) — Framer only, no GSAP. Lower bundle.

```ts
// Code split GSAP — load only on landing
const Hero = dynamic(() => import('@/components/landing/Hero'), {
  ssr: false,  // skip SSR for GSAP-heavy components
});
```

## Animation perf debugging

### Chrome DevTools Performance panel

1. Open DevTools → Performance tab
2. Click record
3. Trigger animation
4. Stop recording
5. Look for:
   - Long tasks (>50ms) during animation
   - Layout/paint events during transform animations (= CSS issue)
   - Forced reflow warnings
   - FPS chart staying at 60

### Layers panel

1. DevTools → More tools → Layers
2. View composited layers
3. If >20 layers → optimize

## Anti-patterns perf

❌ Animating `width` / `height` / `top` / `left` (use transform)
❌ `will-change` on idle elements
❌ Concurrent 5+ animations on screen
❌ Parallax on mobile
❌ Lottie / Rive (banned)
❌ Forced reflow inside animation loop
❌ `overflow: hidden` + `overflow-y: scroll` thrashing
❌ Multiple `position: fixed` elements animating simultaneously
❌ SVG with 200+ path nodes animating
❌ Setting inline styles every frame instead of using transform
❌ Forgetting `key` prop in animated lists (Framer can't track)
❌ Heavy CSS filters (blur, drop-shadow) on animated elements
❌ Animation continuing in background tabs (use `Page Visibility API` to pause)

## Audit checklist perf

```
1. Animations use transform + opacity only? ✓
2. will-change applied only during active animation? ✓
3. Concurrent ≤ 3 animations per viewport? ✓
4. Composited layers ≤ 20 per page? ✓
5. Mobile: parallax disabled? ✓
6. Mobile: breath idle disabled? ✓
7. Mobile: stagger interval 0.05 (faster)? ✓
8. Layout shift prevention (CLS) — explicit dimensions? ✓
9. AnimatePresence list has key + layout? ✓
10. Bundle: NO Lottie / Rive (Path C lock)? ✓
11. GSAP code-split (landing only)? ✓
12. FPS holds 60 on mid-tier mobile? ✓
13. Pause animations in background tabs? ✓
```

## Performance test plan Wave 6

Test on these devices before ship:

```
Desktop:   MacBook M1 / Intel i5 8th gen / Windows mid-tier
Mobile:    iPhone 12 / iPhone 8 / Pixel 6 / Mid-tier Android 2020
Tablet:    iPad Air / iPad Mini
Network:   Throttled 3G + Fast 4G + WiFi
```

For each device:
- Landing scroll smooth?
- Dashboard initial render <1s?
- Result page reveal smooth?
- Battle drama reveal smooth?
- No FPS drops below 50?
- No CLS warnings?

Lighthouse scores:
- Performance: ≥85 mobile, ≥95 desktop
- CLS: <0.1
- LCP: <2.5s

If fail → tighten animations, simplify, or remove non-essential motion.

## See also

- `06-motion/motion-philosophy.md` — when to animate
- `06-motion/duration-language.md` — timing scale
- `06-motion/framer-variants.md` — Framer perf patterns
- `06-motion/gsap-scroll.md` — GSAP perf patterns
- `06-motion/svg-path.md` — SVG perf considerations
- `06-motion/result-reveal.md` — reveal sequence perf budget
- `00-manifesto/what-we-are-not.md` — Path C code-only lock
