# Editorial result — anthology scoring/feedback canon

Keywords for skill search: editorial result, scoring page, band score reveal, sub-band grid, AI feedback prose, highlighted essay, popover, amber red highlights, comparison sample, Writing result, IELTS scoring page.

Canon for **graded result pages** with score reveal + structured AI feedback + inline annotations + comparison material. Used today for Writing v2 (`PracticeResultPage.tsx`, `FullTestResultPage.tsx`). Reusable for future Speaking AI scoring result page and Reading band assessment results.

## When to use

- Graded results where user submitted content + backend returned scores + feedback
- Score has **multiple dimensions** (overall + sub-criteria) — IELTS bands, CEFR levels, multi-axis rubrics
- Feedback is **structured into categories** (strengths / weaknesses / improvements OR equivalents)
- Source content (essay, transcript, etc.) needs **inline annotation** of issues
- Comparison material (band-7 sample, model answer, expert reference) available

## When NOT to use

- Single-number scoring with no breakdown (use a compact result toast or card)
- Real-time feedback (no scoring delay) — use inline indicators instead
- Pass/fail binary results — use minimal confirmation, not a full result page

## Page anatomy (top to bottom)

```
Breadcrumb · minimal
─────────────────────
Eyebrow: ĐÃ CHẤM XONG · vừa xong
Band score reveal: 88px Playfair italic
                   + trend line "+0.5 so với lần trước" (icon)
─────────────────────
4-column sub-band grid:
  TASK RESPONSE    COHERENCE    LEXICAL    GRAMMAR
  6.5              7.0          6.5        6.0
  Trả lời đề bài   Liên kết...  Từ vựng    Ngữ pháp
─────────────────────
LINGONA NHẬN XÉT
  → Bạn làm tốt (eyebrow)
    → strength item 1
    → strength item 2
  ─── divider ───
  → Cần làm khác (eyebrow)
    → weakness item 1
  ─── divider ───
  → Gợi ý cụ thể (eyebrow)
    → improvement item 1
─────────────────────
BÀI CỦA BẠN · 245 từ              Click vào ô màu để xem góp ý
  [essay text with amber/red highlighted sentences]
  ▢ Cần cải thiện   ▢ Lỗi   ← legend
─────────────────────
SO VỚI BAND 7 MẪU
  [▢ Xem bài mẫu band 7 cùng đề  ▶]   ← inline expand card
─────────────────────
[Viết bài khác →] [Xem lịch sử]
```

### Container

```tsx
<main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
  <div className="max-w-[960px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
```

960 wider than picker (920) — accommodates the 4-column sub-band grid at comfortable cell widths.

### Band score reveal

```tsx
<header className="my-8">
  <div className="text-[11px] uppercase tracking-[0.16em] mb-3"
       style={{ color: "rgba(0, 168, 150, 0.7)" }}>
    Đã chấm xong <span style={{ color: "var(--color-text-tertiary)" }}>· {time}</span>
  </div>
  <div className="flex items-baseline gap-6 flex-wrap">
    <div className="font-display italic leading-none tabular-nums tracking-tight
                    text-[64px] sm:text-[88px]"
         style={{ color: "var(--color-text)" }}>
      {band.toFixed(1)}
    </div>
    <div className="flex flex-col gap-1 pb-3">
      <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
        Band tổng
      </div>
      {/* Trend line with TrendingUp/Down/Minus from Lucide */}
    </div>
  </div>
</header>
```

Mobile scales `text-[88px]` down to `text-[64px]` — the 88px figure becomes overwhelming below 640px wide.

### Sub-band grid

`grid grid-cols-2 lg:grid-cols-4 gap-6 my-8`. Each cell:
- Eyebrow: English label (`Task Response`) uppercase tracking-[0.16em], teal at 70% opacity
- Score: `font-display italic text-[28px] leading-none tabular-nums` — color `var(--color-text)`
- Vietnamese label: `text-[11px]` tertiary text

No card borders. Pure typography rhythm.

### AI feedback — structured editorial sections

