# Result card — sub-skill score card

Result card = small card showing 1 sub-skill score in Result page (Reading/Writing/Speaking/Listening). Per `02-layout/result-page-anatomy.md`, 3-5 cards displayed in grid below band number.

## Canonical result card

```tsx
<div
  className="rounded-none border border-gray-200 p-6"
  style={{
    background: 'var(--color-bg-secondary)',
    borderLeft: `4px solid ${getColorByScore(skill.score)}`,
  }}
>
  <div className="text-sm text-gray-600 font-medium">{skill.label}</div>
  
  <div className="mt-2 flex items-baseline gap-2">
    <span className="text-3xl font-display italic text-navy">
      {skill.score}
    </span>
    {skill.maxScore && (
      <span className="text-sm text-gray-500">/ {skill.maxScore}</span>
    )}
  </div>
  
  {skill.delta != null && (
    <div className="mt-1 flex items-center gap-1 text-xs">
      <DeltaIcon direction={skill.delta > 0 ? 'up' : 'down'} />
      <span className={skill.delta > 0 ? 'text-teal' : 'text-error'}>
        {skill.delta > 0 ? '+' : ''}{skill.delta} so với lần trước
      </span>
    </div>
  )}
  
  {skill.tip && (
    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
      {skill.tip}
    </p>
  )}
</div>
```

| Aspect | Value |
|--------|-------|
| Background | `var(--color-bg-secondary)` (slight tint, NOT primary card bg) |
| Border main | `border-gray-200` 1px |
| Border-left | 4px dynamic per score (teal/amber/error) |
| Radius | `rounded-none` (mandatory — partial border + rounded = visual error per radius rule) |
| Padding | `p-6` (24px) |
| Score font | `text-3xl font-display italic` Playfair |
| Label font | `text-sm font-medium text-gray-600` DM Sans |
| Delta font | `text-xs` DM Sans |

## Score color mapping

```ts
// frontend/lib/resultColor.ts
export function getColorByScore(score: number): string {
  if (score >= 7.0) return 'var(--color-teal)';        // achievement, high band
  if (score >= 5.5) return 'var(--color-teal-light)';  // mid band, encouraging
  if (score >= 4.0) return 'var(--color-warning)';     // amber, needs work
  return 'var(--color-error)';                          // low, focus area
}
```

Score color encodes meaning per `01-foundations/palette.md`. KHÔNG cycle rainbow per skill (color = meaning, not categorical).

## Delta indicator

| Delta | Visual |
|-------|--------|
| `delta > 0` | `↑` arrow + `+0.5 so với lần trước` + teal text |
| `delta < 0` | `↓` arrow + `-0.5 so với lần trước` + error text |
| `delta == 0` | `=` neutral + `Giữ vững so với lần trước` + gray text |
| `delta == null` (first time) | (omit delta row entirely) |

Voice rule:
- ✅ "so với lần trước" (peer voice)
- ❌ "compared to last time" (English)
- ❌ "vs previous attempt" (translate)

## Sub-skill card patterns per skill

### Reading result — 5 cards typical

```tsx
// Per Reading result anatomy:
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
  <ResultCard label="Multiple Choice" score={8.0} maxScore={10} delta={+0.5} />
  <ResultCard label="True/False/NG" score={7.5} maxScore={10} delta={-0.5} />
  <ResultCard label="Matching" score={6.5} maxScore={10} delta={null} />
  <ResultCard label="Heading" score={7.0} maxScore={10} delta={+1.0} />
  <ResultCard label="Summary" score={8.0} maxScore={10} delta={0} />
</div>
```

### Writing result — 4 cards (4 IELTS criteria)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <ResultCard label="Task Achievement" score={6.5} delta={+0.5} />
  <ResultCard label="Coherence & Cohesion" score={7.0} delta={+1.0} />
  <ResultCard label="Lexical Resource" score={6.5} delta={null} />
  <ResultCard label="Grammar" score={6.0} delta={-0.5} />
</div>
```

### Speaking result — 4 cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <ResultCard label="Fluency" score={6.5} delta={+0.5} />
  <ResultCard label="Vocabulary" score={7.0} delta={+1.0} />
  <ResultCard label="Grammar" score={6.0} delta={null} />
  <ResultCard label="Pronunciation" score={6.5} delta={-0.5} />
</div>
```

### Listening result — 4 cards (section breakdown)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <ResultCard label="Section 1" score={9} maxScore={10} delta={+1} />
  <ResultCard label="Section 2" score={7} maxScore={10} delta={0} />
  <ResultCard label="Section 3" score={6} maxScore={10} delta={-1} />
  <ResultCard label="Section 4" score={5} maxScore={10} delta={+0.5} />
</div>
```

### Battle result — 2 cards (your vs opponent)

```tsx
<div className="grid grid-cols-2 gap-4">
  <ResultCard label="Bạn" score={youScore} maxScore={10} highlight={youWon} />
  <ResultCard label="Đối thủ" score={opScore} maxScore={10} highlight={!youWon} />
