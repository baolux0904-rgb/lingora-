# Result reveal — earned moment choreography

Result page = Lingona's **earned moment**. Stagger reveal sequence orchestrates: band number tick → Lintopus enter → sub-skill cards stagger → CTA fade-in.

Battle result = drama register variant. VICTORY/DEFEAT headline 600ms ease-out-expo dramatic, then standard result reveal.

## Reveal sequence — Reading/Writing/Speaking/Listening result

```
Frame 0ms:    Page bg fade-in (300ms ease-out)
Frame 100ms:  Big band number TICK animation start (0 → final, 1200ms extended)
Frame 200ms:  Lintopus enters from right (300ms ease-out, scale 0.9 → 1, opacity)
Frame 400ms:  Lintopus bubble text fade-in (300ms ease-out)
Frame 600ms:  Sub-skill cards stagger reveal start
              Card 1: 600ms (initial delay 100ms inside container) → fade + slide-up 12px
              Card 2: 680ms (+80ms stagger)
              Card 3: 760ms
              Card 4: 840ms
Frame 1000ms: Detailed feedback prose fade-in (400ms ease-out)
Frame 1400ms: Action row CTA fade-in (300ms ease-out)
```

Total reveal time: ~1700ms. User watches the moment unfold.

## Implementation pattern

```tsx
'use client';
import { motion } from 'framer-motion';
import { staggerContainer, staggerChild, staggerChildTransition } from '@/lib/motionVariants';
import { useNumberTick } from '@/lib/motionVariants';
import { useState } from 'react';

function ReadingResultPage({ result }: { result: ReadingResult }) {
  const [bandDisplay, setBandDisplay] = useState(0);
  
  // Band number tick from 0 → final
  useNumberTick(0, result.band, setBandDisplay, 1.2, 'easeOut');
  
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-cream py-12"
    >
      <div className="max-w-[1120px] mx-auto px-12">
        {/* L1 — Big band moment */}
        <div className="grid grid-cols-12 gap-6 mb-24">
          <div className="col-span-7">
            <span className="text-6xl font-display italic text-navy tabular-nums">
              {bandDisplay.toFixed(1)}
            </span>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.2, ease: 'easeOut' }}
              className="mt-4 text-xl text-gray-600"
            >
              {result.skillContext}
            </motion.p>
          </div>
          
          <motion.div
            className="col-span-5 flex justify-end"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
          >
            <Mascot
              size={120}
              mood={getMoodFromBand(result.band)}
              bubble={getBandBubble(result.band)}
            />
          </motion.div>
        </div>
        
        {/* L3 — Sub-skill cards stagger */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: 0.6, staggerChildren: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-24"
        >
          {result.subSkills.map((skill, i) => (
            <motion.div
              key={skill.label}
              variants={staggerChild}
              transition={staggerChildTransition}
            >
              <ResultCard {...skill} />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Detailed feedback prose */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.0, ease: 'easeOut' }}
        >
          <DetailedFeedback feedback={result.detailed} />
        </motion.section>
        
        {/* Action row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.4, ease: 'easeOut' }}
          className="mt-12 flex items-center gap-6"
        >
          <button className="primary-button">Luyện tiếp</button>
          <a href="/skill/history" className="text-teal-dark hover:underline">
            Xem lịch sử →
          </a>
        </motion.div>
      </div>
    </motion.main>
  );
}
```

Key timing landmarks:
- Page bg fade-in: 0ms (instant on mount)
- Band number tick: 0 → final, duration 1200ms ease-out
- Lintopus enter: delay 200ms, duration 300ms
- Sub-skill cards: delayChildren 600ms, staggerChildren 80ms
- Detailed feedback: delay 1000ms, duration 400ms
- Action row: delay 1400ms, duration 300ms

## Battle result reveal — drama variant

Battle has more dramatic VICTORY/DEFEAT/DRAW headline. Choreography:

```
Frame 0ms:    Page bg fade-in (300ms ease-out)
Frame 200ms:  HUGE VICTORY/DEFEAT/DRAW headline drama reveal
              - 600ms ease-out-expo
              - Initial: opacity 0, y 40, scale 0.9
              - Final: opacity 1, y 0, scale 1
Frame 600ms:  Score sub-text (yourScore : oppScore) fade-in (300ms)
Frame 700ms:  Lintopus enters with mood + bubble (300ms ease-out)
Frame 1000ms: LP delta number tick start (1200ms)
              "+22 LP" tick from 0 → 22 with sign
Frame 1100ms: Sub-skill cards (your vs opponent) stagger
              Card 1: 1100ms
              Card 2: 1180ms
Frame 1500ms: Action row "Đấu nữa" CTA fade-in (300ms)
```

Total: ~1800ms — drama earned.

