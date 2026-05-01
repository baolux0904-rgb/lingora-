# Streak ring — signature circular element

Streak ring = circular SVG progress visualization for **daily streak**, **week progress**, **goal completion**. Lingona signature element — used on dashboard, profile, daily mission card.

## Canonical streak ring

```tsx
interface StreakRingProps {
  current: number;        // current count (e.g., 7 days)
  target?: number;        // target count (e.g., 30 for monthly goal). null = open-ended streak
  size?: number;          // px, default 120
  strokeWidth?: number;   // px, default 8
  showCenter?: boolean;   // show count number in center, default true
  label?: string;         // bottom label (e.g., "ngày streak"), default "ngày"
  status?: 'active' | 'at-risk' | 'broken';
}

<StreakRing
  current={7}
  size={120}
  status="active"
  label="ngày streak"
/>
```

## Visual structure

```tsx
function StreakRing({ current, target, size = 120, strokeWidth = 8, showCenter = true, label = 'ngày', status = 'active' }: StreakRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target ? Math.min(current / target, 1) : 1;
  const dashOffset = circumference * (1 - progress);
  
  const strokeColor = status === 'active'
    ? 'var(--color-teal)'
    : status === 'at-risk'
    ? 'var(--color-warning)'
    : 'var(--color-gray-400)';
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track (background ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-gray-200)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      
      {/* Center content */}
      {showCenter && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-display italic text-navy tabular-nums">
            {current}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}
```

| Aspect | Value |
|--------|-------|
| Track color | `var(--color-gray-200)` — empty ring |
| Progress color (active) | `var(--color-teal)` |
| Progress color (at-risk) | `var(--color-warning)` amber — streak hôm nay chưa luyện |
| Progress color (broken) | `var(--color-gray-400)` — visual de-emphasis |
| Stroke linecap | `round` — softer feel |
| Rotation start | `-90deg` — progress starts at 12 o'clock |
| Transition | `0.6s ease-out` — smooth fill animation |
| Center font | `font-display italic tabular-nums` — Playfair signature |

## Status logic

```ts
// frontend/lib/streakStatus.ts
export type StreakStatus = 'active' | 'at-risk' | 'broken';

export function getStreakStatus(currentStreak: number, lastCompletedAt: Date | null): StreakStatus {
  if (currentStreak === 0) return 'broken';
  
  if (!lastCompletedAt) return 'broken';
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastCompletedDate = new Date(
    lastCompletedAt.getFullYear(),
    lastCompletedAt.getMonth(),
    lastCompletedAt.getDate()
  );
  
  // If last completed today → active
  if (lastCompletedDate.getTime() === todayStart.getTime()) return 'active';
  
  // If last completed yesterday → at-risk (need to do today)
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (lastCompletedDate.getTime() === yesterdayStart.getTime()) return 'at-risk';
  
  // If older → broken
  return 'broken';
}
```

Single source for streak status logic. KHÔNG hardcode logic per component.

## Size variants

| Size | Use case |
|------|----------|
| **48px** | Inline dashboard widget, BottomNav badge |
| **80px** | Profile card streak indicator |
| **120px** (default) | Dashboard primary streak block |
| **160–200px** | Achievement detail modal, streak save moment overlay |

```tsx
// Dashboard primary
<StreakRing current={7} size={120} />

// Profile inline
<StreakRing current={7} size={80} showCenter={true} />

// Compact widget
<StreakRing current={7} size={48} showCenter={false} label="" />
```

## Variants by use case

### Daily streak (open-ended, no target)

```tsx
<StreakRing
  current={currentStreak}
  size={120}
  status={status}
  label="ngày streak"
/>
```

No `target` → progress always 100% filled. Color encodes status.

### Weekly goal progress (target = 7)

```tsx
<StreakRing
  current={daysCompletedThisWeek}
  target={7}
  size={120}
  status="active"
  label={`ngày / ${7}`}
/>
```

Progress arc partial (e.g., 5/7 = 71% filled).

### Monthly goal progress

```tsx
<StreakRing
  current={daysCompletedThisMonth}
  target={30}
  size={160}
  label="ngày / 30"
/>
```

### XP daily goal

```tsx
<StreakRing
  current={todayXP}
  target={dailyXPGoal}
  size={120}
  label="XP hôm nay"
/>
```

