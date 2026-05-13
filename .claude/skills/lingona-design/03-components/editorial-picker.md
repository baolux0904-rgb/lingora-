# Editorial picker — anthology list canon

Keywords for skill search: editorial picker, anthology list, hairline divider, numbered prefix, Playfair italic title, topic eyebrow, Vietnamese paraphrase title, content library, prompt picker, essay picker, long content list, IELTS Writing list.

Canon for **long content libraries** rendered as anthology lists: numbered hairline-divider entries, eyebrow caps, Playfair italic title, peer-voice paraphrase + raw source preview. Used today for the Writing v2 essay picker (`EditorialEssayPicker.tsx`). Reusable for future Reading passage libraries, Blog archives, course catalogs.

## When to use

- Long content libraries (≥10 items) where each item is text-heavy
- Items have **paired metadata**: a short editorial title + a longer raw-source preview (paraphrase + English original, summary + full text, etc.)
- Browsing pattern is **read-to-pick** (user scans to evaluate before clicking), not **scan-to-act** (Help FAQ, Settings)
- Filter chips at top constrain the scroll list

## When NOT to use

- Short lists (<10 items) — use stacked cards from `scenario-card.md` instead
- Action grids (Profile stats, settings, BottomNav) — use `profile-stats.md` typography grid
- Dashboard summaries — these need richer cards with stats + visual hierarchy
- Conversation lists (Friends chat) — use compact list pattern from `friend-list.md`

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb · minimal text-only                               │
│                                                              │
│ Page H1 — Playfair italic 32-40px                            │
│ Subtitle — DM Sans 15-16px peer voice                        │
│                                                              │
│ ▢ Tất cả  ▢ Giáo dục  ▢ Công nghệ  ▢ Xã hội ...               │  ← Filter pills
│ ────────────────────────────────────────────                 │  ← hairline divider
│ 01    GIÁO DỤC · TRUNG CẤP                                   │
│       Hai luồng ý kiến đối lập — thảo luận                   │
│       Some people think children should learn coding...     │
│       Đã viết                                            →   │
│ ────────────────────────────────────────────                 │
│ 02    MÔI TRƯỜNG · CƠ BẢN                                    │
│       Nguyên nhân và giải pháp                               │
│       Climate change is causing more frequent extreme...    │
│                                                          →   │
│ ────────────────────────────────────────────                 │
```

### Container

```tsx
<div className="max-w-[920px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
```

Wider than About's editorial 720 (utility-page reading width), narrower than Help's 720 (utility lookup). 920 fits the eyebrow + title + preview block at comfortable line length while leaving room for filter chips horizontal.

### Filter chips (top)

Canonical pill pattern per `scenario-card.md`:
- `rounded-full`, `min-h-[44px]`, canonical focus-visible ring
- Active: `bg-teal text-cream shadow-colored`
- Inactive: `bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]`
- "Tất cả" always first, followed by translated topic names
- Horizontal scroll on overflow (`overflow-x-auto pb-1 -mx-1 px-1`)

### Entries — hairline divider list

**No card borders.** Just `border-t` between entries, `rgba(229,220,198,0.16)` color (reads on both cream and dark navy bg).

Each entry:
```tsx
<li className="border-t" style={{ borderColor: "rgba(229,220,198,0.16)" }}>
  <button onClick={() => onSelect(item.id)} className="group w-full text-left py-7 lg:py-9 ...">
    <div className="flex items-start gap-4 sm:gap-6">
      {/* Numbered prefix */}
      <span className="font-display italic text-[22px] sm:text-[26px] tabular-nums shrink-0 mt-0.5"
            style={{ color: "var(--color-text-tertiary)", opacity: isAttempted ? 0.55 : 1 }}>
        {String(idx + 1).padStart(2, "0")}
      </span>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Eyebrow */}
        <div className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-1.5"
             style={{ color: "#5DCAA5" }}>
          {topicLabel(item.topic)}
          <span className="ml-2" style={{ color: "var(--color-text-tertiary)" }}>
            · {difficultyLabel(item.difficulty)}
          </span>
        </div>

        {/* Title — peer-voice Vietnamese paraphrase */}
        <h2 className="font-display italic text-[19px] sm:text-[22px] leading-snug mb-1.5"
            style={{ color: "var(--color-text)", opacity: isAttempted ? 0.7 : 1 }}>
          {paraphrasedTitle}
        </h2>

        {/* Preview — raw source, italic muted */}
        <p className="text-[13px] sm:text-[14px] italic leading-relaxed line-clamp-2"
           style={{ color: "var(--color-text-tertiary)" }}>
          {rawSourceText}
        </p>

        {/* Done state (optional) */}
        {isAttempted && (
          <p className="mt-2.5 text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            Đã viết
          </p>
        )}
      </div>

      {/* Chevron */}
      <ArrowRight className="w-4 h-4 mt-2 shrink-0 transition-transform group-hover:translate-x-1" />
    </div>
  </button>
