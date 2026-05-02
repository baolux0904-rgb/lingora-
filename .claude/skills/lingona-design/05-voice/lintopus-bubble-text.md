# Lintopus bubble text — copy library

Lintopus bubble = optional 1-line text next to mascot SVG. Per `03-components/mascot.md`, bubble is **visual companion to result moment**, NOT speech narrative.

## Bubble rules

| Rule | Detail |
|------|--------|
| **Length** | Max 80 characters / 1 line. Mobile: max 60 chars |
| **Voice** | Peer voice (mình/bạn) per `05-voice/persona.md` |
| **Em-dash OK** | Em-dash signature where appropriate |
| **Optional** | Mascot can render WITHOUT bubble. Bubble adds emotion, not always needed |
| **Mode-aware** | NEVER in `ielts-authentic` mode (no mascot at all) |
| **Single line** | KHÔNG line break. KHÔNG paragraph |

## Bubble copy library by trigger

### Result page — band ≥ 7.5

**Trigger**: high band achievement
**Mood**: `happy`
**Frequency**: 50% with bubble, 50% no bubble (let band number speak)

```
✅ "Vững rồi đấy"
✅ "Top form đấy"
✅ "Đỉnh — giữ rhythm này"
✅ "Band 7.5 — bằng phẳng đường tới 8"
✅ "Lintopus tự hào lắm 🐙"
```

### Result page — band 7.0

**Trigger**: solid Band 7
**Mood**: `happy`

```
✅ "Vững"
✅ "Cleared Band 7 — đẹp"
✅ "Top form đấy"
```

### Result page — band 6.5

**Trigger**: close to Band 7
**Mood**: `default` or `thinking`

```
✅ "Đang gần Band 7"
✅ "Còn 1-2 chỗ — luyện tiếp"
✅ null  (no bubble — let result page anatomy speak)
```

### Result page — band 6.0

**Trigger**: mid-band, encouraging
**Mood**: `thinking`

```
✅ "Đang ở Band 6 — còn 1 band tới mục tiêu"
✅ "Cohesion vững — vocab cần đa dạng hơn"
✅ null
```

### Result page — band 5.5

**Trigger**: building foundation
**Mood**: `thinking` or `default`

```
✅ "Foundation đang lên"
✅ "Luyện thêm 5 bài rồi quay lại"
✅ null
```

### Result page — band 5.0

**Trigger**: starting band
**Mood**: `default`

```
✅ "Bắt đầu từ đây"
✅ "Cùng luyện đi — Lintopus đợi"
✅ null
```

### Result page — band <5.0

**Trigger**: low band, recovery
**Mood**: `default` (KHÔNG `sad` per mascot rules)

```
✅ "Lintopus đợi bạn ở vòng tiếp theo"
✅ "Phần này khó. Cứ thử."
✅ "Quay lại Practice mode — luyện thêm 3-5 bài"
```

### Battle result — VICTORY

**Trigger**: Battle win
**Mood**: `happy`

```
✅ "Top form đấy"
✅ "Win clean"
✅ "+22 LP — đẹp"
✅ null  (let VICTORY headline speak)
```

### Battle result — DEFEAT

**Trigger**: Battle loss
**Mood**: `default` (NOT `sad`)

```
✅ "Lintopus đợi bạn ở vòng tiếp theo"
✅ "Phân tích lại lần sau"
✅ null
```

### Battle result — DRAW

**Trigger**: tie
**Mood**: `thinking`

```
✅ "Sát nhau — đấu nữa nào"
✅ null
```

### Battle queue — searching

**Trigger**: waiting opponent
**Mood**: `thinking`

```
✅ "Đang tìm đối thủ..."
✅ "Lintopus đợi cùng bạn"
✅ null
```

### Battle queue — match found

**Trigger**: opponent matched
**Mood**: `happy`

```
✅ "Tìm được rồi! Vào trận"
✅ "Đối thủ: {username}"
✅ null
```

### Battle gate (not met — need 5 practice)

**Trigger**: user trying to access Battle without prerequisite
**Mood**: `default`

