# Result page anatomy — canonical signature layout

Result page = **Lingona's most identity-critical surface**. Đây là moment user thấy outcome (Band 7.0 / VICTORY / DEFEAT / "you got 18/20"). Soul §1 lock từ codebase: *"Stand next to every result, win or loss"*.

Pre-Wave-6 status:
- ✅ `BattleResult.tsx` — implements Soul §1 correctly (Lintopus mood-aware)
- ❌ `ReadingResult.tsx` — missing Lintopus (Wave 6 fix)
- ❌ `WritingResult.tsx` — missing Lintopus (Wave 6 fix)
- ❌ `WritingFullTestResult.tsx` — verify, likely missing
- ❌ Speaking result — verify file location, likely missing

Wave 6 mandate: **align all result pages to canonical anatomy below**.

## Canonical layout (Pattern C asymmetric)

```
┌─────────────────────────────────────────────────────────────┐
│   ←160px gutter→                                             │
│                                                              │
│   ┌────────────────────────┐    ┌──────────────────────┐    │
│   │                        │    │                      │    │
│   │   [Score / Band L1]    │    │    [Lintopus]        │    │
│   │   (text-6xl Playfair)  │    │    visual mascot     │    │
│   │                        │    │    100-120px         │    │
│   │   [Skill summary L2]   │    │    mood-aware        │    │
│   │   (text-xl DM Sans)    │    │                      │    │
│   │                        │    │    [bubble text]     │    │
│   │                        │    │    (1 line max)      │    │
│   │                        │    │                      │    │
│   └────────────────────────┘    └──────────────────────┘    │
│      col-span-7 (45%)              col-span-5 (38%)         │
│                                                              │
│   ↓ section break 96px                                       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  [Feedback cards L3]                                 │  │
│   │  ┌───────┐ ┌───────┐ ┌───────┐                       │  │
│   │  │ Sub   │ │ Sub   │ │ Sub   │  ← per-skill breakdown│  │
│   │  │ skill │ │ skill │ │ skill │                       │  │
│   │  └───────┘ └───────┘ └───────┘                       │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   ↓ section break 96px                                       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  [Detailed feedback L3 — text + recommendation]      │  │
│   │  (paragraph + bullet list)                           │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   ↓ section break 96px                                       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  [Action L2 — primary CTA + secondary "Xem lịch sử"] │  │
│   │  [Luyện tiếp]    Xem lịch sử →                       │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Anatomy components

### Component 1: Score / Band display (L1, top-left)

The band number / score / VICTORY / DEFEAT — **biggest visual element on page**.

| Skill | Display |
|-------|---------|
| Reading | Band number "7.0" + correct/total "18/20" |
| Writing | Band number "6.5" |
| Speaking | Band number "6.5" |
| Listening | Band number "7.0" + correct/total |
| Battle | "VICTORY" / "DEFEAT" / "DRAW" English ALL CAPS + score split |

```jsx
<div className="text-6xl font-display italic text-navy">
  7.0
</div>
<div className="text-lg text-gray-600 mt-2">
  {correctAnswers}/{totalQuestions} câu đúng
</div>
```

For Battle:

```jsx
<div className="text-6xl font-display font-bold text-navy uppercase tracking-tight">
  VICTORY
</div>
<div className="text-lg text-gray-600 mt-2">
  {yourScore} : {opponentScore}
</div>
```

### Component 2: Skill summary (L2, below band)

1 line context. KHÔNG over-narrate.

```jsx
<h2 className="text-xl text-navy-light mt-6">
  Reading Practice — Cambridge 14, Test 2
