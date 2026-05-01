# IELTS-authentic mode — Cambridge faithful

IELTS-authentic = **exam mode**. Cambridge UI exact mimic. Active during Full Test (all 4 skills) + Battle Ranked match. Brand identity stripped to maximize "thi thật" feel.

Active ~5% of app surface. Highest mode boundary discipline — KHÔNG bleed brand styling into authentic, KHÔNG bleed authentic into brand.

## When ielts-authentic mode is active

| Page | Why authentic |
|------|---------------|
| Speaking Full Test in-task (Part 1/2/3) | "Thi thật" simulate, no Lintopus, no game chrome |
| Writing Full Test Task 1 in-task | Same — Cambridge writing paper feel |
| Writing Full Test Task 2 in-task | Same |
| Reading Full Test in-task | Cambridge passage + question grid exact |
| Listening Full Test in-task | Cambridge audio + answer sheet |
| Battle Ranked match in-progress | "Real exam" pressure register |

**NOT authentic mode**:
- Full Test **entry** (mode-select) → **brand mode**
- Full Test **result** → **brand mode** (Lintopus return)
- Practice in-task → **brand-soft mode**
- Battle Casual match → **brand-soft mode** (only Ranked = authentic)

## Visual signals (full strip from brand)

### Palette — Cambridge faithful

```
Page bg:        #F5EFDC cream Cambridge (warmer parchment, NOT brand cream)
Primary text:   #1A1A1A near-black (NOT navy — Cambridge uses near-black)
Body text:      #1A1A1A or #333
Border:         #C9B79C parchment border
Highlight:      #FFEB3B yellow (Cambridge answer marking convention)
Accent:         minimal — exam neutral
NO teal:        teal phá feel "thi thật"
NO gold:        no decoration
NO purple:      drift palette anyway
```

CSS variables override:

```css
[data-mode="ielts-authentic"] {
  --color-bg-page: #F5EFDC;        /* parchment */
  --color-text-primary: #1A1A1A;   /* near-black */
  --color-text-secondary: #4A4A4A; /* dark gray */
  --color-border: #C9B79C;         /* parchment border */
  --color-cta: #1A1A1A;            /* black submit */
  --color-cta-bg: transparent;      /* outline button */
  --color-highlight: #FFEB3B;       /* yellow answer mark */
  --font-body: Georgia, serif;
  --font-display: Georgia, serif;   /* NO Playfair Italic */
  --font-ui: Arial, sans-serif;     /* Cambridge UI */
  --radius-button: 2px;             /* sharp Cambridge */
  --radius-card: 0;                 /* sharp Cambridge */
}
```

### Typography — Cambridge swap

Per `01-foundations/typography.md`:

```
Body:        Georgia, serif (NOT DM Sans)
UI label:    Arial, sans-serif (NOT DM Sans)
Headline:    Georgia bold (NOT Playfair Italic)
Numerical:   Arial tabular-nums (NOT Playfair)
```

Why swap: Cambridge official paper test + computer-delivered IELTS use Georgia/Arial. DM Sans gamified phá feel exam. Playfair Italic editorial — KHÔNG fit exam.

### Layout — Cambridge structure

```
Reading:     2-column 50/50 (passage left, questions right)
Writing:     1-column wide editor with prompt above
Listening:   Single column, audio control top, questions list
Speaking:    Single column, large prompt center, examiner cue inline
```

NO asymmetric Pattern C. NO breathing whitespace. **Content density max** — Cambridge faithful is text-heavy.

### Radius — sharp Cambridge

```
Buttons:     rounded-sm (8px) max — minimal corner softening
Cards:       rounded-none (0) — sharp grid
Tables:      rounded-none — exam table convention
Answer fields: rounded-none — input cells exam grid
```

NO `rounded-md`, `rounded-lg`, `rounded-xl`. Sharp = Cambridge.

### Mascot — ABSENT

Lintopus 100% absent during exam. Returns at result page (which switches back to brand mode).

```tsx
{mode === 'ielts-authentic' && /* NO mascot */}
```

### Voice — neutral exam English

Microcopy switches from Vietnamese peer voice to **neutral English Cambridge convention**:

| Element | Brand | IELTS-authentic |
|---------|-------|-----------------|
| Submit | "Nộp bài" | "Submit" |
| Skip | "Bỏ qua" | "Skip" |
| Flag for review | "Đánh dấu" | "Flag" |
| Bookmark | "Lưu" | "Bookmark" |
| Pause | "Tạm dừng" (rare in exam) | "Pause" (Practice only — Full Test KHÔNG pause) |
| Time | "Thời gian" | "Time" |
| Word count | "Số từ" | "Words" |
| Page | "Trang" | "Page" |
| Section | "Phần" | "Section" |
| Question | "Câu hỏi" | "Question" |
| Answer | "Trả lời" | "Answer" |

