# What we borrow — synthesis

Lingona's positioning = **Study4 IELTS authenticity + Duolingo gamification skeleton + JS Challenger sober text-first layout**, wrapped in **Vietnamese peer voice + Lintopus companion mascot**.

This file synthesizes 3 reference extracts into Lingona's distinct identity.

## Positioning equation

```
Lingona  =  Study4(authenticity)
         +  Duolingo(gamification skeleton, NOT cartoon physics)
         +  JS Challenger(sober text-first restraint)
         +  Vietnamese peer voice (mình/bạn)
         +  Lintopus companion (visual + bubble text)
         +  IELTS rigor (multi-sampling, specific feedback)
```

## What each reference contributes

### From Study4 → IELTS authenticity layer

```
✅ Cambridge faithful exam UI (in ielts-authentic mode)
✅ Vietnamese audience IELTS framing (Cam 14, Test 1/2/3/4)
✅ IELTS content density (passage + question grid 50/50)
✅ Reference Cambridge tests (10/11/12/14)
```

Applied: `04-modes/ielts-authentic.md` mode definition.

### From Duolingo → Gamification skeleton

```
✅ Streak system (active/at-risk/broken + milestones)
✅ XP + Level progression
✅ Achievement gallery (45 badges, 8 categories)
✅ Daily missions (3 per day)
✅ Leaderboard / Ranked tier (Iron → Challenger)
```

Applied: `03-components/streak-ring.md` + `03-components/battle-card.md` rank tier + `03-components/mascot.md` (achievement unlock).

### From JS Challenger → Sober restraint

```
✅ Clean text-first layout (NO mock chat / floating blobs)
✅ Sober color palette (NO rainbow gradient)
✅ Practice-first content density (Reading 56 passages compact)
```

Applied: `02-layout/desktop-canvas.md` Pattern C + `01-foundations/palette.md` restraint + `02-layout/empty-space-philosophy.md`.

## What Lingona contributes (NOT borrowed)

These are Lingona-original — what makes it NOT a clone:

### 1. Vietnamese peer voice (mình/bạn)

Lingona's voice = "bạn cùng lớp" peer. Vietnamese-first. Em-dash signature.

Per `05-voice/persona.md` + `00-manifesto/personality.md`. None of 3 references use Vietnamese peer voice — Study4 corporate VN, Duolingo English cheerleading, JS Challenger English direct.

### 2. Lintopus mascot (visual + bubble text only)

Lintopus = original character. Octopus 8 arms = 8 learning functions. Subtle motion (breath/blink/wave). NO audio.

Per `03-components/mascot.md` + `06-motion/svg-path.md`. Duolingo has Owl but it's cartoon-physics. Study4 has no mascot. JS Challenger no mascot.

### 3. Multi-sampling AI scoring

Writing scored 3x with GPT-4o-mini for noise reduction. Specific to Lingona's rigorous approach.

Per Lingona principles. Duolingo doesn't multi-sample (focused on retention not accuracy). Study4 may use AI but undisclosed methodology.

### 4. 3-mode system (brand / brand-soft / ielts-authentic)

Mode-aware UI swaps. NO reference does this (each is single-mode visually).

Per `04-modes/`. Lingona's signature architecture.

### 5. Honest paywall (Pro 199k base + student 20%)

Transparent pricing, no manipulation, no FOMO countdown banner.

Per `09-anti-patterns/fake-stats-ban.md` + `05-voice/never-say-list.md#9`. Duolingo + Study4 use FOMO/manipulation upsell.

## Score positioning

| Property | Study4 | Duolingo | JS Challenger | **Lingona Wave 6 target** |
|----------|--------|----------|---------------|---------------------------|
| IELTS authenticity | 5 | 0 | 0 | 5 |
| Gamification depth | 1 | 5 | 1 | 5 |
| Visual restraint | 2 | 3 | 5 | 5 |
| Mascot personality | 0 | 5 (cartoon) | 0 | 5 (subtle) |
| Vietnamese voice | 1 corporate | 0 | 0 | 5 peer |
| Honest paywall | 2 | 2 | 4 | 5 |
| Dashboard clarity | 2 | 3 | 5 | 5 |
| Mode-aware UI | 0 | 0 | 0 | 5 |
| Multi-sampling AI | 0 | 0 | 0 | 5 |
| **Sum** | 13 | 18 | 15 | **45 / 45** |

