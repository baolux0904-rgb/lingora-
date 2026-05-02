# SVG path animation — Lintopus subtle motion + line draw

SVG path animations for: Lintopus subtle motion (breath/blink/arm wave) + line draw (decorative SVG strokes on landing).

Per `06-motion/motion-philosophy.md`: Lintopus motion = subtle breath + blink. NO dancing, NO rotation, NO constant animation.

## Lintopus motion library

### 1. Breath (idle, hero only)

Chest expands subtly. 4-second loop.

```css
@keyframes lintopus-breath {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.02); }
}

.mascot-breath {
  animation: lintopus-breath 4s ease-in-out infinite;
  transform-origin: center;
  will-change: transform;
}
```

```tsx
<svg className="mascot-breath" viewBox="0 0 200 200">
  {/* Lintopus paths */}
</svg>
```

| When to apply | Where |
|--------------|-------|
| ✅ Landing hero (320px size) | Idle, breath OK |
| ✅ Onboarding completion (200px size) | Single screen, breath OK |
| ❌ In-task pages | No mascot at all |
| ❌ Result pages | Mascot enters with reveal animation, KHÔNG add breath on top |
| ❌ Empty states (small 48-80px) | Too small to see breath |
| ❌ Error 500 page | Static "Lintopus đang sửa" — no idle motion |

Breath = idle hero only. Stop after first user interaction.

### 2. Blink (rare, 6-10s interval)

Eye scaleY 1 → 0.1 → 1, 0.2s duration. Random interval.

```tsx
'use client';
import { useEffect, useState } from 'react';

function MascotBlink({ children }: { children: React.ReactNode }) {
  const [blinking, setBlinking] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const scheduleBlink = () => {
      // Random 6-10 second interval
      const next = 6000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 200);  // blink lasts 200ms
      }, next);
    };
    
    scheduleBlink();
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div data-blinking={blinking}>
      {children}
    </div>
  );
}
```

CSS:

```css
[data-blinking="true"] .mascot-eye {
  transform: scaleY(0.1);
  transition: transform 0.1s ease-in-out;
  transform-origin: center;
}

.mascot-eye {
  transition: transform 0.1s ease-in-out;
}
```

Use sparingly — landing hero only. Multiple Lintopus on screen blinking sync = creepy.

### 3. Arm wave (welcome moment, single pass)

Arm rotates 0° → 25° → 0° once on mount. 1.2s total.

```tsx
import { motion } from 'framer-motion';

<motion.g
  initial={{ rotate: 0 }}
  animate={{ rotate: [0, 25, 0] }}
  transition={{ duration: 1.2, ease: 'easeInOut' }}
  style={{ transformOrigin: '40% 50%' }}  /* arm joint pivot */
>
  <path d="M ... Z" />  {/* arm path */}
</motion.g>
```

| When to wave | Where |
|--------------|-------|
| ✅ Onboarding screen 1 (welcome) | First impression |
| ✅ First-time user landing visit | Greet new user |
| ❌ Returning users | Skip — no need re-greet |
| ❌ Result pages | Different moment (reveal anim instead) |
| ❌ Battle queue | Different mood (thinking, not waving) |

Wave once on mount, then idle. KHÔNG loop wave.

### 4. Mood transition (mood prop change)

When `<Mascot mood>` prop changes (e.g., default → happy), smooth transition 300ms:

```tsx
import { motion } from 'framer-motion';

function MascotEyes({ mood }: { mood: MascotMood }) {
  return (
    <motion.g
      animate={{
        // Eye position/shape per mood
        translateY: mood === 'happy' ? -2 : 0,
        scaleY: mood === 'thinking' ? 0.8 : 1,
        scaleX: mood === 'sad' ? 0.9 : 1,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <circle className="eye-left" />
      <circle className="eye-right" />
    </motion.g>
  );
}
```

Mood transition smooth = signals state change. KHÔNG snap (jarring).

## SVG line draw (landing decoration)

Decorative SVG strokes that "draw" on scroll-in. Per `06-motion/gsap-scroll.md`.

