# Band progress — canonical IELTS journey visualization

BandProgress = signature progress bar showing user's IELTS band journey from current → target. Used on **Profile main**, **Home dashboard**, **Onboarding completion**, **Result page footer** (optional context).

Per audit Image 1 (Profile): current bug is reverse rendering (Band 7.0 displayed as current with Target 5.5 — impossible logic). Wave 6 fix this + redesign.

## Canonical band progress

```tsx
interface BandProgressProps {
  currentBand: number;       // e.g., 5.5
  targetBand: number;        // e.g., 7.0 (must be > currentBand)
  examDate?: Date | null;    // optional — show countdown
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

<BandProgress
  currentBand={5.5}
  targetBand={7.0}
  examDate={new Date('2026-09-07')}
  size="lg"
  showLabels={true}
/>
```

## Visual structure

```tsx
function BandProgress({ currentBand, targetBand, examDate, size = 'md', showLabels = true }: BandProgressProps) {
  // Validation: target MUST be > current
  if (targetBand <= currentBand) {
    console.warn('BandProgress: targetBand must be > currentBand');
  }
  
  const range = targetBand - currentBand;
  const progressPercent = currentBand >= targetBand ? 100 : 0;
  const remainingBands = (targetBand - currentBand).toFixed(1);
  
  return (
    <div className="space-y-3">
      {showLabels && (
        <div className="text-sm text-gray-600">
          Band journey
        </div>
      )}
      
      {/* Progress bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-3xl font-display italic text-navy">
              {currentBand.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 ml-2">hiện tại</span>
          </div>
          
          <div className="text-right">
            <span className="text-3xl font-display italic text-teal">
              {targetBand.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 ml-2">mục tiêu</span>
          </div>
        </div>
        
        {/* Progress track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Range label */}
        <div className="mt-2 text-xs text-gray-500">
          Còn {remainingBands} band để đạt mục tiêu
        </div>
      </div>
      
      {/* Exam countdown */}
      {examDate && <ExamCountdown date={examDate} />}
    </div>
  );
}
```

## Critical validation

**Lock cứng**: `targetBand > currentBand` ALWAYS. If not, do NOT render → log error + show fallback.

```tsx
// Validation guard
if (targetBand <= currentBand) {
  return (
    <div className="bg-warning-50 border border-warning rounded-md p-4 text-sm text-warning-700">
      ⚠ Mục tiêu band ({targetBand}) phải cao hơn band hiện tại ({currentBand}). 
      Vào Settings để điều chỉnh.
    </div>
  );
}
```

Per audit bug report: Profile (Image 1) shows current=7.0, target=5.5 → invalid. Wave 6 fix this validation + correct DB data.

## Display labels

| Label | VN copy |
|-------|---------|
| Current band | "hiện tại" |
| Target band | "mục tiêu" |
| Progress remaining | "Còn {N} band để đạt mục tiêu" |
| Exam countdown | "Còn {N} ngày đến ngày thi" |
| Goal reached | "Đạt mục tiêu rồi 🐙" |

KHÔNG dùng English ("Current", "Target", "Goal") — Vietnamese-first.

## Goal reached state

When `currentBand >= targetBand`:

```tsx
<div className="space-y-3">
  <div className="flex items-center gap-2">
    <Mascot size={24} mood="happy" />
    <span className="text-sm font-medium text-teal">
      Đạt mục tiêu rồi 🐙
    </span>
  </div>
  
  <div className="flex items-center justify-between">
    <span className="text-3xl font-display italic text-teal">
      {currentBand.toFixed(1)}
    </span>
    <span className="text-sm text-gray-600">
      Mục tiêu: {targetBand.toFixed(1)} ✓
    </span>
  </div>
  
  <div className="h-2 bg-teal rounded-full" />
  
  <button className="text-sm text-teal-dark hover:underline">
    Đặt mục tiêu mới →
  </button>
</div>
```

CTA "Đặt mục tiêu mới" → settings#learning to update target band.

## Size variants

### Small (sm) — Profile sidebar / inline

```tsx
<div className="space-y-1">
  <div className="text-xs text-gray-500">Band journey</div>
  <div className="flex items-center justify-between">
    <span className="text-base font-medium text-navy">{currentBand.toFixed(1)}</span>
    <span className="text-base font-medium text-teal">{targetBand.toFixed(1)}</span>
  </div>
  <div className="h-1 bg-gray-200 rounded-full">
    <div className="h-full bg-teal rounded-full" style={{ width: `${progressPercent}%` }} />
  </div>
</div>
```

Compact 1-line band display. Use in sidebar widgets, narrow card layouts.

### Medium (md) — default Home dashboard widget

Standard pattern from canonical above. ~120px height total.

### Large (lg) — Profile main + Onboarding completion

Includes exam countdown + larger Playfair numbers. ~200px height total.

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6 space-y-4">
  <h3 className="text-lg font-display italic text-navy">Band journey</h3>
  
  <BandProgress
    currentBand={currentBand}
    targetBand={targetBand}
    examDate={examDate}
    size="lg"
    showLabels={false}  /* heading already shown */
  />
  
  <button className="text-sm text-teal-dark hover:underline">
    Cập nhật mục tiêu →
  </button>