Lingona Wave 6 = highest combined score because it borrows best from each + adds Lingona-original layers.

## Anti-borrows summary

What we explicitly DO NOT borrow:

| Reference | Anti to avoid |
|-----------|--------------|
| Study4 | Corporate VN voice, dashboard clutter, free tier watermark, generic SaaS landing |
| Duolingo | Cartoon physics, passive-aggressive Owl, gamification-over-learning, constant cheerleading, cluttered dashboard |
| JS Challenger | Code editor primary UI, cold developer register, dark mode default |

Each anti-borrow = explicit anti-pattern documented in `09-anti-patterns/`:
- Corporate VN → `corporate-translate.md`
- Cartoon physics → `00-manifesto/what-we-are-not.md#1`
- Generic SaaS → `ai-generated-smell.md`
- Manipulation FOMO → `fake-stats-ban.md` + `never-say-list.md#9`
- Cluttered dashboard → `desktop-waste.md` + `empty-space-philosophy.md`

## Decision framework

When designing Wave 6 page, ask:

```
1. What does Study4 do here? → IELTS authenticity (use in ielts-authentic mode only)
2. What does Duolingo do here? → Gamification (borrow skeleton, NOT cartoon vibe)
3. What does JS Challenger do here? → Restraint (apply for clean density)
4. What's Lingona-original here? → Vietnamese peer voice + Lintopus + multi-sampling
5. What anti-pattern to avoid? → Check `09-anti-patterns/` for relevant smell
```

Synthesis decision = which references contribute to which mode + what's original Lingona.

## Wave 6 implementation map

| Wave 6 sprint | Primary reference | Secondary | Lingona-original |
|---------------|-------------------|-----------|------------------|
| Sprint 2 — Landing | JS Challenger restraint | — | Lintopus hero + peer voice |
| Sprint 3 — Auth | JS Challenger sober form | — | Vietnamese peer voice |
| Sprint 4 — Onboarding | Duolingo skeleton | JS Challenger restraint | Lintopus warmth |
| Sprint 5 — Writing flow | Study4 (full-test) | Duolingo (practice) | Multi-sampling + brand chart palette |
| Sprint 6 — Speaking flow | Study4 (full-test) | Duolingo (practice) | Whisper + LLM scoring |
| Sprint 7 — Reading polish | Study4 (full-test) | JS Challenger (compact list) | Mode-aware swap |
| Sprint 8 — Profile/Battle/Settings | Duolingo (Battle) | JS Challenger (Settings) | Pro 199k pricing + honest paywall |

Each sprint pulls from references intentionally + adds Lingona-original.

## When in doubt — reference grep

Before commit, grep self-check:

```bash
# Cluttered dashboard? — JS Challenger / Lingona answer = restraint
grep -rn "ad-banner\|promo-card\|upgrade-popup" frontend/app/(app)/home/
# Should be 0 hits

# Corporate VN? — Study4 anti
grep -rEn "vui lòng|quý khách|trân trọng" frontend/components

# Cartoon physics? — Duolingo anti
grep -rn "animate-bounce\|spring\|stiffness" frontend/

# Mascot present? — Lingona signature
grep -rn "import.*Mascot" frontend/app/(public)/page.tsx frontend/app/(app)/home/
# Should be ≥ 1 in landing + 0 in dashboard primary
```

Reference-aware audit.

## See also

- `11-references/jschallenger-extract.md` — sober text-first
- `11-references/duolingo-extract.md` — gamification skeleton
- `11-references/study4-extract.md` — IELTS authenticity
- `00-manifesto/personality.md` — Lingona-original voice + character
- `00-manifesto/what-we-are-not.md` — anti-positions across references
- `00-manifesto/visual-vocabulary.md` — warm + rigorous + companion
- `00-manifesto/recognizable-from-100ft.md` — 5-signal identity
- `04-modes/` — 3-mode system Lingona-original
- `09-anti-patterns/` — explicit anti-borrow patterns