### Stroke-dashoffset technique

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function LineDraw({ d }: { d: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    if (!pathRef.current) return;
    
    const length = pathRef.current.getTotalLength();
    
    // Set initial state — stroke hidden
    pathRef.current.style.strokeDasharray = `${length}`;
    pathRef.current.style.strokeDashoffset = `${length}`;
    
    const ctx = gsap.context(() => {
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: pathRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, pathRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <svg viewBox="0 0 400 100">
      <path
        ref={pathRef}
        d={d}
        stroke="var(--color-teal)"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
```

| When to use | Why |
|------------|-----|
| ✅ Landing decorative underlines | Subtle drawing motion adds depth |
| ✅ Stat / feature highlight strokes | Earned reveal on scroll |
| ❌ Component icons | Use static SVG |
| ❌ Loading spinners | Use rotation, not stroke |

Line draw = landing decoration only. KHÔNG component icons.

## Lintopus mood-specific decorations

Mood-specific SVG details (eye shape, accent overlay):

```tsx
function Mascot({ mood }: { mood: MascotMood }) {
  return (
    <svg viewBox="0 0 200 200">
      {/* Base body */}
      <path d="M ..." className="lintopus-body" />
      
      {/* Eyes — change per mood */}
      <MascotEyes mood={mood} />
      
      {/* Mood-specific decoration */}
      {mood === 'happy' && (
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Subtle smile arc */}
          <path d="M 80 110 Q 100 120, 120 110" stroke="..." />
        </motion.g>
      )}
      
      {mood === 'sad' && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle frown */}
          <path d="M 80 115 Q 100 105, 120 115" stroke="..." />
        </motion.g>
      )}
    </svg>
  );
}
```

Mood-specific elements fade in/out smoothly. KHÔNG dramatic morph.

## Stroke-width animation (line emphasis)

For "highlighting" a path (e.g., Lintopus arm pointing):

```css
@keyframes stroke-pulse {
  0%, 100% { stroke-width: 2; }
  50%      { stroke-width: 3; }
}

.path-emphasis {
  animation: stroke-pulse 1.5s ease-in-out;  /* single pass */
}
```

Single pulse = point of emphasis. KHÔNG loop (annoying).

## SVG morphing (avoid)

Morphing path A → path B (e.g., shape changing) requires plugins (gsap-flip, MorphSVG). **Skip morphing for Wave 6** — adds complexity without earned moment.

If needed in future, use GSAP's MorphSVGPlugin (commercial license).

For Wave 6: use opacity fade between two static SVG variants instead of morphing.

## Performance considerations

SVG animations can hit perf if heavy:

### will-change usage

```css
.mascot-breath {
  will-change: transform;  /* hint browser to GPU-accelerate */
}
```

ONLY apply `will-change` when animation actively runs. Persistent `will-change` on idle elements = wasted GPU memory.

### transform vs attribute animation

```css
/* ✅ GPU-accelerated — fast */
.mascot-breath { transform: scale(1.02); }

/* ❌ CPU repaint — slow */
.mascot-breath { width: 102%; }
```

Animate `transform` + `opacity` only. Other properties = repaint.

### SVG path complexity

Lintopus SVG = ~20-40 path nodes. KHÔNG add 100+ node complex paths (perf + render time).

## Anti-patterns SVG animation

❌ Lintopus rotating 360° (gimmick anti)
❌ Lintopus scaling >1.05 (over-react)
❌ Multiple Lintopus on screen with sync animations (creepy)
❌ Eye blinking pattern visible (use random interval)
❌ Arm waving in loop (single pass only)
❌ SVG line draw on every component icon (over-use)
❌ Path morphing without plugin (just don't)
❌ `will-change` on idle elements (perf waste)
❌ Animating SVG attributes (`width`, `cx`, `r`) instead of transform (CPU repaint)
❌ Lintopus moving mid-task (focus mode mandate)
❌ Animation in IELTS-authentic mode (mascot absent + animations off)

## Audit checklist SVG path

```
1. Lintopus animations subtle (breath/blink/wave only)? ✓
2. Animations on landing/onboarding hero only? ✓
3. NO Lintopus mid-task animation? ✓
4. NO mid-result-page animation (use Framer reveal instead)? ✓
5. Random blink interval (not sync)? ✓
6. Single-pass arm wave (not loop)? ✓
7. transform/opacity only (NOT width/height)? ✓
8. will-change only during active animation? ✓
9. NO SVG morphing (Wave 6 lock)? ✓
10. NO sync multiple Lintopus on screen? ✓
```

## Component implementation pattern

Wrapper pattern for Lintopus with motion behavior:

```tsx
// frontend/components/ui/Mascot.tsx
'use client';
import { motion } from 'framer-motion';
import { useMode } from '@/lib/useMode';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  bubble?: string;
  enableIdle?: boolean;  // breath + blink, default false
  greeting?: boolean;     // arm wave on mount, default false
  className?: string;
}

export function Mascot({
  size = 80,
  mood = 'default',
  bubble,
  enableIdle = false,
  greeting = false,
  className,
}: MascotProps) {
  const mode = useMode();
  
  // Mode check — absent in ielts-authentic
  if (mode === 'ielts-authentic') return null;
  
  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={enableIdle ? 'mascot-breath' : ''}
        initial={greeting ? { scale: 0.9, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Lintopus base + mood-specific elements */}
        <MascotBody />
        <MascotEyes mood={mood} />
        {greeting && <MascotArmWave />}
      </motion.svg>
      
      {bubble && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-sm text-gray-700 max-w-[200px]"
        >
          {bubble}
        </motion.p>
      )}
    </div>
  );
}
```

Component encapsulates motion. Page-level just passes props (`enableIdle`, `greeting`).

## See also

- `06-motion/motion-philosophy.md` — when to animate
- `06-motion/framer-variants.md` — Framer for component motion
- `06-motion/gsap-scroll.md` — GSAP for scroll-driven SVG line draw
- `06-motion/perf-budget.md` — perf constraints
- `03-components/mascot.md` — Mascot component spec
- `00-manifesto/what-we-are-not.md#1` — NOT Duolingo cartoon dancing
