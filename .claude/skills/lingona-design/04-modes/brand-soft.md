# Brand-soft mode — Practice mode (bridge)

Brand-soft = **bridge mode** between full brand (gamified) and IELTS-authentic (Cambridge faithful). Used for Practice mode in-task pages — user is doing exam-like task but Lingona presence persists subtly.

Active ~10% of app surface. Specifically: **Practice in-task pages only**.

## When brand-soft mode is active

| Page | Why brand-soft |
|------|----------------|
| Speaking Practice in-task | Real exam structure (Part 1/2/3) but Lingona companion stays subtle |
| Writing Practice Task 1 in-task | IELTS-shaped task but brand voice timer/chrome |
| Writing Practice Task 2 in-task | Same |
| Reading Practice in-task | Cambridge-style passage but brand chrome (timer, hints) |
| Listening Practice in-task | Audio + Cambridge questions but brand chrome |

**NOT brand-soft**:
- Practice **entry** (mode-select) → **brand mode**
- Practice **result** → **brand mode** (moment, Lintopus full presence)
- Full Test in-task → **ielts-authentic mode** (Cambridge exact)
- Battle Ranked in-task → **ielts-authentic mode**

Brand-soft = transition state between brand and authentic. KHÔNG persist across page navigation outside Practice in-task.

## Visual signals (vs brand)

### What stays from brand

```
Page bg:        cream #F8F7F4 (same)
Primary text:   navy #1B2B4B (same)
CTA:            teal solid (same — submit, hint, finish)
DM Sans body:   yes (same)
Custom UI:      yes (toggle, modal, button)
Vietnamese voice: yes (microcopy stays VN)
```

### What softens from brand

```
Display font:   Playfair Italic LESS prominent (only for "moment" elements)
Mascot:         ABSENT during in-task (focus mode)
Hero gestures:  reduced (no big celebrations mid-task)
Headlines:      smaller (text-2xl/3xl instead of 4xl/5xl)
Decoration:     minimal (focus on task content)
WS ratio:       25:75 (content dominant — see empty-space-philosophy.md)
```

### What adds toward authentic

```
Passage text:   Georgia OR DM Sans (configurable per skill)
Answer fields:  rounded-md (same brand) — KHÔNG go full sharp yet
Timer:          prominent display
Section navigation: clean linear (no decoration)
Hints:          minimal, optional toggle
```

## Brand-soft component variations

| Component | Brand-soft adjustment |
|-----------|----------------------|
| Header chrome | Sticky top, compact 48px height |
| Timer display | `text-2xl font-display italic tabular-nums text-navy` (Playfair OK for timer signature) |
| Submit button | Same teal solid (brand) — KHÔNG soften CTA |
| Question prompt | DM Sans `text-base` — readable density |
| Passage text | Georgia or DM Sans (skill-specific — see below) |
| Answer input | Custom component (NOT native), rounded-md |
| Section indicator | Compact pill `1/3 → 2/3 → 3/3` |
| Hint button | Subtle pill `bg-teal-50 text-teal text-sm` |
| Pause button | Outline secondary `border border-navy text-navy` |
| Mascot | Absent — return at result page |

## Per-skill brand-soft patterns

### Speaking Practice in-task

```tsx
<main data-mode="brand-soft" className="bg-cream min-h-screen">
  {/* Compact header */}
  <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 h-12 px-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium text-navy">
        Speaking Practice — Part 2
      </span>
    </div>
    
    <div className="text-2xl font-display italic text-navy tabular-nums">
      {formatTime(timeRemaining)}
    </div>
  </header>

  {/* Task body */}
  <section className="max-w-2xl mx-auto px-6 py-8">
    <div className="rounded-lg border border-gray-200 bg-cream p-6 mb-6">
      <span className="text-xs font-semibold text-teal uppercase tracking-wide">
        Task Card
      </span>
      <h2 className="mt-2 text-xl font-display italic text-navy">
        Describe a place you have visited that you found particularly beautiful
      </h2>
      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        <li>• Where it is</li>
        <li>• When you visited</li>
        <li>• What you saw or did there</li>
        <li>• Why you found it beautiful</li>
      </ul>
    </div>
    
    {/* Notes area */}
    <textarea
      className="
        w-full h-32
        rounded-md border border-gray-300 bg-cream
        p-4 text-base text-navy font-sans
        focus:border-teal focus:ring-1 focus:ring-teal
        resize-none
      "
      placeholder="Ghi chú nhanh trước khi nói (60s)..."
    />
    
    <button className="mt-6 primary-button w-full">
      Bắt đầu nói
    </button>
  </section>
</main>
```