```
✅ "Sắp sẵn sàng vào trận"
✅ "Hoàn thành 5 bài luyện rồi quay lại"
✅ "Còn {N} bài là vào trận được"
```

### Streak save (milestone)

**Trigger**: 7/30/100/365 day streak
**Mood**: `happy`

```
7 days:
✅ "Tuần đầu tiên xong. Vững."

30 days:
✅ "Tròn tháng. Lintopus tự hào."
✅ "30 ngày — top tier rồi"

100 days:
✅ "100 ngày. Top 1% học viên Lingona."
✅ "Trăm ngày — Lintopus chưa thấy ai vững thế này"

365 days:
✅ "Một năm. Khó tin được."
```

### Streak break

**Trigger**: streak reset to 0
**Mood**: `default` (NOT `sad`)

```
✅ "Streak {N} ngày đã reset. Bắt đầu lại hôm nay nhé."
✅ "Reset rồi — không sao, hôm nay tiếp tục"
```

### Daily limit hit (Free tier)

**Trigger**: user hit Speaking AI 1x/day limit
**Mood**: `default`

```
✅ "Hôm nay đã luyện Speaking rồi — quay lại mai nhé"
✅ "Daily limit reached — mai gặp lại"
✅ null  (just show upsell, không cần Lintopus speech)
```

NOTE: Bubble at daily limit = soft. Pro upgrade modal handle CTA separately.

### Onboarding welcome

**Trigger**: first time user
**Mood**: `happy`

```
✅ "Chào! Mình là Lintopus 🐙"
✅ "Cùng luyện IELTS với mình"
✅ "Mình giúp bạn từ band hiện tại tới mục tiêu"
```

### Onboarding band-select

**Trigger**: user picking target band
**Mood**: `default`

```
✅ "Bạn muốn đạt band nào?"
✅ null  (let question speak)
```

### Onboarding completion

**Trigger**: finish onboarding flow
**Mood**: `happy`

```
✅ "Sẵn sàng rồi — bắt đầu luyện thôi"
✅ "Lộ trình của bạn đã sẵn sàng"
```

### Achievement unlock

**Trigger**: badge earned
**Mood**: `happy`

```
✅ "{Achievement name} unlocked"
✅ "Mở khóa {achievement}"
✅ "+{N} XP"
```

### Level up

**Trigger**: XP threshold crossed
**Mood**: `happy`

```
✅ "Level {N}"
✅ "Lên level rồi 🐙"
✅ null  (let level number speak)
```

### Rank promotion (Battle)

**Trigger**: rank tier up (Iron → Bronze, etc.)
**Mood**: `happy`

```
✅ "Lên rank {tier}"
✅ "Promotion! {old_tier} → {new_tier}"
```

### Friend invite sent

**Trigger**: user sent friend request
**Mood**: `default`

```
✅ "Đã gửi lời mời tới {username}"
✅ null
```

### Empty states

**Friend list empty**:
```
✅ "Chưa có bạn nào. Mời bạn qua link nhé 🐙"
```

**Battle history empty**:
```
✅ "Chưa có trận nào. Vào trận đầu tiên đi"
```

**Achievement empty**:
```
✅ "Chưa unlock badge nào. Luyện đi để mở"
```

### Error states

**500 error**:
**Mood**: `sad` (only error state where `sad` fits)

```
✅ "Lintopus đang sửa! 🐙"
✅ "Lỗi rồi — đợi tí Lintopus fix"
```

**404 not found**:
**Mood**: `default`

```
✅ "Trang này không tồn tại"
✅ "Lintopus tìm không ra trang này"
```

**Network error**:
**Mood**: `default`

```
✅ "Mạng yếu — thử lại nhé"
✅ "Không kết nối được"
```

### Loading states (rare bubble use)

KHÔNG over-use bubble during loading. Loading = transient, no need narrate.

```
✅ null  (just spinner)
❌ "Đang tải..."  (bubble adds noise)
```

Exception: long loading (>5s) → bubble OK:

```
✅ "Đang xử lý — tí thôi"  (long task only)
```

## Bubble copy generation helper