</li>
```

| Element | Spec | Notes |
|---|---|---|
| Numbered prefix | `font-display italic tabular-nums`, `text-[22px] sm:text-[26px]` | "01" / "02" — zero-padded for visual alignment. Opacity 0.55 when item is in done state. |
| Eyebrow | `text-[10px] uppercase tracking-[0.16em] font-semibold`, color `#5DCAA5` | Topic in localized Vietnamese. Difficulty appended via `·` separator in tertiary text. |
| Title | `font-display italic text-[19px] sm:text-[22px] leading-snug` | **Vietnamese paraphrase** of the source (not literal translation). Peer voice. Opacity 0.7 when done. |
| Preview | `text-[13px] sm:text-[14px] italic line-clamp-2` | **Raw source** (English question_text, original article excerpt, etc.) — italic to signal "source material", line-clamped to 2. |
| Done state | `text-[12px]` "Đã viết" inline meta | Subtle. Title + prefix opacity fade reinforces "you've been here." |
| Chevron | Lucide `ArrowRight`, `w-4 h-4 mt-2` | `group-hover:translate-x-1` micro-interaction. |
| Item padding | `py-7 lg:py-9` | Generous vertical breathing room between dividers. |

**Trailing divider**: render an empty `<li>` after the last entry to close the visual rhythm:

```tsx
<li className="border-t" style={{ borderColor: "rgba(229,220,198,0.16)" }} aria-hidden="true" />
```

## States

- **Loading**: simple centered text `"Đang tải..."` in `var(--color-text-tertiary)`. Skeleton avoided — the editorial list animates in fast enough that a placeholder skeleton would feel heavier than the load itself.
- **Empty (filter returns 0)**: Mascot 80px + peer copy "Chưa có {nội dung} trong nhóm này." + reset-filter CTA "Xem tất cả →" (only when `activeFilter !== null`).
- **Error**: Mascot mood `thinking` + "Có lỗi xảy ra khi tải {nội dung}. Thử lại sau nhé."

## Voice / banned-phrase compliance

- Vietnamese paraphrase **for the title** — peer voice, max ~70 chars. Helper `translatePromptTitle` in Writing v2 demonstrates pattern-match heuristic; upgrade path is pre-translated content via DB column.
- Raw source in preview stays **as-shipped** by backend (English IELTS prompts, original article paragraphs, etc.) — frontend doesn't translate source material.
- Done state: `Đã viết` (peer past tense), NOT `Đã hoàn thành` (corporate).
- Eyebrow: localized topic name (`Giáo dục` not `Education`), localized difficulty (`Cơ bản / Trung cấp / Nâng cao`).

## Token system note

App-mode CSS-var pattern per `scenario-card.md` canon. Semantic accents (teal eyebrow `#5DCAA5`, teal CTA via Tailwind palette) deliberately inline-hex'd — they're brand-stable, not theme-variable.

Hairline divider color `rgba(229,220,198,0.16)` is mode-stable (semi-transparent cream) and reads cleanly on both cream and dark navy backgrounds. Do NOT replace with `var(--color-border)` — that token shifts more dramatically between themes and creates a heavier rule line.

## Origin

Writing v2 redesign — first commit shipping the editorial picker pattern (`EditorialEssayPicker.tsx`, Commit 8694746, May 2026). Pattern stabilized after surveying Spiderum essay archives + The Present Writer longform index + Vietcetera article lists. v1.

## See also

- `03-components/scenario-card.md` — sibling app-mode list canon (filter chips pattern, ≥44px touch target, focus-visible ring)
- `03-components/profile-stats.md` — pure-typography button canon (CTAs at end of picker)
- `03-components/long-form-reading.md` — typography foundation for the editorial register
- `03-components/editorial-result.md` — sibling pattern for editorial scoring/feedback pages
- `frontend/components/Writing/v2/EditorialEssayPicker.tsx` — reference implementation
- `frontend/components/Writing/v2/topicTranslations.ts` — Vietnamese topic name map + `translatePromptTitle` heuristic
