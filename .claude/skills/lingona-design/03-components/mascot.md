# Mascot — Lintopus rules

Lintopus = Lingona's only character. Custom hand-feel SVG mascot. Soul §1 lock từ codebase: *"stand next to every result, win or loss"*.

**CRITICAL**: Lintopus = visual SVG + optional 1-line bubble text/microcopy ONLY. NO audio, NO TTS, NO voice acting. (See `00-manifesto/what-we-are-not.md#7`.)

## Asset

- **File**: `frontend/public/mascot.svg` (single canonical asset)
- **Format**: SVG hand-feel custom (KHÔNG stock illustration, KHÔNG generated)
- **Variants**: 1 base shape — mood signaled via component prop, NOT via different SVG files
- **Size**: scalable vector, render any size 24px–400px

## Component spec

`frontend/components/ui/Mascot.tsx`:

```tsx
type MascotMood = "default" | "happy" | "thinking" | "sad";

interface MascotProps {
  size?: number;              // px, default 80
  mood?: MascotMood;           // default "default"
  className?: string;
  alt?: string;                // default "Lintopus"
  bubble?: string;             // optional bubble text (max 80 chars, 1 line)
  bubblePosition?: "right" | "below";  // default "below"
}

<Mascot
  size={120}
  mood="happy"
  alt="Lintopus"
  bubble="Vững rồi đấy"
/>
```

Mood implementation options:
- (a) Different SVG variants per mood (4 files)
- (b) Single SVG + CSS filter / opacity / mood-aware decoration (1 file, simpler)

**Recommend (b)** — easier maintenance, smaller bundle. Implement mood as `data-mood` attribute on container, style mood-specific accents (eye expression, posture) via CSS or wrapper SVG layer.

## 4 mood states

### `default` — neutral companion

**When**: routine pages with Lintopus presence (onboarding intro, landing hero, gating not-met, low band result)

**Visual**: standard Lintopus pose, neutral eyes, no extra decoration

**Bubble text**: optional, neutral copy
- ✅ "Lintopus đợi bạn ở đây nha"
- ✅ "Cùng luyện IELTS với mình"
- ❌ "Hi! I'm Lintopus..." (over-narrative)

### `happy` — celebration moment

**When**: Band 7+ result, VICTORY in Battle, achievement unlock, level up, rank promotion

**Visual**: brighter eyes, slightly raised posture, optional small celebration accent (NOT cartoon physics — see `00-manifesto/what-we-are-not.md#1`)

**Bubble text**: optional, earned-praise copy
- ✅ "Lintopus tự hào lắm! 🐙🎉"
- ✅ "Vững rồi đấy"
- ✅ "Top 10% — Lintopus tự hào lắm!"
- ❌ "AMAZING! 🎉🎉🎉" (over-celebrate AI smell)
- ❌ "WOOHOO!!" (cartoon)

### `thinking` — encouraging mid-band

**When**: Band 5.5–6.5 result, close win/loss Battle, stuck state, partial completion

**Visual**: tilted head pose, contemplative eyes (NOT confused, NOT sad — alert curious)

**Bubble text**: optional, peer encouragement
- ✅ "Đang gần Band 7"
- ✅ "Còn vài chỗ luyện thêm"
- ❌ "You're getting there!" (translate)
- ❌ "Almost!" (English placeholder)

### `sad` — loss/error recovery

**When**: Band <5.0 result, DEFEAT Battle (rare — usually `default`), error 500, streak broken

**Visual**: lowered posture, eyes slightly downcast (NOT crying, NOT dramatic — quiet companion)

**Bubble text**: optional, recovery-focused copy
- ✅ "Đừng nản — Lintopus đợi bạn ở vòng tiếp theo"
- ✅ "Lintopus đang sửa! 🐙" (error state)
- ❌ "Don't worry, you'll get it!" (fake comfort EN)
- ❌ "Đừng buồn nhé!" (fake comfort VN)

## Size system

| Size | Use case |
|------|----------|
| **24px** | Inline emoji-replacement (rare — prefer 🐙 emoji char inline) |
| **48px** | Toast notification, small badge area |
| **80px** | Default — empty state, gating message, secondary moment |
| **100–120px** | Result page (Battle/Reading/Writing/Speaking result side-panel) |
| **160–200px** | Onboarding screen primary visual, level-up overlay |
| **240–320px** | Landing hero, error 500 page center moment |