</div>
```

Battle variant: highlighted card (winner) = `border-l-teal` + `bg-teal-50` tint. Loser = `border-l-gray-300`.

## Tip text (peer voice)

Optional `skill.tip` for actionable feedback. Voice rules per `00-manifesto/personality.md`:

```
✅ "Cohesion vững — nhưng vocab cần đa dạng hơn ở đoạn 2"
✅ "Đang gần Band 7 phần này. Luyện thêm linking words"
✅ "Section 3 khó hơn. Lần sau tập trung note-taking"

❌ "Great progress! Keep it up!" (English fake-cheer)
❌ "Bạn đã làm rất tốt!" (corporate VN)
❌ "Cần cố gắng hơn" (vague, not actionable)
```

Tip = **specific** + **actionable** + **peer voice mình/bạn**. Max 2 lines.

## Stagger reveal animation

Per `06-motion/result-reveal.md` (pending):

```tsx
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,  // stagger 80ms per card
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {skills.map((skill, i) => (
    <motion.div
      key={skill.label}
      custom={i}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <ResultCard {...skill} />
    </motion.div>
  ))}
</div>
```

Stagger reveal: each card 80ms delay after previous. Total reveal time for 4 cards = ~640ms. Subtle, KHÔNG dramatic.

KHÔNG bouncy spring (anti per `06-motion/motion-philosophy.md` pending). Smooth ease-out only.

## Mode-specific result card

### Brand mode (default Practice result)

Standard `result-card` per spec above.

### Brand-soft mode (Practice quick)

Same as brand. Practice = doing-mode, structure unchanged.

### IELTS-authentic mode (Full Test result)

**Result page in authentic mode** = transition to brand mode (per `02-layout/result-page-anatomy.md` — exam ends, brand mode active).

Result card same canonical pattern. Authentic mode applies during exam in-progress only.

## Empty state — no result yet

```tsx
<div className="rounded-lg border border-gray-200 bg-cream p-8 text-center">
  <Mascot size={80} mood="default" />
  <p className="mt-4 text-sm text-gray-600">
    Chưa có kết quả nào. Luyện 1 bài để xem feedback.
  </p>
  <button className="mt-4 primary-button">Luyện ngay</button>
</div>
```

Show Lintopus + peer voice + clear next action.

## Score precision rules

| Skill | Score precision | Display |
|-------|----------------|---------|
| Reading correct/total | Integer | `18/20` |
| Reading band | Half-band | `7.0`, `7.5`, `8.0` |
| Writing band | Half-band | `6.5`, `7.0` |
| Speaking band | Half-band | `6.5`, `7.0` |
| Listening correct/total | Integer | `36/40` |
| Listening band | Half-band | `7.5`, `8.0` |
| Battle score | Integer | `7/10` |

KHÔNG display `7.25` band (NOT IELTS valid). Round to half-band.

```ts
// frontend/lib/bandRound.ts
export function roundBandIELTS(raw: number): number {
  // IELTS rounds to nearest 0.5
  return Math.round(raw * 2) / 2;
}
```

Display via `Intl.NumberFormat` for tabular consistency:

```tsx
const formatter = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

<span className="text-3xl font-display italic">
  {formatter.format(skill.score)}
</span>
```

## Accessibility

```
1. Card semantic role (article OR div, depends on context)?
2. Score readable by screen reader (no font-display swallowing)?
3. Color NOT only signal (delta has + / - text, not just color)?
4. Tab order logical (sub-skill cards in reading order)?
```

Color blindness: delta direction signaled by `↑` / `↓` icon AND text "+0.5" / "-0.5", NOT just color teal/error.

## Anti-patterns

❌ Result card with rounded-lg + border-l-4 (visual error)
❌ Card padding `p-3` (too tight, score number cramped)
❌ Score using `text-2xl` (insufficient prominence — use `text-3xl` minimum)
❌ Score using `font-sans` (use `font-display italic` for signature)
❌ Delta indicator color-only (color blindness fail)
❌ "Great work!" / "Try harder" generic English/translate copy
❌ Cards animating with bounce / dramatic entrance
❌ More than 5 sub-skill cards per result (cluttered, see `02-layout/empty-space-philosophy.md`)
❌ Card width less than 160px (score number wraps awkward)
❌ Score precision 2 decimals (NOT IELTS standard)

## Audit checklist

```
1. Card uses rounded-none + border-l-4 dynamic color? ✓
2. Score is text-3xl font-display italic? ✓
3. Delta has icon + text (not color-only)? ✓
4. Tip text peer voice + specific + actionable? ✓
5. Card count per result page ≤ 5? ✓
6. Stagger reveal animation 80ms? ✓
7. Score rounded to half-band IELTS? ✓
8. Color encodes meaning (not random)? ✓
9. Mobile collapse to 1-column? ✓
10. Empty state with Lintopus + CTA? ✓
```

## See also

- `02-layout/result-page-anatomy.md` — where result cards appear in result page
- `01-foundations/palette.md` — score color mapping
- `01-foundations/typography.md` — Playfair Italic for score
- `03-components/card-language.md` — card-language base + border-left rule
- `06-motion/result-reveal.md` — stagger animation (pending)
- `00-manifesto/personality.md` — tip voice rules
