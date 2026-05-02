# Battle drama — register exception

Battle = Lingona's only surface where voice register **breaks peer voice** for drama. Drama register = sharper, gamified, English keywords, ALL CAPS for results.

Why exception: Battle is competitive feature. User expects gaming register (won/lost/rank/LP). Peer voice mềm phá tension. Drama register sells the moment.

## Drama register vocabulary

### English keywords (locked, untranslated)

| Term | Use |
|------|-----|
| **VICTORY** | Win result heading, ALL CAPS Playfair Italic bold |
| **DEFEAT** | Loss result heading |
| **DRAW** | Tie result heading |
| **LP** | League Points (rank score unit) |
| **Rank** / **rank** | Tier system label |
| **Iron / Bronze / Silver / Gold / Platinum / Diamond / Master / Challenger** | Rank tier names (untranslated) |
| **Division** | Sub-tier (Iron II, Iron III) |
| **Win streak** / **W** | Consecutive wins |
| **Match** | 1 Battle round |

KHÔNG translate. Vietnamese gamer audience uses English gaming convention. "Chiến thắng" / "Thất bại" = clunky, NOT gamified.

### Mixed VN-EN copy

```
✅ "VICTORY — top form đấy"  (English headline + VN body)
✅ "DEFEAT — Lintopus đợi bạn ở vòng tiếp theo"
✅ "+22 LP — đẹp"
✅ "Rank Gold II — sát Platinum rồi"
✅ "5W streak — top form"

❌ "CHIẾN THẮNG — top form đấy" (translated, lose drama)
❌ "VICTORY — great job!" (English body, lose VN voice)
❌ "Bạn đã thắng vòng đấu này!" (lecture register)
```

Headline English ALL CAPS Playfair Italic bold. Body Vietnamese peer voice DM Sans. Best of both register.

## Battle copy library

### Pre-battle

| Context | ✅ Drama copy |
|---------|--------------|
| Battle tab home | "Battle Arena" / "BATTLE" |
| Queue button | "Vào trận" |
| Find match button | "Tìm đối thủ" |
| Cancel queue | "Hủy tìm trận" |
| Queue searching | "Đang tìm đối thủ..." |
| Match found | "Tìm được rồi!" |
| Match countdown | "Vào trận trong {N}..." |
| Battle gate | "Hoàn thành {N} bài luyện để mở khóa Battle" |

### Mid-battle

| Context | ✅ Drama copy |
|---------|--------------|
| Your side label | "Bạn" |
| Opponent label | "Đối thủ" |
| Score | "{N} điểm" |
| Time remaining | "Còn {N}" |
| Submit answer | "Nộp" / "OK" |
| Skip question | "Bỏ qua" |
| Question {N} of {total} | "{N} / {total}" |

### Post-battle — VICTORY

| Element | ✅ Copy |
|---------|---------|
| Hero headline | "VICTORY" (text-7xl Playfair Italic bold uppercase) |
| Score sub | "{yourScore} : {oppScore}" |
| Opponent context | "Đối thủ: {opponent_username}" |
| LP change | "+{N} LP" (teal color) |
| Streak indicator | "{N}W" |
| Mascot bubble (optional) | "Top form đấy" / "Win clean" / "Đỉnh" / null |
| Primary CTA | "Đấu nữa" |
| Secondary CTA | "Xem lịch sử →" |

### Post-battle — DEFEAT

| Element | ✅ Copy |
|---------|---------|
| Hero headline | "DEFEAT" (same text-7xl Playfair Italic bold uppercase) |
| Score sub | "{yourScore} : {oppScore}" |
| Opponent context | "Đối thủ: {opponent_username}" |
| LP change | "-{N} LP" (error color) |
| Streak reset | "Streak reset" / "Streak {N} → 0" |
| Mascot bubble (optional) | "Lintopus đợi bạn ở vòng tiếp theo" / null |
| Primary CTA | "Luyện lại" (NOT "Đấu nữa" — recovery focus) |
| Secondary CTA | "Xem lịch sử →" |

DEFEAT recovery framing: primary CTA "Luyện lại" (Practice mode), NOT pushy "Đấu nữa". KHÔNG salt the wound.

### Post-battle — DRAW

| Element | ✅ Copy |
|---------|---------|
| Hero headline | "DRAW" |
| Score sub | "{yourScore} : {oppScore}" |
| LP change | "+0 LP" (gray neutral) |
| Mascot bubble | "Sát nhau — đấu nữa nào" / null |
| Primary CTA | "Đấu nữa" |

DRAW = neutral, encouraging.

### Rank promotion

| Event | ✅ Copy |
|-------|---------|
| Promotion (Iron II → Iron I) | "Promotion! Iron II → Iron I" |
| Tier-up (Iron I → Bronze IV) | "Lên rank Bronze" / "BRONZE TIER UNLOCKED" |
| Top tier reach (Master) | "MASTER TIER" |
| Demotion | "Demoted to Bronze IV" / "Rank giảm — Iron I → Iron II" |

Rank promotion = bigger drama moment than regular VICTORY. Use overlay celebration.

### Rank demotion

| Event | ✅ Copy |
|-------|---------|
| Demotion warning | "Sắp demotion — thắng trận này để giữ rank" |
| Demotion confirmed | "Demoted to {tier}" / "Rank giảm — đừng nản, build lại" |

Demotion = factual, NOT drama-heavy. Recovery framing.

## Win streak milestones