```ts
// frontend/lib/mascotBubble.ts
import { MascotMood } from '@/components/ui/Mascot';

export function getBandBubble(band: number): string | null {
  if (band >= 7.5) return 'Vững rồi đấy';
  if (band >= 7.0) return null;  // mood-only
  if (band >= 6.5) return 'Đang gần Band 7';
  if (band >= 6.0) return 'Cohesion vững — vocab cần đa dạng hơn';
  if (band >= 5.5) return null;  // mood-only
  if (band >= 5.0) return 'Bắt đầu từ đây';
  return 'Lintopus đợi bạn ở vòng tiếp theo';
}

export function getBattleBubble(result: 'victory' | 'defeat' | 'draw'): string | null {
  if (result === 'victory') return 'Top form đấy';
  if (result === 'defeat') return 'Lintopus đợi bạn ở vòng tiếp theo';
  return null;  // draw
}

export function getStreakMilestoneBubble(streak: number): string | null {
  if (streak === 7) return 'Tuần đầu tiên xong. Vững.';
  if (streak === 30) return 'Tròn tháng. Lintopus tự hào.';
  if (streak === 100) return '100 ngày. Top 1% học viên Lingona.';
  if (streak === 365) return 'Một năm. Khó tin được.';
  return null;
}

export function getErrorBubble(code: number): string {
  if (code === 500) return 'Lintopus đang sửa! 🐙';
  if (code === 404) return 'Trang này không tồn tại';
  return 'Mạng yếu — thử lại nhé';
}
```

Single source. KHÔNG hardcode bubble per component.

## When to use null (no bubble)

50% of mascot renders should be **mood-only, no bubble**. Reasons:

- Result page: band number itself = the moment, bubble redundant
- Battle result: VICTORY/DEFEAT headline = the moment
- Onboarding step: question itself = the prompt
- Loading state: transient
- Empty state: action CTA = the focus

When in doubt: skip bubble. Mascot mood alone communicates 70% of emotion.

```tsx
<Mascot
  size={120}
  mood={getMoodFromBand(band)}
  bubble={getBandBubble(band)}  // null OK — Mascot handles gracefully
/>
```

## Anti-bubble patterns

❌ **Long bubble** — "Bạn đã làm rất tốt với band 7.0! Lintopus rất tự hào về bạn vì..."  → not 1-line
❌ **Generic praise** — "Great job!" / "Bạn tuyệt vời!" → vague, fake
❌ **English bubble** — "Keep going!" "You can do it!" → English in brand voice
❌ **Lecturing** — "Bạn cần phải cố gắng hơn để đạt..." → tutor register
❌ **Multiple sentences** — "Vững rồi đấy. Tiếp tục luyện. Mục tiêu sắp tới." → 3 sentences = paragraph
❌ **Emoji spam** — "Vững rồi đấy 🐙🎉🎊✨" → visual noise
❌ **Bubble in IELTS-authentic mode** → mascot itself absent
❌ **Persuasive sales bubble** — "Nâng cấp Pro để được Lintopus nói nhiều hơn!"  → Lintopus = NOT salesperson
❌ **Streak shame bubble** — "Bạn đã không luyện 3 ngày rồi 😢" → Duolingo Owl pattern

## Audit checklist bubble

```
1. Bubble length ≤ 80 chars (60 mobile)? ✓
2. Pronoun mình/bạn (NOT anh/em)? ✓
3. Vietnamese (NOT English) — except Battle drama? ✓
4. Specific (NOT vague generic)? ✓
5. Mascot mood matches bubble tone? ✓
6. Mode-aware (null in ielts-authentic)? ✓
7. 50% of mascot renders WITHOUT bubble (mood-only)? ✓
8. Single line, no paragraph? ✓
9. Em-dash where appropriate (not always)? ✓
10. NO multi-emoji decoration? ✓
```

## See also

- `03-components/mascot.md` — mascot rules + bubble integration
- `05-voice/persona.md` — bạn cùng lớp voice
- `05-voice/tone-rhythm.md` — em-dash + sentence rhythm
- `05-voice/microcopy-library.md` — broader microcopy beyond bubble
- `05-voice/battle-drama.md` — VICTORY/DEFEAT bubble exception
- `05-voice/never-say-list.md` — banned bubble phrases