</div>
```

## Exam countdown component

```tsx
function ExamCountdown({ date }: { date: Date }) {
  const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil <= 0) return null;
  
  const urgency = daysUntil <= 7 ? 'urgent' : daysUntil <= 30 ? 'soon' : 'plenty';
  const colorClass = {
    urgent: 'text-error',
    soon: 'text-warning',
    plenty: 'text-gray-600',
  }[urgency];
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <Calendar className="w-3.5 h-3.5 text-gray-500" />
      <span className={colorClass}>
        Còn {daysUntil} ngày đến ngày thi
      </span>
    </div>
  );
}
```

| Days until exam | Color |
|----------------|-------|
| ≤ 7 days | error (urgent) |
| 8–30 days | warning (soon) |
| > 30 days | gray-600 (plenty time) |

KHÔNG drama urgency: "URGENT! 7 days left!". Factual + tiếng Việt: "Còn 7 ngày đến ngày thi".

## Skill breakdown variant (4 IELTS skills)

For Result page footer or Profile detail — show progress per skill:

```tsx
<div className="space-y-3">
  <h4 className="text-sm font-medium text-navy">Tiến độ từng skill</h4>
  
  {skills.map(skill => (
    <div key={skill.name} className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-navy font-medium">{skill.name}</span>
        <span className="font-display italic text-navy">
          {skill.currentBand.toFixed(1)} → {skill.targetBand.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal transition-all duration-500"
          style={{ width: `${(skill.currentBand / skill.targetBand) * 100}%` }}
        />
      </div>
    </div>
  ))}
</div>
```

4-skill view shows Speaking/Writing/Reading/Listening individually. Each has own progress bar.

## Animation on update

When user submits a result and band updates:

```tsx
// Frame 1: show old current band
// Frame 2: animate progress bar fill from old % → new %
// Frame 3: number tick animation old → new

import { animate } from 'framer-motion';

useEffect(() => {
  const controls = animate(prevBand, newBand, {
    duration: 1.2,
    ease: 'easeOut',
    onUpdate: (latest) => {
      setDisplayBand(latest);
    },
  });
  return controls.stop;
}, [newBand]);
```

Smooth 1.2s tick animation old band → new band. Progress bar fills simultaneously.

KHÔNG snap update (jarring). KHÔNG bouncy spring (anti per motion philosophy).

## Color encoding

| State | Progress color |
|-------|---------------|
| In-progress (default) | `bg-teal` |
| Goal reached | `bg-teal` (full) |
| Below 50% progress | `bg-teal-light` (encourage) |
| Above 80% progress | `bg-teal` (close) |
| Goal mismatch (target ≤ current) | `bg-warning` (validation error display) |

KHÔNG cycle red/yellow/green progress (gamified anti). Single teal hierarchy.

## Empty state — no result yet

When user just registered, no skills tested:

```tsx
<div className="bg-cream border border-gray-200 rounded-lg p-6 text-center">
  <Mascot size={80} mood="default" />
  
  <h3 className="mt-4 text-base font-medium text-navy">
    Chưa có dữ liệu band
  </h3>
  
  <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
    Luyện 1 bài Speaking hoặc Writing để có band score đầu tiên.
  </p>
  
  <button className="mt-4 primary-button-sm">
    Luyện ngay
  </button>
</div>
```

## Anti-patterns

❌ Target < current (impossible IELTS journey logic — validation guard)
❌ Negative remaining bands (`+−1.5 bands` like audit bug Image 1)
❌ Progress bar gradient `from-teal to-purple` (palette canon only)
❌ Numbers using `font-sans` (use `font-display italic` for signature)
❌ Animation spring bounce (smooth ease-out only)
❌ "Goal reached" without celebration mascot (Soul §1 moment)
❌ Exam countdown urgency drama ("ONLY 7 DAYS LEFT!" — factual neutral instead)
❌ English labels ("Current", "Target") — Vietnamese-first
❌ Progress bar height > 4px (subtle, not dominant)
❌ Multiple band progress bars stacked (use single canonical, OR skill breakdown variant)
❌ Display band 2-decimal (`7.25`) — round to half-band IELTS
❌ Hardcoded `currentBand={7.0} targetBand={5.5}` reverse (audit bug)

## Codebase reference

- `frontend/components/Profile/BandProgressCard.tsx` (Wave 6 redesign target)
- `frontend/components/Home/BandWidget.tsx` (Wave 6 redesign target)
- `frontend/lib/bandRound.ts` — IELTS half-band rounding helper

## Audit checklist

```
1. targetBand > currentBand validation? ✓
2. Numbers Playfair Italic? ✓
3. Progress bar bg-teal solid (not gradient)? ✓
4. Vietnamese labels (hiện tại / mục tiêu)? ✓
5. Exam countdown factual (not drama)? ✓
6. Goal reached has Lintopus + CTA "Đặt mục tiêu mới"? ✓
7. Empty state with mascot + CTA? ✓
8. Animation smooth ease-out (not spring)? ✓
9. Half-band rounding applied? ✓
10. NO gradient, NO bouncy, NO drama? ✓
```

## See also

- `03-components/result-card.md` — band rounding helper
- `03-components/mascot.md` — Lintopus mood at goal-reached
- `01-foundations/palette.md` — teal canon
- `01-foundations/typography.md` — Playfair Italic for band numbers
- `02-layout/result-page-anatomy.md` — band progress as result footer (optional)
- `00-manifesto/personality.md` — voice rules countdown urgency