```tsx
function BattleResultPage({ result }: { result: BattleResult }) {
  const [lpDisplay, setLpDisplay] = useState(0);
  
  // LP delta tick
  useNumberTick(0, Math.abs(result.lpDelta), setLpDisplay, 1.2, 'easeOut');
  
  return (
    <main className="bg-cream py-12">
      <div className="max-w-[1120px] mx-auto px-12">
        {/* HUGE VICTORY/DEFEAT/DRAW */}
        <motion.h1
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],  // ease-out-expo
          }}
          className="text-7xl font-display italic font-bold uppercase tracking-tight text-navy"
        >
          {result.outcome.toUpperCase()}
        </motion.h1>
        
        {/* Score sub */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-4 text-2xl text-gray-600"
        >
          {result.yourScore} : {result.oppScore}
        </motion.div>
        
        {/* Lintopus */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7, ease: 'easeOut' }}
        >
          <Mascot
            size={120}
            mood={getMoodFromBattleResult(result.outcome)}
            bubble={getBattleBubble(result.outcome)}
          />
        </motion.div>
        
        {/* LP delta tick */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.0 }}
          className={result.lpDelta > 0 ? 'text-teal' : 'text-error'}
        >
          <span className="text-2xl font-display italic">
            {result.lpDelta > 0 ? '+' : '-'}{lpDisplay} LP
          </span>
        </motion.div>
        
        {/* Sub-skill cards stagger */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          transition={{ delayChildren: 1.1, staggerChildren: 0.08 }}
          className="mt-12 grid grid-cols-2 gap-4"
        >
          <motion.div variants={staggerChild}>
            <ResultCard label="Bạn" score={result.yourScore} />
          </motion.div>
          <motion.div variants={staggerChild}>
            <ResultCard label="Đối thủ" score={result.oppScore} />
          </motion.div>
        </motion.div>
        
        {/* Action row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.5 }}
          className="mt-8 flex items-center justify-center gap-6"
        >
          <button className="primary-button-large font-display italic">
            {result.outcome === 'defeat' ? 'Luyện lại' : 'Đấu nữa'}
          </button>
        </motion.div>
      </div>
    </main>
  );
}
```

## Per-skill reveal variant

Per `02-layout/result-page-anatomy.md` + `03-components/result-card.md`, sub-skill card count differs per skill. Stagger timing scales:

| Skill | Sub-skill cards | Total stagger time |
|-------|----------------|---------------------|
| Reading | 5 cards | 5 × 80ms = 400ms |
| Writing | 4 cards (4 IELTS criteria) | 320ms |
| Speaking | 4 cards | 320ms |
| Listening | 4 cards (sections) | 320ms |
| Battle | 2 cards (you + opponent) | 160ms |

Container `delayChildren: 0.6` keeps the start time consistent across skills. Total reveal time slightly varies but feels uniform.

## Streak save / achievement / level-up reveal

Modal overlay with bigger drama:

```
Frame 0ms:    Backdrop fade-in (250ms)
Frame 100ms:  Modal slide-up + fade (350ms ease-out)
Frame 350ms:  Lintopus reveal (size 200px) with bubble (400ms)
Frame 550ms:  Title (e.g., "Streak 30 ngày") reveal (400ms ease-out, scale 0.95 → 1)
Frame 800ms:  Stat or reward (e.g., "+50 XP") fade-in (300ms)
Frame 1100ms: Action button "Tiếp tục" fade-in (300ms)
```

Big celebration but earned. KHÔNG confetti, KHÔNG screen shake (per `06-motion/motion-philosophy.md`).

## Skip animation conditions

Some users / situations should skip reveal animation:

### 1. Reduced motion preference

```tsx
import { useReducedMotion } from 'framer-motion';

const reduce = useReducedMotion();

if (reduce) {
  // Static render — no motion wrappers
  return <StaticResultPage result={result} />;
}
```

### 2. Fast-skip user setting (Wave 6+ feature, optional)

User setting "Skip result animations" → save to profile, applies to all result reveals.

### 3. IELTS-authentic mode result page

Result page returns to brand mode automatically (per `04-modes/mode-switch-rules.md`). NHƯNG nếu vì lý do nào đó render trong authentic context — disable animations.

```tsx
const mode = useMode();

const transition = mode === 'ielts-authentic'
  ? { duration: 0 }
  : { duration: 0.3, ease: 'easeOut' };
```

## Skeleton → result transition

While result loads from API, show skeleton screen. When data arrives → fade out skeleton, fade in result with reveal:

```tsx
{isLoading ? (
  <ResultSkeleton />
) : (
  <ResultPage result={data} />
)}
```

Skeleton fades out (200ms), result reveal begins. Transition feels natural (not jarring snap).

## Audit checklist result reveal

```
1. Band number tick animation 1200ms ease-out? ✓
2. Lintopus enters at 200ms with scale 0.9 → 1 + opacity? ✓
3. Sub-skill cards stagger 80ms interval? ✓
4. Stagger delayChildren 600ms (after band tick visible)? ✓
5. Detailed feedback fades in at 1000ms? ✓
6. Action CTA fades in at 1400ms? ✓
7. Battle result drama VICTORY/DEFEAT 600ms ease-out-expo? ✓
8. LP delta tick 1200ms? ✓
9. NO confetti, NO screen shake, NO bouncy spring? ✓
10. Reduced motion respected (skip reveal entirely)? ✓
11. Mode-aware (skip animation in ielts-authentic)? ✓
12. Skeleton fade-out before result reveal (smooth transition)? ✓
```

## See also

- `06-motion/motion-philosophy.md` — earned moment principle
- `06-motion/duration-language.md` — timing scale
- `06-motion/framer-variants.md` — staggerContainer + staggerChild + battleHeading
- `02-layout/result-page-anatomy.md` — result page structure
- `03-components/result-card.md` — sub-skill card spec
- `03-components/battle-card.md` — Battle result drama
- `03-components/mascot.md` — Lintopus enter motion
- `05-voice/battle-drama.md` — VICTORY/DEFEAT typography