Why English: Cambridge IELTS = English-only UI. Authentic mode mimic = English chrome. Brand voice mềm phá feel.

NOTE: Test instructions, examiner cues, passage content luôn English (Cambridge content). Brand mode chỉ Vietnamese-first cho user-facing chrome.

### Animation — NONE

```
Transitions:    instant (NO 200ms ease)
Stagger reveal: NONE
Fade-in:        NONE
Tap scale:      NONE (Cambridge buttons rigid)
Mascot motion:  NONE (no mascot)
```

Static UI = exam pressure. Animation = game register, phá feel.

Exception: timer countdown ticks (real-time clock — required functional).

## IELTS-authentic component manifest

| Component | Authentic style |
|-----------|-----------------|
| Header | Solid border-bottom, Arial, compact |
| Timer | `font-mono Arial tabular-nums text-3xl text-black` rigid |
| Section indicator | `1 / 3` plain text, no progress bar |
| Question prompt | Georgia bold |
| Answer field | `rounded-none border border-black bg-cream-cambridge px-2 py-1 font-serif` |
| Multiple choice radio | Native styled minimal Cambridge |
| Checkbox | Native styled minimal |
| Submit button | `rounded-sm border border-black bg-cream-cambridge text-black px-6 py-2 font-serif font-bold hover:bg-gray-100` |
| Flag/bookmark | Compact icon button, no fill color |
| Pagination | Cambridge-style numbered list |
| Audio player | Linear progress bar Cambridge style |
| Highlight tool (Reading) | Yellow `#FFEB3B` background on selected text |
| Notes panel (Reading) | Right sidebar, Arial, plain |

## Per-skill ielts-authentic patterns

### Reading Full Test

```tsx
<main data-mode="ielts-authentic" className="bg-[#F5EFDC] min-h-screen">
  <header className="border-b-2 border-black bg-[#F5EFDC] sticky top-0 z-20">
    <div className="max-w-[1280px] mx-auto px-6 py-2 flex items-center justify-between">
      <span className="font-serif text-base text-black">
        IELTS Reading Test — Practice Test {testNumber}
      </span>
      
      <div className="flex items-center gap-6">
        <span className="font-mono text-2xl text-black tabular-nums">
          {formatTime(timeRemaining)}
        </span>
        
        <button
          onClick={onSubmit}
          className="
            rounded-sm border border-black
            bg-[#F5EFDC] text-black px-6 py-2
            font-serif font-bold text-base
            hover:bg-[#EDE5CB]
          "
        >
          Submit
        </button>
      </div>
    </div>
  </header>
  
  {/* 2-column: passage left, questions right */}
  <div className="grid grid-cols-2 gap-6 max-w-[1280px] mx-auto px-6 py-6 h-[calc(100vh-60px)]">
    <article className="overflow-y-auto pr-6 border-r border-[#C9B79C]">
      <h2 className="font-serif font-bold text-xl text-black mb-4">
        {passage.title}
      </h2>
      <div className="font-serif text-base text-black leading-relaxed space-y-3">
        {/* Passage paragraphs */}
        {passage.paragraphs.map((p, i) => (
          <p key={i}><strong>{String.fromCharCode(65 + i)}</strong> {p}</p>
        ))}
      </div>
    </article>
    
    <div className="overflow-y-auto pl-2 space-y-6">
      <h3 className="font-serif font-bold text-base text-black">
        Questions {questionsRange.start}–{questionsRange.end}
      </h3>
      
      {questions.map((q, i) => (
        <div key={q.id} className="space-y-2">
          <p className="font-serif text-base text-black">
            <strong>{i + 1}.</strong> {q.text}
          </p>
          
          {/* Answer cell sharp Cambridge */}
          <input
            type="text"
            value={answers[q.id] || ''}
            onChange={e => handleAnswer(q.id, e.target.value)}
            className="
              w-full
              rounded-none
              border border-black bg-[#F5EFDC]
              px-3 py-1
              font-serif text-base text-black
              focus:outline-none focus:bg-[#FFF5D4]
            "
          />
        </div>
      ))}
    </div>
  </div>
</main>
```

Visual checklist:
- Cream-Cambridge bg #F5EFDC ✓
- Black border + Georgia serif ✓
- Sharp rounded-none on answer fields ✓
- 50/50 column split ✓
- English UI (Submit, Questions) ✓
- NO Lintopus, NO teal, NO Playfair Italic ✓
- Tabular-nums timer Arial mono ✓

### Writing Full Test