Three sections, hairline-divided:
1. **Bạn làm tốt** — strengths array
2. **Cần làm khác** — weaknesses array
3. **Gợi ý cụ thể** — top_3_priorities (preferred) OR improvements

Empty arrays skip the section entirely. Each item rendered as `flex items-start gap-3` row with `ArrowRight` icon prefix + 15px peer-voice text.

```tsx
<ul className="list-none p-0 m-0 flex flex-col gap-3">
  {items.map((item, i) => (
    <li className="flex items-start gap-3 text-[15px] leading-[1.65]"
        style={{ color: "var(--color-text-secondary)" }}>
      <ArrowRight className="w-4 h-4 mt-1 shrink-0"
                  style={{ color: "rgba(0, 168, 150, 0.7)" }} />
      <span>{item}</span>
    </li>
  ))}
</ul>
```

### Inline annotations — 2-tier color highlights

**Tiers (accepted palette exceptions)**:
- `improve` (amber) — vocabulary/coherence issues. CSS vars `--color-amber-bg / --color-amber-text`.
- `error` (red) — grammar errors. CSS vars `--color-red-bg / --color-red-text`.
- `strong` (teal) — **reserved for future backend positional annotation API**, not implemented in v1.

Each highlight is a `<button>` (sentence-level, currently — word-level requires backend positional data):

```tsx
<button
  type="button"
  data-writing-highlight="true"
  onClick={(e) => openPopover(e, comment)}
  aria-label={`Góp ý ${tierLabel}: ${comment}`}
  className="px-1.5 py-0.5 rounded-sm cursor-pointer text-left
             focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
  style={{ background: tierStyle.bg, color: tierStyle.color }}
>
  {sentence}
</button>
```

**Popover** rendered via React portal to `document.body` (escapes overflow + stacking contexts). Position computed once via `getBoundingClientRect()` on toggle, clamped to viewport. Closes on Escape + outside-click. `role="dialog"` + `aria-label`.

**Legend bar** below essay: only renders when at least one highlight exists.

**Substring algorithm** (current v1): sentence-detect via punctuation `/([.!?]+)/`, normalize whitespace + lowercase, substring-match against AI's `original` field. Multi-correction sentences use severity-max (grammar > vocabulary/coherence) for tier choice, aggregate comments with `· ` separator.

Word-level highlighting requires backend to ship positional annotations (`{startIndex, endIndex, type, comment}[]`). Future scope.

### Color palette additions (accepted exceptions)

Added to `globals.css`:
```css
:root {
  --color-amber-bg: rgba(245, 158, 11, 0.18);
  --color-amber-text: #92400E;
  --color-red-bg: rgba(239, 68, 68, 0.18);
  --color-red-text: #991B1B;
}

.dark {
  --color-amber-bg: rgba(245, 158, 11, 0.22);
  --color-amber-text: #FCD34D;
  --color-red-bg: rgba(239, 68, 68, 0.22);
  --color-red-text: #FCA5A5;
}
```

**Scope**: grammar/error annotation context only. NOT applicable to band scores. Soul §1 red-on-band-scores ban still holds — bands always use `var(--color-text)`, never red.

Precedent: amber already accepted for `nâng cao` difficulty in `scenario-card.md`. Red is a new accepted exception scoped to annotation use only.

### Comparison sample card — inline expand

```tsx
<button onClick={() => setOpen(v => !v)} aria-expanded={open}
  className="w-full text-left rounded-md p-5 ..."
  style={{ background: "rgba(0, 168, 150, 0.06)",
           border: "1px solid rgba(0, 168, 150, 0.2)" }}>
  <div className="flex items-center justify-between gap-3">
    <div>
      <div className="font-display italic text-[16px]">
        {open ? "Đóng bài mẫu" : "Xem bài mẫu band 7 cùng đề"}
      </div>
      <div className="text-[12px] mt-1">
        So sánh để hiểu khoảng cách band {currentBand} → 7.0
      </div>
    </div>
    {open ? <ChevronDown /> : <ArrowRight />}
  </div>
</button>

{open && (
  <div className="mt-3 p-5 rounded-md" style={{ background: "var(--color-bg-card)" }}>
    <div className="text-[10px] uppercase tracking-[0.16em] mb-3">Bài mẫu band 7</div>
    <p className="text-[15px] leading-[1.85] whitespace-pre-wrap">{sampleEssay}</p>
  </div>
)}
```

