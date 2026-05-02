# Duolingo reference — what we borrow (gamification)

Duolingo (duolingo.com) — language learning app. Per Wave 6 audit comparison: **34/35** score. Highest reference score.

## Why reference

Duolingo nailed gamification skeleton: streak, XP, levels, achievements, daily missions, leagues. Habit-forming UX patterns Lingona can borrow.

NHƯNG Duolingo also has anti-patterns Lingona must NOT borrow (cartoon physics, passive-aggressive owl, gamification-over-learning).

## What we borrow (5 things)

### 1. Streak system (current/longest/freeze)

Duolingo's streak = signature gamification element. Daily completion → streak counter. Miss day → streak reset (or use streak freeze power-up).

Lingona equivalent:
```
- Daily streak counter with status (active/at-risk/broken)
- Milestone celebrations: 7d/30d/100d/365d
- Streak break = factual recovery copy "Streak {N} reset. Bắt đầu lại nhé."
- Streak freeze (Pro feature) — optional, post-launch
```

Per `03-components/streak-ring.md` + `05-voice/lintopus-bubble-text.md` (streak save/break copy).

### 2. XP + Level progression

Duolingo: complete lesson → earn XP → level up. Level-up overlay celebration.

Lingona equivalent:
```
- XP per Speaking/Writing/Reading/Listening submission
- Level threshold crossed → overlay celebration
- Total XP visible on dashboard
- Daily XP goal (user sets in settings)
```

Per `03-components/streak-ring.md` (XP variant) + `05-voice/lintopus-bubble-text.md` (level-up copy).

### 3. Achievement gallery (badges, categories)

Duolingo: 30+ achievements across categories. Visual gallery.

Lingona equivalent:
```
- 45 achievements, 8 categories (per codebase Wave 2)
- Gallery page `/achievements`
- Locked/unlocked state visual
- Unlock overlay celebration
```

Per `03-components/mascot.md` placement matrix (achievement unlock = Lintopus 200px happy).

### 4. Daily missions (3-5 per day)

Duolingo: daily missions reset 0am UTC. Complete all → bonus XP.

Lingona equivalent:
```
- Daily missions reset 0am Vietnam time (ICT)
- 3 missions per day (Speaking 1x, Writing 1x, optional Reading)
- Complete all → +50 XP bonus + Lintopus celebration
- Show progress on dashboard
```

Per `03-components/mascot.md` (daily mission completion = Lintopus 80px happy).

### 5. Leaderboard / Ranked tier (League system)

Duolingo: weekly leagues (Bronze → Diamond → Obsidian) with promotion/demotion.

Lingona Battle equivalent:
```
- 8 ranks: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger
- LP system per Battle win/loss
- Promotion/demotion overlay
- Leaderboard top 100
```

Per `03-components/battle-card.md` (rank tier) + `05-voice/battle-drama.md` (promotion copy).

## What we DON'T borrow (5 things)

### 1. Cartoon physics + spring bounce

Duolingo Owl jumps, dances, bounces. Cartoon vibe. Per `00-manifesto/what-we-are-not.md#1`:

```
❌ Duolingo cartoon physics
✅ Lintopus subtle breath/blink/wave (per `06-motion/svg-path.md`)
```

Lingona = study app, KHÔNG kindergarten cartoon.

### 2. Passive-aggressive owl shame

Duolingo Owl: "You haven't practiced in a while" / "Your streak is in danger!" / threatening notification copy.

Per `05-voice/never-say-list.md#3`:

```
❌ "Streak của bạn sắp mất!" (manipulation FOMO)
❌ "Bạn đã không luyện 3 ngày rồi" (Duolingo Owl shame)
❌ "Đừng để tuột mất..." (loss aversion)

✅ "Streak {N} ngày đã reset. Bắt đầu lại hôm nay nhé."
✅ Recovery framing, factual, NOT shaming
```

Lintopus = peer companion, NOT manipulator.

### 3. Gamification-over-learning

Duolingo: optimized for retention through gamification, sometimes at expense of actual language proficiency. User "gets streak" without actually improving.

Lingona priority:
```
1. IELTS proficiency (band improvement)
2. Honest feedback (multi-sampling, specific feedback)
3. Gamification (streak/XP) supports #1, NOT replace
```

Per `00-manifesto/personality.md`: warm + **rigorous** + companion. Rigorous = real IELTS scoring.

### 4. Constant celebration cheerleading

Duolingo: every lesson complete → fireworks, confetti, "AMAZING!" Owl celebration.

Per `05-voice/never-say-list.md#2`:

```
❌ Constant praise per lesson
❌ Confetti per completion
❌ "AMAZING!" / "WOW!"

✅ Earned moments only (band 7+ result, Battle VICTORY, milestone streak)
✅ Specific praise: "Cohesion vững" not "AMAZING!"
✅ NO confetti per `06-motion/motion-philosophy.md`
```

### 5. Cluttered dashboard

Duolingo dashboard: 10+ widgets simultaneously (path, streak, XP, missions, leagues, friends, ads, premium upsell). Cluttered.

Per `02-layout/empty-space-philosophy.md`:

```
Lingona dashboard = clean 3-stat row + 4-skill grid + missions section.
NO ads, NO premium upsell pop-up on dashboard.
Pro upgrade discoverable via Settings, NOT dashboard cluttering.
```

## Score breakdown — Duolingo vs Lingona Wave 6

| Dimension | Duolingo | Lingona current | Lingona Wave 6 target |
|-----------|----------|-----------------|----------------------|
| Gamification depth | 5/5 | 4/5 | 5/5 |
| Visual polish | 5/5 | 3/5 | 5/5 |
| Mascot personality | 5/5 | 4/5 | 5/5 |
| Onboarding flow | 5/5 | 3/5 | 5/5 |
| Learning effectiveness | 3/5 | 4/5 | 5/5 |
| Tone (peer vs cartoon) | 2/5 | 5/5 | 5/5 |
| Cluttered vs clean | 3/5 | 3/5 | 5/5 |
| **Total** | **34/35** (artificial inflation, deduct cartoon) | 18/35 | **32/35** |

Lingona target: borrow Duolingo's gamification skeleton + own peer voice + clean restraint = strongest combination.

## See also

- `00-manifesto/personality.md` — warm + rigorous + companion (rigorous distinguishes from Duo)
- `00-manifesto/what-we-are-not.md#1` — NOT Duolingo cartoon
- `03-components/mascot.md` — Lintopus subtle (NOT Owl dance)
- `03-components/streak-ring.md` — streak system
- `03-components/battle-card.md` — rank tier system
- `05-voice/never-say-list.md#3` — anti Duolingo Owl shame
- `06-motion/motion-philosophy.md` — calm > energetic (anti cartoon physics)
- `11-references/study4-extract.md` — IELTS-authentic reference
- `11-references/what-we-borrow.md` — synthesis