</h2>
```

Variants:
- Reading: `"Reading Practice — {book}, {test_number}"`
- Writing: `"Writing Task {1|2} — {topic_short}"`
- Speaking: `"Speaking Part {1|2|3}"`
- Battle: `"Đối thủ: {opponent_username}"`

### Component 3: Lintopus visual + bubble text (top-right)

**Soul §1 mandatory**. Lintopus stands next to result, mood-aware.

| Outcome | Mascot mood | Bubble text (optional, 1 line max) |
|---------|-------------|------------------------------------|
| Band 7.0+ / VICTORY | `happy` | `"Vững rồi đấy"` (optional, KHÔNG bắt buộc) |
| Band 6.0–6.5 / close win | `default` (neutral) | `"Đang gần Band 7"` |
| Band 5.0–5.5 / close loss | `thinking` | (no bubble — Lintopus silent) |
| Band <5.0 / DEFEAT | `default` or `sad` | `"Lintopus đợi bạn ở vòng tiếp theo"` |
| DRAW | `default` | (no bubble) |

```jsx
<div className="flex flex-col items-center gap-3">
  <Mascot
    size={120}
    mood={getMoodFromBand(band)}
    alt="Lintopus"
  />
  {bubbleText && (
    <div className="text-sm text-gray-700 max-w-[200px] text-center font-medium">
      {bubbleText}
    </div>
  )}
</div>
```

Bubble text rendering options:
- (a) Plain text below mascot (simplest, OK for v1)
- (b) Speech bubble SVG container next to mascot (Wave 6 polish phase)

Default v1 = (a). Speech bubble (b) optional polish.

### Component 4: Feedback cards (L3, sub-skill breakdown)

3-4 cards per result, sub-skill scores. Stagger reveal animation (per `06-motion/result-reveal.md` pending).

```jsx
<div className="grid grid-cols-3 gap-6">
  {subSkills.map(skill => (
    <FeedbackCard
      key={skill.name}
      title={skill.label}      // "Coherence", "Vocabulary", "Grammar"
      score={skill.score}       // 7.0
      delta={skill.delta}       // +0.5 from last
      borderColor={getColorByScore(skill.score)}  // teal / amber / error
    />
  ))}
</div>
```

Card structure:
```jsx
<div
  className="rounded-lg border p-6"
  style={{
    background: 'var(--color-bg-secondary)',
    borderLeft: `4px solid ${color}`,
  }}
>
  <div className="text-sm text-gray-600">{title}</div>
  <div className="text-3xl font-display italic text-navy mt-2">
    {score}
  </div>
  {delta && (
    <div className="text-xs text-teal mt-1">
      {delta > 0 ? '+' : ''}{delta} so với lần trước
    </div>
  )}
