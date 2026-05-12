# Achievement badge — earned celebratory, locked tasteful

Keywords for skill search: achievement, badge, huy hiệu, rarity, earned, locked, lock overlay, progress bar, palette exception.

Canon for `<AchievementsSection>` badge grid on `/profile`. Two distinct anatomies — celebratory earned grid vs progress-bar locked list. App-mode component, CSS-var tokens with documented multi-color exception for earned rarity.

## Two anatomies, one section

```
Earned grid (celebratory)               Locked list (calm progress)
┌──────────┐ ┌──────────┐ ┌──────────┐  ┌─────────────────────────┐
│  🎤      │ │  💬      │ │  🔥      │  │ 🎨  Name [Phổ thông]    │
│ Name     │ │ Name     │ │ Name     │  │     description         │
│ HIẾM     │ │ SỬ THI   │ │ PHỔ      │  │     ▓▓▓░░░░ 3/10        │
│ 12 thg 5 │ │ 8 thg 4  │ │ 3 thg 3  │  ├─────────────────────────┤
└──────────┘ └──────────┘ └──────────┘  │ 🔒 Locked  ...          │
                                         └─────────────────────────┘
```

Earned: 3-4 col grid, square-ish card, color + glow per rarity, "Đã đạt" pill top-right.
Locked: vertical list, grayscale icon + lock overlay + progress bar.

## Rarity color tiers — palette exception (earned ONLY)

```ts
const RARITY_CONFIG = {
  common:    { border: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.06)", glow: "none",                          label: "Phổ thông" },
  rare:      { border: "rgba(59,130,246,0.4)",  bg: "rgba(59,130,246,0.06)",  glow: "0 0 12px rgba(59,130,246,0.15)", label: "Hiếm" },
  epic:      { border: "rgba(139,113,234,0.4)", bg: "rgba(139,113,234,0.06)", glow: "0 0 16px rgba(139,113,234,0.2)", label: "Sử thi" },
  legendary: { border: "rgba(245,158,11,0.5)",  bg: "rgba(245,158,11,0.08)",  glow: "0 0 20px rgba(245,158,11,0.25)", label: "Huyền thoại" },
};
```

**Accepted palette exception — earned cards only.** Rationale:
- 4 discrete rarity tiers map to user expectation from gaming context (Diablo, Hearthstone, Genshin all use this gradient)
- Color signals progression toward a goal (rare → epic → legendary)
- Limited surface area — bordered card, low-opacity bg (`.06`-`.08`), subtle glow
- Earned moments are signature emotional beats per Soul §1 — they earn the color

**Locked cards do NOT inherit rarity color** — pure palette: `bg-[var(--color-bg-card)]` + `border-[var(--color-border)]`. Rationale: locked is aspirational, not celebratory. Don't pre-color a moment that hasn't happened yet.

Rationale documented: "rarity color applies ONLY when earned; locked stays in canonical palette."

## Earned badge anatomy

```tsx
<div className="relative rounded-xl p-3 flex flex-col items-center gap-1.5 text-center transition-all hover:scale-[1.03]"
     style={{ background: r.bg, border: `1px solid ${r.border}`, boxShadow: r.glow }}>
  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
        style={{ background: "rgba(0,168,150,0.18)", color: "#00A896" }}>
    Đã đạt
  </span>
  <span className="text-3xl" aria-hidden="true">{b.emoji}</span>
  <span className="text-xs font-semibold leading-tight" style={{ color: "var(--color-text)" }}>{b.name}</span>
  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: r.border }}>{r.label}</span>
  <span className="text-[11px] tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
    {new Date(awardedAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
  </span>
</div>
```

| Element | Spec |
|---|---|
| Container | `rounded-xl p-3`, rarity bg + border + glow, hover `scale-[1.03]` |
| "Đã đạt" pill | absolute top-right, `text-[9px]` uppercase, teal wash `rgba(0,168,150,0.18)` + teal text |
| Emoji | `text-3xl`, centered (gaming convention — see emoji rule below) |
| Name | `text-xs font-semibold`, full opacity, `var(--color-text)` |
| Rarity label | `text-[10px] uppercase tracking-wider`, color = rarity border |
| Awarded date | `text-[11px] tabular-nums`, tertiary text |

Grid: `grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3` — 3 mobile, 4 desktop.

## Locked badge anatomy

```tsx
<div className="relative rounded-lg p-3 flex items-center gap-3"
     style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
  <div className="relative shrink-0">
    <span className="text-2xl block"
          style={{ filter: "grayscale(1)", opacity: 0.5 }} aria-hidden="true">
      {b.emoji}
    </span>
    <Lock className="absolute -top-1 -right-1 w-3.5 h-3.5" strokeWidth={2}
          style={{ color: "var(--color-text-tertiary)" }} aria-hidden="true" />
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{b.name}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: r.border }}>{r.label}</span>
    </div>
    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{b.description}</span>
    {prog && (
      <div className="mt-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(27,43,75,0.06)" }}>
          <div className="h-full rounded-full"
               style={{ width: `${prog.percent}%`, background: "#00A896",
                        transition: "width 400ms ease-out" }} />
        </div>
        <span className="text-xs mt-0.5 block tabular-nums"
              style={{ color: "var(--color-text-tertiary)" }}>
          {prog.current}/{prog.target}
        </span>
      </div>
    )}
  </div>
  <span className="text-xs font-semibold tabular-nums"
        style={{ color: "var(--color-text-tertiary)" }}>+{b.achievement_points}</span>
</div>
```