XP variant uses XP count instead of day count. Same visual primitive.

## Streak break overlay (recovery moment)

Per `00-manifesto/personality.md` voice rules — break = factual, KHÔNG drama:

```tsx
<div className="bg-cream border border-gray-200 rounded-xl p-8 text-center">
  <StreakRing current={0} size={160} status="broken" label="ngày" />
  
  <h3 className="mt-6 text-xl font-display italic text-navy">
    Streak reset
  </h3>
  
  <p className="mt-2 text-sm text-gray-700 max-w-xs mx-auto">
    Streak {previousStreak} ngày đã reset. Bắt đầu lại hôm nay nhé.
  </p>
  
  <button className="mt-6 primary-button">
    Luyện 1 bài
  </button>
</div>
```

Voice rule:
- ✅ "Streak {N} ngày đã reset. Bắt đầu lại hôm nay nhé."
- ❌ "Bạn đã làm mất streak!" (drama, blame)
- ❌ "Streak gone." (sterile English)

## Streak save moment (achievement)

When user maintains streak (especially milestones like 7/30/100 days):

```tsx
<div className="bg-cream border-2 border-teal rounded-xl p-8 text-center">
  <StreakRing current={currentStreak} size={200} status="active" />
  
  <h3 className="mt-6 text-2xl font-display italic text-navy">
    Streak {currentStreak} ngày 🐙
  </h3>
  
  <p className="mt-2 text-sm text-gray-700 max-w-xs mx-auto">
    {getStreakMilestoneMessage(currentStreak)}
  </p>
</div>
```

Milestone messages:

```ts
function getStreakMilestoneMessage(streak: number): string {
  if (streak === 7) return 'Tuần đầu tiên xong. Vững.';
  if (streak === 30) return 'Tròn tháng. Lintopus tự hào.';
  if (streak === 100) return '100 ngày. Top 1% học viên Lingona.';
  if (streak === 365) return 'Một năm. Khó tin được.';
  return `${streak} ngày liên tục.`;
}
```

Specific peer voice. KHÔNG generic "Keep going!" / "Great streak!".

## Accessibility

```tsx
<div
  role="img"
  aria-label={`Streak ${current} ngày, trạng thái ${status}`}
  className="..."
>
  <svg>...</svg>
</div>
```

Add `role="img"` + `aria-label` for screen reader. Visual circle = decorative, label tells the story.

## Anti-patterns

❌ Streak ring with gradient stroke (`from-teal to-blue`) — solid color only
❌ Multiple progress arcs in 1 ring (use sequential displays instead)
❌ Streak ring rotating animation (static, KHÔNG spin)
❌ Drop-shadow / glow on ring (flat design)
❌ Numbers > 9999 inside ring (overflow visual — use abbreviated `9.9k+`)
❌ Center font `text-base` (insufficient prominence — use `text-3xl` minimum)
❌ Center font `font-sans` (use `font-display italic` Lingona signature)
❌ Streak break with mascot `sad` mood (use `default` per `03-components/mascot.md`)
❌ Streak save with confetti emoji spam (over-celebrate)
❌ Status logic hardcoded per component (use `getStreakStatus` helper)
❌ Streak count >0 with status `broken` (logic conflict)

## Codebase reference

`frontend/components/Streak/StreakRing.tsx` (Wave 6 build target — likely doesn't exist as canonical component yet, may be inline in dashboard).

## Audit checklist

```
1. Stroke color from canon (teal/warning/gray-400)? ✓
2. Stroke linecap round? ✓
3. Track color gray-200? ✓
4. Center font Playfair Italic + tabular-nums? ✓
5. Progress fills with smooth transition (0.6s ease-out)? ✓
6. Status logic uses helper (not hardcoded)? ✓
7. role="img" + aria-label? ✓
8. NO gradient stroke, NO glow, NO drop-shadow? ✓
9. NO spin animation? ✓
10. Status `broken` mascot mood `default` (not `sad`)? ✓
```

## See also

- `03-components/mascot.md` — Lintopus mood at streak break/save
- `01-foundations/palette.md` — teal/warning/gray-200 canon
- `01-foundations/typography.md` — Playfair Italic for center number
- `00-manifesto/personality.md` — streak break voice (factual, not drama)
- `07-moments/streak-save.md` — streak save moment design (pending Phase B)