Note:
- Header compact, KHÔNG hero treatment
- Task card looks like brand card but content English (IELTS authentic prompt)
- Notes area placeholder Vietnamese (brand voice)
- Submit CTA brand teal
- KHÔNG Lintopus during recording

### Writing Practice in-task

```tsx
<main data-mode="brand-soft">
  <header className="sticky top-0 ...">
    <span>Writing Practice — Task 2</span>
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {wordCount} / 250 từ
      </span>
      <span className="text-2xl font-display italic tabular-nums">
        {formatTime(remaining)}
      </span>
    </div>
  </header>
  
  {/* Split layout */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1280px] mx-auto px-6 py-8">
    {/* Prompt left */}
    <div className="rounded-lg border border-gray-200 bg-cream p-6">
      <h2 className="text-lg font-display italic text-navy mb-4">
        Task Prompt
      </h2>
      <p className="text-base text-gray-700 leading-relaxed">
        {essayPrompt}
      </p>
      
      {hasChart && <Chart data={chartData} palette="brand" />}
    </div>
    
    {/* Editor right */}
    <textarea
      className="
        h-[600px] rounded-lg border border-gray-300 bg-cream
        p-6 text-base text-navy font-sans
        focus:border-teal focus:ring-1 focus:ring-teal
        resize-none
      "
      placeholder="Bắt đầu viết câu trả lời của bạn..."
    />
  </div>
  
  <footer className="border-t border-gray-200 py-4 px-6 flex items-center justify-end gap-3">
    <button className="secondary-button">Lưu nháp</button>
    <button className="primary-button">Nộp bài</button>
  </footer>
</main>
```

Note:
- 2-column split (Pattern 6/6 from `02-layout/grid-vs-flow.md`)
- Word count + timer in header
- Chart palette = brand (Navy/Teal/Cream variants — NOT Chart.js default rainbow per audit Image 2 fix)
- Submit/Save buttons brand canon
- Timer Playfair Italic (signature moment)
- Editor placeholder Vietnamese ("Bắt đầu viết câu trả lời của bạn...")

### Reading Practice in-task

```tsx
<main data-mode="brand-soft">
  <header>
    <span>Reading Practice — {topicLabel}</span>
    <span className="text-2xl font-display italic">{timer}</span>
  </header>
  
  {/* Split passage left + questions right */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1280px] mx-auto px-6 py-8">
    <article className="rounded-lg border border-gray-200 bg-cream p-8">
      <h2 className="text-2xl font-display italic text-navy mb-6">
        {passageTitle}
      </h2>
      <div className="prose prose-sm font-serif text-navy leading-relaxed">
        {/* Passage text in Georgia for readability */}
        {passageContent}
      </div>
    </article>
    
    <div className="space-y-6">
      {questions.map((q, i) => (
        <QuestionCard key={q.id} question={q} index={i} />
      ))}
    </div>
  </div>
  
  <footer>
    <button className="secondary-button">Flag</button>
    <button className="primary-button">Nộp bài</button>
  </footer>
</main>
```

Note:
- Passage text in Georgia (`font-serif`) — Cambridge-readability convention
- Question cards in DM Sans — brand chrome
- Headline Playfair Italic — signature
- Submit "Nộp bài" Vietnamese

### Listening Practice in-task

```tsx
<main data-mode="brand-soft">
  <header>
    <span>Listening Practice — Section 2</span>
    <AudioPlayer src={audioUrl} sticky />
  </header>
  
  <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
    {questions.map(q => <QuestionCard key={q.id} question={q} />)}
  </div>
</main>
```

Sticky audio player at top (per Listening feature design — codebase pattern).

## Brand-soft animation rules

Reduce animation intensity vs brand mode:

| Element | Brand mode | Brand-soft |
|---------|-----------|------------|
| Page enter | Stagger 80ms | Single fade 200ms |
| Card reveal | Stagger | Static |
| Button tap | Scale 0.97 | Scale 0.97 (same) |
| Headline | Slide-up + fade | Static |
| Mascot | Animated breathing | Absent |

Reduced animation = focus signal. User's attention on task, not chrome.

## Brand-soft chart palette

Per audit Image 2 (Writing Task 1 chart):
- ❌ Chart.js default rainbow (Brazil red, India yellow, Japan blue, US green) → palette violation
- ✅ Use brand-soft palette: Navy + Teal + Teal-light + Gold (4-data-point max)