| Streak | ✅ Drama copy |
|--------|--------------|
| 3W | "3W streak" / "3 trận liên tiếp" |
| 5W | "5W — đang nóng" |
| 10W | "10W STREAK 🐙 — Lintopus chưa thấy ai vững vậy" |
| 20W | "20W TIER LEGEND" |
| Streak break | "Streak {N}W reset" / null (just show 0W) |

10+ streak = bigger overlay celebration. Achievement unlock parallel.

## Anti-drama patterns

❌ **Toxic gaming slang**
```
❌ "ez win"
❌ "gg"
❌ "noob"
❌ "trash opponent"
❌ "rekt"
```

Gaming slang ≠ Lingona drama. Drama = sharp earned, NOT toxic.

❌ **Over-celebration**
```
❌ "AMAZING VICTORY! 🎉🎊✨"
❌ "Bạn là siêu sao! Top 1!"
❌ "WOOHOO! GREAT JOB!"
```

Drama = brief earned. NOT confetti spam.

❌ **English fake-cheer**
```
❌ "Better luck next time!"
❌ "You're so close!"
❌ "Don't give up!"
```

English in body = phá Vietnamese voice. Headline English OK (VICTORY/DEFEAT only).

❌ **Salt the wound (DEFEAT)**
```
❌ "DEFEAT — bạn đã thua dễ"
❌ "DEFEAT — đối thủ giỏi hơn"
❌ "DEFEAT — luyện thêm rồi quay lại"  (lecture)
```

DEFEAT recovery framing only. Lintopus voice = "Đợi bạn ở vòng tiếp theo".

❌ **Lecture in drama register**
```
❌ "VICTORY! Bạn đã làm rất tốt vì có chiến thuật rõ ràng và luyện tập đều đặn..."
```

Drama = punchy. Long sentence phá moment.

## Drama register typography

Per `01-foundations/typography.md` + `03-components/battle-card.md`:

```css
.battle-result-heading {
  font-family: var(--font-display);  /* Playfair Display */
  font-style: italic;
  font-weight: 700;                   /* bold — Battle exception */
  text-transform: uppercase;
  letter-spacing: -0.02em;            /* tracking-tight */
  font-size: clamp(48px, 8vw, 96px);  /* text-7xl responsive */
  line-height: 1;
  color: var(--color-navy);
}
```

Other drama elements (LP change, streak count) keep DM Sans body but bigger size:

```css
.battle-lp-delta {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 2rem;      /* text-2xl */
  color: var(--color-teal);  /* teal for + */
}

.battle-lp-delta.negative {
  color: var(--color-error);  /* error for - */
}
```

## Drama register motion (rare exception)

Per `06-motion/result-reveal.md` (pending):

VICTORY/DEFEAT headline = stagger reveal MORE pronounced than normal result page:

```tsx
import { motion } from 'framer-motion';

const battleHeadingVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],  // ease-out-expo dramatic
    },
  },
};

<motion.h1
  variants={battleHeadingVariants}
  initial="hidden"
  animate="visible"
  className="battle-result-heading"
>
  VICTORY
</motion.h1>
```

NHƯNG vẫn KHÔNG bouncy spring. Drama = smooth + earned.

KHÔNG confetti particle effect. KHÔNG screen shake. KHÔNG dramatic zoom.

## Sound = STILL NONE

Even Battle drama, **NO audio**. Lingona = silent app per `00-manifesto/what-we-are-not.md#7`.

KHÔNG victory fanfare. KHÔNG defeat sting. KHÔNG button click sound.

Visual + text drama only. Battle drama relies on:
- Big VICTORY/DEFEAT headline reveal animation
- LP delta animation (+22 ticking up)
- Lintopus mood + bubble
- Score reveal stagger

KHÔNG sound. Period.

## Mode boundary — drama exception zone

Drama register active **only on**:
- `/battle/casual/match/{id}/result` (Casual battle result)
- `/battle/ranked/match/{id}/result` (Ranked battle result)
- Achievement unlock overlay (rank promotion only)

NOT active:
- Battle queue (use neutral tone "Đang tìm đối thủ...")
- Battle match in-progress (focus mode, neutral)
- Friend chat (peer voice)
- Other skills' results (use peer voice)

Drama is moment-bound. Outside the moment, peer voice returns.

## Audit checklist Battle drama

```
1. VICTORY / DEFEAT / DRAW English ALL CAPS Playfair Italic bold? ✓
2. Hero headline text-7xl (text-5xl mobile)? ✓
3. Body copy Vietnamese peer voice (NOT English)? ✓
4. LP delta has sign (+22 / -15) AND color? ✓
5. DEFEAT recovery framing (NOT lecturing)? ✓
6. CTA "Đấu nữa" for VICTORY, "Luyện lại" for DEFEAT? ✓
7. NO confetti, NO screen shake, NO sound? ✓
8. NO toxic gaming slang? ✓
9. Reveal animation smooth ease-out (NOT bouncy)? ✓
10. Drama bounded to /result page only? ✓
```

## See also

- `00-manifesto/personality.md` — voice rules + drama exception
- `00-manifesto/what-we-are-not.md#7` — silent app (no sound)
- `03-components/battle-card.md` — Battle card UI
- `03-components/mascot.md` — VICTORY/DEFEAT mascot mood
- `01-foundations/typography.md` — Playfair Italic bold = Battle exception
- `05-voice/persona.md` — peer voice (broken in Battle)
- `05-voice/microcopy-library.md` — Battle copy table
- `05-voice/lintopus-bubble-text.md` — Battle bubble copy
- `06-motion/result-reveal.md` — Battle stagger reveal animation (pending)