</div>
```

KHÔNG more than 5 sub-skill cards (clutter). Reading/Writing/Speaking thường có 3-4, Battle có 2 (your score vs opponent score).

### Component 5: Detailed feedback (L3, prose + recommendation)

Text-heavy section — examiner-style critique + actionable recommendation.

```jsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-semibold text-navy mb-2">
      Phản hồi chi tiết
    </h3>
    <p className="text-base text-gray-700 leading-relaxed">
      {detailed_feedback_text_vietnamese}
    </p>
  </div>
  <div>
    <h3 className="text-lg font-semibold text-navy mb-2">
      Luyện thêm
    </h3>
    <ul className="space-y-2 text-base text-gray-700">
      {recommendations.map(r => (
        <li key={r.id} className="flex items-start gap-2">
          <span className="text-teal mt-1.5">•</span>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
```

Recommendations = specific (skill name + action), KHÔNG vague ("cải thiện thêm"). Per voice rules.

### Component 6: Action row (L2, primary CTA + secondary)

End of page. Primary action + history link.

```jsx
<div className="flex items-center gap-6">
  <button className="px-8 py-3 rounded-md bg-teal text-cream font-semibold">
    Luyện tiếp
  </button>
  <a href="/reading/history" className="text-base text-teal-dark underline-offset-4 hover:underline">
    Xem lịch sử →
  </a>
</div>
```

Variants:
- Reading/Writing/Speaking: `[Luyện tiếp]` + `Xem lịch sử →`
- Battle: `[Đấu nữa]` + `Xem lịch sử Battle →`
- Full Test: `[Xem chi tiết từng skill]` + `Lưu kết quả`

## Anti-patterns result page

❌ Lintopus missing (Soul §1 violation)
❌ Band number text-base (no prominence — should be text-6xl)
❌ Wall of text without sub-skill cards (no L3 detail breakdown)
❌ "Try again" pushy English CTA — use "Luyện tiếp"
❌ Confetti emoji 🎉 spam (over-celebrate)
❌ Generic "Great job!" / "Keep going!" — use specific peer voice
❌ Modal overlay result instead of full page (Lingona = full page result, not transient modal)
❌ Auto-redirect after 3 seconds (user doesn't get to absorb result)
❌ Symmetric center-stack layout (use Pattern C asymmetric)

## Mode-specific result variants

### Brand mode result (default — Practice)

Full canonical anatomy as above. Lintopus mood-aware. Feedback cards prominent.

### Brand-soft mode result (Practice)

Same as brand. Practice result = same structure.

### IELTS-authentic mode result (Full Test, Battle Ranked)

**Reduced layout** — Cambridge faithful, less drama:

- Score display Georgia bold (not Playfair Italic)
- NO Lintopus presence DURING exam, BUT **Lintopus appears in result page** (mode boundary: result is OUT of authentic mode, returns to brand mode)
- Sub-skill cards minimal
- "View Full Test breakdown" CTA → goes to detailed analysis page (separate)

Full Test result transition:
1. User submits Full Test → loading spinner
2. Result page renders in **brand mode** (NOT authentic mode) — Lintopus + canonical anatomy
3. Detail breakdown page (per skill) keeps brand mode

Authentic mode = TASK only. Result = celebration moment, brand mode active.

## Mobile collapse

```
Mobile 390px:
   [Band 7.0]              ← center (no asymmetric on mobile)
   [Skill summary]
   [Lintopus visual]       ← below band, not side
   [bubble text]
   
   ↓
   
   [Feedback card 1]       ← full width stack
   [Feedback card 2]
   [Feedback card 3]
   
   ↓
   
   [Detailed feedback]
   
   ↓
   
   [Luyện tiếp button]
   [Xem lịch sử link]
```

```jsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-7">
    <BandDisplay />
    <SkillSummary />
  </div>
  <div className="lg:col-span-5 flex justify-center lg:justify-end">
    <LintopusBlock />
  </div>
</div>
```

## Codebase reference

Canonical impl: `frontend/components/Battle/BattleResult.tsx` line ~48–49 verified Soul §1.

Wave 6 task: align `ReadingResult.tsx`, `WritingResult.tsx`, `WritingFullTestResult.tsx`, Speaking result page → canonical anatomy. Atomic commits per file.

## Audit checklist result page

```
1. Lintopus present? ✓ Soul §1 mandatory
2. Lintopus mood-aware (happy / default / thinking / sad)? ✓
3. Score / band L1 prominent (text-5xl/6xl Playfair Italic)? ✓
4. Skill summary L2 1-line context? ✓
5. Sub-skill feedback cards L3 (3-5 cards, not more)? ✓
6. Cards stagger reveal animation? ✓ (per motion file)
7. Detailed feedback specific to skill (not vague)? ✓
8. Recommendations actionable + Vietnamese-first peer voice? ✓
9. Primary CTA "Luyện tiếp" Vietnamese (not "Try Again" EN)? ✓
10. Pattern C asymmetric on desktop, single-column collapse mobile? ✓
11. WS:content ratio ≈ 45:55? ✓
12. Mode-aware (brand for Practice result, brand for Full Test result, NOT authentic)? ✓
```

## See also

- `03-components/result-card.md` — sub-skill card component spec (pending batch 4)
- `03-components/mascot.md` — Lintopus mood logic (pending batch 4)
- `06-motion/result-reveal.md` — stagger reveal animation (pending batch 7)
- `05-voice/microcopy-library.md` — feedback copy templates (pending batch 6)
- `04-modes/mode-switch-rules.md` — Full Test → result mode transition (pending batch 5)
- `02-layout/desktop-canvas.md` — Pattern C asymmetric
- `02-layout/hierarchy-stair.md` — 3-level hierarchy
- `02-layout/empty-space-philosophy.md` — WS:content ratio
- `00-manifesto/personality.md` — voice rules praise/critique
- `00-manifesto/recognizable-from-100ft.md` — 5-signal identity test