```ts
// frontend/lib/chartPalette.ts
export const BRAND_SOFT_CHART_COLORS = [
  '#1B2B4B',  // navy primary
  '#00A896',  // teal primary
  '#00C4B0',  // teal-light secondary
  '#FFD700',  // gold accent (4th line max)
];

// For >4 data points, use shades within ramps:
export const BRAND_SOFT_CHART_EXTENDED = [
  '#1B2B4B',  // navy
  '#2D4A7A',  // navy-light
  '#0F1429',  // navy-dark
  '#00A896',  // teal
  '#00C4B0',  // teal-light
  '#FFD700',  // gold
];
```

```tsx
<Chart
  data={chartData}
  options={{
    plugins: { legend: { display: false } },  // custom legend HTML
    scales: { /* navy axis colors */ },
  }}
  palette={BRAND_SOFT_CHART_COLORS}
/>
```

NEVER use Chart.js default `borderColor` / `backgroundColor`. Always specify brand palette.

## Hint / help system in brand-soft

Hints are optional, opt-in. Subtle UI:

```tsx
<button
  onClick={toggleHints}
  className="text-xs text-teal hover:text-teal-dark underline-offset-4 hover:underline"
>
  Hiện gợi ý
</button>

{showHints && (
  <div className="mt-3 rounded-md bg-teal-50 border border-teal-100 p-3">
    <p className="text-xs text-teal-700">
      <strong>Gợi ý:</strong> {hint}
    </p>
  </div>
)}
```

Hints:
- Subtle teal-50 background (NOT prominent yellow warning)
- Vietnamese label "Hiện gợi ý" / "Ẩn gợi ý"
- Compact text size

## Pause / save state

User có thể pause Practice (NOT Full Test which has strict timing):

```tsx
<button onClick={onPause} className="secondary-button">
  Tạm dừng
</button>

{isPaused && (
  <Modal title="Tạm dừng">
    <p className="text-base text-gray-700">
      Bạn đã tạm dừng. Tiến độ đã lưu — quay lại lúc nào cũng được.
    </p>
    <div className="mt-6 flex gap-3">
      <button className="secondary-button" onClick={onResume}>
        Tiếp tục
      </button>
      <button className="primary-button" onClick={onExit}>
        Lưu và thoát
      </button>
    </div>
  </Modal>
)}
```

Voice rule: factual, peer voice. KHÔNG drama "Are you sure you want to leave?".

## Anti-patterns brand-soft

❌ Lintopus visible during in-task (focus mode mandate)
❌ Headlines text-5xl+ (over-prominent for task page)
❌ Mascot bubble text mid-task (distract)
❌ Confetti / drama animation mid-task
❌ Chart Chart.js default palette (use brand chart palette)
❌ Native HTML form elements (toggle, select) — custom components
❌ English microcopy ("Submit", "Pause") — Vietnamese
❌ Mode bleed: brand-soft persisting after navigation away
❌ Skipping mode declaration (no `data-mode="brand-soft"` wrapper)
❌ Mascot returning prematurely (must wait until result page)

## Mode boundary check

Brand-soft strictly bounded to Practice **in-task** route. Boundary:

```
/exam/speaking/practice (entry)         → brand mode
/exam/speaking/practice/run             → brand-soft mode  ← here
/exam/speaking/practice/result          → brand mode (Lintopus return)

/exam/writing/practice/task-1/run       → brand-soft mode
/exam/writing/practice/task-1/result    → brand mode

/exam/reading/practice/run              → brand-soft mode
/exam/reading/practice/result           → brand mode
```

When route changes from `/run` → `/result` → mode flips back to brand. See `04-modes/mode-switch-rules.md` for transition mechanism.

## Audit checklist brand-soft

```
1. Page declares data-mode="brand-soft"? ✓
2. Lintopus ABSENT during in-task? ✓
3. Headlines text-2xl/3xl (NOT text-5xl+)? ✓
4. Timer Playfair Italic tabular-nums? ✓
5. Submit button brand teal canon? ✓
6. Passage text Georgia (Reading skill)? ✓
7. Chart uses brand-soft palette (Navy/Teal/Gold)? ✓
8. Hints opt-in subtle teal-50? ✓
9. Vietnamese microcopy? ✓
10. WS:content 25:75 (content dominant)? ✓
11. Mode flips back to brand on /result navigation? ✓
12. NO confetti / drama mid-task? ✓
```

## See also

- `04-modes/brand.md` — default mode (entry + result)
- `04-modes/ielts-authentic.md` — exam mode (Full Test)
- `04-modes/mode-switch-rules.md` — runtime mode swap
- `02-layout/empty-space-philosophy.md` — WS ratio per page type
- `03-components/mascot.md` — placement matrix (NOT during in-task)
- `03-components/primary-button.md` — brand-soft button variant
- `00-manifesto/personality.md` — voice rules (peer voice)