Inline expand preferred over modal. Renders nothing when sample is null — no empty state.

### CTAs (per `profile-stats.md` pure-typography canon)

Primary: solid teal pill (`bg-teal text-cream rounded-full px-7 py-3`).
Secondary: outlined (`border-[var(--color-border)] rounded-full px-6 py-3 text-[var(--color-text-secondary)]`).

No decoration emojis. Success state is text-only (already shipped in `profile-stats.md`).

### Loading state

`Mascot` size 100 mood `thinking` + static peer-voice copy `"Đang chấm bài, chờ Lingona 1 chút..."`. NO progress percentage, NO intermediate updates. Backend 3x multi-sampling takes 15-30s typically; honesty about wait time beats fabricated progress.

### Error state

`Mascot` size 100 + peer-voice message + retry CTA when retry is meaningful.

### Trend delta

Separate `getWritingHistory` call (or equivalent for future skills). Compute current band vs prior submission's band. Format:
- Up: `"+0.5 so với lần trước"` with `TrendingUp` icon (teal)
- Down: `"-0.5 so với lần trước"` with `TrendingDown` icon (red)
- Flat: `"= lần trước"` with `Minus` icon (secondary)
- First submission OR no history: trend line hidden entirely

## Voice / banned-phrase compliance

- Section labels: `Bạn làm tốt`, `Cần làm khác`, `Gợi ý cụ thể`, `Lingona nhận xét`, `Bài của bạn`, `Click vào ô màu để xem góp ý`, `Cần cải thiện`, `Lỗi`, `So với band 7 mẫu`, `Xem bài mẫu band 7 cùng đề`, `Đóng bài mẫu`, `Bài mẫu band 7`, `Đang chấm bài, chờ Lingona 1 chút...`
- AI feedback content rendered **as-shipped** by backend. If English residue, flag for backend voice audit — frontend doesn't translate AI output.
- No banned phrases, no dialect particles, no emoji (Lucide icons throughout).

## Token system note

App-mode CSS vars + 4 amber/red tokens for highlights. Hairline dividers use `rgba(229,220,198,0.16)` (same as editorial-picker.md canon).

Comparison card tint uses inline `rgba(0,168,150,0.06)` (teal at 6% alpha) — same brand-stable accent used in eyebrows and chevrons.

## Origin

Writing v2 redesign — first commit shipping the editorial result pattern (`PracticeResultPage.tsx` + `FullTestResultPage.tsx` + 7 atom components + 2 utils + 4 color tokens, Commit 01224c7, May 2026). Pattern emerged from Louis-approved mockups + reconciliation with actual backend AI scoring response shape (`WritingFeedback` structured arrays, not prose; `sentence_corrections` substring-match, not positional). v1.

## See also

- `03-components/scenario-card.md` — sibling app-mode list canon (filter chip pattern reused on highlight legend)
- `03-components/profile-stats.md` — pure-typography button canon (CTAs at bottom of result)
- `03-components/editorial-picker.md` — sibling pattern for editorial list/library pages (often paired in a flow)
- `03-components/friend-list.md` — palette exception precedent (`#5DCAA5` online indicator)
- `frontend/components/Writing/v2/PracticeResultPage.tsx` — reference implementation (Practice — single essay)
- `frontend/components/Writing/v2/FullTestResultPage.tsx` — reference implementation (Full Test — T1 + T2)
- `frontend/components/Writing/v2/utils/parseHighlights.ts` — sentence-detect + substring-match algorithm
- `frontend/components/Writing/v2/utils/formatTrendDelta.ts` — trend line computation