```tsx
<main data-mode="ielts-authentic" className="bg-[#F5EFDC]">
  <header>
    <span>IELTS Writing Test — Task 1</span>
    <div>
      <span>Words: {wordCount}</span>
      <span className="font-mono">{formatTime(remaining)}</span>
      <button className="cambridge-submit">Submit</button>
    </div>
  </header>
  
  {/* Stack vertical: prompt top, editor below */}
  <div className="max-w-[1024px] mx-auto px-6 py-6 space-y-6">
    <div className="border border-black p-6 bg-[#F5EFDC]">
      <h2 className="font-serif font-bold text-lg text-black mb-3">
        Task 1
      </h2>
      <p className="font-serif text-base text-black leading-relaxed">
        {prompt}
      </p>
      
      {hasChart && (
        <div className="mt-4 border border-[#C9B79C] p-4">
          {/* Chart in monochrome cambridge palette */}
          <ChartCambridge data={chartData} />
        </div>
      )}
    </div>
    
    <textarea
      className="
        w-full min-h-[400px]
        rounded-none border border-black bg-[#F5EFDC]
        p-4 font-serif text-base text-black
        focus:outline-none focus:bg-[#FFF5D4]
        resize-none
      "
      placeholder="Begin writing your answer here..."
    />
  </div>
</main>
```

Note:
- Single column wide layout (no 2-column for writing)
- Chart in Cambridge monochrome (NOT brand teal)
- Editor sharp + Georgia
- Placeholder English

### Speaking Full Test

```tsx
<main data-mode="ielts-authentic" className="bg-[#F5EFDC]">
  <header>
    <span>IELTS Speaking Test — Part {currentPart}</span>
    <span className="font-mono">{formatTime(remaining)}</span>
  </header>
  
  <section className="max-w-2xl mx-auto px-6 py-12">
    {/* Examiner cue */}
    <div className="mb-8">
      <span className="text-xs uppercase tracking-wider text-black font-bold mb-2 block">
        Examiner
      </span>
      <p className="font-serif text-lg text-black leading-relaxed">
        {examinerCue}
      </p>
    </div>
    
    {/* Recording control */}
    <div className="border border-black p-8 text-center bg-[#F5EFDC]">
      <button
        onClick={toggleRecording}
        className="
          w-16 h-16 rounded-full
          border-2 border-black bg-[#F5EFDC]
          flex items-center justify-center
        "
      >
        <Mic className="w-8 h-8 text-black" />
      </button>
      
      <p className="mt-4 font-serif text-sm text-black">
        {isRecording ? 'Recording...' : 'Click to start speaking'}
      </p>
    </div>
  </section>
</main>
```

Note:
- No mascot avatar for examiner — Cambridge text-only "Examiner" label
- Mic button neutral, no teal accent
- English copy "Recording...", "Click to start speaking"

### Listening Full Test

```tsx
<main data-mode="ielts-authentic" className="bg-[#F5EFDC]">
  <header>
    <span>IELTS Listening Test — Section {currentSection}</span>
    <AudioPlayer
      src={audioUrl}
      style="cambridge"
      controls={['play', 'progress']}
      noScrub
    />
  </header>
  
  <div className="max-w-2xl mx-auto px-6 py-6">
    {questions.map(q => (
      <CambridgeQuestionCard key={q.id} question={q} />
    ))}
  </div>
</main>
```

Audio player Cambridge style: simple progress bar, play button only, NO scrub (Cambridge plays once, no replay).

### Battle Ranked match

```tsx
<main data-mode="ielts-authentic" className="bg-[#F5EFDC]">
  {/* Compact header */}
  <header className="border-b border-black p-2 flex items-center justify-between">
    <span className="font-serif text-sm text-black">
      Ranked Match — Reading
    </span>
    <span className="font-mono text-2xl text-black tabular-nums">
      {formatTime(remaining)}
    </span>
  </header>
  
  {/* Same Reading split layout but with opponent score sidebar */}
  <div className="grid grid-cols-12 gap-2 max-w-[1440px] mx-auto px-2 py-2">
    <article className="col-span-7">{/* passage */}</article>
    <div className="col-span-3">{/* questions */}</div>
    <aside className="col-span-2 border border-black p-3">
      {/* Opponent sidebar — Cambridge minimal */}
      <h4 className="font-serif font-bold text-sm text-black">Opponent</h4>
      <p className="font-mono text-xl text-black mt-2">
        {oppScore} / 10
      </p>
    </aside>
  </div>
</main>
```

Battle Ranked = exam pressure + competitive sidebar minimal. NO teal accent, NO drama VICTORY/DEFEAT during match (drama only at result, brand mode).

## Mode boundary CỨNG

IELTS-authentic strictly bounded. Boundary list:

```
/exam/reading/full-test (entry)         → brand mode
/exam/reading/full-test/run             → ielts-authentic ← here
/exam/reading/full-test/result          → brand mode (Lintopus return)

/exam/writing/full-test/task-1/run      → ielts-authentic
/exam/writing/full-test/task-1/result   → brand mode

/exam/speaking/full-test/run            → ielts-authentic
/exam/speaking/full-test/result         → brand mode

/exam/listening/full-test/run           → ielts-authentic
/exam/listening/full-test/result        → brand mode

/battle/ranked/match/{matchId}          → ielts-authentic
/battle/ranked/match/{matchId}/result   → brand mode (Lintopus return + drama register)
```

KHÔNG bleed: brand chrome bị cấm xuất hiện trong authentic page. Authentic chrome bị cấm xuất hiện trong brand page.

See `04-modes/mode-switch-rules.md` for runtime swap.

## Anti-patterns ielts-authentic

❌ Lintopus visible (focus mode mandate, ABSENT during authentic)
❌ Teal CTA (use black/cambridge button)
❌ DM Sans body (use Georgia)
❌ Playfair Italic title (use Georgia bold)
❌ Rounded-md/lg/xl on cards/buttons (sharp Cambridge)
❌ Brand cream `#F8F7F4` (use Cambridge `#F5EFDC` parchment)
❌ Vietnamese microcopy (English neutral exam UI)
❌ Animations / transitions (instant, static)
❌ Asymmetric Pattern C (use Cambridge symmetric layout)
❌ Mascot bubble text (no mascot at all)
❌ Toast notification "Saved" / "Submitted" (Cambridge UI = no toast pop)
❌ Drama VICTORY/DEFEAT during match (defer to result page brand mode)
❌ Daily streak / XP / achievement notification mid-exam (no gamified bleed)
❌ Pro upgrade prompt mid-exam (zero monetization push during authentic)
❌ Custom emoji in copy (no 🐙 in Cambridge UI)
❌ Confetti at submit success (Cambridge = no celebration)
❌ Background gradient / pattern (flat parchment)

## Bleed prevention checklist

```
1. Page declares data-mode="ielts-authentic"? ✓
2. Header KHÔNG có sidebar Lingona logo? ✓
3. Body bg #F5EFDC? ✓
4. Text Georgia, NOT DM Sans/Playfair? ✓
5. Buttons rounded-sm + black border + Arial/Georgia? ✓
6. Microcopy English neutral (Submit, Flag)? ✓
7. NO Lintopus rendered? ✓
8. NO teal color anywhere? ✓
9. NO toast notifications? ✓
10. NO XP/streak/achievement panels? ✓
11. NO Pro upgrade CTA? ✓
12. Animations off (transition: none)? ✓
13. Timer Arial tabular-nums (NOT Playfair)? ✓
14. Submit button Cambridge sharp + outline? ✓
15. Mode flips back to brand on /result navigation? ✓
```

## Practice → Full Test → Result transition flow

```
User flow Reading:

1. /exam/reading                        ← brand mode (entry mode-select)
   click "Bắt đầu Full Test"
   
2. /exam/reading/full-test              ← brand mode (test difficulty select)
   click "Practice Test 1"
   
3. /exam/reading/full-test/run          ← ielts-authentic mode kicks in
   - Mode wrapper data-mode="ielts-authentic"
   - CSS variables override
   - Lintopus disappear, teal disappear
   - Cambridge UI render
   
4. User submits / time up
   
5. /exam/reading/full-test/result       ← brand mode returns
   - Mode wrapper data-mode="brand"
   - Lintopus reappear, teal CTA back
   - Result page anatomy renders
```

Transition feels like: enter exam hall → emerge → see Lintopus + result. Mode boundary = the exam hall door.

## Audit checklist

```
1. data-mode="ielts-authentic" applied at /run route? ✓
2. CSS variables override resolves Cambridge palette? ✓
3. Font swap to Georgia/Arial verified? ✓
4. Sharp radius enforced? ✓
5. Lintopus 0% present? ✓
6. Teal 0% used? ✓
7. English microcopy throughout? ✓
8. Cambridge layout (50/50 reading, single col writing)? ✓
9. Highlight tool yellow #FFEB3B? ✓
10. Submit button Cambridge sharp? ✓
11. Animations off? ✓
12. Result page returns to brand cleanly? ✓
```

## See also

- `04-modes/brand.md` — default mode (entry + result)
- `04-modes/brand-soft.md` — Practice mode (bridge)
- `04-modes/mode-switch-rules.md` — runtime swap
- `01-foundations/typography.md` — Georgia/Arial swap
- `01-foundations/palette.md` — Cambridge cream override
- `01-foundations/radius-language.md` — sharp Cambridge radius
- `03-components/mascot.md` — placement (absent during authentic)
- `03-components/primary-button.md` — Cambridge sharp variant
- `00-manifesto/personality.md` — voice rules (English in authentic mode)