```tsx
// Result page (per result-page-anatomy.md)
<Mascot size={120} mood={getMoodFromBand(band)} bubble={bubbleText} />

// Landing hero (per desktop-canvas.md Pattern C)
<Mascot size={320} mood="happy" />

// Empty state inline
<Mascot size={48} mood="default" />

// Toast
<Mascot size={32} mood="happy" />
```

## Placement matrix (where Lintopus appears)

Per Soul §1 + codebase audit:

| Surface | Mascot present? | Mood logic |
|---------|----------------|------------|
| Landing hero | ✅ YES (320px) | `happy` |
| Landing final CTA | ✅ YES (160px) | `default` |
| Onboarding screen 1 (welcome) | ✅ YES (200px) | `happy` |
| Onboarding screens 2+ (questions) | ✅ YES (120px) | `default` |
| Onboarding completion | ✅ YES (200px) | `happy` |
| /home dashboard | ❌ NO (implicit via achievements/streak — KHÔNG over-presence) | — |
| Speaking entry | ❌ NO | — |
| Speaking task in-progress | ❌ NO (focus mode, KHÔNG distract) | — |
| **Speaking result** | ✅ YES (120px) Soul §1 | mood from band |
| Writing entry | ❌ NO | — |
| Writing task in-progress | ❌ NO | — |
| **Writing result** | ✅ YES (120px) Soul §1 — Wave 6 fix | mood from band |
| Reading entry | ❌ NO | — |
| Reading task in-progress | ❌ NO | — |
| **Reading result** | ✅ YES (120px) Soul §1 — Wave 6 fix | mood from band |
| Listening entry | ❌ NO | — |
| Listening task in-progress | ❌ NO | — |
| **Listening result** | ✅ YES (120px) Soul §1 | mood from band |
| Battle tab home | ❌ NO (queue button focus) | — |
| Battle queue (waiting opponent) | ✅ YES (100px) | `thinking` |
| Battle match in-progress | ❌ NO (focus mode) | — |
| **Battle result** | ✅ YES (120px) Soul §1 ✅ verified | `happy` if win, `default` if lose |
| Battle gate not-met (need 5 practice) | ✅ YES (100px) | `default` |
| Profile main | ❌ NO (avatar takes role) | — |
| Settings | ❌ NO (utility page) | — |
| Friends list | ❌ NO | — |
| Friend chat | ❌ NO (within messages) | — |
| Friend chat empty | 🐙 emoji only inline | — |
| Achievement unlock overlay | ✅ YES (200px) | `happy` |
| Level-up overlay | ✅ YES (200px) | `happy` |
| Rank promotion overlay | ✅ YES (200px) | `happy` |
| Daily mission completion | ✅ YES (80px) | `happy` |
| Streak save moment | ✅ YES (120px) | `happy` |
| Streak break notification | ✅ YES (80px) | `default` (KHÔNG `sad` — drama not earned) |
| Error boundary 404 | ✅ YES (200px) | `default` |
| Error boundary 500 | ✅ YES (200px) | `sad` (per codebase: "Đừng lo, Lintopus đang sửa!") |
| Empty state — generic | ✅ YES 🐙 emoji inline | — |
| Daily limit hit modal | ❌ NO (Lintopus không upsell) | — |
| Pro upgrade screen | ❌ NO (Lintopus không sell) | — |

**Rule cứng**: Lintopus appears at **emotional moments** (high win, low loss, recovery, welcome) and **soul §1 result pages**. Lintopus does NOT appear at:
- Routine functional pages (settings, profile main, friend list)
- In-task focus pages (speaking/writing/reading mid-task)
- Sales pages (Pro upgrade, daily limit upsell — Lintopus không là salesperson)

## Speech bubble UI (optional Wave 6 polish)

Two bubble text rendering modes:

### Mode A — plain text below mascot (simplest, default v1)

```tsx
<div className="flex flex-col items-center gap-3">
  <Mascot size={120} mood="happy" />
  <p className="text-sm text-gray-700 max-w-[200px] text-center font-medium">
    Vững rồi đấy
  </p>
</div>
```

OK pattern Wave 6 v1. Ship this first.

### Mode B — speech bubble SVG container (Wave 6 polish phase, optional)