| Element | Spec |
|---|---|
| Container | `rounded-lg p-3` horizontal flex, `var(--color-bg-card)` bg, canonical border |
| Emoji | `text-2xl`, `filter: grayscale(1)` + `opacity: 0.5` (looks dim, not invisible) |
| Lock overlay | Lucide `Lock`, `w-3.5 h-3.5`, top-right of emoji, tertiary color |
| Name + rarity | inline, name semibold, rarity uses rarity border color (HINT what tier it will be when earned) |
| Description | tertiary text, full opacity, helps user understand what to do |
| Progress bar | `h-1.5 bg-teal`, NOT rarity color (cross-canon: progress = teal everywhere) |
| Progress numbers | `tabular-nums` so `3/10` aligns across badges |
| Points | right-aligned `+N` in tertiary — what they'll earn |

**Pre-rebuild state**: locked bg was `rgba(255,255,255,0.02)` (almost invisible) + emoji `opacity-40` + progress bar tinted to rarity color. Looked "dead grey" per user feedback. Post-rebuild: pure palette card surface (`var(--color-bg-card)`) is dim but legible, lock overlay clarifies status, teal progress bar gives forward signal.

## Emoji canon (accepted exception)

43 badges are DB-stored with `emoji` field per row. **Keep the emoji** — gaming-convention badge icons; replacing 43 emojis with custom illustrations or Lucide icons would be massive content effort and loses recognizability (🎤 First Voice = obvious).

This is the ONE accepted Profile emoji exception. All other Profile emojis are removed (8 stat icons → Lucide, 3 header meta → Lucide, 🏅 Top% → Lucide Award, action button decorations → none).

If a future audit pass wants to swap emojis for custom badge illustrations, the swap is centralized in the DB `badges` table — no frontend code change required as long as the field type stays string.

## Category filter (canonical pill pattern)

Per `scenario-card.md` / `friend-list.md` canon — full pill rounded, `min-h-[44px]`, canonical focus ring.

```tsx
<button onClick={() => setFilter(cat)} aria-pressed={isActive}
  className={[
    "px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 min-h-[44px]",
    "transition-colors duration-fast",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
    isActive
      ? "bg-teal text-cream shadow-colored"
      : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[rgba(27,43,75,0.05)] hover:text-[var(--color-text)]",
  ].join(" ")}
>
  {CATEGORY_LABEL[cat] ?? cat}
</button>
```

Pre-rebuild used `text-xs px-2.5 py-1` (~32px tall — failed 44px touch target). Now matches cross-component pill canon.

## Voice / banned-phrase compliance

- `Achievements` → `Huy hiệu`
- `pts` → `điểm`
- `Locked (N)` → `Chưa đạt (N)`
- `View all N locked →` → `Xem tất cả N huy hiệu chưa đạt →`
- `Earned (N)` → `Đã đạt (N)` (Session 1 already shipped)
- Rarity labels: `Common / Rare / Epic / Legendary` → `Phổ thông / Hiếm / Sử thi / Huyền thoại`
- Empty state: `Chưa có thành tích trong mục này` (Session 1)
- Category chips: `Tất cả / Streak / XP / Speaking / Writing / Reading / Battle / Xã hội / Học tập` (Session 1 — Streak/XP/Speaking/Writing/Reading/Battle kept English per gaming convention)

## Token system note

Pure CSS-var pattern for locked cards. Earned cards use inline rgba per rarity (documented exception). Progress bar uses inline `#00A896` (teal) consistent with Lingona's semantic accent. No new Tailwind utilities added — all rarity color lives in `RARITY_CONFIG` JS constants.

## Origin

Session 4 polish — first commit shipping:
- Earned/locked anatomy split (was prior: locked too dim, looked dead)
- "Đã đạt" pill on earned cards (badge of pride)
- Lock overlay + grayscale emoji on locked
- Progress bar normalized to teal (was per-rarity rgba — inconsistent)
- Rarity label localization
- Category filter elevated to canonical pill

Commit hash placeholder (matches sibling convention). v1.

## See also

- `03-components/profile-stats.md` — sibling Profile canon (8-grid, RankChip, action buttons, handle split-tone)
- `03-components/scenario-card.md` — origin of canonical pill filter pattern + ≥44px touch target rule
- `03-components/friend-list.md` — palette exception precedent (`#5DCAA5` online indicator)
- `05-voice/never-say-list.md` — rarity label translations, peer voice
- `09-anti-patterns/fake-stats-ban.md` — achievement counts must be real (no fake `+12 unlocked this week` etc.)