```tsx
<div className="flex items-end gap-3">
  <Mascot size={120} mood="happy" />
  <SpeechBubble pointer="left">
    <p className="text-sm font-medium">Vững rồi đấy</p>
  </SpeechBubble>
</div>
```

`SpeechBubble` component:
- Rounded card with pointer triangle pointing toward mascot
- Background `var(--color-bg-card)` cream tint
- Border `var(--color-border)` 1px
- Padding 12px 16px
- Max-width 240px
- Pointer: triangle/arrow SVG element

Defer Mode B to Wave 6 polish sprint. Ship Mode A v1.

## Anti-patterns Lintopus

❌ Lintopus on every page (over-presence — kills emotional moment value)
❌ Lintopus dancing / waving wildly (Duolingo cartoon — see `00-manifesto/what-we-are-not.md#1`)
❌ Lintopus speaking long monologue (`"Hi! I'm Lintopus and I'm here to help you on your IELTS journey..."` — over-narrative)
❌ Lintopus with audio voice / TTS / play button (audio character — see #7)
❌ Lintopus on Pro upgrade page (Lintopus không salesperson)
❌ Lintopus blocking content (KHÔNG floating overlay covering UI)
❌ Lintopus with passive-aggressive copy ("It's been a while..." — Duolingo Owl pattern, anti)
❌ Lintopus mood `sad` for low band drama (Band 5.5 ≠ tragedy — use `thinking` or `default`)
❌ Lintopus mood `happy` for routine actions (login success ≠ celebration moment)
❌ Multiple Lintopus on same screen (1 only — visual focus)
❌ Lintopus rendered raw `<img src="/mascot.svg">` outside `landing/*` (use `<Mascot>` component)

## Implementation rules

```tsx
// ✅ OK — use component
import { Mascot } from '@/components/ui/Mascot';
<Mascot size={120} mood="happy" alt="Lintopus" />

// ✅ OK — landing exception (LCP priority)
import Image from 'next/image';
<Image
  src="/mascot.svg"
  alt="Lintopus"
  width={320}
  height={320}
  priority
/>

// ❌ BAN — raw img tag outside landing
<img src="/mascot.svg" alt="Lintopus" width="120" />

// ❌ BAN — inline SVG paste (component existed, why duplicate)
<svg viewBox="0 0 200 200">...</svg>
```

## Mood logic helpers

```ts
// frontend/lib/mascotMood.ts
export function getMoodFromBand(band: number): MascotMood {
  if (band >= 7.0) return 'happy';
  if (band >= 6.0) return 'default';
  if (band >= 5.0) return 'thinking';
  return 'default';  // band <5.0 — KHÔNG sad, just default companion
}

export function getMoodFromBattleResult(result: 'victory' | 'defeat' | 'draw'): MascotMood {
  if (result === 'victory') return 'happy';
  if (result === 'draw') return 'thinking';
  return 'default';  // defeat — KHÔNG sad
}

export function getMoodFromError(errorCode: number): MascotMood {
  if (errorCode === 500) return 'sad';
  return 'default';
}
```

Single source for mood logic. KHÔNG hardcode mood per page.

## Bubble text logic helpers

```ts
// frontend/lib/mascotBubble.ts
export function getBandBubble(band: number): string | null {
  if (band >= 7.5) return 'Vững rồi đấy';
  if (band >= 7.0) return null;  // mood-only, no bubble
  if (band >= 6.5) return 'Đang gần Band 7';
  if (band >= 5.5) return null;  // mood-only
  return 'Lintopus đợi bạn ở vòng tiếp theo';
}

export function getBattleBubble(result: 'victory' | 'defeat' | 'draw'): string | null {
  if (result === 'victory') return 'Top form đấy';
  if (result === 'defeat') return 'Lintopus đợi bạn ở vòng tiếp theo';
  return null;
}
```

Single source for bubble copy. Apply voice rules from `00-manifesto/personality.md`.

## See also

- `00-manifesto/personality.md` — Lintopus voice scope (visual + bubble text only)
- `00-manifesto/what-we-are-not.md#1` — NOT Duolingo cartoon
- `00-manifesto/what-we-are-not.md#7` — NOT audio character
- `02-layout/result-page-anatomy.md` — Lintopus placement in result page Soul §1
- `06-motion/svg-path.md` — Lintopus arm wave / blink / bounce subtle animation (pending)
- `07-moments/*` — moments where Lintopus appears (pending Phase B)
